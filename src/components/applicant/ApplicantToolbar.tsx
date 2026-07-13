import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, SlidersHorizontal, X, List, KanbanSquare } from 'lucide-react';
import { JobPosting, Stage, StageStatus } from '@/types/jobPosting';

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

        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm max-w-[220px]"
          value={filters.jobId}
          onChange={e => onFiltersChange({ jobId: e.target.value, team: 'all', stageId: 'all', statusId: 'all' })}
        >
          <option value="all">전체 공고</option>
          {jobPostings.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>

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
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={filters.team}
                onChange={e => onFiltersChange({ team: e.target.value })}
              >
                <option value="all">전체</option>
                {teamOptions.map(team => <option key={team} value={team}>{team}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                현재 단계{!isJobSelected && ' (공고 선택 시 사용 가능)'}
              </label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                value={filters.stageId}
                disabled={!isJobSelected}
                onChange={e => onFiltersChange({ stageId: e.target.value, statusId: 'all' })}
              >
                <option value="all">전체</option>
                {selectedJobStages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                상태{filters.stageId === 'all' && isJobSelected && ' (단계 선택 시 사용 가능)'}
              </label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                value={filters.statusId}
                disabled={filters.stageId === 'all'}
                onChange={e => onFiltersChange({ statusId: e.target.value })}
              >
                <option value="all">전체</option>
                {statusOptionsForSelectedStage.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
          </PopoverContent>
        </Popover>

        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm ml-auto"
          value={sortBy}
          onChange={e => onSortByChange(e.target.value as ApplicantSortOption)}
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={value => value && onViewModeChange(value as ApplicantViewMode)}
          className="border rounded-md p-0.5"
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
            <FilterChip label={`공고: ${selectedJob.title}`} onRemove={() => onFiltersChange({ jobId: 'all', team: 'all', stageId: 'all', statusId: 'all' })} />
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
