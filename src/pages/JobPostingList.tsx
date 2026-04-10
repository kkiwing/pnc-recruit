import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserX, ChevronRight } from 'lucide-react';
import { JOB_POSTING_STATUS_LABELS } from '@/types/jobPosting';

export default function JobPostingListPage() {
  const { jobPostings } = useJobPostings();
  const { applicants } = useApplicants();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">공고 관리</h2>
        <p className="text-sm text-muted-foreground">총 {jobPostings.length}건의 채용 공고</p>
      </div>

      <div className="grid gap-4">
        {jobPostings.map(job => {
          const jobApplicants = applicants.filter(a => a.jobPostingId === job.id);
          const activeCount = jobApplicants.filter(a => !a.isSeparateManagement).length;
          const separateCount = jobApplicants.filter(a => a.isSeparateManagement).length;
          const interviewPending = jobApplicants.filter(a =>
            !a.isSeparateManagement &&
            a.recruitmentStatus.interviewNotice.status === 'done' &&
            a.recruitmentStatus.interviewResult.status === 'pending'
          ).length;
          const passed = jobApplicants.filter(a =>
            !a.isSeparateManagement &&
            a.recruitmentStatus.interviewResult.status === 'pass'
          ).length;

          const statusColor = job.status === 'open'
            ? 'bg-emerald-100 text-emerald-800'
            : job.status === 'closed'
              ? 'bg-muted text-muted-foreground'
              : 'bg-amber-100 text-amber-800';

          return (
            <Card
              key={job.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/postings/${job.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor}`}>
                        {JOB_POSTING_STATUS_LABELS[job.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">{job.department}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">{job.startDate} ~ {job.endDate}</p>
                  </div>
                  <div className="flex items-center gap-6 mr-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">{activeCount}</span>
                      <span className="text-xs text-muted-foreground">지원자</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <UserX className="w-4 h-4 text-destructive" />
                      <span className="font-medium">{separateCount}</span>
                      <span className="text-xs text-muted-foreground">별도관리</span>
                    </div>
                    {interviewPending > 0 && (
                      <Badge variant="secondary" className="text-xs">면접 예정 {interviewPending}</Badge>
                    )}
                    {passed > 0 && (
                      <Badge className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200">합격 {passed}</Badge>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
