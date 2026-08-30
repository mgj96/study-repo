# 🧪 코딩테스트 기출 복기 & 유형 훈련

> GitHub에서 이 폴더를 열면 보이는 인덱스. 상위 계획은 [코딩테스트 2주 로드맵](../coding-test-2week.md).
> 모든 노트는 답을 먼저 보여주지 않고 **🤔 생각(멈춰서 스스로) → 📖 읽기(접힌 추론을 열어서) → ✅ 확인(손 검증)** 순서로 진행된다 — 풀이 암기가 아니라 **문제를 봤을 때 무엇에 주목하는지**를 훈련하는 형식.

## 수준 기준선

실전 기출이 **HackerRank Medium ≈ 기업 코테 3문제 세트의 2번 문제(중)** 급으로 확인됨. 이 폴더의 훈련 문제는 전부 이 급으로 통일한다 — **2번 문제가 합격선**이다 (1번 워밍업 급은 시간 대비 이득이 없고, 3번 급은 당락 기여도가 낮다).

## 노트 목록

| # | 노트 | 유형 | 난이도 (HackerRank / 기업) | 핵심 한 줄 |
|---|---|---|---|---|
| 1 | [이진 문자열 조합 개수](binary-distinct-combinations.md) ★기출 | Distinct Subsequences DP | Medium / 2번(중~중상) | 마지막 글자로 분류 + **덮어쓰기 = 중복 제거**. 겉모습 같은 4형제 판별표 포함 |
| 2 | [REST API 페이지네이션](rest-api-pagination.md) ★기출 | HTTP + 집계(max/그룹 합산) | Intermediate 인증 / 1~2번(하~중) | **첫 응답은 데이터가 아니라 지도(total_pages)**. 국가별 합산-argmax 변형 포함 |
| 3 | [Sherlock and Anagrams](sherlock-and-anagrams.md) | 해시 그룹핑 + 조합 공식 | Medium / 2번(중) | 쌍을 세지 말고 **정규화 키로 묶어 c(c-1)/2** |
| 4 | [중복 없는 최장 부분문자열](longest-unique-substring.md) | 슬라이딩 윈도우 | Medium / 1~2번(중) | 불변식 유지 + `left = max(left, last+1)` **후퇴 금지** |

## 사고 연결 지도

노트들이 공유하는 사고 패턴 — 새 문제를 만나면 이 중 어느 것인지부터 판별:

- **"나열하지 말고 세라"** — 결과가 지수적으로 많으면 분류 기준을 잡아 개수만 굴린다 (1번: 마지막 글자 / 3번: 정규화 키)
- **"순회 중엔 모으고, 끝나고 판단하라"** — 최종 승자를 중간에 알 수 없으면 Map에 누적 후 argmax (2번 §3.5 / 3번)
- **"불변식을 유지하며 밀어라"** — 연속 구간 최장/최단은 창의 조건을 매 턴 복구 (4번)

## NotebookLM에 넣기 (Raw 링크 — 복사해서 소스 추가)

```
https://raw.githubusercontent.com/mgj96/study-repo/main/study/coding-test-2week.md
https://raw.githubusercontent.com/mgj96/study-repo/main/study/coding-test/binary-distinct-combinations.md
https://raw.githubusercontent.com/mgj96/study-repo/main/study/coding-test/rest-api-pagination.md
https://raw.githubusercontent.com/mgj96/study-repo/main/study/coding-test/sherlock-and-anagrams.md
https://raw.githubusercontent.com/mgj96/study-repo/main/study/coding-test/longest-unique-substring.md
```

추천 프롬프트: *"각 노트의 🤔 생각 질문만 뽑아 퀴즈로 내고, 내 답과 📖 추론을 비교해줘"* — 노트 형식이 그대로 문답 훈련이 된다.

## 새 노트 추가 규칙

1. 실전에서 만난 문제는 **★기출** 표시, 훈련용은 표시 없음 — 전부 2번 문제 급 유지
2. 형식 고정: 0단계 판별 → 🤔/📖(details 접기)/✅ 단계들 → 결론 코드(Java) → 손 추적 표 → 함정 체크리스트 → 3단 요약
3. 추가 시 이 README 표 + [로드맵 §1.5](../coding-test-2week.md) 표 + [NotebookLM 소스 목록](../notebooklm-sources.md)에 한 줄씩 등록
