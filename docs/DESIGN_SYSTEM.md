# 디자인 시스템 (Design System)

본 문서는 이 프로젝트(멀티 테넌트 채용 사이트 SaaS)의 UI가 어떤 원칙과 토큰으로 구현되었는지 정리한 것입니다. Cal.com 스타일의 **라이트 모노크롬(light monochrome)** 미학을 기반으로 하며, 모든 값은 `src/index.css`의 CSS 변수와 `tailwind.config.ts`의 시맨틱 토큰으로 정의됩니다.

---

## 1. 디자인 원칙

1. **라이트 모노크롬 온리** — 다크 테마 없음. 브랜드 컬러는 링크용 파랑(`#0099ff`) 하나만 예외.
2. **하드 보더 금지** — 카드/패널 구분은 얕은 레이어드 섀도우로 처리. `border: 1px solid` 스타일은 피함.
3. **시맨틱 토큰만 사용** — 컴포넌트에서 `text-white`, `bg-black`, `bg-[#...]` 같은 하드코딩 금지. 반드시 `bg-background`, `text-foreground`, `text-muted-foreground` 등의 토큰 사용.
4. **한 프로젝트 = 한 시각적 방향** — 일반적인 AI 기본값(Inter/Poppins, 보라 그라디언트) 지양. 한글 서비스이므로 NanumSquare 계열을 기본으로.
5. **여백 우선** — 섹션은 80~96px(py-24/py-32), 컴포넌트 간격 16~24px, 컨테이너 최대폭 1200px(`max-w-6xl`).

---

## 2. 컬러 토큰

정의 위치: `src/index.css` `:root` (HSL 값), `tailwind.config.ts` 매핑.

| 토큰 | HSL | HEX | 용도 |
|---|---|---|---|
| `--background` | `0 0% 100%` | `#ffffff` | 페이지 기본 배경 |
| `--foreground` | `0 0% 14%` | `#242424` | 기본 텍스트 |
| `--card` | `0 0% 100%` | `#ffffff` | 카드 표면 |
| `--primary` | `0 0% 14%` | `#242424` | 주요 버튼/강조 (거의 검정) |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | primary 위 텍스트 |
| `--secondary` / `--muted` / `--accent` | `0 0% 96%` | `#f5f5f5` | 서브 표면, 얕은 배경 |
| `--muted-foreground` | `0 0% 54%` | `#898989` | 보조 텍스트 |
| `--border` | `0 0% 92%` | `#eaeaea` | 매우 얕은 구분선 (거의 사용 안 함) |
| `--input` | `0 0% 90%` | `#e5e5e5` | 폼 인풋 테두리 |
| `--ring` | `0 0% 14%` | `#242424` | 포커스 링 |
| `--link` | `204 100% 50%` | `#0099ff` | 링크 (유일한 브랜드 컬러) |
| `--destructive` | `0 72% 51%` | 위험/삭제 | 삭제·에러 액션 |
| `--success` | `142 60% 38%` | 성공 | 저장 완료, 합격 등 |
| `--warning` | `38 92% 50%` | 경고 | 주의 표시 |

**Sidebar 전용 토큰** (`--sidebar-*`)은 관리자 사이드바가 본문과 톤을 분리할 수 있게 별도 정의되어 있으나 현재는 동일 팔레트를 사용.

### 사용 규칙
- 색상은 반드시 토큰 이름 기반 유틸리티 사용: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-secondary`, `bg-primary text-primary-foreground`.
- 브랜드 컬러 필요 시 → 링크만 `text-[hsl(var(--link))]`.
- 상태 배지는 shadcn `Badge` + 시맨틱 토큰(`success` / `warning` / `destructive`) 조합.

---

## 3. 타이포그래피

- **본문·헤딩 공통 폰트**: `NanumSquare` / `NanumSquareOTF` (한글 최적화, `src/index.css`에서 웹폰트 로드).
- **폴백**: Noto Sans KR → 시스템 sans-serif.
- **font-display 클래스**: 헤딩용 별칭 — 동일 폰트, `letter-spacing: -0.02em`로 타이트한 트래킹.
- Tailwind 매핑: `font-sans`, `font-display` (`tailwind.config.ts`).

### 타입 스케일 (권장)
| 용도 | 크기 | weight | line-height |
|---|---|---|---|
| Hero | 56–64px | 700 | 1.05 |
| Section Title (h2) | 40–48px | 600–700 | 1.15 |
| Card Title | 20–24px | 600 | 1.3 |
| Body | 14–16px | 400 | 1.55 |
| Caption / Meta | 11–12px | 400 | 1.4 |

헤딩은 트래킹을 좁혀(`-0.02em`) 밀도감을 유지.

---

## 4. 여백 & 레이아웃

- **컨테이너 최대폭**: `max-w-6xl` (≈1200px), Tailwind container padding `2rem`.
- **섹션 세로 여백**: `py-24` (96px) 표준, 조밀한 페이지는 `py-16` (64px).
- **컴포넌트 간격**: `gap-4` ~ `gap-6` (16–24px).
- **반응형**: 2xl 컨테이너 1400px까지 확장.
- **관리자 레이아웃**: 좌측 사이드바 + 콘텐츠 카드 그리드. 대시보드는 큰 숫자 + `card-elevated` 패널.
- **공개 사이트**: 화이트 배경 + 중앙정렬 히어로 + 채용 카드 리스트(호버 리프트).

---

## 5. 라운딩 & 섀도우

- **Radius**: `--radius: 0.625rem` (10px). Tailwind `rounded-lg` = radius, `rounded-md`/`rounded-sm`는 -2/-4px.
- **Shadow (하드 보더 대체)**:
  - `--shadow-card` — 기본 카드
  - `--shadow-card-hover` — 호버시 상승
  - `--shadow-soft` — 낮은 elevation(패널, 인풋 그룹)

모두 다층(멀티 레이어) 섀도우 + 얇은 1px 링(rgba)로 구성해 Cal.com 특유의 "라인 없이도 정의된" 감각을 만듬.

Tailwind 매핑: `shadow-card`, `shadow-card-hover`, `shadow-soft`.

---

## 6. 컴포넌트 클래스 (index.css `@layer components`)

| 클래스 | 정의 | 용도 |
|---|---|---|
| `.card-elevated` | `bg-card` + `shadow-card` → hover 시 `shadow-card-hover` | 모든 콘텐츠 카드의 기본 |
| `.card-soft` | `bg-card` + `shadow-soft` | 인라인 패널, 위젯 |

### shadcn 컴포넌트
`components.json`으로 shadcn/ui 설치. 모든 primitives는 시맨틱 토큰을 참조하도록 유지 — 필요한 경우 `cva` variants로 확장하고 하드코딩 컬러를 넣지 않음.

예: `StatusBadge`는 stage 컬러(사용자가 지정한 브랜드 컬러)만 `style={{backgroundColor}}` 인라인으로 받고, 텍스트 대비는 `getContrastTextColor()`(WCAG 명도 계산)로 자동 선택.

---

## 7. 상태 & 인터랙션

- **호버**: 카드는 그림자 상승(`shadow-card` → `shadow-card-hover`), 200ms ease.
- **포커스**: `--ring` (거의 검정) 2px 아웃라인. shadcn 기본 유지.
- **트랜지션**: `transition: box-shadow 200ms ease, transform 200ms ease` 표준.
- **애니메이션**: accordion 열림/닫힘 0.2s, 이 외에는 절제.

---

## 8. 접근성

- 텍스트 대비 최소 WCAG AA (4.5:1). 브랜드 컬러 배지에는 `getContrastTextColor()` 유틸이 자동으로 흰색/검정 텍스트 선택.
- 포커스 링 항상 노출 (제거 금지).
- 아이콘 버튼은 `aria-label` 필수.
- 시맨틱 HTML + 단일 H1 원칙.

---

## 9. 반드시 지켜야 할 규칙 (Do / Don't)

**Do**
- `bg-background text-foreground` 같은 시맨틱 유틸리티만 사용.
- 카드에는 `card-elevated` 또는 `card-soft`.
- 폰트는 NanumSquare 계열 유지.
- 새 색이 필요하면 `index.css`에 HSL 토큰 추가 후 `tailwind.config.ts`에 매핑.

**Don't**
- `text-white`, `bg-black`, `bg-[#hex]` 등 하드코딩 컬러 금지 → 다크 모드/테마화 파괴.
- 두꺼운 하드 보더(`border-2`, 진한 테두리) 금지.
- 보라·인디고 그라디언트, Inter/Poppins 등 "AI 기본값" 미학 지양.
- shadcn 컴포넌트의 색상 클래스를 직접 덮어쓰지 말고 variant/토큰으로 확장.

---

## 10. 참고 파일

- `src/index.css` — 컬러/섀도우/컴포넌트 클래스 정의
- `tailwind.config.ts` — 토큰 → Tailwind 유틸리티 매핑
- `src/lib/colorContrast.ts` — 브랜드 컬러 대비 자동 계산
- `src/components/admin/ats/StatusBadge.tsx` — 사용자 컬러 + 시맨틱 토큰 혼합 예시
- `.lovable/memory/design/tokens.md` — 요약 규칙 메모
