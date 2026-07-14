import { Stage, getCompletionStatus, getPassStatus } from '@/types/jobPosting';

export type SeparateManagementReason =
  | '지원 포기'
  | '인성 미응시'
  | '자사양식 미작성'
  | '면접 취소'
  | '지원 포기(인성 응시 후)'
  | '지원 포기(자사양식 작성 후)'
  | '지원 포기(면접 후)';

export interface StageRecordMeta {
  startDate?: string;
  endDate?: string;
  time?: string;
  interviewer?: string;
}

export interface StageRecord {
  stageId: string;
  statusId: string;
  meta?: StageRecordMeta;
  updatedAt: string;
}

export type Gender = '남성' | '여성';

export interface EducationEntry {
  schoolName: string;
  degree: '대학교' | '대학원';
  period: string;
  majorField: string;
  major: string;
  minor?: string;
  gpa: number;
  gpaMax: number;
}

export interface CertificateEntry {
  name: string;
  issuer: string;
  acquiredDate: string;
}

export interface CareerEntry {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface ActivityEntry {
  name: string;
  role: string;
  organization: string;
  period: string;
  description: string;
}

export interface StatisticsPackageEntry {
  name: string;
  level: string;
  detail: string;
}

export interface ThesisInfo {
  title: string;
  keyword: string;
  summary: string;
}

export interface CoverLetterAnswer {
  questionId: string;
  answer: string;
}

export type SubmissionStatus = '완료' | '미완료';

export interface Applicant {
  id: string;
  no: number;
  jobPostingId: string;
  team: string;
  name: string;
  platform: string;
  gender: Gender;
  birthDate: string;
  email: string;
  phone: string;
  region: string;
  regionDetail: string;
  address: string;
  educations: EducationEntry[];
  certificates: CertificateEntry[];
  careers: CareerEntry[];
  activities: ActivityEntry[];
  statisticsPackages: StatisticsPackageEntry[];
  thesis?: ThesisInfo;
  coverLetter: CoverLetterAnswer[];
  submissionStatus: SubmissionStatus;
  memo: string;
  applicationDate: string;
  stageRecords: StageRecord[];
  isSeparateManagement: boolean;
  separateReason?: SeparateManagementReason;
  /** 별도관리로 전환된 시점의 단계 id — 이후 stageRecords가 바뀌어도 "당시 진행 단계" 표시가 흔들리지 않도록 스냅샷 */
  separateStageId?: string;
  files: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export const SEPARATE_REASONS: SeparateManagementReason[] = [
  '지원 포기',
  '인성 미응시',
  '자사양식 미작성',
  '면접 취소',
  '지원 포기(인성 응시 후)',
  '지원 포기(자사양식 작성 후)',
  '지원 포기(면접 후)',
];

export const REGION_INTERVIEW_FEE: Record<string, string> = {
  '서울': '면접비 미지원',
  '경기': '면접비 미지원',
  '인천': '면접비 미지원',
  '부산': '왕복 교통비 지원',
  '대구': '왕복 교통비 지원',
  '광주': '왕복 교통비 지원',
  '대전': '왕복 교통비 지원',
  '울산': '왕복 교통비 지원',
  '세종': '왕복 교통비 지원',
  '강원': '왕복 교통비 지원',
  '충북': '왕복 교통비 지원',
  '충남': '왕복 교통비 지원',
  '전북': '왕복 교통비 지원',
  '전남': '왕복 교통비 지원',
  '경북': '왕복 교통비 지원',
  '경남': '왕복 교통비 지원',
  '제주': '왕복 교통비 + 숙박비 지원',
};

export function createDefaultStageRecords(stages: Stage[]): StageRecord[] {
  const now = new Date().toISOString();
  return stages.map(stage => {
    const defaultStatus = stage.statuses.find(s => s.isDefault) ?? stage.statuses[0];
    return { stageId: stage.id, statusId: defaultStatus?.id ?? '', updatedAt: now };
  });
}

function findStageStatus(stage: Stage, statusId: string) {
  return stage.statuses.find(s => s.id === statusId);
}

function getDefaultStageStatus(stage: Stage) {
  return stage.statuses.find(s => s.isDefault) ?? stage.statuses[0];
}

/**
 * stageRecords에서 해당 단계의 상태를 조회한다. 기록이 아예 없는 경우(예: 지원자
 * 생성 이후 새로 추가된 단계)나, 기록은 있지만 참조 중인 statusId가 더 이상
 * 존재하지 않는 경우(프로세스 관리에서 해당 상태를 삭제)에는 단계의 기본 상태로
 * 안전하게 폴백한다. 모든 단계 관련 파생 함수는 이 함수를 거쳐야 한다.
 */
export function getStageRecordStatus(stageRecords: StageRecord[], stage: Stage) {
  const record = stageRecords.find(r => r.stageId === stage.id);
  const status = record && findStageStatus(stage, record.statusId);
  return status ?? getDefaultStageStatus(stage);
}

/** 순서상 마지막으로 '대기(기본)'가 아닌 단계, 없으면 첫 단계를 현재 단계로 반환 */
export function getCurrentStage(stageRecords: StageRecord[], stages: Stage[]): Stage | undefined {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  let current: Stage | undefined = sorted[0];
  for (const stage of sorted) {
    const status = getStageRecordStatus(stageRecords, stage);
    if (status && !status.isDefault) {
      current = stage;
    }
  }
  return current;
}

/** 해당 단계가 기본(대기) 상태를 벗어나 처리되었는지 여부 (중간 상태 포함) */
export function isStageDone(stageRecords: StageRecord[], stage: Stage): boolean {
  const status = getStageRecordStatus(stageRecords, stage);
  return !!status && !status.isDefault;
}

/** 해당 단계가 "처리 완료"(isCompletion) 상태까지 도달했는지 여부 — '필요'처럼 중간 상태는 제외 */
export function isStageCompleted(stageRecords: StageRecord[], stage: Stage): boolean {
  const completionStatus = getCompletionStatus(stage);
  const status = getStageRecordStatus(stageRecords, stage);
  return !!completionStatus && status?.id === completionStatus.id;
}

/** 해당 단계의 현재 상태가 "합격"(isPass)인지 여부 */
export function isStagePassed(stageRecords: StageRecord[], stage: Stage): boolean {
  const passStatus = getPassStatus(stage);
  const status = getStageRecordStatus(stageRecords, stage);
  return !!passStatus && status?.id === passStatus.id;
}

/**
 * 별도관리 전환 시점의 단계를 반환한다. separateStageId 스냅샷이 있고 해당 단계가
 * 아직 존재하면 그 단계를, 없으면(스냅샷이 없는 레거시 데이터이거나 단계가 삭제된
 * 경우) stageRecords 기준 현재 단계로 폴백한다.
 */
export function getSeparationStage(applicant: Pick<Applicant, 'stageRecords' | 'separateStageId'>, stages: Stage[]): Stage | undefined {
  if (applicant.separateStageId) {
    const stage = stages.find(s => s.id === applicant.separateStageId);
    if (stage) return stage;
  }
  return getCurrentStage(applicant.stageRecords, stages);
}

/** 생년월일(YYYY-MM-DD)에서 출생연도만 뽑아 표시용으로 쓴다. 별도 필드로 저장하지 않는다. */
export function getBirthYear(birthDate: string): string {
  return birthDate.slice(0, 4);
}
