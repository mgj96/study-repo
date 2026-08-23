# 딥다이브 — X(Twitter) For You 랭킹 알고리듬 (공개 소스 원문 대조)

> 대조 대상: [`xai-org/x-algorithm`](https://github.com/xai-org/x-algorithm) @ `d0cef2f` (2026-08-20)
> 방법: 저장소를 직접 clone 하여 `home-mixer/params/param.rs`, `home-mixer/params/config.rs` 값을 1:1 대조
> 형식: 12살 요약 → 원문 수치 심화. 얕은 버전은 [concept.md](concept.md), [qna.md](qna.md).
> 관련: [학습 신호·라벨·확증편향](learning-signal.md) · [모델 편집·보안](model-editing-and-security.md) · [검색 기록](research-log.md)

---

## 0. 30초 직관 — 추천은 "점수 매기기"다

피드에 뭘 띄울지 고르는 일은 결국 **후보마다 점수를 매기고 높은 순으로 줄 세우는 것**이다.

점수는 이렇게 만든다. "이 사람이 이 글에 좋아요를 누를 확률"을 모델이 예측하고, 거기에 "좋아요는 얼마나 값진가"라는 **가중치**를 곱한다. 리트윗도, 공유도, 신고도 똑같이 한다. 그렇게 나온 값들을 전부 더하면 그 글의 최종 점수다.

이번에 X가 공개한 것이 바로 **그 가중치 숫자들**이다. 그동안은 구조만 알려져 있었고 숫자는 몰랐다.

여기서 딱 하나만 기억하면 된다. **가중치는 "확률"에 곱해지는 값이지, "횟수"에 곱해지는 값이 아니다.** 이걸 헷갈리면 아래 4장의 유명한 오해에 그대로 빠진다.

---

## 1. 공개 경위

| 시점 | 내용 |
|---|---|
| 2026-01-20 | 1차 오픈소스 공개 (구조 중심) |
| 2026-08-13 | 확대 공개 — **파라미터 가중치 포함**, 코드베이스 약 10~15배 |

비공개로 남은 부분: Grok(Grox) 기반 규정위반 예측 프롬프트, 일부 botmaker 룰. 어뷰징 회피를 막기 위한 조치라고 밝힘.

---

## 2. 점수 계산 구조

```
최종 점수 = Σ ( weight_i × P(action_i) )
```

**핵심: 가중치는 `예측 확률`에 곱해집니다. 실제 행동 횟수(raw count)가 아닙니다.**

이 구분이 아래 4장 전체의 근거입니다.

---

## 3. 실제 가중치 값 (원문 대조 완료)

### 3.1 양수 가중치 — `param.rs`

| 행동 | 값 | 위치 |
|---|---|---|
| 링크 복사 공유 | **20.0** | `ShareViaCopyLinkWeight` L358 |
| 답글 | **5.0** | `ReplyWeight` L315 |
| ↳ 상호팔로우 답글 부스트 | **+15.0** (실질 20.0) | `BidirectionalFollowReplyWeightBoost` L317 |
| 인용 | **5.0** | `QuoteWeight` L364 |
| DM 공유 | **5.0** | `ShareViaDmWeight` L352 |
| 작성자 팔로우 | **4.0** | `FollowAuthorWeight` L378 |
| 일반 공유 | **2.0** | `ShareWeight` L350 |
| 리트윗 | **1.0** | `RetweetWeight` L328 |
| 좋아요 | **0.5** | `FavoriteWeight` L314 |
| 클릭 | **0.4** | `ClickWeight` L341 |
| 링크 열기 | **0.2** | `OpenLinkWeight` L342 |
| 사진 확대 / 영상 재생 | **0.05** | `PhotoExpandWeight` L330, `VideoOpenWeight` L336 |
| 미탐색 게시물 보정 | **0.02** | `PostUnexploredWeight` L384 |
| **연속 체류시간** | **0.004** | `ContDwellTimeWeight` L408 |

### 3.2 음수 가중치

| 행동 | 값 | 위치 |
|---|---|---|
| 신고 | **−234.0** | `ReportWeight` L474 |
| 음소거 | **−58.8** | `MuteAuthorWeight` L469 |
| 관심없음 | **−43.2** | `NotInterestedWeight` L457 |
| 차단 | **−31.2** | `BlockAuthorWeight` L463 |
| 미체류 | **−0.02** | `NotDwelledWeight` L476 |

> 음소거(−58.8)가 차단(−31.2)보다 **1.88배** 크다는 점은 사실.
> 차단은 그 사용자와의 관계를 끊는 개별 행위지만, 음소거는 "관계는 두되 콘텐츠만 싫다"는 신호라 콘텐츠 품질 판정에 더 직접적이기 때문으로 해석됨.

### 3.3 값이 0인 것

| 항목 | 값 |
|---|---|
| 프로필 클릭 | `ProfileClickWeight = 0.0` |
| 체류(이진 플래그) | `DwellWeight = 0.0` |
| 클릭 후 체류시간 | `ContClickDwellTimeWeight = 0.0` |
| 인용글 영상재생 | `QuotedVqvWeight = 0.0` |

### 3.4 구조 상수 — `config.rs`

| 항목 | 값 | 위치 |
|---|---|---|
| 게시물 최대 수명 | **48시간** | `MAX_POST_AGE = 48*60*60` L36 |
| 후보 선정 수 | **50** | `TOP_K_CANDIDATES_TO_SELECT` L17 |
| 실제 노출 수 | **35** | `RESULT_SIZE` L18 |
| 신규계정 외부글 계수 | **0.00001** | `NEW_USER_OON_WEIGHT_FACTOR` L38 |
| 신규계정 기준 팔로우 수 | **5개 미만** | `NEW_USER_MIN_FOLLOWING` L39 |
| 일반 미팔로우 글 할인 | **0.75** | `OonWeightFactor` (param.rs L253) |
| 토픽 미팔로우 글 할인 | **0.5** | `TopicOonWeightFactor` (param.rs L273) |

---

## 4. 널리 퍼진 두 가지 오해 — 정정

### 오해 ① "신고 1건 = 좋아요 468개"

**소스코드 주석이 이 계산을 직접 반박합니다.** `param.rs` 가중치 블록 바로 위 주석 원문:

> *"One common misinterpretation is that you can read these weight ratios as count equivalences, e.g. the incorrect statement that "one report cancels 468 likes" -- this is incorrect because the weights apply to the predicted **probabilities** rather than raw counts. And the baseline probability of a Report is more than 1000x lower than a Like, so it's weighted more to allow the prediction to affect the final ranking at all."*

**해석:** 234 ÷ 0.5 = 468 이라는 산술은 맞지만, 두 값은 서로 다른 스케일의 확률에 곱해집니다. 신고의 기저 발생확률이 좋아요보다 1000배 이상 낮기 때문에, 계수를 키우지 않으면 랭킹에 **아예 반영조차 안 됩니다**. 큰 계수는 "파괴력"이 아니라 **스케일 정규화**입니다.

xAI가 이 오해를 예상하고 코드에 미리 못 박아 둔 것으로 보입니다.

### 오해 ② "체류 시간 가중치는 0, 꺼져 있다"

**절반만 맞습니다.**

- `DwellWeight = 0.0` → 이진 체류 플래그**만** 꺼짐
- `ContDwellTimeWeight = 0.004` → **연속 체류시간은 켜져 있음**
- `NotDwelledWeight = −0.02` → **체류하지 않으면 감점**

즉 dwell 신호는 제거된 게 아니라 "이진 판정 → 연속값 가점 + 미체류 감점" 형태로 **재설계**된 것입니다. 좋아요(0.5)에 비하면 작지만 0이 아니며, 미체류 감점(−0.02)이 연속 가점(0.004)의 5배라는 점이 오히려 시사적입니다.

---

## 5. 요약 시사점

1. **공유 > 대화 > 팔로우 > 리트윗 > 좋아요** 순의 명확한 위계. 좋아요는 최하위권 양수 신호.
2. **링크 복사 공유(20.0)가 최고 양수** — 플랫폼 외부로 나가는 공유를 가장 높게 평가.
3. **상호팔로우 관계의 답글은 링크 복사와 동급(20.0)** — 관계 기반 대화에 강한 가중.
4. **부정 신호가 압도적** — 최고 양수(20.0) 대비 신고는 계수상 11.7배. 단, 4장 ① 참조하여 확률 스케일 차이를 반드시 함께 읽을 것.
5. **콜드스타트 절벽** — 팔로우 5개 미만이면 외부 글 계수가 0.00001. 신규 계정은 사실상 팔로우를 채우기 전까지 피드가 형성되지 않음.
6. **48시간 수명 + 50→35 필터** — 콘텐츠 회전이 매우 빠르고, 후보 30%가 노출 직전 탈락.

---

## 6. 재현 방법

```bash
git clone --depth 1 https://github.com/xai-org/x-algorithm.git
cd x-algorithm
grep -n "Weight" home-mixer/params/param.rs
cat home-mixer/params/config.rs
```

---

## 참고 자료

- [xai-org/x-algorithm (GitHub)](https://github.com/xai-org/x-algorithm) — 1차 출처
- [TechCrunch: X open sources its ranking algorithm](https://techcrunch.com/2026/08/13/x-open-sources-its-ranking-algorithm-letting-users-see-if-theyve-been-shadowbanned/)
- [explainx.ai: X Discloses Ranking Weights](https://explainx.ai/blog/x-algorithm-for-you-timeline-open-source-ranking-weights-august-2026)

> ⚠️ 2차 매체 기사들은 수치가 서로 엇갈립니다(2023년 구버전 가중치를 현행으로 소개하는 경우 다수). **반드시 저장소 원문을 기준으로 삼을 것.**
