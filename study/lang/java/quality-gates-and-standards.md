# 품질 게이트와 팀 코드 표준 — 무료 도구로 "문서"를 "빌드 실패"로 승격하기

> 출발 질문 두 개: ① 자바에서 유닛테스트 말고 에러를 잡는 형식이 더 있나? ② SonarQube 말고 무료 도구로 소스 정규화·팀 표준을 맞추는 방법은?
> 핵심 주장: **스타일 가이드 문서는 아무도 안 지킨다. 지켜지는 표준은 "어기면 빌드가 깨지는" 표준뿐이다.**
> 관련: [테스트 전략](deep-testing-strategy.md) · [디자인 패턴](design-patterns.md) · [아키텍처 피트니스 함수](../../architecture/concept.md)

---

## 0. 큰 그림 — 에러를 잡는 4단 사다리 (shift-left)

유닛테스트는 아래 사다리의 **3칸 중 하나**일 뿐이다. 왼쪽(이른 시점)으로 당길수록 수정 비용이 싸진다:

| 단계 | 시점 | 도구 (전부 무료) | 잡는 것 |
|---|---|---|---|
| ① 컴파일 | javac 도는 순간 | 언어 자체 · **ErrorProne**(구글) · **NullAway**(우버) | 타입 오류, 버그 패턴(`==` 문자열 비교), 널 접근 — Kotlin 없이 자바에서 널 안전 근사 |
| ② 정적 분석 | 실행 없이 소스·의존성 | **Checkstyle · PMD · SpotBugs** · SonarQube CE · **OWASP Dependency-Check** | 스타일·버그 패턴·보안(SAST)·의존성 CVE(SCA) |
| ③ 테스트 | 실행해서 | JUnit · Testcontainers · **jqwik**(property) · **PIT**(mutation) · Pact(계약) | 동작 오류. mutation은 "테스트를 테스트" |
| ④ 런타임 | 떠 있는 앱 | OWASP ZAP(DAST) · 관측(RED/USE → [성능 공학](../../cs/deep-performance-engineering.md)) | 마지막 그물 |

> 보안은 3종 세트로: **SAST**(내 소스) · **SCA**(의존성 — Log4Shell이 이 칸의 존재 이유) · **DAST**(외부 공격 시뮬). 여기에 **gitleaks**(커밋 속 비밀키 스캔)까지가 기본 배선.

이 노트의 본론은 이 중 **②의 왼쪽 절반 — 스타일·표준을 기계로 강제하는 법**이다.

---

## 1. 철학 — 논쟁을 회의실에서 도구로 옮긴다

팀 표준이 무너지는 경로는 늘 같다: 가이드 문서 작성 → 처음엔 지킴 → 바쁘면 안 지킴 → 리뷰마다 스타일 지적으로 감정 소모 → 포기. 구글의 해법이 업계 표준이 됐다:

> **스타일은 사람이 리뷰하지 않는다.** 포맷은 기계가 통일하고, 리뷰는 설계·로직에만 쓴다.
> 규칙의 가치는 내용이 아니라 **일관성**에 있다 — "탭이냐 스페이스냐"의 정답은 없지만, 섞이면 모든 diff가 오염된다.

따라서 도입 순서도 "좋은 규칙 만들기"가 아니라 **"기존 프리셋 채택 + 강제 지점 배선"**이다. 커스텀 규칙 하나 = 유지보수 부채 하나.

---

## 2. 계층별 무료 도구 — 무엇을 어느 도구로

| 역할 | 도구 | 한 줄 |
|---|---|---|
| **에디터 공통 기초** | **EditorConfig** (`.editorconfig`) | 인코딩·개행(LF)·인덴트를 IDE 불문 통일. IntelliJ·이클립스·VS Code 전부 내장 지원 — **가장 싼 첫 수** |
| **포매터 (정규화 본체)** | **Spotless** + google-java-format | 그레이들/메이븐 플러그인. `spotlessApply`(고침)/`spotlessCheck`(검사·CI용). 포맷 논쟁 자체를 소멸시킴 |
| **네이밍·스타일 린트** | **Checkstyle** | `google_checks.xml`로 시작해 명명 규칙(클래스 PascalCase, 상수 UPPER_SNAKE…)을 **빌드 실패로 강제** |
| 버그 패턴 (소스) | **PMD** | 빈 catch, 미사용 변수, 과도한 복잡도(cyclomatic) 임계치 |
| 버그 패턴 (바이트코드) | **SpotBugs** (+FindSecBugs) | 컴파일 결과를 분석 — NPE 경로, 리소스 누수, 보안 룰 |
| 컴파일 강화 | **ErrorProne**, **NullAway** | javac 플러그인 — 사다리 ①로 당기는 도구 |
| 의존성 취약점 | **OWASP Dependency-Check** | CVE DB 대조. CI 주 1회라도 |
| 종합 대시보드 | SonarQube **Community Edition** | 위 결과들의 추이·게이트 관리 (이미 사용 중이면 위 도구들이 그 밑을 채우는 재료) |

> **역할이 겹치지 않는다는 게 포인트**: EditorConfig(입력 기초) → Spotless(모양) → Checkstyle(이름·구조 규칙) → PMD/SpotBugs(버그) → SonarQube(집계). "소나큐브 있는데 왜 또?"의 답 — 소나큐브는 **보여주는** 쪽이고, 이 도구들은 빌드에서 **막는** 쪽이다.

---

## 3. 강제 지점 3단 배선 — 어디서 막을 것인가

같은 규칙이라도 **어디서 걸리느냐**가 체감을 결정한다. 세 겹으로 배선한다:

```
① IDE 저장 시     — 저장하면 자동 포맷 (개발자는 규칙을 "느끼지" 못함. 이게 이상적)
② git pre-commit  — 커밋 순간 spotlessCheck. 어기면 커밋 자체가 안 됨
③ CI 게이트       — 머지 요청에서 spotlessCheck + checkstyle. 어기면 머지 불가 ← 진짜 강제력
```

**② pre-commit 배선 (그레이들 예)** — 저장소에 훅을 넣고 팀원은 한 줄만 실행:

```bash
# 저장소에 커밋해두는 파일: .githooks/pre-commit
#!/bin/sh
./gradlew spotlessCheck checkstyleMain --daemon || {
  echo "포맷/스타일 위반 — ./gradlew spotlessApply 후 다시 커밋"; exit 1;
}
```

```bash
# 팀원 1회 설정 (README에 한 줄)
git config core.hooksPath .githooks
```

**③ CI 게이트** — Bamboo·GitLab CI 어느 쪽이든 검사 태스크 하나 추가가 전부:

```yaml
# GitLab CI 예 — 이 잡이 실패하면 MR 머지 버튼이 잠긴다
lint:
  stage: check
  script: ./gradlew spotlessCheck checkstyleMain pmdMain spotbugsMain
```

> **왜 3겹인가**: ①만 있으면 IDE 안 쓰는 사람·설정 안 한 사람이 뚫는다. ②는 로컬이라 우회 가능(`--no-verify`). **③이 유일하게 우회 불가**라 최종 보루이고, ①②는 ③에서 창피당하기 전에 미리 잡아주는 편의다. — [분산 정합성](../../cs/deep-distributed-consistency.md)의 "최종 지점에서 검증"과 같은 사고: 앞단은 최적화, 보증은 마지막 게이트가 한다.

---

## 4. 기존 코드베이스 도입 — 진짜 어려운 부분

빈 프로젝트에 거는 건 쉽다. 수십만 줄 운영 코드(마더쉽 + 현장 fork)에 거는 게 문제다. 함정 두 개와 해법:

### 함정 ① 전체 리포맷이 git blame을 오염시킨다

한 번에 전부 포맷하면 모든 줄의 "마지막 수정자"가 포맷 커밋이 된다 — 장애 추적 때 `git blame`이 무용지물. **해법**: 포맷 전용 커밋을 만들고 그 해시를 제외 목록에 등록:

```bash
# .git-blame-ignore-revs 파일에 포맷 커밋 해시 기록
git config blame.ignoreRevsFile .git-blame-ignore-revs
# → blame이 포맷 커밋을 건너뛰고 진짜 수정자를 보여줌 (GitHub/GitLab UI도 지원)
```

### 함정 ② 기존 위반 수천 건이 첫날 빌드를 전멸시킨다

전 파일에 Checkstyle을 켜면 위반 8,000건 → 팀 반발 → 도구 제거 수순. **해법 = 래칫(ratchet), 한 방향 나사**:

- **Spotless `ratchetFrom 'origin/main'`** — **이번에 건드린 파일만** 검사. 새 코드부터 깨끗해지고, 손대는 파일이 점진적으로 정규화됨
- Checkstyle은 처음엔 위반을 **경고로 집계만**(baseline) → 신규 위반부터 실패 처리 → 분기마다 임계치 하향

> 래칫의 철학: **"어제보다 나빠지지만 않으면 된다."** 빅뱅 정리는 실패하고, 한 방향 나사는 조용히 이긴다 — 표준화를 1년 프로젝트가 아니라 **자동 진행되는 배경 프로세스**로 바꾸는 발상.

---

## 5. 합의 관리 — 도구 설정이 곧 표준 문서다

- **진실의 원천(SSOT)은 설정 파일**: `checkstyle.xml`·`.editorconfig`가 저장소에 커밋돼 있으면 그게 표준이다. 위키 가이드 문서는 "왜"만 짧게 — 문서와 도구가 어긋나면 **도구가 이긴다** (안 그러면 둘 다 죽는다)
- **규칙 변경은 ADR로**: "왜 이 규칙을 껐나"를 [결정 기록](../../architecture/concept.md)으로 — 6개월 뒤 같은 논쟁의 재발 방지
- **화이트라벨/fork 구조에서는**: 표준 설정을 마더쉽에 두고 현장이 상속 — 설정 파일도 코드처럼 fork 전략을 태운다. 현장별 예외는 예외 파일로 명시(암묵 diff 금지)

---

## 3단 요약 (암기)

- **① 결론 · WHAT** — 무료 배선 공식: **EditorConfig(기초) + Spotless(포맷) + Checkstyle(명명·규칙) + PMD/SpotBugs(버그) + ErrorProne(컴파일)**을 **IDE 저장 → pre-commit → CI 게이트** 3겹에 건다. SonarQube는 이 결과의 대시보드지 대체재가 아니다.
- **② 원리 · HOW** — 지켜지는 표준은 "어기면 빌드가 깨지는" 표준뿐이다. 스타일 논쟁을 사람에서 기계로 옮기고(규칙의 가치는 내용이 아니라 일관성), 강제력의 보증은 우회 불가능한 **최종 게이트(CI)**가 맡는다 — 앞단(IDE·훅)은 최적화일 뿐.
- **③ 확장 · TRADE-OFF** — 비용은 셋: 빌드 시간(ErrorProne·SpotBugs), 오탐 관리(PMD 룰 튜닝), 그리고 **도입 충격**. 기존 코드베이스엔 빅뱅 대신 **래칫**(건드린 파일만 검사)과 **blame-ignore-revs**(이력 보존)로 점진 도입한다 — "어제보다 나빠지지 않게"가 1년 정리 프로젝트를 이긴다. 커스텀 규칙은 하나가 부채 하나: 기본 프리셋에서 시작해 빼는 쪽으로만.

---

## 용어 사전

| 용어 | 뜻 |
|---|---|
| shift-left | 검증을 개발 흐름의 이른(왼쪽) 시점으로 당기는 원칙 |
| SAST / SCA / DAST | 내 소스 정적 분석 / 의존성 취약점 검사 / 실행 중 앱 공격 시뮬 |
| 포매터 vs 린터 | 모양을 고쳐줌(Spotless) vs 규칙 위반을 지적함(Checkstyle) |
| pre-commit hook | 커밋 직전 자동 실행되는 검사 스크립트 |
| 래칫(ratchet) | 한 방향 나사 — 변경분만 검사해 "나빠지지 않음"을 보장하는 점진 도입 |
| baseline | 기존 위반을 동결하고 신규 위반만 실패 처리하는 기법 |
| .git-blame-ignore-revs | 대량 포맷 커밋을 blame에서 제외해 이력 추적을 보존 |
| SSOT | 단일 진실 원천 — 표준의 실체는 문서가 아니라 커밋된 설정 파일 |

## 연결 지도
- **테스트 계층의 심화 (③칸)**: → [deep-testing-strategy.md](deep-testing-strategy.md)
- **아키텍처 규칙의 강제 (ArchUnit·피트니스 함수)**: → [../../architecture/concept.md](../../architecture/concept.md)
- **"최종 지점에서 검증" 사고의 원형**: → [../../cs/deep-distributed-consistency.md](../../cs/deep-distributed-consistency.md)
- **관측이 담당하는 ④칸**: → [../../cs/deep-performance-engineering.md](../../cs/deep-performance-engineering.md)
- **컴파일 타임으로 당기기의 극단 (Kotlin)**: → [../kotlin-for-java-devs.md](../kotlin-for-java-devs.md)
