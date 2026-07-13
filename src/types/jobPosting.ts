export type CareerType = '신입' | '경력';
export type EmploymentType = '정규직' | '계약직' | '인턴';

export interface CoverLetterQuestion {
  id: string;
  question: string;
  maxLength?: number;
}

export type CompletionFormType = 'none' | 'period' | 'interview';

/**
 * 단계의 성격. 'result'는 "합불을 판정하는 단계"(예: 인성검사 결과, 면접 결과)를
 * 명시적으로 나타낸다 — 순서상 마지막 단계라는 암묵적 가정 대신, 합불 집계
 * (getFinalStage 등)가 이 값을 근거로 판단한다.
 */
export type StageType = 'normal' | 'result';

export interface StageStatus {
  id: string;
  name: string;
  color: string;
  /** 아직 처리되지 않은 시작 상태 (예: 대기) */
  isDefault?: boolean;
  /** normal 단계에서 "처리 완료" 의미의 상태 (예: 완료) — 완료 입력폼(모달) 트리거 기준 */
  isCompletion?: boolean;
  /** result 단계에서 "합격" 의미의 상태 */
  isPass?: boolean;
  /** result 단계에서 "불합격" 의미의 상태 */
  isFail?: boolean;
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
  stageType: StageType;
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

/** stageType이 'result'인 단계들을 순서대로 반환 (합불을 판정하는 단계들) */
export function getResultStages(stages: Stage[]): Stage[] {
  return stages.filter(s => s.stageType === 'result').sort((a, b) => a.order - b.order);
}

/**
 * 최종 합불 판정 단계. stageType === 'result'인 단계 중 순서상 가장 마지막 단계를
 * 반환한다 — "파이프라인의 마지막 단계"가 아니라 "합불을 판정하는 단계"를 명시적으로
 * 찾는다. 예를 들어 면접 결과 뒤에 처우 협의 단계가 추가되어도 면접 결과가 계속
 * 최종 판정 단계로 인식된다. result 타입 단계가 하나도 없으면(레거시 데이터 등)
 * 순서상 마지막 단계로 폴백한다.
 */
export function getFinalStage(stages: Stage[]): Stage | undefined {
  const resultStages = getResultStages(stages);
  if (resultStages.length > 0) return resultStages[resultStages.length - 1];
  return [...stages].sort((a, b) => b.order - a.order)[0];
}

export function getInterviewStage(stages: Stage[]): Stage | undefined {
  return stages.find(s => s.completionForm === 'interview');
}

/** normal 단계에서 "처리 완료"를 의미하는 상태. isCompletion이 명시되지 않은
 * 레거시 단계는 목록의 마지막 상태로 폴백한다. */
export function getCompletionStatus(stage: Stage): StageStatus | undefined {
  const explicit = stage.statuses.find(s => s.isCompletion);
  if (explicit) return explicit;
  return stage.statuses[stage.statuses.length - 1];
}

/** result 단계에서 "합격"을 의미하는 상태. isPass가 명시되지 않은 레거시 단계는
 * 이름이 "합격"인 상태로 폴백한다. */
export function getPassStatus(stage: Stage): StageStatus | undefined {
  const explicit = stage.statuses.find(s => s.isPass);
  if (explicit) return explicit;
  return stage.statuses.find(s => s.name === '합격');
}

/** result 단계에서 "불합격"을 의미하는 상태. isFail이 명시되지 않은 레거시 단계는
 * 이름이 "불합격"인 상태로 폴백한다. */
export function getFailStatus(stage: Stage): StageStatus | undefined {
  const explicit = stage.statuses.find(s => s.isFail);
  if (explicit) return explicit;
  return stage.statuses.find(s => s.name === '불합격');
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
    { id: crypto.randomUUID(), name: '완료', color: 'green', isCompletion: true },
  ];
}

function resultStatuses(): StageStatus[] {
  return [
    { id: crypto.randomUUID(), name: '대기', color: 'gray', isDefault: true },
    { id: crypto.randomUUID(), name: '합격', color: 'blue', isPass: true },
    { id: crypto.randomUUID(), name: '불합격', color: 'red', isFail: true },
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
    stageType: d.result ? 'result' : 'normal',
    completionForm: d.completionForm,
    statuses: d.result ? resultStatuses() : progressStatuses(),
  }));
}
