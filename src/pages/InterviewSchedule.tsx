import React from 'react';
import { useApplicants } from '@/context/ApplicantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function InterviewSchedulePage() {
  const { applicants } = useApplicants();

  const active = applicants.filter(a => !a.isSeparateManagement);

  const interviews = active
    .filter(a => a.recruitmentStatus.interviewNotice.status === 'done')
    .map(a => ({
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
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = interviews.filter(i => i.result === 'pending');
  const completed = interviews.filter(i => i.result !== 'pending');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">면접 일정 관리</h2>
        <p className="text-sm text-muted-foreground">전체 면접 {interviews.length}건 (예정 {upcoming.length}건 / 완료 {completed.length}건)</p>
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
                    <td>{item.date}</td>
                    <td>{item.interviewer}</td>
                    <td>
                      <span className={`status-badge ${item.result === 'pass' ? 'status-pass' : 'status-fail'}`}>
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
