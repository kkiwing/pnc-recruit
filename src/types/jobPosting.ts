export interface JobPosting {
  id: string;
  title: string;
  department: string;
  status: 'open' | 'closed' | 'draft';
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const JOB_POSTING_STATUS_LABELS: Record<JobPosting['status'], string> = {
  open: '진행중',
  closed: '마감',
  draft: '준비중',
};
