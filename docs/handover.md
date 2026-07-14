# 인수인계 문서

이 저장소를 처음 보는 사람을 위한 문서입니다. 배경/범위는 [project-summary.md](project-summary.md), 진행 상황은 [todo.md](todo.md), 주요 결정 배경은 [decision-log.md](decision-log.md)를 함께 참고하세요.

## 1. 이 저장소는 무엇인가

**P&C(인사)팀의 사내 채용 프로세스 관리 시스템**의 화면·데이터 흐름 프로토타입입니다. 채용 공고 등록부터 지원자 접수, 전형 단계 진행, 별도 관리, 면접 일정까지를 다룹니다.

**중요**: 이것은 프로덕션 서비스가 아니라 **기획 단계 프로토타입**입니다.

- 실제 백엔드/DB가 없습니다. 모든 데이터는 `src/data/`의 더미 데이터로 시작해 브라우저 메모리(React Context)에서만 유지됩니다.
- **새로고침하면 모든 변경 사항이 사라지고 초기 더미 데이터로 리셋됩니다.** 데모 중에는 이 점을 미리 안내하세요.
- 목적은 테크팀이 실제 개발에 착수하기 전에 화면 흐름과 데이터 모델을 검증하는 것입니다.

## 2. 로컬 실행 방법

```bash
npm install
npm run dev
```

기본적으로 `http://localhost:8080`에서 실행됩니다(포트 사용 중이면 자동으로 다른 포트로 전환).

기타 스크립트:

```bash
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run test      # Vitest 단위 테스트 실행
```

환경변수는 필요하지 않습니다(백엔드 연동이 없는 순수 인메모리 구조).

## 3. 주요 디렉토리 구조

```
src/
  pages/            라우트별 화면 컴포넌트
    Dashboard.tsx
    JobPostingList.tsx / JobPostingDetail.tsx
    ProcessManagement.tsx
    ApplicantList.tsx / ApplicantDetail.tsx
    SeparateManagement.tsx
    InterviewSchedule.tsx
  components/
    ui/             shadcn/ui 기본 컴포넌트 (button, select, dialog 등)
    common/         공용 UI 컴포넌트 (StatusBadge, StatusSelect — 색상 배지 시스템)
    applicant/       지원자 관련 컴포넌트 (테이블, 툴바, 폼모달, 파이프라인 뷰, 공고 선택/링크 등)
    jobPosting/      공고 등록/수정 폼모달
    process/         프로세스 관리 관련 (상태값 관리 모달, 자동발송 설정 패널)
    layout/          AdminLayout(좌측 사이드바 + 본문 레이아웃)
  context/           ApplicantContext, JobPostingContext — 인메모리 상태 관리
  types/             applicant.ts, jobPosting.ts — 도메인 타입 정의 + 파생 로직 함수
  data/              dummyApplicants.ts, dummyJobPostings.ts — 초기 시드 데이터
  lib/               colorContrast.ts(배지 텍스트 대비 계산) 등 유틸
docs/                프로젝트 문서 (본 문서 포함)
```

**데이터 흐름을 이해하려면 `src/types/applicant.ts`, `src/types/jobPosting.ts`부터 보는 것을 권장합니다.** 도메인 타입뿐 아니라 `getCurrentStage`, `getStageRecordStatus`, `getFinalStage`처럼 화면 곳곳에서 재사용되는 파생 로직 함수가 여기 모여 있습니다.

## 4. 현재 known issue

- **매트릭스(단계별 컬럼) 지원자 테이블 미사용**: `src/components/applicant/ApplicantTable.tsx`는 공고 상세 화면에서 쓰이던 컴포넌트인데, 화면 개편으로 더 이상 어디서도 import되지 않습니다. 삭제하지 않고 파일 상단에 보존 사유를 주석으로 남겨두었습니다(재도입 검토 대상).
- **테스트 커버리지 낮음**: Vitest 예시 테스트 1개만 존재합니다.
- **번들 크기 경고**: `npm run build` 시 하나의 JS 청크가 500KB를 넘는다는 경고가 출력됩니다. 기능 동작에는 문제 없으나, 실제 서비스 전환 시 코드 스플리팅을 고려할 만합니다.

## 5. 주의할 점

- **디자인 토큰을 반드시 따를 것**: 색상을 하드코딩(`bg-emerald-100` 같은 Tailwind 팔레트 클래스, 임의 hex 등)하지 말고 [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)에 정의된 시맨틱 토큰(`bg-background`, `text-muted-foreground`, `success`/`warning`/`destructive` 등)을 사용하세요. 카드는 `card-elevated`/`card-soft` 클래스를 사용합니다.
- **전형 단계 판별은 명시적 플래그로**: "합불을 판정하는 단계"나 "완료/합격/불합격 상태"를 배열 순서나 이름 문자열로 추정하지 마세요. `Stage.stageType`, `StageStatus.isCompletion`/`isPass`/`isFail`을 사용하는 기존 헬퍼 함수(`getFinalStage`, `getCompletionStatus`, `getPassStatus`, `getFailStatus` 등, `src/types/jobPosting.ts`)를 재사용하세요. 과거 순서 기반 추정 방식에서 단계 재배치 시 오판정이 발생한 적이 있습니다 (`decision-log.md` 참고).
- **같은 기능의 화면은 컴포넌트를 공유할 것**: 별도 관리 화면은 지원자 목록과 같은 테이블 컴포넌트(`ApplicantOverviewTable`)를 `mode` prop으로 분기해서 씁니다. 비슷한 화면을 추가할 때 복제하지 말고 이 패턴을 참고하세요.
- **공고 선택이 필요한 화면은 `?posting=` 쿼리 규칙을 따를 것**: 지원자 목록/별도 관리/프로세스 관리는 URL 쿼리로 공고 컨텍스트를 유지합니다. 새 화면에서 공고 선택이 필요하면 같은 패턴(쿼리 읽기 → 상태 초기화, 선택 변경 시 `replace`로 쿼리 갱신)을 따르세요.
- **인메모리 상태이므로 새로고침에 주의**: 데모/작업 중 새로고침하면 입력한 데이터가 모두 사라집니다.

## 6. 다음 작업자가 이어서 해야 할 일

우선순위와 세부 항목은 [todo.md](todo.md)의 "남은 작업"과 "다음 작업 순서 및 우선순위"를 참고하세요. 요약하면:

1. 테크팀과 함께 현재 화면 흐름·데이터 모델을 리뷰하고 실제 구축 범위 합의
2. 인증/권한, 알림·메일 발송 연동 요구사항부터 정의
3. 파일 스토리지, 변경 이력(감사 로그) 요구사항 정의
4. 오퍼/온보딩 프로세스 설계
5. 매트릭스 뷰 재도입 여부 결정

작업을 진행하면서 의미 있는 의사결정이나 방향 변경이 있으면 이 문서들(`project-summary.md`, `decision-log.md`, `todo.md`, `handover.md`)도 함께 갱신해 주세요.
