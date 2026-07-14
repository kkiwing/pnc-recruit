import React from 'react';
import { useApplicants } from '@/context/ApplicantContext';
import ApplicantTable from '@/components/applicant/ApplicantTable';

export default function SeparateManagementPage() {
  const { applicants } = useApplicants();
  const separateApplicants = applicants.filter(a => a.isSeparateManagement);

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">별도 관리</h2>
        <p className="text-sm text-muted-foreground">미응시 / 중도 하차 인원 ({separateApplicants.length}명)</p>
      </div>

      <div className="card-elevated">
        <ApplicantTable applicants={separateApplicants} showSeparateActions />
      </div>
    </div>
  );
}
