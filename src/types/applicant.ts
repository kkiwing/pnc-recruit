import { Stage } from '@/types/jobPosting';
import { toDateStr } from '@/lib/utils';

export interface StageRecordMeta {
  startDate?: string;
  endDate?: string;
  time?: string;
  note?: string;
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

/**
 * 전형 단계와 무관하게 지정하는 최종 합불 판정. 특별 채용처럼 전형 구조를 다 거치지
 * 않고도 최종 결과를 확정해야 하는 예외를 다루기 위해, 단계 진행 상황(stageRecords)과
 * 완전히 분리된 필드로 둔다 — "구조는 단순하게, 예외는 메모로"라는 원칙에 따라 이런
 * 예외는 별도 상태값을 늘리는 대신 note에 사유를 적어 남긴다.
 */
export interface FinalResult {
  result: '합격' | '불합격';
  note?: string;
  decidedAt: string;
}

/** 최종 결과가 지정된 지원자의 전형 조작 UI(목록 셀렉트, 파이프라인 드래그/메뉴,
 * 상세 페이지 조작)를 잠글 때 공통으로 보여주는 안내 문구. */
export const FINAL_RESULT_LOCK_MESSAGE = '최종 결과가 지정되어 전형이 종료된 지원자입니다.';

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
  /** 전형 단계와 무관한 최종 합불 판정. 미정이면 null. */
  finalResult: FinalResult | null;
  isSeparateManagement: boolean;
  /** 별도 관리로 옮기는 사유. 정해진 목록에서 고르는 게 아니라 담당자가 직접 서술하는 자유 텍스트다. */
  separateReason?: string;
  /** 별도 관리로 전환된 일시. 사유를 나중에 수정해도 이 값은 최초 이동 시점 그대로 유지된다. */
  separatedAt?: string;
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

/** 순서상 마지막으로 시작 상태가 아닌 단계, 없으면 첫 단계를 현재 단계로 반환 */
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

/** 해당 단계가 시작 상태를 벗어나 처리되었는지 여부 (중간 상태 포함) */
export function isStageDone(stageRecords: StageRecord[], stage: Stage): boolean {
  const status = getStageRecordStatus(stageRecords, stage);
  return !!status && !status.isDefault;
}

/** 해당 단계의 현재 상태가 "단계 종료"(isCompletion)인지 여부. 한 단계 안에 종료
 * 상태가 여러 개일 수 있으므로(예: 합격/불합격 모두), 특정 하나의 "완료 상태"를
 * 찾는 대신 현재 상태 자체의 플래그를 직접 확인한다. */
export function isStageCompleted(stageRecords: StageRecord[], stage: Stage): boolean {
  const status = getStageRecordStatus(stageRecords, stage);
  return !!status?.isCompletion;
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

export type InterviewBucket = 'upcoming' | 'overdue' | 'completed';

export interface InterviewInfo {
  bucket: InterviewBucket;
  date?: string;
  time?: string;
  note?: string;
}

/**
 * 지원자의 면접 일정 상태를 계산한다. 특정 단계를 "면접 단계"로 못박아두지 않고,
 * 날짜 입력이 딸린 상태(hasDateInput) 중 실제로 시간(meta.time)까지 입력된 기록을
 * 찾아 그것을 면접 일정으로 취급한다(단계 구조가 바뀌어도 깨지지 않도록).
 * 그런 기록이 없으면 undefined(면접 자체가 잡히지 않은 지원자).
 * - completed: 최종 결과(finalResult)가 이미 확정됨 — 면접일과 무관하게 우선
 * - overdue: 면접일이 오늘보다 이전인데 최종 결과가 아직 없음 ("지난 면접")
 * - upcoming: 면접일이 오늘 이후(또는 날짜 미상)이고 최종 결과 미정
 */
export function getInterviewInfo(
  stageRecords: StageRecord[],
  stages: Stage[],
  finalResult: FinalResult | null,
  todayStr: string = toDateStr(new Date())
): InterviewInfo | undefined {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  let record: StageRecord | undefined;
  for (const stage of sorted) {
    const candidate = stageRecords.find(r => r.stageId === stage.id);
    if (candidate?.meta?.time) record = candidate;
  }
  if (!record) return undefined;

  const { endDate: date, time, note } = record.meta ?? {};
  if (finalResult) return { bucket: 'completed', date, time, note };
  if (date && date < todayStr) return { bucket: 'overdue', date, time, note };
  return { bucket: 'upcoming', date, time, note };
}
