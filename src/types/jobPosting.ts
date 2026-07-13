export type CareerType = '신입' | '경력';
export type EmploymentType = '정규직' | '계약직' | '인턴';

export interface CoverLetterQuestion {
  id: string;
  question: string;
  maxLength?: number;
}

export type CompletionFormType = 'none' | 'period' | 'interview';

export interface StageStatus {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface AutoSendConfig {
  enabled: boolean;
  channels: ('email' | 'sms')[];
  title: string;
  body: string;
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  completionForm: CompletionFormType;
  statuses: StageStatus[];
  autoSend?: AutoSendConfig;
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
  stages: Stage[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageColorSwatch {
  id: string;
  label: string;
  className: string;
}

export const STAGE_COLOR_PALETTE: StageColorSwatch[] = [
  { id: 'gray', label: '회색', className: 'bg-muted text-muted-foreground' },
  { id: 'orange', label: '주황', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'green', label: '초록', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { id: 'blue', label: '파랑', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'red', label: '빨강', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'purple', label: '보라', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'pink', label: '분홍', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 'yellow', label: '노랑', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 'teal', label: '청록', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  { id: 'indigo', label: '남색', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
];

export function getStageColorClass(colorId: string): string {
  return STAGE_COLOR_PALETTE.find(c => c.id === colorId)?.className ?? STAGE_COLOR_PALETTE[0].className;
}

export function getFinalStage(stages: Stage[]): Stage | undefined {
  return [...stages].sort((a, b) => b.order - a.order)[0];
}

export function getInterviewStage(stages: Stage[]): Stage | undefined {
  return stages.find(s => s.completionForm === 'interview');
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

function progressStatuses(): StageStatus[] {
  return [
    { id: crypto.randomUUID(), name: '대기', color: 'gray', isDefault: true },
    { id: crypto.randomUUID(), name: '필요', color: 'orange' },
    { id: crypto.randomUUID(), name: '완료', color: 'green' },
  ];
}

function resultStatuses(): StageStatus[] {
  return [
    { id: crypto.randomUUID(), name: '대기', color: 'gray', isDefault: true },
    { id: crypto.randomUUID(), name: '합격', color: 'blue' },
    { id: crypto.randomUUID(), name: '불합격', color: 'red' },
  ];
}

export const DEFAULT_STAGE_NAMES = [
  '인성검사 안내',
  '인성검사 공고 등록',
  '인성검사 결과',
  '자사양식 안내',
  '자사양식 제출',
  '면접 안내',
  '면접 결과',
] as const;

export function createDefaultStages(): Stage[] {
  const defs: { name: string; completionForm: CompletionFormType; result?: boolean }[] = [
    { name: '인성검사 안내', completionForm: 'period' },
    { name: '인성검사 공고 등록', completionForm: 'none' },
    { name: '인성검사 결과', completionForm: 'none', result: true },
    { name: '자사양식 안내', completionForm: 'period' },
    { name: '자사양식 제출', completionForm: 'none' },
    { name: '면접 안내', completionForm: 'interview' },
    { name: '면접 결과', completionForm: 'none', result: true },
  ];
  return defs.map((d, i) => ({
    id: crypto.randomUUID(),
    name: d.name,
    order: i + 1,
    completionForm: d.completionForm,
    statuses: d.result ? resultStatuses() : progressStatuses(),
  }));
}
