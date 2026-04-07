import React from 'react';
import { useApplicants } from '@/context/ApplicantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Calendar, ClipboardCheck, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { applicants } = useApplicants();

  const active = applicants.filter(a => !a.isSeparateManagement);
  const separate = applicants.filter(a => a.isSeparateManagement);

  const awaitingPersonalityTest = active.filter(a =>
    a.recruitmentStatus.personalityTestNotice.status === 'need' ||
    a.recruitmentStatus.personalityTestNotice.status === 'done'
  ).filter(a => a.recruitmentStatus.personalityTestResult.status === 'pending').length;

  const awaitingCompanyForm = active.filter(a =>
    a.recruitmentStatus.companyFormNotice.status === 'done' &&
    a.recruitmentStatus.companyFormSubmission.status !== 'done'
  ).length;

  const awaitingInterview = active.filter(a =>
    a.recruitmentStatus.interviewNotice.status === 'done' &&
    a.recruitmentStatus.interviewResult.status === 'pending'
  ).length;

  const passed = active.filter(a => a.recruitmentStatus.interviewResult.status === 'pass').length;

  const stats = [
    { label: '전체 지원자', value: active.length, icon: Users, color: 'text-primary' },
    { label: '인성검사 진행중', value: awaitingPersonalityTest, icon: ClipboardCheck, color: 'text-warning' },
    { label: '자사양식 대기', value: awaitingCompanyForm, icon: FileText, color: 'text-info' },
    { label: '면접 예정', value: awaitingInterview, icon: Calendar, color: 'text-accent-foreground' },
    { label: '최종 합격', value: passed, icon: UserCheck, color: 'text-success' },
    { label: '별도 관리', value: separate.length, icon: UserX, color: 'text-destructive' },
  ];

  const upcomingInterviews = active
    .filter(a => a.recruitmentStatus.interviewNotice.status === 'done' && a.recruitmentStatus.interviewResult.status === 'pending')
    .map(a => ({
      name: a.name,
      team: a.team,
      date: a.recruitmentStatus.interviewNotice.endDate,
      time: a.recruitmentStatus.interviewNotice.time,
      interviewer: a.recruitmentStatus.interviewNotice.interviewer,
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">대시보드</h2>
        <p className="text-sm text-muted-foreground">채용 프로세스 현황 요약</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">예정된 면접 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">예정된 면접이 없습니다.</p>
          ) : (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>팀</th>
                  <th>면접일</th>
                  <th>시간</th>
                  <th>담당자</th>
                </tr>
              </thead>
              <tbody>
                {upcomingInterviews.map((item, i) => (
                  <tr key={i}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.team}</td>
                    <td>{item.date || '-'}</td>
                    <td>{item.time || '-'}</td>
                    <td>{item.interviewer || '-'}</td>
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
