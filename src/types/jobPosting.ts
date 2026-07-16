export type CareerType = '신입' | '경력';
export type EmploymentType = '정규직' | '계약직' | '인턴';

export interface CoverLetterQuestion {
  id: string;
  question: string;
  maxLength?: number;
}

export interface StageStatus {
  id: string;
  name: string;
  color: string;
  /** 아직 처리되지 않은 시작 상태. statuses 배열의 첫 번째 항목과 항상 동기화되며
   * (syncDefaultStatus 참고), 별도로 지정하는 UI는 없다 — 순서를 바꾸면 따라간다. */
  isDefault?: boolean;
  /** 이 상태가 되면 해당 단계가 끝난 것으로 집계된다("단계 종료"). 한 단계 안에
   * 항상 최대 1개 상태만 이 플래그를 가질 수 있다(완전 배타, 2026-07-15 결정). */
  isCompletion?: boolean;
  /** 이 상태로 바꿀 때 날짜(기간)+시간(선택)+메모 입력 모달을 띄울지 여부. 예전에는
   * 단계 속성(completionForm)이었으나, "안내" 성격의 상태만 날짜가 필요하다는 점을
   * 더 정확히 표현하기 위해 상태 속성으로 옮겼다. */
  hasDateInput?: boolean;
}

export interface AutoSendConfig {
  enabled: boolean;
  channels: ('email' | 'sms')[];
  title: string;
  body: string;
}

/**
 * 단계에는 "합불 판정 단계"와 "일반 단계" 같은 구분이 없다. "합격"/"불합격"이라는
 * 이름의 상태값은 그저 이름과 색을 가진 일반 상태로 존재할 수 있고(진행 상황을
 * 보여주는 용도), 집계에는 전혀 쓰이지 않는다 — 최종 합불은 오직
 * Applicant.finalResult로만 판단한다. 단계별로 합불을 판정한다는 개념 자체를
 * 프로토타입 검증 과정에서 폐지했다(2026-07-15 decision-log 참고): 상태값 관리
 * 화면에 "구분"·"합격으로"·"불합격으로" 같은 개념이 늘어나 복잡도만 커지고,
 * 실제로 필요한 것은 finalResult 하나로 충분했다.
 */
export interface Stage {
  id: string;
  name: string;
  order: number;
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
  /** 배지 배경색 (hex) — 텍스트 색은 getContrastTextColor로 자동 계산 */
  hex: string;
}

export const STAGE_COLOR_PALETTE: StageColorSwatch[] = [
  { id: 'gray', label: '회색', hex: '#71717a' },
  { id: 'orange', label: '주황', hex: '#f59e0b' },
  { id: 'green', label: '초록', hex: '#10b981' },
  { id: 'blue', label: '파랑', hex: '#3b82f6' },
  { id: 'red', label: '빨강', hex: '#ef4444' },
  { id: 'purple', label: '보라', hex: '#8b5cf6' },
  { id: 'pink', label: '분홍', hex: '#ec4899' },
  { id: 'yellow', label: '노랑', hex: '#eab308' },
  { id: 'teal', label: '청록', hex: '#14b8a6' },
  { id: 'indigo', label: '남색', hex: '#6366f1' },
];

export function getStageColorHex(colorId: string): string {
  return STAGE_COLOR_PALETTE.find(c => c.id === colorId)?.hex ?? STAGE_COLOR_PALETTE[0].hex;
}

/** statuses 배열의 첫 번째 항목을 isDefault=true로, 나머지를 false로 맞춘다.
 * 상태 목록을 추가/삭제/순서 변경할 때마다 반드시 이 함수를 거쳐야 "시작 상태 =
 * 목록 맨 위"라는 불변식이 유지된다(상태 관리 모달에서 별도로 "시작"을 지정하는
 * UI는 없다 — 순서를 바꾸면 자동으로 따라간다). */
export function syncDefaultStatus(statuses: StageStatus[]): StageStatus[] {
  return statuses.map((s, i) => ({ ...s, isDefault: i === 0 }));
}

export type JobPostingStatus = '진행중' | '종료';

export function getJobPostingStatus(job: Pick<JobPosting, 'endDate'>, now: Date = new Date()): JobPostingStatus {
  if (!job.endDate) return '진행중';
  const end = new Date(`${job.endDate}T23:59:59`);
  return now.getTime() > end.getTime() ? '종료' : '진행중';
}

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

/** "단계 추가"에서 새 단계에 기본으로 적용하는 상태 세트. */
export function progressStatuses(): StageStatus[] {
  return [
    { id: crypto.randomUUID(), name: '대기', color: 'gray', isDefault: true },
    { id: crypto.randomUUID(), name: '진행중', color: 'orange' },
    { id: crypto.randomUUID(), name: '완료', color: 'green', isCompletion: true },
  ];
}

export const DEFAULT_STAGE_NAMES = ['인성검사', '자사양식', '면접', '최종'] as const;

/** 단계 배열을 새 id로 깊은 복사한다. 프리셋을 새 공고에 스냅샷으로 복사할 때,
 * 이후 프리셋 수정이 이미 생성된 공고에 영향을 주지 않도록 참조를 완전히 분리한다. */
export function cloneStages(stages: Stage[]): Stage[] {
  return stages.map(s => ({
    ...s,
    id: crypto.randomUUID(),
    statuses: s.statuses.map(st => ({ ...st, id: crypto.randomUUID() })),
    autoSend: s.autoSend ? { ...s.autoSend, channels: [...s.autoSend.channels] } : undefined,
  }));
}

/**
 * 기본 프로세스 프리셋(4단계): 인성검사 → 자사양식 → 면접 → 최종.
 * 각 단계의 첫 상태가 시작 상태이고, 각 단계의 마지막 상태가 단계 종료(isCompletion)다.
 * 단계 내 합격/불합격 상태값은 존재하지 않는다 — 단계 통과는 "다음 단계로의 이동"으로,
 * 탈락은 Applicant.finalResult(불합격)로 표현하므로 경유지 성격의 합불 상태는 군더더기이자
 * 단계종료 배타 규칙(2.12)을 깨는 원인이었다(2026-07-16 decision-log, "구조는 단순하게"
 * 원칙의 마무리). "안내" 상태만 hasDateInput으로 날짜+메모 입력을 받는다. 최종 합격/불합격은
 * Applicant.finalResult로 전형 구조와 무관하게 별도 지정한다(특별 채용 등 예외 대응).
 */
export function createDefaultStages(): Stage[] {
  const stage = (name: string, statuses: StageStatus[]): Omit<Stage, 'id' | 'order'> => ({
    name,
    statuses,
  });

  const defs = [
    stage('인성검사', [
      { id: crypto.randomUUID(), name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
      { id: crypto.randomUUID(), name: '공고등록', color: 'orange' },
      { id: crypto.randomUUID(), name: '진행완료', color: 'purple', isCompletion: true },
    ]),
    stage('자사양식', [
      { id: crypto.randomUUID(), name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
      { id: crypto.randomUUID(), name: '작성완료', color: 'green', isCompletion: true },
    ]),
    stage('면접', [
      { id: crypto.randomUUID(), name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
      { id: crypto.randomUUID(), name: '진행완료', color: 'purple', isCompletion: true },
    ]),
    stage('최종', [
      { id: crypto.randomUUID(), name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
      { id: crypto.randomUUID(), name: '전형완료', color: 'green', isCompletion: true },
    ]),
  ];

  return defs.map((d, i) => ({ ...d, id: crypto.randomUUID(), order: i + 1 }));
}
