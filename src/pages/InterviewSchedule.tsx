import React, { useState, useMemo } from 'react';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InterviewSchedulePage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const active = applicants.filter(a => !a.isSeparateManagement);

  const interviews = useMemo(() => active
    .filter(a => a.recruitmentStatus.interviewNotice.status === 'done')
    .map(a => {
      const job = jobPostings.find(j => j.id === a.jobPostingId);
      return {
        id: a.id,
        name: a.name,
        team: a.team,
        phone: a.phone,
        email: a.email,
        region: `${a.region} ${a.regionDetail}`,
        date: a.recruitmentStatus.interviewNotice.endDate || '',
        time: a.recruitmentStatus.interviewNotice.time || '',
        interviewer: a.recruitmentStatus.interviewNotice.interviewer || '',
        result: a.recruitmentStatus.interviewResult.status,
        jobTitle: job?.title || '-',
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [active, jobPostings]
  );

  const upcoming = interviews.filter(i => i.result === 'pending');
  const completed = interviews.filter(i => i.result !== 'pending');

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
        <p className="text-sm text-muted-foreground">전체 면접 {interviews.length}건 (예정 {upcoming.length}건 / 완료 {completed.length}건)</p>
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
                              <span className={`text-xs px-1.5 py-0.5 rounded ${interview.result === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {interview.result === 'pass' ? '합격' : '불합격'}
                              </span>
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
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${item.result === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.result === 'pass' ? '합격' : '불합격'}
                      </span>
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
