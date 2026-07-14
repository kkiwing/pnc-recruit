import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobPosting } from '@/types/jobPosting';

interface Props {
  jobPostings: JobPosting[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** "전체 공고" + 개별 공고를 고르는 셀렉트. 지원자 목록/별도 관리 등에서 공유한다. */
export default function JobPostingSelect({ jobPostings, value, onChange, className }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? 'max-w-[220px]'}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">전체 공고</SelectItem>
        {jobPostings.map(job => (
          <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
