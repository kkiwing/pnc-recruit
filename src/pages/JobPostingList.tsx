import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, UserX, ChevronRight, Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { JobPosting, JOB_POSTING_STATUS_LABELS } from '@/types/jobPosting';
import JobPostingFormModal from '@/components/jobPosting/JobPostingFormModal';

export default function JobPostingListPage() {
  const { jobPostings, deleteJobPosting } = useJobPostings();
  const { applicants, deleteApplicantsByJobPostingId } = useApplicants();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<JobPosting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobPosting | null>(null);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">공고 관리</h2>
          <p className="text-sm text-muted-foreground">총 {jobPostings.length}건의 채용 공고</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> 새 공고 등록
        </Button>
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
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTarget(job)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(job)} className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {jobPostings.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">등록된 채용 공고가 없습니다.</p>
        )}
      </div>

      {showForm && (
        <JobPostingFormModal open={showForm} onClose={() => setShowForm(false)} />
      )}

      {editTarget && (
        <JobPostingFormModal open={!!editTarget} onClose={() => setEditTarget(null)} editData={editTarget} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공고를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" 공고를 삭제하면 소속된 지원자 데이터도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteApplicantsByJobPostingId(deleteTarget.id);
                  deleteJobPosting(deleteTarget.id);
                }
                setDeleteTarget(null);
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
