# 추론 기법 — LLM 시대에 사고력을 잃지 않기

> 왜 이 문서가 있나: LLM이 **근거 찾기**를 쉽게 해주는 대신, 스스로 생각하는 노력이 줄어
> "생각하는 법"을 잊기 쉽다. 판단(어떤 원칙을 언제 적용할지)은 결국 사람의 추론이다.
> 그 추론을 **의식적으로 연습**하기 위한 노트.

## 경고 — AI는 사고를 '검증'으로 옮긴다 (연구 근거)

Microsoft의 지식노동자 319명 설문(CHI 2025):
- **AI를 더 신뢰할수록 비판적 사고를 덜 한다.** 반대로 자기 확신이 높을수록 더 한다.
- 응답자 다수가 GenAI 사용 시 인지 노력이 **줄었다**고 보고
  (지식수집 72%, 이해 79%, 분석 72%, 종합 76%가 "노력 덜 듦").
- 사고의 성격이 **정보 검증·응답 통합·작업 관리(stewardship)** 로 이동.
- 출처: [The Impact of GenAI on Critical Thinking (MS, CHI 2025)](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/)

→ 결론: LLM 시대엔 **"답을 만드는 힘"보다 "검증·판단하는 힘"이 더 중요**해진다.
   그 힘은 추론을 직접 굴려야 유지된다 (안 쓰면 퇴화). 카파시식 "직접 해보기"와 같은 맥락.

## 추론 3종 (도구상자)

| 종류 | 방향 | 예 | 한계 |
|------|------|-----|------|
| **연역(Deductive)** | 일반 원칙 → 구체 결론 | "쓰기 잦으면 인덱스 손해 / 이건 쓰기 잦음 → 인덱스 줄여라" | 전제가 틀리면 결론도 틀림 |
| **귀납(Inductive)** | 구체 관찰 → 일반화 | "이 4개 회사가 모놀리스로 성공 → 중소엔 모놀리스가 낫다" | 반례 하나로 무너짐(잠정적) |
| **가추(Abductive)** | 증상 → 최선의 가설 | "응답이 느리다 → 아마 N+1 쿼리일 것" | 가장 약함 → 반드시 검증 필요 |

출처: [Deductive/Inductive/Abductive (Butte College)](https://www.butte.edu/departments/cas/tipsheets/thinking/reasoning.html)

> 실무 흐름: **가추**로 가설 세우고 → **연역**으로 "그게 맞다면 이런 결과여야"를 도출 →
> **측정/귀납**으로 확인. (lab-benchmarks가 바로 이 검증 단계)

## First-Principles (밑바닥부터)

남의 결론·유추를 빌리지 말고 **부정할 수 없는 기본 사실까지 쪼갠 뒤** 다시 쌓는다.
- "다들 Redis 쓰니까" (유추) ❌ → "동시성=정합성 문제고, 우리 앱은 단일 DB다 →
  DB 락이면 충분" (기본 사실에서 재구성) ✅
- 카파시의 "직접 구현해 이해" 와 같은 정신. ([karpathy-approach](../llm/karpathy-approach.md))

## 연습법 — LLM과 함께 쓰되 사고를 지키기

1. **가설 먼저, 답은 나중**: LLM에 묻기 전에 **내 답·이유를 한 줄 적는다.** 그다음 비교.
2. **검증을 의무화**: LLM 답을 받으면 "반례는? 근거의 근거는? 직접 재현되나?" (이 세션 내내 한 것)
3. **Feynman 기법**: 배운 걸 **남에게 가르치듯** 내 말로 써본다 (이 레포 자체가 그 도구).
4. **Steelman**: 반대 입장을 **가장 강하게** 만들어보고 그래도 내 결론이 서는지 본다.
5. **판단을 위탁하지 않기**: 근거 수집은 LLM, **"그래서 어떻게 할지" 결정은 내가.**

## 우리 레포에 어떻게 쓰이나

- 트레이드오프 판단 = 가추(가설) + 연역(원칙 적용) + 귀납·측정(검증).
- 단순함 원칙([simplicity-principles](../conventions/simplicity-principles.md))의 "지금 필요한가?"
  판단이 곧 추론. 원칙은 도구, **고르는 건 추론.**

## 관련 문서

- [단순함 원칙(YAGNI 등)](../conventions/simplicity-principles.md)
- [카파시 접근법](../llm/karpathy-approach.md) — 밑바닥부터 이해
- [트레이드오프 읽는 법 + 지표](../tradeoffs/reading-tradeoffs-and-metrics.md)
- [환각·추론·창발 논문](../papers/hallucination-reasoning-emergence.md)
