import { JobPosting, DEFAULT_COVER_LETTER_QUESTION_TEXTS } from '@/types/jobPosting';

function questionsFor(postingId: string) {
  return DEFAULT_COVER_LETTER_QUESTION_TEXTS.map((question, i) => ({
    id: `${postingId}-q${i + 1}`,
    question,
  }));
}

export const dummyJobPostings: JobPosting[] = [
  {
    id: 'job-01',
    title: '2026년 상반기 개발팀 신입/경력 채용',
    department: '개발',
    careerType: '경력',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    isPublic: true,
    description: '프론트엔드/백엔드 개발자 채용',
    content:
      '서비스의 프론트엔드 및 백엔드 개발을 담당할 개발자를 채용합니다. React/TypeScript 기반의 웹 프론트엔드 또는 Java/Spring, Node.js 기반의 서버 개발 경험이 있는 분을 우대합니다. 신규 서비스 설계부터 배포, 운영까지 전 과정에 참여하게 됩니다.',
    coverLetterQuestions: questionsFor('job-01'),
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'job-02',
    title: '2026년 상반기 마케팅팀 채용',
    department: '마케팅',
    careerType: '신입',
    startDate: '2026-03-10',
    endDate: '2026-07-31',
    isPublic: true,
    description: '디지털 마케팅 및 콘텐츠 기획',
    content:
      '디지털 채널 기반의 마케팅 캠페인 기획 및 운영, 콘텐츠 제작을 담당할 신입 마케터를 채용합니다. SNS/퍼포먼스 마케팅에 대한 이해가 있고, 데이터 기반으로 캠페인 성과를 분석하고 개선할 수 있는 분을 찾습니다.',
    coverLetterQuestions: questionsFor('job-02'),
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'job-03',
    title: '2026년 디자인팀 경력 채용',
    department: '디자인',
    careerType: '경력',
    startDate: '2026-03-15',
    endDate: '2026-04-30',
    isPublic: true,
    description: 'UX/UI 디자이너 및 영상 디자이너',
    content:
      '서비스 전반의 UX/UI 디자인을 담당하거나, 브랜드 영상 콘텐츠를 제작할 경력 디자이너를 채용합니다. 사용자 리서치부터 프로토타이핑, 디자인 시스템 운영 경험이 있는 분을 우대합니다.',
    coverLetterQuestions: questionsFor('job-03'),
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'job-04',
    title: '2026년 기획/인사팀 수시 채용',
    department: '기획/인사',
    careerType: '신입',
    startDate: '2026-03-20',
    endDate: '2026-08-15',
    isPublic: false,
    description: '서비스 기획 및 인사 담당자',
    content:
      '신규 서비스 기획 및 운영, 또는 채용/인사 제도 운영을 담당할 인원을 수시로 채용합니다. 내부 추천 및 별도 채널을 통한 지원을 우선 검토하고 있어 공개 채용 페이지에는 노출하지 않습니다.',
    coverLetterQuestions: questionsFor('job-04'),
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'job-05',
    title: '2026년 재무/회계팀 경력 채용',
    department: '재무/회계',
    careerType: '경력',
    startDate: '2026-03-25',
    endDate: '2026-05-15',
    isPublic: true,
    description: '재무 분석 및 회계 담당자 채용',
    content:
      '월/분기/연 결산, 재무제표 작성, 예산 관리를 담당할 경력 회계 담당자를 채용합니다. 전표 처리부터 세무 신고까지 회계 전반의 실무 경험이 있는 분을 우대하며, 관련 자격증 보유자를 우대합니다.',
    coverLetterQuestions: questionsFor('job-05'),
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-25T09:00:00Z',
  },
  {
    id: 'job-06',
    title: '2026년 데이터팀 신입 채용',
    department: '데이터',
    careerType: '신입',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    isPublic: true,
    description: '데이터 분석가 및 데이터 엔지니어',
    content:
      'SQL/Python 기반의 데이터 분석 및 파이프라인 구축을 담당할 신입 데이터 인력을 채용합니다. 통계 분석 도구 활용 경험이 있거나, 데이터 기반 의사결정에 관심이 많은 분을 찾습니다.',
    coverLetterQuestions: questionsFor('job-06'),
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
  },
];
