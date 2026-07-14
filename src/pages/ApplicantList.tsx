import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import ApplicantOverviewTable from '@/components/applicant/ApplicantOverviewTable';
import ApplicantPipelineView from '@/components/applicant/ApplicantPipelineView';
import ApplicantToolbar, { ApplicantFilters, ApplicantSortOption, ApplicantViewMode, DEFAULT_APPLICANT_FILTERS } from '@/components/applicant/ApplicantToolbar';
import ApplicantFormModal from '@/components/applicant/ApplicantFormModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KanbanSquare, Plus } from 'lucide-react';
import { getCurrentStage, getStageRecordStatus } from '@/types/applicant';

export default function ApplicantListPage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFiltersState] = useState<ApplicantFilters>(() => ({
    ...DEFAULT_APPLICANT_FILTERS,
    jobId: searchParams.get('posting') ?? 'all',
  }));
  const [sortBy, setSortBy] = useState<ApplicantSortOption>('newest');
  const [viewMode, setViewMode] = useState<ApplicantViewMode>('list');

  const setFilters = (updater: (prev: ApplicantFilters) => ApplicantFilters) => {
    setFiltersState(prev => {
      const next = updater(prev);
      if (next.jobId !== prev.jobId) {
        setSearchParams(sp => {
          const nextParams = new URLSearchParams(sp);
          if (next.jobId === 'all') nextParams.delete('posting');
          else nextParams.set('posting', next.jobId);
          return nextParams;
        }, { replace: true });
      }
      return next;
    });
  };

  const activeApplicants = useMemo(() => applicants.filter(a => !a.isSeparateManagement), [applicants]);

  const jobFiltered = useMemo(
    () => filters.jobId === 'all' ? activeApplicants : activeApplicants.filter(a => a.jobPostingId === filters.jobId),
    [activeApplicants, filters.jobId]
  );

  const teamOptions = useMemo(
    () => Array.from(new Set(jobFiltered.map(a => a.team))).filter(Boolean).sort(),
    [jobFiltered]
  );

  const selectedJob = jobPostings.find(j => j.id === filters.jobId);
  const selectedJobStages = useMemo(
    () => selectedJob ? [...selectedJob.stages].sort((a, b) => a.order - b.order) : [],
    [selectedJob]
  );
  const selectedStage = selectedJobStages.find(s => s.id === filters.stageId);
  const statusOptionsForSelectedStage = selectedStage?.statuses ?? [];

  const filtered = useMemo(() => {
    const query = search.trim();
    return jobFiltered.filter(a => {
      if (query && !a.name.includes(query) && !a.email.includes(query) && !a.phone.includes(query) && !a.memo.includes(query)) {
        return false;
      }
      if (filters.team !== 'all' && a.team !== filters.team) return false;
      if (selectedJob && (filters.stageId !== 'all' || filters.statusId !== 'all')) {
        const currentStage = getCurrentStage(a.stageRecords, selectedJobStages);
        if (filters.stageId !== 'all' && currentStage?.id !== filters.stageId) return false;
        if (filters.statusId !== 'all') {
          const currentStatus = currentStage && getStageRecordStatus(a.stageRecords, currentStage);
          if (currentStatus?.id !== filters.statusId) return false;
        }
      }
      return true;
    });
  }, [jobFiltered, search, filters, selectedJob, selectedJobStages]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => a.applicationDate.localeCompare(b.applicationDate));
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'newest':
      default:
        list.sort((a, b) => b.applicationDate.localeCompare(a.applicationDate));
    }
    return list;
  }, [filtered, sortBy]);

  const hasActiveFilter = search.trim() !== '' || filters.jobId !== 'all' || filters.team !== 'all' || filters.stageId !== 'all' || filters.statusId !== 'all';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">지원자 목록</h2>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilter
              ? `지원자 ${sorted.length}명 (전체 ${activeApplicants.length}명)`
              : `지원자 ${activeApplicants.length}명`}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> 지원자 등록
        </Button>
      </div>

      <ApplicantToolbar
        search={search}
        onSearchChange={setSearch}
        jobPostings={jobPostings}
        filters={filters}
        onFiltersChange={patch => setFilters(prev => ({ ...prev, ...patch }))}
        teamOptions={teamOptions}
        selectedJobStages={selectedJobStages}
        statusOptionsForSelectedStage={statusOptionsForSelectedStage}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'list' ? (
        <div className="card-elevated">
          <ApplicantOverviewTable applicants={sorted} />
        </div>
      ) : selectedJob ? (
        <ApplicantPipelineView applicants={sorted} jobPosting={selectedJob} />
      ) : (
        <div className="card-elevated py-16 flex flex-col items-center gap-3">
          <KanbanSquare className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">공고를 선택하면 파이프라인으로 볼 수 있어요.</p>
          <Select onValueChange={v => setFilters(prev => ({ ...prev, jobId: v, team: 'all', stageId: 'all', statusId: 'all' }))}>
            <SelectTrigger className="max-w-[280px]"><SelectValue placeholder="공고 선택" /></SelectTrigger>
            <SelectContent>
              {jobPostings.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showForm && (
        <ApplicantFormModal open={showForm} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
