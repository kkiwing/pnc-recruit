import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApplicants } from '@/context/ApplicantContext';
import { useJobPostings } from '@/context/JobPostingContext';
import ApplicantOverviewTable from '@/components/applicant/ApplicantOverviewTable';
import JobPostingSelect from '@/components/applicant/JobPostingSelect';
import JobPostingDetailLink from '@/components/applicant/JobPostingDetailLink';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SeparateManagementPage() {
  const { applicants } = useApplicants();
  const { jobPostings } = useJobPostings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [jobId, setJobIdState] = useState(() => searchParams.get('posting') ?? 'all');

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
      </div>

      <div className="card-elevated">
        <ApplicantOverviewTable applicants={filtered} mode="separate" />
      </div>
    </div>
  );
}
