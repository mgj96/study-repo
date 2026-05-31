# Reusable Workflows (재사용 워크플로우)

## 한 줄 정의

워크플로우를 **함수처럼** 정의해두고, 다른 워크플로우에서 **호출(call)** 해서 재사용하는 기능.

```
일반 워크플로우 = 트리거 + 로직이 한 파일에 다 들어있음
재사용 워크플로우 = 로직만 분리 → 여러 곳에서 호출
```

---

## 왜 쓰나

- **중복 제거**: 같은 빌드/배포 단계를 여러 워크플로우가 복붙하지 않음
- **유지보수**: 로직을 한 곳에서만 고치면 호출하는 모든 곳에 반영
- **가독성**: caller는 "언제/무엇을" 부르는지만 보면 됨

---

## 구조: caller(호출) vs called(정의)

함수에 비유하면 이해가 빠르다.

| 비유 | 워크플로우 |
|------|-----------|
| 함수 정의 | called 워크플로우 (`on: workflow_call`) |
| 함수 시그니처(매개변수) | `inputs`, `secrets` |
| 함수 호출 | caller의 `uses:` |
| 인자 전달 | `with:`, `secrets:` |

---

## 예제 — 실제 리팩토링 사례 (trending-news)

### Before: 한 파일에 다 섞임
```yaml
# daily_report.yml
on:
  schedule:
    - cron: '13 22 * * *'
  workflow_dispatch:
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.10'      # ← 하드코딩
      - run: pip install requests beautifulsoup4 google-generativeai
      - run: python trending.py        # ← 하드코딩
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      # ... 커밋 & 푸시
```

### After: 정의(called) + 호출(caller) 분리

**① called — `_python-report.yml` (재사용 로직)**
```yaml
on:
  workflow_call:              # ← 직접 안 돌고 "호출되면" 실행
    inputs:
      python-version:
        type: string
        default: '3.10'       # 기본값 → 생략 가능
      script-name:
        type: string
        required: true        # 필수 인자
    secrets:
      GEMINI_API_KEY:
        required: true        # 시크릿도 명시적으로 받아야 함
permissions:
  contents: write
jobs:
  run-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ inputs.python-version }}   # 변수화
      - run: python ${{ inputs.script-name }}            # 변수화
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

**② caller — `daily_report.yml` (트리거 + 호출)**
```yaml
on:
  schedule:
    - cron: '13 22 * * *'
  workflow_dispatch:
permissions:
  contents: write
jobs:
  daily-trending:
    uses: ./.github/workflows/_python-report.yml   # ← 함수 호출
    with:
      script-name: 'trending.py'                   # 인자 전달
    secrets:
      GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      # 전부 그대로 넘길 땐 `secrets: inherit` 한 줄로 대체 가능
```

---

## 꼭 기억할 함정 3가지

### 1. 시크릿은 자동 상속 안 됨
called 워크플로우는 호출한 쪽의 secrets를 **자동으로 못 본다.**
- 명시적 전달: `secrets: { KEY: ${{ secrets.KEY }} }`
- 전부 전달: `secrets: inherit`

### 2. 권한(permissions)은 caller가 상한
called 워크플로우가 `contents: write`를 선언해도,
**caller가 그 권한을 안 주면 못 쓴다.** caller의 권한이 천장.

### 3. 트리거는 caller에만
`on: workflow_call`만 가진 워크플로우는 **스스로 못 돈다.**
cron, push 같은 실제 트리거는 caller가 가져야 함.

---

## `uses:` 경로 종류

```yaml
# 같은 레포
uses: ./.github/workflows/_python-report.yml

# 다른 레포 (조직 공통 워크플로우 등) — 버전 고정 권장
uses: my-org/shared-workflows/.github/workflows/ci.yml@v1
```

---

## 언제 분리할지 판단 기준

```
같은 단계를 2개 이상 워크플로우에서 쓴다     → 분리
나중에 비슷한 작업이 늘어날 게 보인다        → 분리
한 워크플로우에서 한 번만 쓰고 끝            → 굳이 안 해도 됨 (과한 추상화 주의)
```

---

## 관련 문서

- [코드베이스 분석 방법](../llm/codebase-analysis.md) — Claude Code와 작업 시 컨텍스트 전달
- 실제 적용 PR: mgj96/trending-news#1
