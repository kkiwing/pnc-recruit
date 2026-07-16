import {
  Applicant,
  Gender, EducationEntry, CertificateEntry, CareerEntry, ActivityEntry,
  StatisticsPackageEntry, ThesisInfo, CoverLetterAnswer, SubmissionStatus,
  StageRecord, StageRecordMeta, FinalResult,
} from '@/types/applicant';
import { JobPosting, Stage } from '@/types/jobPosting';
import { dummyJobPostings } from './dummyJobPostings';

/** 각 단계에서 지원자가 현재 어느 상태인지를 상태 이름으로 직접 지정한다. 예전에는
 * 구(舊) 7단계 pass/fail 원시값을 상태 이름으로 재해석하는 변환 레이어가 있었지만,
 * 단계 내 합불 상태값 자체가 폐지되면서(2026-07-16 decision-log) 그 변환이 더 이상
 * 필요 없어졌다 — 각 지원자가 각 단계의 상태를 직접 명시하는 편이 더 단순하고 명확하다. */
interface StageProgress {
  status: string;
  meta?: StageRecordMeta;
}

function prog(status: string, meta?: StageRecordMeta): StageProgress {
  return meta ? { status, meta } : { status };
}

// ── 원본 지원자 데이터 (기본정보 + 전형현황) ────────────────────────────
// school/major/career는 신규 구조화 필드(educations/careers 등)를 만들기 위한 생성 입력으로 사용됨.
interface RawApplicant {
  id: string; no: number; jobPostingId: string; team: string; name: string; platform: string;
  birthYear: string; email: string; phone: string; region: string; regionDetail: string;
  school: string; major: string; career: string; memo: string; applicationDate: string;
  /** 공고의 stages 순서대로 각 단계의 현재 상태. 기본 프리셋(인성검사/자사양식/면접/최종)
   * 공고는 4개, job-05(서류/인성검사/적성검사및면접/최종임원면접)도 4개. */
  progress: [StageProgress, StageProgress, StageProgress, StageProgress];
  /** 지원서(자기소개서 등) 제출 완료 여부 — 전형 진행 상황과는 별개다. 특별 채용 케이스
   * (d06-07)만 아직 지원서조차 없는 예외로 미완료를 쓴다. */
  submitted: boolean;
  isSeparateManagement: boolean; separateReason?: string; separatedAt?: string;
  createdAt: string; updatedAt: string;
}

const rawApplicants: RawApplicant[] = [
  // ===== job-01: 개발팀 (12명, 별도관리 2명 포함) =====
  {
    id: 'd01-01', no: 1, jobPostingId: 'job-01', team: '프론트엔드', name: '김민준', platform: '사람인', birthYear: '1995', email: 'minjun.kim@gmail.com', phone: '010-1234-5678', region: '서울', regionDetail: '강남구', school: '서울대학교', major: '컴퓨터공학', career: '경력 3년', memo: 'React/TypeScript 능숙', applicationDate: '2026-03-05',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('안내', { startDate: '2026-07-08', endDate: '2026-07-08', time: '10:00', note: '박과장' }),
      prog('안내'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd01-02', no: 2, jobPostingId: 'job-01', team: '백엔드', name: '이서준', platform: '잡코리아', birthYear: '1993', email: 'seojun.lee@naver.com', phone: '010-2345-6789', region: '경기', regionDetail: '성남시 분당구', school: '카이스트', major: '전산학', career: '경력 5년', memo: 'Java/Spring 전문', applicationDate: '2026-03-06',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('진행완료', { startDate: '2026-04-12', endDate: '2026-04-12', time: '14:00', note: '김부장' }),
      prog('전형완료'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-06T09:00:00Z', updatedAt: '2026-04-12T16:00:00Z',
  },
  {
    id: 'd01-03', no: 3, jobPostingId: 'job-01', team: '프론트엔드', name: '박지호', platform: '링크드인', birthYear: '1997', email: 'jiho.park@gmail.com', phone: '010-3456-7890', region: '서울', regionDetail: '마포구', school: '연세대학교', major: '소프트웨어학', career: '경력 2년', memo: '', applicationDate: '2026-03-07',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('진행완료', { startDate: '2026-04-11', endDate: '2026-04-11', time: '11:00', note: '박과장' }),
      prog('안내'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-07T09:00:00Z', updatedAt: '2026-04-11T15:00:00Z',
  },
  {
    id: 'd01-04', no: 4, jobPostingId: 'job-01', team: '백엔드', name: '최예진', platform: '사람인', birthYear: '1998', email: 'yejin.choi@hanmail.net', phone: '010-4567-8901', region: '부산', regionDetail: '해운대구', school: '부산대학교', major: '정보컴퓨터공학', career: '신입', memo: '인턴 경험 있음', applicationDate: '2026-03-08',
    progress: [prog('진행완료'), prog('작성완료'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-08T09:00:00Z', updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'd01-05', no: 5, jobPostingId: 'job-01', team: '프론트엔드', name: '정하은', platform: '워크넷', birthYear: '1999', email: 'haeun.jung@gmail.com', phone: '010-5678-9012', region: '인천', regionDetail: '연수구', school: '인하대학교', major: '컴퓨터공학', career: '신입', memo: '', applicationDate: '2026-03-10',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-30T10:00:00Z',
  },
  {
    id: 'd01-06', no: 6, jobPostingId: 'job-01', team: '백엔드', name: '강도윤', platform: '잡코리아', birthYear: '1994', email: 'doyun.kang@daum.net', phone: '010-6789-0123', region: '대전', regionDetail: '유성구', school: '충남대학교', major: '전자공학', career: '경력 4년', memo: 'AWS 자격증 보유', applicationDate: '2026-03-11',
    progress: [prog('진행완료'), prog('안내', { startDate: '2026-03-27', endDate: '2026-04-02' }), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-11T09:00:00Z', updatedAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'd01-07', no: 7, jobPostingId: 'job-01', team: '프론트엔드', name: '윤시우', platform: '직접지원', birthYear: '1992', email: 'siwoo.yoon@gmail.com', phone: '010-7890-1234', region: '경기', regionDetail: '수원시 영통구', school: '성균관대학교', major: '소프트웨어학', career: '경력 6년', memo: '시니어급, 팀리드 경험', applicationDate: '2026-03-12',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-12T09:00:00Z', updatedAt: '2026-03-26T10:00:00Z',
  },
  {
    id: 'd01-08', no: 8, jobPostingId: 'job-01', team: '백엔드', name: '한수민', platform: '인크루트', birthYear: '2000', email: 'sumin.han@naver.com', phone: '010-8901-2345', region: '서울', regionDetail: '동작구', school: '숭실대학교', major: '컴퓨터학부', career: '신입', memo: '', applicationDate: '2026-03-14',
    progress: [prog('공고등록'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-14T09:00:00Z', updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'd01-09', no: 9, jobPostingId: 'job-01', team: '프론트엔드', name: '오태현', platform: '사람인', birthYear: '1996', email: 'taehyun.oh@gmail.com', phone: '010-9012-3456', region: '서울', regionDetail: '관악구', school: '서울시립대학교', major: '컴퓨터과학', career: '경력 2년', memo: '', applicationDate: '2026-03-15',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'd01-10', no: 10, jobPostingId: 'job-01', team: '백엔드', name: '임채원', platform: '잡코리아', birthYear: '2001', email: 'chaewon.lim@naver.com', phone: '010-0123-4567', region: '강원', regionDetail: '원주시', school: '강원대학교', major: '정보통신', career: '신입', memo: '', applicationDate: '2026-03-18',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-18T09:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'd01-11', no: 11, jobPostingId: 'job-01', team: '프론트엔드', name: '서유빈', platform: '링크드인', birthYear: '1998', email: 'yubin.seo@gmail.com', phone: '010-1122-3344', region: '경기', regionDetail: '고양시 일산동구', school: '한양대학교', major: '컴퓨터공학', career: '경력 1년', memo: '인성검사 미응시', applicationDate: '2026-03-06',
    progress: [prog('안내', { startDate: '2026-03-10', endDate: '2026-03-20' }), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: true, separateReason: '인성검사 안내 발송 후 응시 기한(3/20)까지 연락이 닿지 않아 미응시 처리함.', separatedAt: '2026-03-22T10:00:00Z', createdAt: '2026-03-06T09:00:00Z', updatedAt: '2026-03-22T10:00:00Z',
  },
  {
    id: 'd01-12', no: 12, jobPostingId: 'job-01', team: '백엔드', name: '조현서', platform: '워크넷', birthYear: '1997', email: 'hyunseo.jo@naver.com', phone: '010-2233-4455', region: '서울', regionDetail: '송파구', school: '건국대학교', major: '소프트웨어학', career: '경력 2년', memo: '개인 사유로 포기', applicationDate: '2026-03-07',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: true, separateReason: '인성검사까지는 응시했으나 이후 연락 두절, 개인 사정으로 전형 포기 의사 확인.', separatedAt: '2026-03-25T10:00:00Z', createdAt: '2026-03-07T09:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },

  // ===== job-02: 마케팅팀 (9명, 별도관리 1명 포함) =====
  {
    id: 'd02-01', no: 13, jobPostingId: 'job-02', team: '콘텐츠마케팅', name: '이서연', platform: '잡코리아', birthYear: '1997', email: 'seoyeon.lee@naver.com', phone: '010-3344-5566', region: '서울', regionDetail: '강서구', school: '고려대학교', major: '미디어학', career: '경력 2년', memo: '영어 능통', applicationDate: '2026-03-12',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('안내', { startDate: '2026-07-18', endDate: '2026-07-18', time: '14:00', note: '이차장' }),
      prog('안내'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-12T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd02-02', no: 14, jobPostingId: 'job-02', team: '퍼포먼스마케팅', name: '박채린', platform: '사람인', birthYear: '1996', email: 'chaerin.park@gmail.com', phone: '010-4455-6677', region: '경기', regionDetail: '안양시 동안구', school: '이화여자대학교', major: '경영학', career: '경력 3년', memo: 'Google Ads 전문', applicationDate: '2026-03-13',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('진행완료', { startDate: '2026-04-10', endDate: '2026-04-10', time: '15:00', note: '이차장' }),
      prog('전형완료'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-13T09:00:00Z', updatedAt: '2026-04-10T17:00:00Z',
  },
  {
    id: 'd02-03', no: 15, jobPostingId: 'job-02', team: '콘텐츠마케팅', name: '신유진', platform: '인크루트', birthYear: '1998', email: 'yujin.shin@gmail.com', phone: '010-5566-7788', region: '서울', regionDetail: '서대문구', school: '중앙대학교', major: '광고홍보', career: '경력 1년', memo: '콘텐츠 제작 경험', applicationDate: '2026-03-14',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-14T09:00:00Z', updatedAt: '2026-03-30T10:00:00Z',
  },
  {
    id: 'd02-04', no: 16, jobPostingId: 'job-02', team: '브랜드마케팅', name: '강하은', platform: '워크넷', birthYear: '1999', email: 'haeun.kang@naver.com', phone: '010-6677-8899', region: '광주', regionDetail: '서구', school: '전남대학교', major: '국어국문', career: '신입', memo: '', applicationDate: '2026-03-15',
    progress: [prog('진행완료'), prog('안내', { startDate: '2026-04-01', endDate: '2026-04-07' }), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'd02-05', no: 17, jobPostingId: 'job-02', team: '퍼포먼스마케팅', name: '홍채원', platform: '잡코리아', birthYear: '2001', email: 'chaewon.hong@naver.com', phone: '010-7788-9900', region: '강원', regionDetail: '춘천시', school: '강원대학교', major: '언론정보', career: '신입', memo: '', applicationDate: '2026-03-18',
    progress: [prog('공고등록'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-18T09:00:00Z', updatedAt: '2026-03-24T10:00:00Z',
  },
  {
    id: 'd02-06', no: 18, jobPostingId: 'job-02', team: '브랜드마케팅', name: '문서현', platform: '사람인', birthYear: '1997', email: 'seohyun.moon@gmail.com', phone: '010-8899-0011', region: '서울', regionDetail: '종로구', school: '숙명여자대학교', major: '홍보광고', career: '경력 1년', memo: '', applicationDate: '2026-03-20',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'd02-07', no: 19, jobPostingId: 'job-02', team: '콘텐츠마케팅', name: '남지원', platform: '링크드인', birthYear: '2000', email: 'jiwon.nam@gmail.com', phone: '010-9900-1122', region: '경기', regionDetail: '파주시', school: '한국외국어대학교', major: '영어학', career: '신입', memo: '영문 콘텐츠 가능', applicationDate: '2026-03-22',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-22T09:00:00Z', updatedAt: '2026-03-22T10:00:00Z',
  },
  {
    id: 'd02-08', no: 20, jobPostingId: 'job-02', team: '퍼포먼스마케팅', name: '배수아', platform: '직접지원', birthYear: '1995', email: 'sua.bae@naver.com', phone: '010-0011-2233', region: '서울', regionDetail: '영등포구', school: '서강대학교', major: '경제학', career: '경력 4년', memo: 'Meta Ads 경험', applicationDate: '2026-03-16',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-16T09:00:00Z', updatedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'd02-09', no: 21, jobPostingId: 'job-02', team: '브랜드마케팅', name: '김나현', platform: '사람인', birthYear: '1998', email: 'nahyun.kim@hanmail.net', phone: '010-1133-2244', region: '인천', regionDetail: '남동구', school: '인천대학교', major: '신문방송', career: '신입', memo: '타사 합격으로 포기', applicationDate: '2026-03-13',
    progress: [prog('진행완료'), prog('작성완료'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: true, separateReason: '자사양식 제출까지 완료했으나 타사 합격으로 최종 포기 의사를 전달받음.', separatedAt: '2026-04-04T10:00:00Z', createdAt: '2026-03-13T09:00:00Z', updatedAt: '2026-04-04T10:00:00Z',
  },

  // ===== job-03: 디자인팀 (8명, 별도관리 1명 포함) =====
  {
    id: 'd03-01', no: 22, jobPostingId: 'job-03', team: 'UX디자인', name: '임나연', platform: '사람인', birthYear: '1997', email: 'nayeon.lim@gmail.com', phone: '010-2244-3355', region: '서울', regionDetail: '용산구', school: '이화여자대학교', major: '디자인학', career: '경력 3년', memo: '포트폴리오 우수', applicationDate: '2026-03-17',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('안내', { startDate: '2026-07-11', endDate: '2026-07-11', time: '11:00', note: '최팀장' }),
      prog('안내'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-17T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd03-02', no: 23, jobPostingId: 'job-03', team: 'UI디자인', name: '배현우', platform: '잡코리아', birthYear: '1994', email: 'hyunwoo.bae@naver.com', phone: '010-3355-4466', region: '서울', regionDetail: '서초구', school: '국민대학교', major: '시각디자인', career: '경력 5년', memo: 'Figma 전문', applicationDate: '2026-03-18',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('진행완료', { startDate: '2026-04-12', endDate: '2026-04-12', time: '13:00', note: '최팀장' }),
      prog('전형완료'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-18T09:00:00Z', updatedAt: '2026-04-12T15:00:00Z',
  },
  {
    id: 'd03-03', no: 24, jobPostingId: 'job-03', team: '영상디자인', name: '류건우', platform: '링크드인', birthYear: '1996', email: 'gunwoo.ryu@gmail.com', phone: '010-4466-5577', region: '경기', regionDetail: '용인시 수지구', school: '건국대학교', major: '영상디자인', career: '경력 2년', memo: '영상 편집 가능', applicationDate: '2026-03-19',
    progress: [prog('진행완료'), prog('안내', { startDate: '2026-04-03', endDate: '2026-04-09' }), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-19T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'd03-04', no: 25, jobPostingId: 'job-03', team: 'UX디자인', name: '양소연', platform: '사람인', birthYear: '1999', email: 'soyeon.yang@naver.com', phone: '010-5577-6688', region: '서울', regionDetail: '마포구', school: '홍익대학교', major: 'UX디자인', career: '신입', memo: '', applicationDate: '2026-03-20',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-04-04T10:00:00Z',
  },
  {
    id: 'd03-05', no: 26, jobPostingId: 'job-03', team: 'UI디자인', name: '정민서', platform: '인크루트', birthYear: '2000', email: 'minseo.jung@gmail.com', phone: '010-6688-7799', region: '충북', regionDetail: '청주시 흥덕구', school: '충북대학교', major: '산업디자인', career: '신입', memo: '', applicationDate: '2026-03-22',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-22T09:00:00Z', updatedAt: '2026-04-06T10:00:00Z',
  },
  {
    id: 'd03-06', no: 27, jobPostingId: 'job-03', team: '영상디자인', name: '노유찬', platform: '워크넷', birthYear: '1998', email: 'yuchan.noh@naver.com', phone: '010-7799-8800', region: '대구', regionDetail: '달서구', school: '계명대학교', major: '멀티미디어', career: '경력 1년', memo: '', applicationDate: '2026-03-24',
    progress: [prog('공고등록'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-24T09:00:00Z', updatedAt: '2026-03-30T10:00:00Z',
  },
  {
    id: 'd03-07', no: 28, jobPostingId: 'job-03', team: 'UX디자인', name: '황지유', platform: '사람인', birthYear: '2001', email: 'jiyu.hwang@gmail.com', phone: '010-8800-9911', region: '서울', regionDetail: '성동구', school: '동국대학교', major: '시각디자인', career: '신입', memo: '', applicationDate: '2026-03-26',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-26T09:00:00Z', updatedAt: '2026-03-26T10:00:00Z',
  },
  {
    id: 'd03-08', no: 29, jobPostingId: 'job-03', team: 'UI디자인', name: '송다은', platform: '잡코리아', birthYear: '1995', email: 'daeun.song@naver.com', phone: '010-9911-0022', region: '경기', regionDetail: '성남시 중원구', school: '세종대학교', major: '디자인이노베이션', career: '경력 3년', memo: '면접 후 타사 입사로 포기', applicationDate: '2026-03-17',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('진행완료', { startDate: '2026-04-10', endDate: '2026-04-10', time: '10:00', note: '최팀장' }),
      prog('안내'),
    ],
    submitted: true, isSeparateManagement: true, separateReason: '면접 완료 후 타사 입사를 이유로 전형 포기 의사를 전달받음.', separatedAt: '2026-04-11T10:00:00Z', createdAt: '2026-03-17T09:00:00Z', updatedAt: '2026-04-11T10:00:00Z',
  },

  // ===== job-04: 기획/인사팀 (9명, 별도관리 2명 포함) =====
  {
    id: 'd04-01', no: 30, jobPostingId: 'job-04', team: '서비스기획', name: '서지민', platform: '링크드인', birthYear: '1996', email: 'jimin.seo@gmail.com', phone: '010-1010-2020', region: '서울', regionDetail: '송파구', school: '연세대학교', major: '경제학', career: '경력 3년', memo: '', applicationDate: '2026-03-22',
    progress: [
      prog('진행완료'),
      prog('작성완료'),
      prog('안내', { startDate: '2026-07-21', endDate: '2026-07-21', time: '15:30', note: '정과장' }),
      prog('안내'),
    ],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-22T09:00:00Z', updatedAt: '2026-04-12T10:00:00Z',
  },
  {
    id: 'd04-02', no: 31, jobPostingId: 'job-04', team: '인사', name: '최수빈', platform: '사람인', birthYear: '1996', email: 'subin.choi@hanmail.net', phone: '010-2020-3030', region: '인천', regionDetail: '연수구', school: '인하대학교', major: '심리학', career: '경력 2년', memo: '', applicationDate: '2026-03-23',
    progress: [prog('진행완료'), prog('작성완료'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-23T09:00:00Z', updatedAt: '2026-04-09T10:00:00Z',
  },
  {
    id: 'd04-03', no: 32, jobPostingId: 'job-04', team: '서비스기획', name: '한도윤', platform: '잡코리아', birthYear: '1994', email: 'doyun.han@daum.net', phone: '010-3030-4040', region: '대전', regionDetail: '유성구', school: '한국과학기술원', major: '산업공학', career: '경력 4년', memo: '전 직장 추천서 있음', applicationDate: '2026-03-24',
    progress: [prog('진행완료'), prog('안내', { startDate: '2026-04-09', endDate: '2026-04-13' }), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-24T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd04-04', no: 33, jobPostingId: 'job-04', team: '인사', name: '오준혁', platform: '인크루트', birthYear: '1995', email: 'junhyuk.oh@naver.com', phone: '010-4040-5050', region: '대구', regionDetail: '수성구', school: '경북대학교', major: '행정학', career: '경력 3년', memo: '대구 거주, 서울 이전 가능', applicationDate: '2026-03-25',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-25T09:00:00Z', updatedAt: '2026-04-09T10:00:00Z',
  },
  {
    id: 'd04-05', no: 34, jobPostingId: 'job-04', team: '서비스기획', name: '권태현', platform: '직접지원', birthYear: '1993', email: 'taehyun.kwon@daum.net', phone: '010-5050-6060', region: '경남', regionDetail: '창원시 성산구', school: '부산대학교', major: '경영정보', career: '경력 5년', memo: '기획서 우수', applicationDate: '2026-03-26',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-26T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd04-06', no: 35, jobPostingId: 'job-04', team: '인사', name: '문서현', platform: '사람인', birthYear: '1997', email: 'seohyun2.moon@naver.com', phone: '010-6060-7070', region: '울산', regionDetail: '남구', school: '울산대학교', major: '사회학', career: '경력 1년', memo: '', applicationDate: '2026-03-28',
    progress: [prog('공고등록'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-28T09:00:00Z', updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'd04-07', no: 36, jobPostingId: 'job-04', team: '서비스기획', name: '유하진', platform: '워크넷', birthYear: '2000', email: 'hajin.yoo@gmail.com', phone: '010-7070-8080', region: '서울', regionDetail: '노원구', school: '광운대학교', major: '경영학', career: '신입', memo: '', applicationDate: '2026-03-30',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-03-30T10:00:00Z',
  },
  {
    id: 'd04-08', no: 37, jobPostingId: 'job-04', team: '인사', name: '백지안', platform: '잡코리아', birthYear: '1998', email: 'jian.baek@naver.com', phone: '010-8080-9090', region: '경기', regionDetail: '화성시', school: '아주대학교', major: '행정학', career: '경력 1년', memo: '자사양식 미제출', applicationDate: '2026-03-23',
    progress: [prog('진행완료'), prog('안내', { startDate: '2026-04-08', endDate: '2026-04-12' }), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: true, separateReason: '자사양식 안내 후 제출 기한(4/12)까지 미제출, 이후 연락도 닿지 않음.', separatedAt: '2026-04-13T10:00:00Z', createdAt: '2026-03-23T09:00:00Z', updatedAt: '2026-04-13T10:00:00Z',
  },
  {
    id: 'd04-09', no: 38, jobPostingId: 'job-04', team: '서비스기획', name: '고은채', platform: '사람인', birthYear: '1999', email: 'eunchae.go@gmail.com', phone: '010-9090-0101', region: '서울', regionDetail: '강동구', school: '동덕여자대학교', major: '국제경영', career: '신입', memo: '개인 사유로 포기', applicationDate: '2026-03-24',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: true, separateReason: '인성검사 응시는 완료했으나 개인 사정으로 전형을 포기함.', separatedAt: '2026-04-08T10:00:00Z', createdAt: '2026-03-24T09:00:00Z', updatedAt: '2026-04-08T10:00:00Z',
  },

  // ===== job-05: 재무/회계팀 (7명, 별도관리 1명 포함) — 대체 템플릿(서류/인성검사/적성검사및면접/최종임원면접) =====
  {
    id: 'd05-01', no: 39, jobPostingId: 'job-05', team: '재무분석', name: '장윤호', platform: '사람인', birthYear: '1994', email: 'yunho.jang@gmail.com', phone: '010-1212-3434', region: '서울', regionDetail: '여의도동', school: '서울대학교', major: '경영학', career: '경력 4년', memo: 'CPA 자격증 보유', applicationDate: '2026-03-27',
    progress: [prog('완료'), prog('완료'), prog('진행중'), prog('대기')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-27T09:00:00Z', updatedAt: '2026-04-13T10:00:00Z',
  },
  {
    id: 'd05-02', no: 40, jobPostingId: 'job-05', team: '회계', name: '민소희', platform: '잡코리아', birthYear: '1996', email: 'sohee.min@naver.com', phone: '010-3434-5656', region: '경기', regionDetail: '의정부시', school: '고려대학교', major: '회계학', career: '경력 2년', memo: '', applicationDate: '2026-03-28',
    progress: [prog('완료'), prog('완료'), prog('진행중'), prog('대기')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-28T09:00:00Z', updatedAt: '2026-04-12T10:00:00Z',
  },
  {
    id: 'd05-03', no: 41, jobPostingId: 'job-05', team: '재무분석', name: '차준영', platform: '링크드인', birthYear: '1995', email: 'junyoung.cha@gmail.com', phone: '010-5656-7878', region: '서울', regionDetail: '강남구', school: '성균관대학교', major: '경제학', career: '경력 3년', memo: '재무모델링 경험', applicationDate: '2026-03-29',
    progress: [prog('완료'), prog('완료'), prog('대기'), prog('대기')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-29T09:00:00Z', updatedAt: '2026-04-14T10:00:00Z',
  },
  {
    id: 'd05-04', no: 42, jobPostingId: 'job-05', team: '회계', name: '표지혜', platform: '사람인', birthYear: '1998', email: 'jihye.pyo@naver.com', phone: '010-7878-9090', region: '충남', regionDetail: '천안시 동남구', school: '단국대학교', major: '세무회계', career: '신입', memo: '', applicationDate: '2026-03-31',
    progress: [prog('완료'), prog('진행중'), prog('대기'), prog('대기')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-03-31T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'd05-05', no: 43, jobPostingId: 'job-05', team: '재무분석', name: '김다인', platform: '직접지원', birthYear: '2000', email: 'dain.kim@gmail.com', phone: '010-9090-1212', region: '서울', regionDetail: '광진구', school: '한양대학교', major: '파이낸스', career: '신입', memo: '', applicationDate: '2026-04-02',
    progress: [prog('대기'), prog('대기'), prog('대기'), prog('대기')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'd05-06', no: 44, jobPostingId: 'job-05', team: '회계', name: '윤재민', platform: '워크넷', birthYear: '1997', email: 'jaemin.yoon@naver.com', phone: '010-1313-2424', region: '경기', regionDetail: '부천시', school: '가톨릭대학교', major: '회계학', career: '경력 1년', memo: '', applicationDate: '2026-04-03',
    progress: [prog('대기'), prog('대기'), prog('대기'), prog('대기')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-03T10:00:00Z',
  },
  {
    id: 'd05-07', no: 45, jobPostingId: 'job-05', team: '재무분석', name: '성하람', platform: '잡코리아', birthYear: '1996', email: 'haram.sung@gmail.com', phone: '010-2424-3535', region: '서울', regionDetail: '중구', school: '서울시립대학교', major: '세무학', career: '경력 2년', memo: '면접 당일 취소', applicationDate: '2026-03-27',
    progress: [
      prog('완료'),
      prog('완료'),
      prog('완료', { startDate: '2026-04-18', endDate: '2026-04-18', time: '10:00', note: '한부장' }),
      prog('대기'),
    ],
    submitted: true, isSeparateManagement: true, separateReason: '면접 당일 개인 사정으로 참석이 어렵다는 연락을 받아 취소 처리함.', separatedAt: '2026-04-18T09:00:00Z', createdAt: '2026-03-27T09:00:00Z', updatedAt: '2026-04-18T09:00:00Z',
  },

  // ===== job-06: 데이터팀 (8명, 별도관리 1명 포함) =====
  {
    id: 'd06-01', no: 46, jobPostingId: 'job-06', team: '데이터분석', name: '양지수', platform: '링크드인', birthYear: '1991', email: 'jisoo.yang@gmail.com', phone: '010-3535-4646', region: '서울', regionDetail: '강서구', school: '서울대학교', major: '통계학', career: '경력 5년', memo: 'Python/SQL 전문', applicationDate: '2026-04-02',
    progress: [prog('진행완료'), prog('작성완료'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-04-14T10:00:00Z',
  },
  {
    id: 'd06-02', no: 47, jobPostingId: 'job-06', team: '데이터엔지니어링', name: '조은서', platform: '사람인', birthYear: '1997', email: 'eunseo.jo@naver.com', phone: '010-4646-5757', region: '경기', regionDetail: '안산시 상록구', school: '한양대학교', major: '데이터사이언스', career: '경력 2년', memo: 'Spark 경험', applicationDate: '2026-04-03',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-14T10:00:00Z',
  },
  {
    id: 'd06-03', no: 48, jobPostingId: 'job-06', team: '데이터분석', name: '이하율', platform: '잡코리아', birthYear: '1999', email: 'hayul.lee@gmail.com', phone: '010-5757-6868', region: '서울', regionDetail: '관악구', school: '서울대학교', major: '수학', career: '신입', memo: '석사 졸업', applicationDate: '2026-04-04',
    progress: [prog('진행완료'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-04T09:00:00Z', updatedAt: '2026-04-14T10:00:00Z',
  },
  {
    id: 'd06-04', no: 49, jobPostingId: 'job-06', team: '데이터엔지니어링', name: '박준서', platform: '워크넷', birthYear: '1998', email: 'junseo.park@naver.com', phone: '010-6868-7979', region: '세종', regionDetail: '한솔동', school: '충북대학교', major: '정보통신공학', career: '경력 1년', memo: '', applicationDate: '2026-04-05',
    progress: [prog('공고등록'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd06-05', no: 50, jobPostingId: 'job-06', team: '데이터분석', name: '김서윤', platform: '사람인', birthYear: '2001', email: 'seoyun.kim2@gmail.com', phone: '010-7979-8080', region: '서울', regionDetail: '중랑구', school: '국민대학교', major: '빅데이터', career: '신입', memo: '', applicationDate: '2026-04-07',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-07T09:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'd06-06', no: 51, jobPostingId: 'job-06', team: '데이터엔지니어링', name: '정우진', platform: '인크루트', birthYear: '1996', email: 'woojin.jung@daum.net', phone: '010-8080-9191', region: '전북', regionDetail: '전주시 덕진구', school: '전북대학교', major: '컴퓨터공학', career: '경력 2년', memo: 'ETL 파이프라인 경험', applicationDate: '2026-04-08',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: false, createdAt: '2026-04-08T09:00:00Z', updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'd06-07', no: 52, jobPostingId: 'job-06', team: '데이터분석', name: '안서현', platform: '직접지원', birthYear: '2000', email: 'seohyun.ahn@gmail.com', phone: '010-9191-0202', region: '경기', regionDetail: '하남시', school: '경희대학교', major: '응용통계', career: '신입', memo: '', applicationDate: '2026-04-10',
    progress: [prog('안내'), prog('안내'), prog('안내'), prog('안내')],
    submitted: false, isSeparateManagement: false, createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd06-08', no: 53, jobPostingId: 'job-06', team: '데이터분석', name: '구민재', platform: '잡코리아', birthYear: '1998', email: 'minjae.gu@naver.com', phone: '010-0202-1313', region: '서울', regionDetail: '동대문구', school: '세종대학교', major: '데이터사이언스', career: '경력 1년', memo: '지원 포기 연락', applicationDate: '2026-04-03',
    progress: [prog('안내', { startDate: '2026-04-07', endDate: '2026-04-14' }), prog('안내'), prog('안내'), prog('안내')],
    submitted: true, isSeparateManagement: true, separateReason: '지원 직후 전화로 지원 포기 의사를 전달받음.', separatedAt: '2026-04-10T10:00:00Z', createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
];

// ── 구조화 필드 생성 헬퍼 ───────────────────────────────────────────────

type MajorField = '공학계열' | '자연과학계열' | '상경계열' | '인문사회계열' | '예술계열';

function classifyMajorField(major: string): MajorField {
  if (/컴퓨터|전산|소프트웨어|전자|정보통신|산업공학|정보|공학/.test(major)) return '공학계열';
  if (/통계|수학|빅데이터|데이터사이언스|응용통계/.test(major)) return '자연과학계열';
  if (/경영|경제|회계|세무|파이낸스|경영정보/.test(major)) return '상경계열';
  if (/디자인|시각|영상|멀티미디어/.test(major)) return '예술계열';
  return '인문사회계열';
}

const COMPANY_POOL = [
  '㈜테크노베이션', '그로스브릿지㈜', '㈜파인드업', '넥스트웨이브㈜', '㈜에이블스퀘어',
  '㈜브라이트랩', '코어스택㈜', '㈜모먼텀즈', '㈜비즈니스퓨처', '㈜클리어포인트',
];

const ROLE_BY_TEAM: Record<string, string> = {
  '프론트엔드': '프론트엔드 개발자', '백엔드': '백엔드 개발자',
  '콘텐츠마케팅': '콘텐츠 마케터', '퍼포먼스마케팅': '퍼포먼스 마케터', '브랜드마케팅': '브랜드 마케터',
  'UX디자인': 'UX 디자이너', 'UI디자인': 'UI 디자이너', '영상디자인': '영상 디자이너',
  '서비스기획': '서비스 기획자', '인사': '인사 담당자',
  '재무분석': '재무 분석가', '회계': '회계 담당자',
  '데이터분석': '데이터 분석가', '데이터엔지니어링': '데이터 엔지니어',
};

const CERT_POOL: Record<MajorField, { name: string; issuer: string }[]> = {
  '공학계열': [{ name: '정보처리기사', issuer: '한국산업인력공단' }, { name: 'SQLD', issuer: '한국데이터산업진흥원' }, { name: '리눅스마스터 2급', issuer: '한국정보통신진흥협회' }],
  '자연과학계열': [{ name: 'ADsP', issuer: '한국데이터산업진흥원' }, { name: 'SQLD', issuer: '한국데이터산업진흥원' }, { name: '빅데이터분석기사', issuer: '한국산업인력공단' }],
  '상경계열': [{ name: '전산회계 1급', issuer: '한국세무사회' }, { name: 'ADsP', issuer: '한국데이터산업진흥원' }, { name: '재경관리사', issuer: '삼일회계법인' }],
  '인문사회계열': [{ name: '컴퓨터활용능력 1급', issuer: '대한상공회의소' }, { name: '한국사능력검정 1급', issuer: '국사편찬위원회' }],
  '예술계열': [{ name: 'GTQ 1급', issuer: '한국생산성본부' }, { name: '컬러리스트기사', issuer: '한국산업인력공단' }],
};

const ACTIVITY_POOL: Record<MajorField, { name: string; role: string }[]> = {
  '공학계열': [{ name: '교내 해커톤', role: '팀원' }, { name: '오픈소스 컨트리뷰션 프로젝트', role: '기여자' }],
  '자연과학계열': [{ name: '데이터 분석 공모전', role: '팀장' }, { name: '통계 학회 학술제', role: '발표자' }],
  '상경계열': [{ name: '증권 모의투자 대회', role: '팀원' }, { name: '창업 동아리', role: '재무 담당' }],
  '인문사회계열': [{ name: '대학생 서포터즈', role: '팀원' }, { name: '교내 학보사', role: '기자' }],
  '예술계열': [{ name: '졸업 작품 전시회', role: '참여 작가' }, { name: '디자인 공모전', role: '수상자' }],
};

function pick<T>(pool: T[], seed: number): T {
  return pool[seed % pool.length];
}

function buildAddress(raw: RawApplicant): string {
  const streets = ['테헤란로', '중앙로', '역전로', '문화로', '대학로', '번영로'];
  const streetNum = (raw.no * 17) % 90 + 10;
  return `${raw.region} ${raw.regionDetail} ${pick(streets, raw.no)} ${streetNum}`;
}

function buildBirthDate(raw: RawApplicant): string {
  const month = String(((raw.no * 7) % 12) + 1).padStart(2, '0');
  const day = String(((raw.no * 13) % 28) + 1).padStart(2, '0');
  return `${raw.birthYear}-${month}-${day}`;
}

function buildGender(raw: RawApplicant): Gender {
  return raw.no % 2 === 0 ? '여성' : '남성';
}

function buildEducations(raw: RawApplicant, majorField: MajorField): EducationEntry[] {
  const gradYear = Number(raw.birthYear) + 26;
  const startYear = gradYear - 4;
  const isGraduate = raw.memo.includes('석사');
  const entries: EducationEntry[] = [
    {
      schoolName: raw.school,
      degree: '대학교',
      period: `${startYear}.03 - ${gradYear}.02`,
      majorField,
      major: raw.major,
      minor: raw.no % 5 === 0 ? '경영학' : undefined,
      gpa: Math.round((3.0 + (raw.no % 11) / 10) * 100) / 100,
      gpaMax: 4.5,
    },
  ];
  if (isGraduate) {
    entries.push({
      schoolName: raw.school,
      degree: '대학원',
      period: `${gradYear}.03 - ${gradYear + 2}.02`,
      majorField,
      major: raw.major,
      gpa: 4.0,
      gpaMax: 4.5,
    });
  }
  return entries;
}

function buildCertificates(raw: RawApplicant, majorField: MajorField): CertificateEntry[] {
  const certs: CertificateEntry[] = [];
  if (raw.memo.includes('AWS')) certs.push({ name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', acquiredDate: '2025-06' });
  if (raw.memo.includes('CPA')) certs.push({ name: '공인회계사(CPA)', issuer: '금융감독원', acquiredDate: '2023-11' });
  if (certs.length === 0) {
    const pool = CERT_POOL[majorField];
    const c = pick(pool, raw.no);
    certs.push({ ...c, acquiredDate: `${Number(raw.birthYear) + 25}-0${(raw.no % 9) + 1}` });
  }
  return certs;
}

function buildCareers(raw: RawApplicant): CareerEntry[] {
  const match = raw.career.match(/경력\s*(\d+)년/);
  if (!match) return [];
  const years = Number(match[1]);
  const numCompanies = years <= 2 ? 1 : years <= 4 ? 2 : 3;
  const role = ROLE_BY_TEAM[raw.team] || `${raw.team} 담당자`;
  const endYear = Number(raw.applicationDate.slice(0, 4));
  const entries: CareerEntry[] = [];
  let cursor = endYear;
  for (let i = 0; i < numCompanies; i++) {
    const span = Math.max(1, Math.round(years / numCompanies));
    const start = cursor - span;
    entries.unshift({
      company: pick(COMPANY_POOL, raw.no + i),
      role,
      period: `${start}.03 - ${i === 0 ? cursor + '.02' : cursor + '.02'}`,
      description: `${role}로서 ${raw.team} 관련 실무를 담당했습니다.`,
    });
    cursor = start;
  }
  return entries;
}

function buildActivities(raw: RawApplicant, majorField: MajorField): ActivityEntry[] {
  const pool = ACTIVITY_POOL[majorField];
  const base = pick(pool, raw.no);
  const gradYear = Number(raw.birthYear) + 26;
  const activities: ActivityEntry[] = [
    {
      name: base.name,
      role: base.role,
      organization: raw.school,
      period: `${gradYear - 2}.03 - ${gradYear - 1}.02`,
      description: `${base.name}에 ${base.role}(으)로 참여하여 실무 감각을 익혔습니다.`,
    },
  ];
  if (raw.no % 4 === 0) {
    const second = pool[(pool.indexOf(base) + 1) % pool.length];
    activities.push({
      name: second.name,
      role: second.role,
      organization: raw.school,
      period: `${gradYear - 3}.09 - ${gradYear - 3}.12`,
      description: `${second.name} 활동을 통해 협업 경험을 쌓았습니다.`,
    });
  }
  return activities;
}

function buildStatisticsPackages(raw: RawApplicant, majorField: MajorField): StatisticsPackageEntry[] {
  if (majorField === '자연과학계열') {
    return [
      { name: 'Python (Pandas/NumPy)', level: '상', detail: '데이터 전처리 및 분석 파이프라인 구축 경험' },
      { name: 'R', level: '중', detail: '회귀분석 및 데이터 시각화 활용 경험' },
    ];
  }
  if (majorField === '상경계열' && raw.no % 3 === 0) {
    return [{ name: 'SPSS', level: '중', detail: '기초 통계 분석 및 설문 데이터 처리 경험' }];
  }
  return [];
}

function buildThesis(raw: RawApplicant, majorField: MajorField): ThesisInfo | undefined {
  if (!raw.memo.includes('석사')) return undefined;
  return {
    title: `${raw.major} 분야의 데이터 기반 의사결정에 관한 연구`,
    keyword: majorField === '자연과학계열' ? '통계적 추론, 데이터 시각화' : '실증 분석',
    summary: `${raw.major} 전공 지식을 바탕으로 실데이터를 활용한 분석 방법론을 제안하고 검증한 연구입니다.`,
  };
}

function buildCoverLetter(raw: RawApplicant): CoverLetterAnswer[] {
  const role = ROLE_BY_TEAM[raw.team] || raw.team;
  const answers = [
    `${raw.school}에서 ${raw.major} 전공을 통해 쌓은 역량을 바탕으로 ${role} 직무에 기여하고 싶어 지원하게 되었습니다.`,
    `${raw.team} 분야는 실제 사용자의 문제를 데이터와 논리로 풀어나가는 과정이 매력적이라고 느껴 흥미를 갖게 되었습니다.`,
    `새로운 도구와 기술을 배우는 데 적극적이며, 관련 스터디와 실습을 통해 꾸준히 역량을 키워왔습니다.`,
    `이전 경험에서 문제 상황을 발견하고 개선안을 제안해 실제 업무 효율을 높였던 경험이 있습니다.`,
  ];
  return answers.map((answer, i) => ({ questionId: `${raw.jobPostingId}-q${i + 1}`, answer }));
}

const postingsById = new Map(dummyJobPostings.map(p => [p.id, p]));

/** raw.progress를 공고의 실제 stages 순서에 맞춰 StageRecord[]로 변환한다. 각 단계의
 * 상태는 이름으로 조회하므로(공고마다 상태 id는 다르지만 이름 체계는 공고 유형별로
 * 고정) 어떤 공고의 stages든 동일하게 동작한다. */
function toStageRecords(raw: RawApplicant, stages: Stage[]): StageRecord[] {
  return stages.map((stage, i) => {
    const p = raw.progress[i];
    const status = stage.statuses.find(st => st.name === p.status) ?? stage.statuses[0];
    return { stageId: stage.id, statusId: status.id, meta: p.meta, updatedAt: raw.updatedAt };
  });
}

/** 전형 단계와 무관하게 지정하는 최종 판정(일부 지원자만). d06-07은 인성검사조차
 * 시작 전인 상태에서 finalResult만 합격으로 지정해, "구조는 단순하게, 예외는
 * 메모로" 원칙에 따른 특별 채용 예외 케이스를 보여준다. */
const FINAL_RESULTS: Record<string, FinalResult> = {
  'd01-02': { result: '합격', decidedAt: '2026-04-13T10:00:00Z' },
  'd02-02': { result: '합격', decidedAt: '2026-04-11T09:00:00Z' },
  'd03-02': { result: '합격', decidedAt: '2026-04-13T09:00:00Z' },
  'd01-03': { result: '불합격', note: '면접 결과 미흡', decidedAt: '2026-04-12T09:00:00Z' },
  'd02-08': { result: '불합격', note: '인성검사 결과 미달', decidedAt: '2026-04-02T09:00:00Z' },
  'd01-07': { result: '불합격', note: '인성검사 결과 미달', decidedAt: '2026-03-27T10:00:00Z' },
  'd06-07': { result: '합격', note: '임원 추천 특별 채용', decidedAt: '2026-04-11T09:00:00Z' },
};

function enrich(raw: RawApplicant): Applicant {
  const majorField = classifyMajorField(raw.major);
  const submissionStatus: SubmissionStatus = raw.submitted ? '완료' : '미완료';
  const posting = postingsById.get(raw.jobPostingId);
  const stageRecords = posting ? toStageRecords(raw, posting.stages) : [];

  return {
    id: raw.id,
    no: raw.no,
    jobPostingId: raw.jobPostingId,
    team: raw.team,
    name: raw.name,
    platform: raw.platform,
    gender: buildGender(raw),
    birthDate: buildBirthDate(raw),
    email: raw.email,
    phone: raw.phone,
    region: raw.region,
    regionDetail: raw.regionDetail,
    address: buildAddress(raw),
    educations: buildEducations(raw, majorField),
    certificates: buildCertificates(raw, majorField),
    careers: buildCareers(raw),
    activities: buildActivities(raw, majorField),
    statisticsPackages: buildStatisticsPackages(raw, majorField),
    thesis: buildThesis(raw, majorField),
    coverLetter: submissionStatus === '완료' ? buildCoverLetter(raw) : [],
    submissionStatus,
    memo: raw.memo,
    applicationDate: raw.applicationDate,
    stageRecords,
    finalResult: FINAL_RESULTS[raw.id] ?? null,
    isSeparateManagement: raw.isSeparateManagement,
    separateReason: raw.separateReason,
    separatedAt: raw.separatedAt,
    files: [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const dummyApplicants: Applicant[] = rawApplicants.map(enrich);
