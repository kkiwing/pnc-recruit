import { JobPosting, Stage, DEFAULT_COVER_LETTER_QUESTION_TEXTS } from '@/types/jobPosting';

function questionsFor(postingId: string) {
  return DEFAULT_COVER_LETTER_QUESTION_TEXTS.map((question, i) => ({
    id: `${postingId}-q${i + 1}`,
    question,
  }));
}

function progressStatusesFor(prefix: string) {
  return [
    { id: `${prefix}-s1`, name: '대기', color: 'gray', isDefault: true },
    { id: `${prefix}-s2`, name: '진행중', color: 'orange' },
    { id: `${prefix}-s3`, name: '완료', color: 'green', isCompletion: true },
  ];
}

function buildStages(postingId: string, defs: { name: string }[]): Stage[] {
  return defs.map((d, i) => {
    const prefix = `${postingId}-stage${i + 1}`;
    return {
      id: prefix,
      name: d.name,
      order: i + 1,
      statuses: progressStatusesFor(prefix),
    };
  });
}

/**
 * 기본 프로세스 프리셋(4단계: 인성검사→자사양식→면접→최종)과 동일한 구조를 안정적인
 * id로 구현한다(더미 지원자 데이터가 이 id를 참조하므로 crypto.randomUUID 대신
 * 고정 id를 쓴다). src/types/jobPosting.ts의 createDefaultStages()와 상태
 * 구성이 같다 — 실제 신규 공고 생성 시 프리셋을 복사한 결과와 동일한 모양. 단계 내
 * 합격/불합격 상태값은 없다 — 단계 통과는 다음 단계로의 이동으로, 탈락은
 * Applicant.finalResult(불합격)로 표현한다(2026-07-16 decision-log).
 */
function defaultStagesFor(postingId: string): Stage[] {
  const personality = `${postingId}-personality`;
  const form = `${postingId}-form`;
  const interview = `${postingId}-interview`;
  const final = `${postingId}-final`;
  return [
    {
      id: personality, name: '인성검사', order: 1,
      statuses: [
        { id: `${personality}-notice`, name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
        { id: `${personality}-registered`, name: '공고등록', color: 'orange' },
        { id: `${personality}-inprogress`, name: '진행완료', color: 'purple', isCompletion: true },
      ],
      autoSend: {
        enabled: true,
        channels: ['email'],
        title: '[{{회사명}}] 인성검사 안내',
        body: '안녕하세요, {{지원자명}}님.\n{{회사명}} {{포지션명}} 채용 인성검사 안내드립니다.\n아래 링크를 통해 진행해 주시기 바랍니다.\n\n{{링크}}',
      },
    },
    {
      id: form, name: '자사양식', order: 2,
      statuses: [
        { id: `${form}-notice`, name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
        { id: `${form}-done`, name: '작성완료', color: 'green', isCompletion: true },
      ],
      autoSend: {
        enabled: true,
        channels: ['email'],
        title: '[{{회사명}}] 자사양식 작성 안내',
        body: '안녕하세요, {{지원자명}}님.\n{{회사명}} {{포지션명}} 채용 자사 지원서 작성을 안내드립니다.\n아래 링크에서 작성해 주시기 바랍니다.\n\n{{링크}}',
      },
    },
    {
      id: interview, name: '면접', order: 3,
      statuses: [
        { id: `${interview}-notice`, name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
        { id: `${interview}-inprogress`, name: '진행완료', color: 'purple', isCompletion: true },
      ],
      autoSend: {
        enabled: true,
        channels: ['email', 'sms'],
        title: '[{{회사명}}] 면접 안내',
        body: '안녕하세요, {{지원자명}}님.\n{{회사명}} {{포지션명}} 면접 일정을 안내드립니다.\n일시: {{면접일시}}\n장소: {{면접장소}}',
      },
    },
    {
      id: final, name: '최종', order: 4,
      statuses: [
        { id: `${final}-notice`, name: '안내', color: 'gray', isDefault: true, hasDateInput: true },
        { id: `${final}-done`, name: '전형완료', color: 'green', isCompletion: true },
      ],
      autoSend: {
        enabled: true,
        channels: ['email'],
        title: '[{{회사명}}] 최종 전형 안내',
        body: '안녕하세요, {{지원자명}}님.\n{{회사명}} {{포지션명}} 최종 전형 안내드립니다.\n\n{{링크}}',
      },
    },
  ];
}

/** 대체 템플릿 예시: 서류-인성검사-적성검사/면접-임원면접 흐름. 기본 프리셋과 다른
 * 단계 구성도 공고별로 가능하다는 것을 보여주기 위해 한 공고(job-05)만 이 템플릿을
 * 쓴다. 상태 세트는 다른 일반 단계와 동일하게 대기(시작)/진행중/완료(단계종료)다. */
function executiveStagesFor(postingId: string): Stage[] {
  return buildStages(postingId, [
    { name: '서류' },
    { name: '인성검사' },
    { name: '적성검사 및 면접' },
    { name: '최종 임원 면접' },
  ]);
}

export const dummyJobPostings: JobPosting[] = [
  {
    id: 'job-01',
    title: '2026년 상반기 개발팀 신입/경력 채용',
    department: '개발',
    careerType: '경력',
    employmentType: '정규직',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    isPublic: true,
    description: '프론트엔드/백엔드 개발자 채용',
    content:
      '서비스의 프론트엔드 및 백엔드 개발을 담당할 개발자를 채용합니다. React/TypeScript 기반의 웹 프론트엔드 또는 Java/Spring, Node.js 기반의 서버 개발 경험이 있는 분을 우대합니다. 신규 서비스 설계부터 배포, 운영까지 전 과정에 참여하게 됩니다.',
    coverLetterQuestions: questionsFor('job-01'),
    stages: defaultStagesFor('job-01'),
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'job-02',
    title: '2026년 상반기 마케팅팀 채용',
    department: '마케팅',
    careerType: '신입',
    employmentType: '정규직',
    position: '퍼포먼스 마케터',
    startDate: '2026-03-10',
    endDate: '2026-07-31',
    isPublic: true,
    description: '디지털 마케팅 및 콘텐츠 기획',
    content:
      '디지털 채널 기반의 마케팅 캠페인 기획 및 운영, 콘텐츠 제작을 담당할 신입 마케터를 채용합니다. SNS/퍼포먼스 마케팅에 대한 이해가 있고, 데이터 기반으로 캠페인 성과를 분석하고 개선할 수 있는 분을 찾습니다.',
    coverLetterQuestions: questionsFor('job-02'),
    stages: defaultStagesFor('job-02'),
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'job-03',
    title: '2026년 디자인팀 경력 채용',
    department: '디자인',
    careerType: '경력',
    employmentType: '계약직',
    position: 'UX 디자이너',
    startDate: '2026-03-15',
    endDate: '2026-04-30',
    isPublic: true,
    description: 'UX/UI 디자이너 및 영상 디자이너',
    content:
      '서비스 전반의 UX/UI 디자인을 담당하거나, 브랜드 영상 콘텐츠를 제작할 경력 디자이너를 채용합니다. 사용자 리서치부터 프로토타이핑, 디자인 시스템 운영 경험이 있는 분을 우대합니다.',
    coverLetterQuestions: questionsFor('job-03'),
    stages: defaultStagesFor('job-03'),
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'job-04',
    title: '2026년 기획/인사팀 수시 채용',
    department: '기획/인사',
    careerType: '신입',
    employmentType: '정규직',
    startDate: '2026-03-20',
    endDate: '2026-08-15',
    isPublic: false,
    description: '서비스 기획 및 인사 담당자',
    content:
      '신규 서비스 기획 및 운영, 또는 채용/인사 제도 운영을 담당할 인원을 수시로 채용합니다. 내부 추천 및 별도 채널을 통한 지원을 우선 검토하고 있어 공개 채용 페이지에는 노출하지 않습니다.',
    coverLetterQuestions: questionsFor('job-04'),
    stages: defaultStagesFor('job-04'),
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'job-05',
    title: '2026년 재무/회계팀 경력 채용',
    department: '재무/회계',
    careerType: '경력',
    employmentType: '정규직',
    position: '회계 담당자',
    startDate: '2026-03-25',
    endDate: '2026-05-15',
    isPublic: true,
    description: '재무 분석 및 회계 담당자 채용',
    content:
      '월/분기/연 결산, 재무제표 작성, 예산 관리를 담당할 경력 회계 담당자를 채용합니다. 전표 처리부터 세무 신고까지 회계 전반의 실무 경험이 있는 분을 우대하며, 관련 자격증 보유자를 우대합니다.',
    coverLetterQuestions: questionsFor('job-05'),
    stages: executiveStagesFor('job-05'),
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-25T09:00:00Z',
  },
  {
    id: 'job-06',
    title: '2026년 데이터팀 신입 채용',
    department: '데이터',
    careerType: '신입',
    employmentType: '인턴',
    position: '데이터 분석 인턴',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    isPublic: true,
    description: '데이터 분석가 및 데이터 엔지니어',
    content:
      'SQL/Python 기반의 데이터 분석 및 파이프라인 구축을 담당할 신입 데이터 인력을 채용합니다. 통계 분석 도구 활용 경험이 있거나, 데이터 기반 의사결정에 관심이 많은 분을 찾습니다.',
    coverLetterQuestions: questionsFor('job-06'),
    stages: defaultStagesFor('job-06'),
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
  },
];
