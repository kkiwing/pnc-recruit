export type CareerType = '신입' | '경력';
export type EmploymentType = '정규직' | '계약직' | '인턴';

export interface CoverLetterQuestion {
  id: string;
  question: string;
  maxLength?: number;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  careerType: CareerType;
  employmentType: EmploymentType;
  position?: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  description: string;
  content: string;
  coverLetterQuestions: CoverLetterQuestion[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type JobPostingStatus = '진행중' | '종료';

export function getJobPostingStatus(job: Pick<JobPosting, 'endDate'>, now: Date = new Date()): JobPostingStatus {
  if (!job.endDate) return '진행중';
  const end = new Date(`${job.endDate}T23:59:59`);
  return now.getTime() > end.getTime() ? '종료' : '진행중';
}

export const JOB_POSTING_STATUS_COLORS: Record<JobPostingStatus, string> = {
  '진행중': 'bg-emerald-100 text-emerald-800',
  '종료': 'bg-muted text-muted-foreground',
};

export const DEFAULT_COVER_LETTER_QUESTION_TEXTS = [
  '지원 동기를 작성해주세요.',
  '흥미를 느낀 사업 분야와 그 이유를 작성해주세요.',
  '새로운 지식이나 기술을 배우기 위해 노력했던 경험을 작성해주세요.',
  '문제를 발견하고 개선했던 경험을 작성해주세요.',
];

export function createDefaultCoverLetterQuestions(): CoverLetterQuestion[] {
  return DEFAULT_COVER_LETTER_QUESTION_TEXTS.map(question => ({
    id: crypto.randomUUID(),
    question,
  }));
}
