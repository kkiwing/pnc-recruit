import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, UserCheck, Calendar, ChevronRight } from 'lucide-react';
import { getJobPostingStatus, JOB_POSTING_STATUS_COLORS, getInterviewStage, getFinalStage } from '@/types/jobPosting';
import { isStageDone, isStageCompleted, isStagePassed } from '@/types/applicant';

export default function DashboardPage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const navigate = useNavigate();

  const postingsById = new Map(jobPostings.map(j => [j.id, j]));

  const totalApplicants = applicants.filter(a => !a.isSeparateManagement).length;
  const totalPassed = applicants.filter(a => {
    if (a.isSeparateManagement) return false;
    const posting = postingsById.get(a.jobPostingId);
    const finalStage = posting && getFinalStage(posting.stages);
    return !!finalStage && isStagePassed(a.stageRecords, finalStage);
  }).length;
  const totalInterviewPending = applicants.filter(a => {
    if (a.isSeparateManagement) return false;
    const posting = postingsById.get(a.jobPostingId);
    if (!posting) return false;
    const interviewStage = getInterviewStage(posting.stages);
    const finalStage = getFinalStage(posting.stages);
    return !!interviewStage && !!finalStage && isStageCompleted(a.stageRecords, interviewStage) && !isStageDone(a.stageRecords, finalStage);
  }).length;
  const openPostings = jobPostings.filter(j => getJobPostingStatus(j) === '진행중').length;

  const stats = [
    { label: '진행중 공고', value: openPostings, icon: Briefcase, color: 'text-primary' },
    { label: '전체 지원자', value: totalApplicants, icon: Users, color: 'text-blue-600' },
    { label: '면접 예정', value: totalInterviewPending, icon: Calendar, color: 'text-amber-600' },
    { label: '최종 합격', value: totalPassed, icon: UserCheck, color: 'text-emerald-600' },
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">공고별 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>공고명</th>
                <th>부서</th>
                <th>상태</th>
                <th>기간</th>
                <th className="text-center">지원자</th>
                <th className="text-center">면접 예정</th>
                <th className="text-center">합격</th>
                <th className="text-center">별도관리</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobPostings.map(job => {
                const jobApplicants = applicants.filter(a => a.jobPostingId === job.id);
                const activeCount = jobApplicants.filter(a => !a.isSeparateManagement).length;
                const separateCount = jobApplicants.filter(a => a.isSeparateManagement).length;
                const interviewStage = getInterviewStage(job.stages);
                const finalStage = getFinalStage(job.stages);
                const interviewPending = jobApplicants.filter(a =>
                  !a.isSeparateManagement && interviewStage && finalStage &&
                  isStageCompleted(a.stageRecords, interviewStage) && !isStageDone(a.stageRecords, finalStage)
                ).length;
                const passed = jobApplicants.filter(a =>
                  !a.isSeparateManagement && !!finalStage && isStagePassed(a.stageRecords, finalStage)
                ).length;

                const jobStatus = getJobPostingStatus(job);

                return (
                  <tr key={job.id} className="cursor-pointer" onClick={() => navigate(`/postings/${job.id}`)}>
                    <td className="font-medium">{job.title}</td>
                    <td className="text-xs">{job.department}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${JOB_POSTING_STATUS_COLORS[jobStatus]}`}>
                        {jobStatus}
                      </span>
                    </td>
                    <td className="text-xs">{job.startDate} ~ {job.endDate}</td>
                    <td className="text-center font-medium">{activeCount}</td>
                    <td className="text-center font-medium">{interviewPending}</td>
                    <td className="text-center font-medium text-emerald-600">{passed}</td>
                    <td className="text-center text-muted-foreground">{separateCount}</td>
                    <td><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
