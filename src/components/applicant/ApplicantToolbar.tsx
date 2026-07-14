import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, SlidersHorizontal, X, List, KanbanSquare } from 'lucide-react';
import { JobPosting, Stage, StageStatus } from '@/types/jobPosting';
import JobPostingSelect from '@/components/applicant/JobPostingSelect';
import JobPostingDetailLink from '@/components/applicant/JobPostingDetailLink';

export type ApplicantSortOption = 'newest' | 'oldest' | 'name';
export type ApplicantViewMode = 'list' | 'pipeline';

export interface ApplicantFilters {
  jobId: string;
  team: string;
  stageId: string;
  statusId: string;
}

export const DEFAULT_APPLICANT_FILTERS: ApplicantFilters = {
  jobId: 'all',
  team: 'all',
  stageId: 'all',
  statusId: 'all',
};

const SORT_LABELS: Record<ApplicantSortOption, string> = {
  newest: '최신 지원순',
  oldest: '오래된 지원순',
  name: '이름순',
};

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  jobPostings: JobPosting[];
  filters: ApplicantFilters;
  onFiltersChange: (patch: Partial<ApplicantFilters>) => void;
  teamOptions: string[];
  selectedJobStages: Stage[];
  statusOptionsForSelectedStage: StageStatus[];
  sortBy: ApplicantSortOption;
  onSortByChange: (value: ApplicantSortOption) => void;
  viewMode: ApplicantViewMode;
  onViewModeChange: (value: ApplicantViewMode) => void;
}

export default function ApplicantToolbar({
  search,
  onSearchChange,
  jobPostings,
  filters,
  onFiltersChange,
  teamOptions,
  selectedJobStages,
  statusOptionsForSelectedStage,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const isJobSelected = filters.jobId !== 'all';
  const isPopoverFilterActive = filters.team !== 'all' || filters.stageId !== 'all' || filters.statusId !== 'all';
  const hasAnyFilter = filters.jobId !== 'all' || isPopoverFilterActive;

  const selectedJob = jobPostings.find(j => j.id === filters.jobId);
  const selectedStage = selectedJobStages.find(s => s.id === filters.stageId);
  const selectedStatus = statusOptionsForSelectedStage.find(s => s.id === filters.statusId);

  const resetAll = () => onFiltersChange(DEFAULT_APPLICANT_FILTERS);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="이름, 이메일, 연락처, 메모 검색"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        <JobPostingSelect
          jobPostings={jobPostings}
          value={filters.jobId}
          onChange={v => onFiltersChange({ jobId: v, team: 'all', stageId: 'all', statusId: 'all' })}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              필터
              {isPopoverFilterActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">팀</label>
              <Select value={filters.team} onValueChange={v => onFiltersChange({ team: v })}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {teamOptions.map(team => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                현재 단계{!isJobSelected && ' (공고 선택 시 사용 가능)'}
              </label>
              <Select
                value={filters.stageId}
                disabled={!isJobSelected}
                onValueChange={v => onFiltersChange({ stageId: v, statusId: 'all' })}
              >
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {selectedJobStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                상태{filters.stageId === 'all' && isJobSelected && ' (단계 선택 시 사용 가능)'}
              </label>
              <Select
                value={filters.statusId}
                disabled={filters.stageId === 'all'}
                onValueChange={v => onFiltersChange({ statusId: v })}
              >
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {statusOptionsForSelectedStage.map(status => (
                    <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={sortBy} onValueChange={v => onSortByChange(v as ApplicantSortOption)}>
          <SelectTrigger className="w-auto ml-auto text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={value => value && onViewModeChange(value as ApplicantViewMode)}
          className="card-soft rounded-md p-0.5"
        >
          <ToggleGroupItem value="pipeline" size="sm" className="gap-1.5 px-2.5 text-xs data-[state=on]:bg-accent">
            <KanbanSquare className="w-3.5 h-3.5" /> 파이프라인
          </ToggleGroupItem>
          <ToggleGroupItem value="list" size="sm" className="gap-1.5 px-2.5 text-xs data-[state=on]:bg-accent">
            <List className="w-3.5 h-3.5" /> 목록
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {hasAnyFilter && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          {selectedJob && (
            <>
              <FilterChip label={`공고: ${selectedJob.title}`} onRemove={() => onFiltersChange({ jobId: 'all', team: 'all', stageId: 'all', statusId: 'all' })} />
              <JobPostingDetailLink jobPostingId={selectedJob.id} />
            </>
          )}
          {filters.team !== 'all' && (
            <FilterChip label={`팀: ${filters.team}`} onRemove={() => onFiltersChange({ team: 'all' })} />
          )}
          {selectedStage && (
            <FilterChip label={`단계: ${selectedStage.name}`} onRemove={() => onFiltersChange({ stageId: 'all', statusId: 'all' })} />
          )}
          {selectedStatus && (
            <FilterChip label={`상태: ${selectedStatus.name}`} onRemove={() => onFiltersChange({ statusId: 'all' })} />
          )}
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline ml-1" onClick={resetAll}>
            전체 초기화
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground rounded-full pl-2.5 pr-1.5 py-1">
      {label}
      <button type="button" className="hover:text-foreground" onClick={onRemove}>
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
