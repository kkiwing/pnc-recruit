import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import ApplicantFormModal from '@/components/applicant/ApplicantFormModal';
import JobPostingFormModal from '@/components/jobPosting/JobPostingFormModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, Plus, Pencil, Trash2, Users, UserX, Workflow, ChevronRight } from 'lucide-react';
import { getJobPostingStatus } from '@/types/jobPosting';

export default function JobPostingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobPosting, deleteJobPosting } = useJobPostings();
  const { applicants, deleteApplicantsByJobPostingId } = useApplicants();
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const jobPosting = id ? getJobPosting(id) : undefined;

  if (!jobPosting) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">공고를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/postings')}>
          목록으로
        </Button>
      </div>
    );
  }

  const jobApplicants = applicants.filter(a => a.jobPostingId === jobPosting.id);
  const activeCount = jobApplicants.filter(a => !a.isSeparateManagement).length;
  const separateCount = jobApplicants.filter(a => a.isSeparateManagement).length;
  const sortedStages = [...jobPosting.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate('/postings')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{jobPosting.title}</h2>
          <p className="text-xs text-muted-foreground">
            {getJobPostingStatus(jobPosting)} · {jobPosting.department} · {jobPosting.startDate} ~ {jobPosting.endDate}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> 지원자 등록
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
          <Pencil className="w-3.5 h-3.5 mr-1" /> 공고 수정
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> 공고 삭제
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          type="button"
          className="card-elevated p-4 text-left flex items-center justify-between"
          onClick={() => navigate(`/applicants?posting=${jobPosting.id}`)}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">지원자 목록</p>
              <p className="text-xs text-muted-foreground">{activeCount}명</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="card-elevated p-4 text-left flex items-center justify-between"
          onClick={() => navigate(`/separate-management?posting=${jobPosting.id}`)}
        >
          <div className="flex items-center gap-3">
            <UserX className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-sm font-medium">별도 관리</p>
              <p className="text-xs text-muted-foreground">{separateCount}명</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="card-elevated p-4 text-left flex items-center justify-between"
          onClick={() => navigate(`/process-management?posting=${jobPosting.id}`)}
        >
          <div className="flex items-center gap-3">
            <Workflow className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">프로세스 관리</p>
              <p className="text-xs text-muted-foreground">{sortedStages.length}단계</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card-elevated p-5">
          <h3 className="text-sm font-semibold mb-3">기본 정보</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">구분:</span> {jobPosting.careerType}</div>
            <div><span className="text-muted-foreground">고용 형태:</span> {jobPosting.employmentType}</div>
            <div><span className="text-muted-foreground">팀:</span> {jobPosting.department}</div>
            <div><span className="text-muted-foreground">포지션:</span> {jobPosting.position || '-'}</div>
            <div><span className="text-muted-foreground">게시기간:</span> {jobPosting.startDate} ~ {jobPosting.endDate}</div>
            <div><span className="text-muted-foreground">공개 여부:</span> {jobPosting.isPublic ? '공개' : '비공개'}</div>
          </div>
        </section>

        <section className="card-elevated p-5">
          <h3 className="text-sm font-semibold mb-3">프로세스 요약</h3>
          {sortedStages.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 전형 단계가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedStages.map((stage, i) => (
                <Badge key={stage.id} variant="outline" className="text-xs">{i + 1}. {stage.name}</Badge>
              ))}
            </div>
          )}
        </section>

        <section className="card-elevated p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">공고 본문</h3>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{jobPosting.content || '등록된 본문이 없습니다.'}</p>
        </section>

        <section className="card-elevated p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">자기소개서 문항</h3>
          {jobPosting.coverLetterQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 문항이 없습니다.</p>
          ) : (
            <ol className="space-y-2 text-sm list-decimal list-inside">
              {jobPosting.coverLetterQuestions.map(q => (
                <li key={q.id}>
                  {q.question}
                  {q.maxLength && <span className="text-xs text-muted-foreground ml-1">(최대 {q.maxLength}자)</span>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {showForm && (
        <ApplicantFormModal open={showForm} onClose={() => setShowForm(false)} defaultJobPostingId={jobPosting.id} />
      )}

      {showEditForm && (
        <JobPostingFormModal open={showEditForm} onClose={() => setShowEditForm(false)} editData={jobPosting} />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공고를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{jobPosting.title}" 공고를 삭제하면 소속된 지원자 {jobApplicants.length}명의 데이터도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteApplicantsByJobPostingId(jobPosting.id);
                deleteJobPosting(jobPosting.id);
                navigate('/postings');
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
