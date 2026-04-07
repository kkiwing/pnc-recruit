import { Applicant, createDefaultRecruitmentStatus, StepDetail } from '@/types/applicant';

const s = (status: 'pending' | 'need' | 'done' | 'pass' | 'fail', extra?: Partial<StepDetail>): StepDetail => ({
  status,
  ...extra,
});

export const dummyApplicants: Applicant[] = [
  {
    id: 'dummy-01', no: 1, team: '개발', name: '김민준', platform: '사람인', birthYear: '1995', email: 'minjun.kim@gmail.com', phone: '010-1234-5678', region: '서울', regionDetail: '강남구', school: '서울대학교', major: '컴퓨터공학', career: '경력 3년', memo: '', applicationDate: '2026-03-15',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-20', endDate: '2026-03-30' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-01', endDate: '2026-04-05' }), companyFormSubmission: s('done'), interviewNotice: s('done', { startDate: '2026-04-10', endDate: '2026-04-10', time: '14:00', interviewer: '박과장' }), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'dummy-02', no: 2, team: '마케팅', name: '이서연', platform: '잡코리아', birthYear: '1997', email: 'seoyeon.lee@naver.com', phone: '010-2345-6789', region: '경기', regionDetail: '성남시 분당구', school: '고려대학교', major: '경영학', career: '신입', memo: '영어 능통', applicationDate: '2026-03-16',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-20', endDate: '2026-03-30' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('need'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-16T09:00:00Z', updatedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'dummy-03', no: 3, team: '디자인', name: '박지호', platform: '링크드인', birthYear: '1993', email: 'jiho.park@gmail.com', phone: '010-3456-7890', region: '서울', regionDetail: '마포구', school: '홍익대학교', major: 'UX디자인', career: '경력 5년', memo: '포트폴리오 우수', applicationDate: '2026-03-17',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-22', endDate: '2026-04-01' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-02', endDate: '2026-04-06' }), companyFormSubmission: s('done'), interviewNotice: s('need'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-17T09:00:00Z', updatedAt: '2026-04-04T10:00:00Z',
  },
  {
    id: 'dummy-04', no: 4, team: '인사', name: '최수빈', platform: '사람인', birthYear: '1996', email: 'subin.choi@hanmail.net', phone: '010-4567-8901', region: '인천', regionDetail: '연수구', school: '인하대학교', major: '심리학', career: '경력 2년', memo: '', applicationDate: '2026-03-18',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-22', endDate: '2026-04-01' }), personalityTestRegistration: s('done'), personalityTestResult: s('fail'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-18T09:00:00Z', updatedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'dummy-05', no: 5, team: '개발', name: '정예진', platform: '워크넷', birthYear: '1998', email: 'yejin.jung@gmail.com', phone: '010-5678-9012', region: '부산', regionDetail: '해운대구', school: '부산대학교', major: '소프트웨어', career: '신입', memo: '', applicationDate: '2026-03-19',
    recruitmentStatus: { personalityTestNotice: s('need'), personalityTestRegistration: s('pending'), personalityTestResult: s('pending'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-19T09:00:00Z', updatedAt: '2026-03-19T10:00:00Z',
  },
  {
    id: 'dummy-06', no: 6, team: '기획', name: '한도윤', platform: '잡코리아', birthYear: '1994', email: 'doyun.han@naver.com', phone: '010-6789-0123', region: '대전', regionDetail: '유성구', school: 'KAIST', major: '산업공학', career: '경력 4년', memo: '전 직장 추천서 있음', applicationDate: '2026-03-20',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-25', endDate: '2026-04-03' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-04', endDate: '2026-04-07' }), companyFormSubmission: s('need'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'dummy-07', no: 7, team: '마케팅', name: '강하은', platform: '인크루트', birthYear: '1999', email: 'haeun.kang@gmail.com', phone: '010-7890-1234', region: '광주', regionDetail: '서구', school: '전남대학교', major: '미디어커뮤니케이션', career: '신입', memo: '', applicationDate: '2026-03-21',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-25', endDate: '2026-04-03' }), personalityTestRegistration: s('need'), personalityTestResult: s('pending'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-21T09:00:00Z', updatedAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'dummy-08', no: 8, team: '개발', name: '윤시우', platform: '직접지원', birthYear: '1992', email: 'siwoo.yoon@daum.net', phone: '010-8901-2345', region: '경기', regionDetail: '수원시 영통구', school: '성균관대학교', major: '전자공학', career: '경력 6년', memo: '시니어급', applicationDate: '2026-03-22',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-26', endDate: '2026-04-04' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-05', endDate: '2026-04-08' }), companyFormSubmission: s('done'), interviewNotice: s('done', { startDate: '2026-04-12', endDate: '2026-04-12', time: '10:00', interviewer: '김부장' }), interviewResult: s('pass') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-22T09:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'dummy-09', no: 9, team: '디자인', name: '임나연', platform: '사람인', birthYear: '1997', email: 'nayeon.lim@gmail.com', phone: '010-9012-3456', region: '서울', regionDetail: '용산구', school: '이화여자대학교', major: '시각디자인', career: '경력 1년', memo: '', applicationDate: '2026-03-23',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-27', endDate: '2026-04-05' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('need'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-23T09:00:00Z', updatedAt: '2026-04-03T10:00:00Z',
  },
  {
    id: 'dummy-10', no: 10, team: '인사', name: '오준혁', platform: '잡코리아', birthYear: '1995', email: 'junhyuk.oh@naver.com', phone: '010-0123-4567', region: '대구', regionDetail: '수성구', school: '경북대학교', major: '행정학', career: '경력 3년', memo: '대구 거주, 서울 이전 가능', applicationDate: '2026-03-24',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-28', endDate: '2026-04-06' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-07', endDate: '2026-04-10' }), companyFormSubmission: s('done'), interviewNotice: s('need'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-24T09:00:00Z', updatedAt: '2026-04-06T10:00:00Z',
  },
  {
    id: 'dummy-11', no: 11, team: '기획', name: '서지민', platform: '링크드인', birthYear: '1996', email: 'jimin.seo@gmail.com', phone: '010-1111-2222', region: '서울', regionDetail: '송파구', school: '연세대학교', major: '경제학', career: '경력 2년', memo: '', applicationDate: '2026-03-25',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-29', endDate: '2026-04-07' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-08', endDate: '2026-04-11' }), companyFormSubmission: s('done'), interviewNotice: s('done', { startDate: '2026-04-14', endDate: '2026-04-14', time: '11:00', interviewer: '이차장' }), interviewResult: s('fail') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-25T09:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'dummy-12', no: 12, team: '개발', name: '조은서', platform: '워크넷', birthYear: '2000', email: 'eunseo.jo@naver.com', phone: '010-2222-3333', region: '충남', regionDetail: '천안시 서북구', school: '충남대학교', major: '정보통신', career: '신입', memo: '', applicationDate: '2026-03-26',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-03-30', endDate: '2026-04-08' }), personalityTestRegistration: s('done'), personalityTestResult: s('pending'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-26T09:00:00Z', updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'dummy-13', no: 13, team: '마케팅', name: '신유진', platform: '사람인', birthYear: '1998', email: 'yujin.shin@gmail.com', phone: '010-3333-4444', region: '경기', regionDetail: '고양시 일산서구', school: '중앙대학교', major: '광고홍보', career: '경력 1년', memo: '콘텐츠 마케팅 경험', applicationDate: '2026-03-27',
    recruitmentStatus: { personalityTestNotice: s('need'), personalityTestRegistration: s('pending'), personalityTestResult: s('pending'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-27T09:00:00Z', updatedAt: '2026-03-27T10:00:00Z',
  },
  {
    id: 'dummy-14', no: 14, team: '디자인', name: '배현우', platform: '잡코리아', birthYear: '1994', email: 'hyunwoo.bae@hanmail.net', phone: '010-4444-5555', region: '서울', regionDetail: '서초구', school: '국민대학교', major: '산업디자인', career: '경력 4년', memo: '', applicationDate: '2026-03-28',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-04-01', endDate: '2026-04-09' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-10', endDate: '2026-04-13' }), companyFormSubmission: s('need'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-28T09:00:00Z', updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'dummy-15', no: 15, team: '개발', name: '송하린', platform: '인크루트', birthYear: '1999', email: 'harin.song@gmail.com', phone: '010-5555-6666', region: '제주', regionDetail: '제주시', school: '제주대학교', major: '컴퓨터공학', career: '신입', memo: '제주 거주', applicationDate: '2026-03-29',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-04-02', endDate: '2026-04-10' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('need'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-29T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'dummy-16', no: 16, team: '기획', name: '권태현', platform: '직접지원', birthYear: '1993', email: 'taehyun.kwon@daum.net', phone: '010-6666-7777', region: '경남', regionDetail: '창원시 성산구', school: '경상대학교', major: '경영정보', career: '경력 5년', memo: '기획서 우수', applicationDate: '2026-03-30',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-04-03', endDate: '2026-04-11' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-12', endDate: '2026-04-15' }), companyFormSubmission: s('done'), interviewNotice: s('done', { startDate: '2026-04-18', endDate: '2026-04-18', time: '15:00', interviewer: '정과장' }), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-30T09:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'dummy-17', no: 17, team: '인사', name: '문서현', platform: '사람인', birthYear: '1997', email: 'seohyun.moon@naver.com', phone: '010-7777-8888', region: '울산', regionDetail: '남구', school: '울산대학교', major: '사회학', career: '경력 1년', memo: '', applicationDate: '2026-03-31',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-04-04', endDate: '2026-04-12' }), personalityTestRegistration: s('need'), personalityTestResult: s('pending'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-03-31T09:00:00Z', updatedAt: '2026-04-04T10:00:00Z',
  },
  {
    id: 'dummy-18', no: 18, team: '개발', name: '양지수', platform: '링크드인', birthYear: '1991', email: 'jisoo.yang@gmail.com', phone: '010-8888-9999', region: '서울', regionDetail: '강서구', school: '한양대학교', major: '데이터사이언스', career: '경력 7년', memo: 'AI/ML 전문', applicationDate: '2026-04-01',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-04-05', endDate: '2026-04-13' }), personalityTestRegistration: s('done'), personalityTestResult: s('pass'), companyFormNotice: s('done', { startDate: '2026-04-14', endDate: '2026-04-17' }), companyFormSubmission: s('done'), interviewNotice: s('need'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'dummy-19', no: 19, team: '마케팅', name: '홍채원', platform: '잡코리아', birthYear: '2001', email: 'chaewon.hong@naver.com', phone: '010-9999-0000', region: '강원', regionDetail: '춘천시', school: '강원대학교', major: '국어국문', career: '신입', memo: '', applicationDate: '2026-04-02',
    recruitmentStatus: { personalityTestNotice: s('pending'), personalityTestRegistration: s('pending'), personalityTestResult: s('pending'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'dummy-20', no: 20, team: '디자인', name: '류건우', platform: '사람인', birthYear: '1996', email: 'gunwoo.ryu@gmail.com', phone: '010-1010-2020', region: '경기', regionDetail: '용인시 수지구', school: '건국대학교', major: '영상디자인', career: '경력 2년', memo: '영상 편집 가능', applicationDate: '2026-04-03',
    recruitmentStatus: { personalityTestNotice: s('done', { startDate: '2026-04-05', endDate: '2026-04-13' }), personalityTestRegistration: s('done'), personalityTestResult: s('fail'), companyFormNotice: s('pending'), companyFormSubmission: s('pending'), interviewNotice: s('pending'), interviewResult: s('pending') },
    isSeparateManagement: false, files: [], createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
  },
];
