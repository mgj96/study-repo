# 개발 도구 전략 — IDE 탈출 검증과 AI 에이전트 도구 3종 (2026-08)

> 출발 질문 셋: ① IntelliJ에서 VS Code로 탈출 가능한가, 뭘 잃나? ② Orca·Buzz는 뭐고 Claude Code와 뭐가 다른가? ③ 제미나이 무료 모델로도 멀티에이전트가 되나?
> 결론 먼저: **IDE는 듀얼 운용, 에이전트는 단일이면 이전 불필요, 제미나이 무료 실험은 개인 코드 한정.**
> 관련: [콘웨이 법칙과 AI 에이전트](../architecture/deep-conway-and-ai-agents.md) · [Kotlin 노트](kotlin-for-java-devs.md) · [품질 게이트](java/quality-gates-and-standards.md)

---

## 1. IntelliJ → VS Code 탈출 검증

### 라이선스 진실 (탈출 동기 재점검)

| | 가격 | Spring | JSP |
|---|---|---|---|
| IntelliJ **Community** | 이미 **무료·오픈소스** | ❌ Ultimate 전용 | ❌ Ultimate 전용 |
| IntelliJ Ultimate | 유료 | ✅ 최강 | ✅ |
| **VS Code** + Java 확장팩 | 무료 | ✅ (얕지만 무료) | ❌ **사실상 미지원** |

> 진짜 비교는 "무료 Community(스프링 없음) vs 무료 VS Code(스프링 있음)" — 무료 진영에선 VS Code 승.

### 넘어가면 잃는 것

| 항목 | 손실 | 비고 |
|---|---|---|
| 리팩토링 | ★★★ | IntelliJ 50+ 자동 리팩토링 vs VS Code는 rename·extract 수준 |
| **JSP** | ★★★ | **레거시 JSP 유지보수하는 한 결정타** — 문법 하이라이트 수준뿐 |
| Spring 통합 깊이 | ★★☆ | bean 네비게이션·엔드포인트 뷰의 깊이 차이 |
| MyBatis 생태 | ★★☆ | MyBatisX류 매퍼 점프 플러그인이 IntelliJ에 몰림 |
| **단축키** | ★☆☆ | **IntelliJ IDEA Keybindings 확장이 590+ 키 이식** — 단, 리팩토링 계열은 **기능 자체가 없어서** 키만 살려도 무의미 |

얻는 것: 무료·경량·AI 확장 생태·**Vue/TS 프론트는 오히려 우세**.

> **판정: 듀얼 운용.** 사이드 프로젝트(코테·Kotlin 학습)는 VS Code, 회사 레거시(JSP·대규모 리팩토링)는 IntelliJ. "완전 탈출"은 JSP를 버리는 날 성립한다.

---

## 2. AI 에이전트 도구 3종 — 전부 다른 카테고리다

"IntelliJ에서 Orca로 이전"은 성립하지 않는 문장이다 — 셋은 층이 다르다:

| | **Claude Code 데스크탑** | **Orca** ([onorca.dev](https://www.onorca.dev/)) | **Buzz** ([buzz.xyz](https://block.xyz/inside/introducing-buzz-where-humans-and-agents-work-together)) |
|---|---|---|---|
| 카테고리 | 에이전트 **작업 실행기** | 병렬 실행 **관제탑** (ADE) | 인간+에이전트 **팀 채팅** |
| 핵심 가치 | Claude 하나를 깊게 (세션·도구·서브에이전트) | 여러 CLI 에이전트를 워크트리 격리로 **동시 실행 → 결과 비교 → 승자 선택** | 에이전트가 채널의 **동료**로 상주 — 암호학적 자기 신원(Nostr) |
| 가격 | Claude 구독 | **무료·MIT** (에이전트 구독 BYO) | **무료·오픈소스** (Block/잭 도시) |
| 관계 | — | Claude Code를 **안에서** 돌림 (포장지) | Claude Code가 **참여자로** 입장 (회의실) |

### 이전 판단 — "에이전트 1개면 안 가는 게 맞다"

Orca의 존재 이유는 ① 여러 종류 에이전트 경쟁 ② 같은 작업 N번 병렬 시도. **Claude 하나만 쓰면 ①이 통째로 사라지고**, ②(병렬 세션·워크트리 격리·서브에이전트 팬아웃·백그라운드 작업)는 **Claude Code 데스크탑이 이미 내장**한다. 단일 에이전트 사용자에게 Orca는 이미 가진 기능의 다른 껍데기다.

**이전 트리거 2개**: ① 두 번째 에이전트(Codex·Gemini)를 붙여 경쟁시키고 싶을 때 → Orca ② 팀이 에이전트를 도입해 채널에 상주시킬 때 → Buzz.

---

## 3. 제미나이 무료로 멀티에이전트 실험이 되나?

**된다 — 단 조건부다.** Gemini CLI + 개인 구글 계정:

| 항목 | 내용 |
|---|---|
| 무료 한도 | **60회/분 · 1,000회/일** — 실험엔 충분 |
| 모델 | **2026-04부터 Pro급은 무료 제외** → 무료는 Flash급. Claude와 경쟁 시 체급 차 감안 |
| 비용 구조 | Orca(무료) + Claude(기존 구독) + Gemini CLI(무료) = **추가 0원으로 2-에이전트 경쟁 가능** |

> ⚠️ **결정적 경고 — 무료 티어는 코드를 학습에 쓴다.** 구글 약관이 무료 티어 입력을 제품 개선·ML 학습에 사용하고 리뷰어가 열람할 수 있다고 명시한다(민감·기밀 데이터 제출 금지 조항). **회사 코드(B2G·운영 소스)는 절대 무료 제미나이에 넣지 말 것** — 학습 미사용 보장은 유료 티어부터다.
>
> 실전 규칙: **개인 사이드 프로젝트·코테 연습 = 무료 실험 OK / 회사 코드 = Claude 단독 유지.** [품질 게이트 노트](java/quality-gates-and-standards.md)의 비밀키 스캔과 같은 계열의 규율이다 — 코드가 어디로 흘러가는지가 곧 보안 경계다.

---

## 4. 콘웨이 노트와의 접점

이 3종은 [콘웨이×AI 노트](../architecture/deep-conway-and-ai-agents.md)의 논문 단계들이 반년 만에 제품이 된 구도다: **Orca** = 토폴로지를 UI로 갈아끼우는 역콘웨이 기동의 제품화, **Buzz** = "하이브리드 팀의 소통 경로에 에이전트가 정식 입주"(신원까지 부여), **Claude Code** = 그 안의 개별 노동자. 이론 노트가 예측한 카테고리가 실제로 열리는 중이다.

---

## 3단 요약 (암기)

- **① 결론 · WHAT** — IDE는 **듀얼 운용**(개인 작업 VS Code / 회사 레거시 IntelliJ — JSP가 결정타), 에이전트 도구는 **단일 에이전트면 Claude Code 유지**(Orca는 멀티 경쟁용, Buzz는 팀 채팅용 — 카테고리가 다름), 제미나이 무료는 **개인 코드 한정 실험용**.
- **② 원리 · HOW** — 도구 선택은 기능 목록이 아니라 **"내 병목이 뭔가"**로 정한다: 병목이 리팩토링·JSP면 IntelliJ가 남고, 병목이 에이전트 경쟁이 아니면 관제탑은 불필요하며, 무료 티어의 대가는 돈이 아니라 **데이터**(학습 사용)다.
- **③ 확장 · TRADE-OFF** — 세 판단 모두 시한부다: JSP를 걷어내면 IDE 판정이 뒤집히고, 두 번째 에이전트 구독이 생기면 Orca가 유효해지고, 팀이 에이전트를 도입하면 Buzz가 회의실이 된다. **도구 전략은 결정이 아니라 트리거 목록**으로 관리하라 — 이 노트의 트리거들이 그것이다.

---

## 🔗 링크 모음

| 분류 | 링크 |
|---|---|
| VS Code Java | [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) · [Spring Boot Extension Pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) · [IntelliJ IDEA Keybindings](https://marketplace.visualstudio.com/items?itemName=k--kato.intellij-idea-keybindings) |
| Orca | [공식](https://www.onorca.dev/) · [리뷰](https://vibecodinghub.org/tools/orca) |
| Buzz | [소개(Block)](https://block.xyz/inside/introducing-buzz-where-humans-and-agents-work-together) · [GitHub](https://github.com/block/buzz) |
| Gemini CLI | [GitHub](https://github.com/google-gemini/gemini-cli) · [무료 한도 논의](https://github.com/google-gemini/gemini-cli/discussions/4122) |
| 비교 자료 | [VS Code vs IntelliJ 2026](https://www.javacodegeeks.com/2026/01/an-in-depth-comparison-vs-code-vs-intellij-for-java-development.html) · [병렬 에이전트 도구 정리](https://www.codeagentswarm.com/en/guides/best-tools-to-run-multiple-ai-coding-agents) |
