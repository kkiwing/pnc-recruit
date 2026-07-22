import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Users, UserCheck, Calendar, ChevronRight } from 'lucide-react';
import { JobPostingStatus, getJobPostingStatus } from '@/types/jobPosting';
import { getScheduleInfo } from '@/types/applicant';
import { toDateStr } from '@/lib/utils';

export default function DashboardPage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const navigate = useNavigate();
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<JobPostingStatus | 'all'>('all');

  const postingsById = new Map(jobPostings.map(j => [j.id, j]));
  const todayStr = toDateStr(new Date());

  const fields = useMemo(
    () => Array.from(new Set(jobPostings.map(j => j.field))).filter(Boolean),
    [jobPostings]
  );

  const visiblePostings = useMemo(() => {
    return jobPostings
      .filter(j => fieldFilter === 'all' || j.field === fieldFilter)
      .filter(j => statusFilter === 'all' || getJobPostingStatus(j) === statusFilter)
      .sort((a, b) => (a.endDate || '9999-12-31').localeCompare(b.endDate || '9999-12-31'));
  }, [jobPostings, fieldFilter, statusFilter]);

  const openPostingIds = new Set(jobPostings.filter(j => getJobPostingStatus(j) === '진행중').map(j => j.id));

  const totalApplicants = applicants.filter(a => !a.isSeparateManagement && openPostingIds.has(a.jobPostingId)).length;
  const totalPassed = applicants.filter(a =>
    !a.isSeparateManagement && openPostingIds.has(a.jobPostingId) && a.finalResult?.result === '합격'
  ).length;
  const totalSchedulePending = applicants.filter(a => {
    if (a.isSeparateManagement || !openPostingIds.has(a.jobPostingId)) return false;
    const posting = postingsById.get(a.jobPostingId);
    if (!posting) return false;
    return getScheduleInfo(a.stageRecords, posting.stages, a.finalResult, todayStr)?.bucket === 'upcoming';
  }).length;
  const openPostings = openPostingIds.size;

  const stats = [
    { label: '진행중 공고', value: openPostings, icon: Briefcase, color: 'text-primary' },
    { label: '전체 지원자', value: totalApplicants, icon: Users, color: 'text-muted-foreground', sub: '진행중 공고 기준' },
    { label: '일정 예정', value: totalSchedulePending, icon: Calendar, color: 'text-warning', sub: '진행중 공고 기준' },
    { label: '최종 합격', value: totalPassed, icon: UserCheck, color: 'text-success', sub: '진행중 공고 기준' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">대시보드</h2>
        <p className="text-sm text-muted-foreground">채용 공고 현황 요약</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">공고별 현황</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="모집 분야" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 분야</SelectItem>
                {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as JobPostingStatus | 'all')}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="상태" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="진행중">진행중</SelectItem>
                <SelectItem value="종료">종료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>공고명</th>
                <th>모집 분야</th>
                <th>상태</th>
                <th>기간</th>
                <th className="text-center">지원자</th>
                <th className="text-center">일정 예정</th>
                <th className="text-center">합격</th>
                <th className="text-center">별도관리</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visiblePostings.map(job => {
                const jobApplicants = applicants.filter(a => a.jobPostingId === job.id);
                const activeCount = jobApplicants.filter(a => !a.isSeparateManagement).length;
                const separateCount = jobApplicants.filter(a => a.isSeparateManagement).length;
                const schedulePending = jobApplicants.filter(a =>
                  !a.isSeparateManagement && getScheduleInfo(a.stageRecords, job.stages, a.finalResult, todayStr)?.bucket === 'upcoming'
                ).length;
                const passed = jobApplicants.filter(a =>
                  !a.isSeparateManagement && a.finalResult?.result === '합격'
                ).length;

                const jobStatus = getJobPostingStatus(job);

                return (
                  <tr key={job.id} className="cursor-pointer" onClick={() => navigate(`/postings/${job.id}`)}>
                    <td className="font-medium">{job.title}</td>
                    <td className="text-xs">{job.field}</td>
                    <td>
                      <Badge variant={jobStatus === '진행중' ? 'success' : 'secondary'}>
                        {jobStatus}
                      </Badge>
                    </td>
                    <td className="text-xs whitespace-nowrap">{job.startDate} ~ {job.endDate}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="font-medium hover:underline"
                        onClick={e => { e.stopPropagation(); navigate(`/applicants?posting=${job.id}`); }}
                      >
                        {activeCount}
                      </button>
                    </td>
                    <td className="text-center font-medium">{schedulePending}</td>
                    <td className="text-center font-medium text-success">{passed}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="text-muted-foreground hover:underline"
                        onClick={e => { e.stopPropagation(); navigate(`/separate-management?posting=${job.id}`); }}
                      >
                        {separateCount}
                      </button>
                    </td>
                    <td><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visiblePostings.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">조건에 맞는 공고가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
