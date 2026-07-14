import React, { useState, useMemo } from 'react';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { cn, toDateStr } from '@/lib/utils';
import { getFinalStage, getInterviewStage } from '@/types/jobPosting';
import { getInterviewInfo, isStagePassed } from '@/types/applicant';

export default function InterviewSchedulePage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const active = applicants.filter(a => !a.isSeparateManagement);
  const todayStr = toDateStr(new Date());

  const interviews = useMemo(() => {
    const postingsById = new Map(jobPostings.map(j => [j.id, j]));
    return active
      .map(a => {
        const job = postingsById.get(a.jobPostingId);
        if (!job) return null;
        const info = getInterviewInfo(a.stageRecords, job.stages, todayStr);
        if (!info) return null;
        const interviewStage = getInterviewStage(job.stages);
        const meta = interviewStage ? a.stageRecords.find(r => r.stageId === interviewStage.id)?.meta : undefined;
        const finalStage = getFinalStage(job.stages);
        const result: 'pending' | 'pass' | 'fail' = info.bucket !== 'completed'
          ? 'pending'
          : finalStage && isStagePassed(a.stageRecords, finalStage) ? 'pass' : 'fail';
        return {
          id: a.id,
          name: a.name,
          team: a.team,
          phone: a.phone,
          email: a.email,
          region: `${a.region} ${a.regionDetail}`,
          date: info.date || '',
          time: meta?.time || '',
          interviewer: meta?.interviewer || '',
          bucket: info.bucket,
          result,
          jobTitle: job.title,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [active, jobPostings, todayStr]);

  const upcoming = interviews.filter(i => i.bucket === 'upcoming');
  const overdue = interviews.filter(i => i.bucket === 'overdue');
  const completed = interviews.filter(i => i.bucket === 'completed');

  // Dates that have interviews (for highlighting on calendar)
  const interviewDates = useMemo(() => {
    const dates = new Set<string>();
    interviews.forEach(i => { if (i.date) dates.add(i.date); });
    return dates;
  }, [interviews]);

  // Selected date string in YYYY-MM-DD format
  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : '';

  // Interviews for selected date, sorted by time
  const todayInterviews = useMemo(() =>
    interviews.filter(i => i.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time)),
    [interviews, selectedDateStr]
  );

  // Time slots for timetable (09:00 ~ 18:00)
  const timeSlots = Array.from({ length: 10 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">면접 일정 관리</h2>
        <p className="text-sm text-muted-foreground">전체 면접 {interviews.length}건 (예정 {upcoming.length}건 / 지난 면접 {overdue.length}건 / 완료 {completed.length}건)</p>
      </div>

      {/* Calendar + Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> 면접 캘린더
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("p-3 pointer-events-auto")}
              modifiers={{
                hasInterview: (date) => {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  return interviewDates.has(dateStr);
                },
              }}
              modifiersClassNames={{
                hasInterview: 'bg-primary/20 text-primary font-bold',
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {selectedDateStr ? `${selectedDateStr} 타임테이블` : '날짜를 선택하세요'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {selectedDateStr ? '해당 날짜에 예정된 면접이 없습니다.' : '날짜를 선택해주세요.'}
              </p>
            ) : (
              <div className="space-y-0">
                {timeSlots.map(slot => {
                  const slotInterviews = todayInterviews.filter(i => i.time.startsWith(slot.slice(0, 2)));
                  return (
                    <div key={slot} className={cn(
                      "flex border-b border-border/50 min-h-[40px]",
                      slotInterviews.length > 0 ? 'bg-primary/5' : ''
                    )}>
                      <div className="w-16 flex-shrink-0 text-xs text-muted-foreground py-2 px-2 border-r border-border/50 font-mono">
                        {slot}
                      </div>
                      <div className="flex-1 py-1 px-2">
                        {slotInterviews.map(interview => (
                          <div key={interview.id} className="flex items-center gap-3 py-1 text-sm">
                            <span className="font-medium text-primary">{interview.time}</span>
                            <span className="font-medium">{interview.name}</span>
                            <span className="text-xs text-muted-foreground">({interview.team})</span>
                            <span className="text-xs bg-accent px-1.5 py-0.5 rounded">{interview.jobTitle}</span>
                            <span className="text-xs text-muted-foreground">담당: {interview.interviewer}</span>
                            {interview.result !== 'pending' && (
                              <Badge variant={interview.result === 'pass' ? 'success' : 'destructive'} className="text-xs">
                                {interview.result === 'pass' ? '합격' : '불합격'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> 예정된 면접
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">예정된 면접이 없습니다.</p>
          ) : (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>팀</th>
                  <th>공고</th>
                  <th>면접일</th>
                  <th>시간</th>
                  <th>담당자</th>
                  <th>연락처</th>
                  <th>지역</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(item => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.team}</td>
                    <td className="text-xs max-w-[200px] truncate">{item.jobTitle}</td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.interviewer}</td>
                    <td className="text-xs">{item.phone}</td>
                    <td className="text-xs">{item.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> 지난 면접 (결과 미입력)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overdue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">결과 입력이 밀린 면접이 없습니다.</p>
          ) : (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>팀</th>
                  <th>공고</th>
                  <th>면접일</th>
                  <th>시간</th>
                  <th>담당자</th>
                  <th>연락처</th>
                  <th>지역</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map(item => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.team}</td>
                    <td className="text-xs max-w-[200px] truncate">{item.jobTitle}</td>
                    <td className="text-warning font-medium">{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.interviewer}</td>
                    <td className="text-xs">{item.phone}</td>
                    <td className="text-xs">{item.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">면접 완료</CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">완료된 면접이 없습니다.</p>
          ) : (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>팀</th>
                  <th>공고</th>
                  <th>면접일</th>
                  <th>담당자</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(item => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.team}</td>
                    <td className="text-xs max-w-[200px] truncate">{item.jobTitle}</td>
                    <td>{item.date}</td>
                    <td>{item.interviewer}</td>
                    <td>
                      <Badge variant={item.result === 'pass' ? 'success' : 'destructive'} className="text-xs">
                        {item.result === 'pass' ? '합격' : '불합격'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
