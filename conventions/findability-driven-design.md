# 찾을 수 있게 만들기 (Findability) — 아키텍처·명명·CLAUDE.md

> 초안 (검토 중). LLM이 코드를 이해하는 방식에서 출발해, 왜 아키텍처와
> 명명 규칙이 결국 "검색 가능성"으로 귀결되는지, 그리고 그것을 CLAUDE.md로
> 어떻게 강제하는지 정리한다.

## 출발점 — LLM의 코드 이해 = findability

LLM은 코드를 통째로 "아는" 게 아니라, 필요한 부분을 **찾아서** context에 넣고 추론한다.
([코드베이스 분석 방법](../llm/codebase-analysis.md), [도구 검색·컨텍스트](../llm/tools-search-and-context.md) 참고)

그 "찾기"는 두 방식뿐인데, **둘 다 같은 것을 요구**한다:

| 검색 방식 | 무엇으로 찾나 | 잘 찾히려면 |
|-----------|--------------|------------|
| grep / rg | 이름·텍스트 패턴 | 이름이 **예측 가능**하고 위치가 일관돼야 |
| 인덱싱(RAG) | 의미(임베딩) | 청크 경계 = **모듈 경계**가 깔끔해야 |

→ 결론: **구조와 명명이 일관되면 AI가 잘 찾고, 흩어지면 못 찾는다.**
   즉 "AI가 이해하기 좋은 코드 = 사람이 찾기 좋은 코드 = 좋은 아키텍처"로 귀결된다.

## 그래서 좋은 아키텍처는 곧 AI 친화적 아키텍처

각 패턴이 *왜* findability를 높이는지(단순한 유행이 아니라):

### Frontend — FSD (Feature-Sliced Design)
- **구조**: layer(app/features/entities/shared) → slice(도메인) → segment(ui/model/lib)
- **왜 잘 찾히나**: "결제 UI"는 `features/payment/ui`에 있다고 **위치가 예측됨**.
  단방향 의존(entities→features→app)이라 영향 범위도 추론 가능.
- mesu.live가 실제로 이 구조를 씀 → 본인 사례로 검증 가능.

### Backend — Hexagonal / DDD
- **구조**: 도메인 중심 + port/adapter로 외부(DB·API) 격리
- **왜 잘 찾히나**: 비즈니스 로직이 도메인별로 **한곳에 모여** 있고,
  기술 세부(어댑터)와 분리돼 "주문 도메인 규칙"을 한 경계 안에서 찾는다.

### Spec-driven
- **구조**: 스펙(명세)이 코드보다 먼저, 단일 진실의 원천
- **왜 잘 찾히나**: AI가 "스펙 → 구현" 매핑을 따라가며 일관성 검증 가능.
  (이번 세션에서 "trending.py의 모델명을 진실의 원천으로" 삼은 것과 같은 원리)

## 명명 규칙 — LLM은 이름으로 의미를 추론한다

LLM은 AST가 아니라 **이름의 의미론적 단서**로 코드를 읽는다.
그래서 명명 일관성은 findability의 절반이다.

- `userAge`, `PaymentService`, `getReachableStar` — 이름만으로 역할 추론 가능
- 약어·축약 남발(`usrAgmt`, `calc2`)은 grep·의미검색 모두 방해
- 같은 개념엔 같은 단어 (fetch vs get vs load 섞지 않기)

## 이것을 CLAUDE.md로 강제한다 (다음 단계)

위 규칙들은 사람이 매번 기억할 수 없다. → **CLAUDE.md에 인코딩**해
AI가 생성·탐색할 때 그 규칙을 따르게 만든다.

(이 섹션은 다음 조각에서 항목별 작성 기준으로 이어서 정리)

## 관련 문서

- [코드베이스 분석 방법](../llm/codebase-analysis.md)
- [도구 검색·컨텍스트·용도](../llm/tools-search-and-context.md)
- [카파시 접근법](../llm/karpathy-approach.md) — CLAUDE.md 4원칙
