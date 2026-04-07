export type SeparateManagementReason =
  | '지원 포기'
  | '인성 미응시'
  | '자사양식 미작성'
  | '면접 취소'
  | '지원 포기(인성 응시 후)'
  | '지원 포기(자사양식 작성 후)'
  | '지원 포기(면접 후)';

export type StepStatus = 'pending' | 'need' | 'done' | 'pass' | 'fail';

export interface StepDetail {
  status: StepStatus;
  startDate?: string;
  endDate?: string;
  time?: string;
  interviewer?: string;
  updatedAt?: string;
}

export interface RecruitmentStatus {
  personalityTestNotice: StepDetail;    // 인성검사 안내
  personalityTestRegistration: StepDetail; // 인성검사 공고 등록
  personalityTestResult: StepDetail;    // 인성검사 합격/불합격
  companyFormNotice: StepDetail;        // 자사양식 안내
  companyFormSubmission: StepDetail;    // 자사양식 제출
  interviewNotice: StepDetail;         // 면접 안내
  interviewResult: StepDetail;         // 면접 합격/불합격
}

export interface Applicant {
  id: string;
  no: number;
  team: string;
  name: string;
  platform: string;
  birthYear: string;
  email: string;
  phone: string;
  region: string;
  regionDetail: string;
  school: string;
  major: string;
  career: string;
  memo: string;
  applicationDate: string;
  recruitmentStatus: RecruitmentStatus;
  isSeparateManagement: boolean;
  separateReason?: SeparateManagementReason;
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

export const STEP_LABELS: Record<keyof RecruitmentStatus, string> = {
  personalityTestNotice: '인성검사 안내',
  personalityTestRegistration: '인성검사 공고 등록',
  personalityTestResult: '인성검사 결과',
  companyFormNotice: '자사양식 안내',
  companyFormSubmission: '자사양식 제출',
  interviewNotice: '면접 안내',
  interviewResult: '면접 결과',
};

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

export function createDefaultRecruitmentStatus(): RecruitmentStatus {
  const defaultStep: StepDetail = { status: 'pending' };
  return {
    personalityTestNotice: { ...defaultStep },
    personalityTestRegistration: { ...defaultStep },
    personalityTestResult: { ...defaultStep },
    companyFormNotice: { ...defaultStep },
    companyFormSubmission: { ...defaultStep },
    interviewNotice: { ...defaultStep },
    interviewResult: { ...defaultStep },
  };
}
