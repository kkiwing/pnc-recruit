import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import ApplicantOverviewTable from '@/components/applicant/ApplicantOverviewTable';
import JobPostingSelect from '@/components/applicant/JobPostingSelect';
import JobPostingDetailLink from '@/components/applicant/JobPostingDetailLink';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

/** 별도관리 전용 정렬 기준 — 지원자 목록의 지원일 기준 정렬과는 별개다.
 * 별도관리는 "최근에 이탈한 사람"을 우선 봐야 하므로 기본값이 separatedAt
 * 내림차순이다(2026-07-20). 지원일순은 지원자 목록의 "최신 지원순"과 같은
 * 방향(내림차순)으로 맞춰 혼동을 줄였다. */
type SeparateSortOption = 'recentSeparated' | 'oldestSeparated' | 'applicationNewest';

const SEPARATE_SORT_LABELS: Record<SeparateSortOption, string> = {
  recentSeparated: '최근 이동순',
  oldestSeparated: '오래된 이동순',
  applicationNewest: '지원일순',
};

const toTime = (iso?: string) => (iso ? new Date(iso).getTime() : 0);

export default function SeparateManagementPage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [jobId, setJobIdState] = useState(() => searchParams.get('posting') ?? 'all');
  const [sortBy, setSortBy] = useState<SeparateSortOption>('recentSeparated');

  const setJobId = (id: string) => {
    setJobIdState(id);
    setSearchParams(sp => {
      const next = new URLSearchParams(sp);
      if (id === 'all') next.delete('posting');
      else next.set('posting', id);
      return next;
    }, { replace: true });
  };

  const separateApplicants = useMemo(() => applicants.filter(a => a.isSeparateManagement), [applicants]);

  const filtered = useMemo(() => {
    const query = search.trim();
    return separateApplicants.filter(a => {
      if (jobId !== 'all' && a.jobPostingId !== jobId) return false;
      if (
        query &&
        !a.name.includes(query) &&
        !a.email.includes(query) &&
        !a.phone.includes(query) &&
        !a.memo.includes(query) &&
        !(a.separateReason ?? '').includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [separateApplicants, search, jobId]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case 'oldestSeparated':
        list.sort((a, b) => toTime(a.separatedAt) - toTime(b.separatedAt));
        break;
      case 'applicationNewest':
        list.sort((a, b) => b.applicationDate.localeCompare(a.applicationDate));
        break;
      case 'recentSeparated':
      default:
        list.sort((a, b) => toTime(b.separatedAt) - toTime(a.separatedAt));
    }
    return list;
  }, [filtered, sortBy]);

  const hasActiveFilter = search.trim() !== '' || jobId !== 'all';

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">별도 관리</h2>
        <p className="text-sm text-muted-foreground">
          {hasActiveFilter
            ? `별도 관리 ${filtered.length}명 (전체 ${separateApplicants.length}명)`
            : `미응시 / 중도 하차 인원 (${separateApplicants.length}명)`}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="이름, 이메일, 연락처, 메모, 사유 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <JobPostingSelect jobPostings={jobPostings} value={jobId} onChange={setJobId} />
        {jobId !== 'all' && <JobPostingDetailLink jobPostingId={jobId} />}

        <Select value={sortBy} onValueChange={v => setSortBy(v as SeparateSortOption)}>
          <SelectTrigger className="w-auto ml-auto text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SEPARATE_SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="card-elevated">
        <ApplicantOverviewTable applicants={sorted} mode="separate" />
      </div>
    </div>
  );
}
