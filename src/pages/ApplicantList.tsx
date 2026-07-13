import React, { useState } from 'react';
import { useApplicants } from '@/context/ApplicantContext';
import ApplicantOverviewTable from '@/components/applicant/ApplicantOverviewTable';
import ApplicantFormModal from '@/components/applicant/ApplicantFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export default function ApplicantListPage() {
  const { applicants } = useApplicants();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const activeApplicants = applicants.filter(a => !a.isSeparateManagement);
  const filtered = activeApplicants.filter(a =>
    !search
    || a.name.includes(search)
    || a.email.includes(search)
    || a.phone.includes(search)
    || a.memo.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">지원자 목록</h2>
          <p className="text-sm text-muted-foreground">총 {filtered.length}명</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 w-60"
              placeholder="이름, 이메일, 연락처, 메모 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> 지원자 등록
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <ApplicantOverviewTable applicants={filtered} />
      </div>

      {showForm && (
        <ApplicantFormModal open={showForm} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
