import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobPostings } from '@/context/JobPostingContext';
import { useApplicants } from '@/context/ApplicantContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Users, UserX, ChevronRight, Plus, Pencil, Trash2, MoreVertical, Search, SlidersHorizontal } from 'lucide-react';
import { JobPosting, JobPostingStatus, EmploymentType, getJobPostingStatus, getFinalStage } from '@/types/jobPosting';
import { getInterviewInfo, isStagePassed } from '@/types/applicant';
import { toDateStr } from '@/lib/utils';
import JobPostingFormModal from '@/components/jobPosting/JobPostingFormModal';

type SortOption = 'deadlineAsc' | 'createdDesc' | 'createdAsc' | 'updatedDesc' | 'applicantsDesc' | 'applicantsAsc' | 'statusFirst';

const SORT_LABELS: Record<SortOption, string> = {
  deadlineAsc: '마감일 임박순',
  createdDesc: '최신 생성순',
  createdAsc: '오래된 생성순',
  updatedDesc: '최근 수정순',
  applicantsDesc: '지원자 많은 순',
  applicantsAsc: '지원자 적은 순',
  statusFirst: '게시중 우선',
};

export default function JobPostingListPage() {
  const { jobPostings, deleteJobPosting, updateJobPosting } = useJobPostings();
  const { applicants, deleteApplicantsByJobPostingId } = useApplicants();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<JobPosting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobPosting | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobPostingStatus | 'all'>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadlineAsc');
  const todayStr = toDateStr(new Date());

  const departments = useMemo(
    () => Array.from(new Set(jobPostings.map(j => j.department))).filter(Boolean),
    [jobPostings]
  );

  const visiblePostings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const withCounts = jobPostings
      .filter(job => {
        if (query && !job.title.toLowerCase().includes(query) && !(job.position || '').toLowerCase().includes(query)) return false;
        if (statusFilter !== 'all' && getJobPostingStatus(job) !== statusFilter) return false;
        if (employmentTypeFilter !== 'all' && job.employmentType !== employmentTypeFilter) return false;
        if (departmentFilter !== 'all' && job.department !== departmentFilter) return false;
        return true;
      })
      .map(job => ({
        job,
        applicantCount: applicants.filter(a => a.jobPostingId === job.id && !a.isSeparateManagement).length,
      }));

    const sorted = [...withCounts];
    switch (sortBy) {
      case 'deadlineAsc':
        sorted.sort((a, b) => (a.job.endDate || '9999-12-31').localeCompare(b.job.endDate || '9999-12-31'));
        break;
      case 'createdAsc':
        sorted.sort((a, b) => a.job.createdAt.localeCompare(b.job.createdAt));
        break;
      case 'updatedDesc':
        sorted.sort((a, b) => b.job.updatedAt.localeCompare(a.job.updatedAt));
        break;
      case 'applicantsDesc':
        sorted.sort((a, b) => b.applicantCount - a.applicantCount);
        break;
      case 'applicantsAsc':
        sorted.sort((a, b) => a.applicantCount - b.applicantCount);
        break;
      case 'statusFirst':
        sorted.sort((a, b) => {
          const rank = (j: JobPosting) => getJobPostingStatus(j) === '진행중' ? 0 : 1;
          return rank(a.job) - rank(b.job) || b.job.createdAt.localeCompare(a.job.createdAt);
        });
        break;
      case 'createdDesc':
      default:
        sorted.sort((a, b) => b.job.createdAt.localeCompare(a.job.createdAt));
    }
    return sorted.map(entry => entry.job);
  }, [jobPostings, applicants, search, statusFilter, employmentTypeFilter, departmentFilter, sortBy]);

  const isFilterActive = statusFilter !== 'all' || employmentTypeFilter !== 'all' || departmentFilter !== 'all';

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

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="공고 제목, 포지션 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              필터
              {isFilterActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">게시 상태</label>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as JobPostingStatus | 'all')}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="종료">종료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">고용 형태</label>
              <Select value={employmentTypeFilter} onValueChange={v => setEmploymentTypeFilter(v as EmploymentType | 'all')}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="정규직">정규직</SelectItem>
                  <SelectItem value="계약직">계약직</SelectItem>
                  <SelectItem value="인턴">인턴</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">팀</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-auto ml-auto text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {visiblePostings.map(job => {
          const jobApplicants = applicants.filter(a => a.jobPostingId === job.id);
          const activeCount = jobApplicants.filter(a => !a.isSeparateManagement).length;
          const separateCount = jobApplicants.filter(a => a.isSeparateManagement).length;
          const finalStage = getFinalStage(job.stages);
          const interviewPending = jobApplicants.filter(a =>
            !a.isSeparateManagement && getInterviewInfo(a.stageRecords, job.stages, todayStr)?.bucket === 'upcoming'
          ).length;
          const passed = jobApplicants.filter(a =>
            !a.isSeparateManagement && !!finalStage && isStagePassed(a.stageRecords, finalStage)
          ).length;

          const jobStatus = getJobPostingStatus(job);

          return (
            <Card
              key={job.id}
              className="cursor-pointer"
              onClick={() => navigate(`/postings/${job.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={jobStatus === '진행중' ? 'success' : 'secondary'} className="text-xs">
                        {jobStatus}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{job.careerType}</Badge>
                      <Badge variant="outline" className="text-xs">{job.employmentType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {job.department}{job.position ? ` · ${job.position}` : ''}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">게시기간 {job.startDate} ~ {job.endDate}</p>
                  </div>
                  <div className="flex items-center gap-6 mr-4">
                    <div
                      className="flex items-center gap-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <Switch
                        checked={job.isPublic}
                        onCheckedChange={checked => updateJobPosting(job.id, { isPublic: checked })}
                      />
                      <span className="text-xs text-muted-foreground w-10">{job.isPublic ? '공개' : '비공개'}</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm hover:underline"
                      onClick={e => { e.stopPropagation(); navigate(`/applicants?posting=${job.id}`); }}
                    >
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">{activeCount}</span>
                      <span className="text-xs text-muted-foreground">지원자</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm hover:underline"
                      onClick={e => { e.stopPropagation(); navigate(`/separate-management?posting=${job.id}`); }}
                    >
                      <UserX className="w-4 h-4 text-destructive" />
                      <span className="font-medium">{separateCount}</span>
                      <span className="text-xs text-muted-foreground">별도관리</span>
                    </button>
                    {interviewPending > 0 && (
                      <Badge variant="secondary" className="text-xs">면접 예정 {interviewPending}</Badge>
                    )}
                    {passed > 0 && (
                      <Badge variant="success" className="text-xs">합격 {passed}</Badge>
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
                <div className="mt-3 pt-2 border-t text-[11px] text-muted-foreground">
                  created {job.createdAt.slice(0, 10)} by {job.createdBy} · updated {job.updatedAt.slice(0, 10)} by {job.updatedBy}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {visiblePostings.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            {jobPostings.length === 0 ? '등록된 채용 공고가 없습니다.' : '조건에 맞는 공고가 없습니다.'}
          </p>
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
