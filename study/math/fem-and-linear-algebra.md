# FEM의 수학 — 미분방정식이 결국 Ax=b가 되는 이유

> 출발점: 영상 [An Intuitive Introduction to Finite Element Analysis (FEA), Part 1](https://www.youtube.com/watch?v=lH1vgdJwlDQ) + 현업 시뮬레이션 엔지니어와의 대화("FEM·FVM이 지배적이고, **행렬 풀이가 보통 속도를 좌우한다**").
> 이 노트의 목표: 그 대화를 **알아듣는 수학** — 물리 문제가 어떻게 연립일차방정식이 되고, 왜 마지막의 '행렬 풀이'가 전체 속도를 결정하는지.

---

## 0. 왜 만들어졌나 — 비행기가 낳은 수학

- **1943 · Courant** — 막대의 비틀림 문제를 풀며 영역을 **삼각형 조각**으로 쪼개 근사하는 아이디어를 처음 제시. 그러나 결과가 **당시엔 풀 수 없는 크기의 연립방정식**이라 묻혔다.
- **1956 · Turner & Clough (보잉)** — 복잡한 **항공기 구조**의 강성·처짐 해석에 같은 아이디어를 적용. 델타 날개는 기존 보(beam) 이론으로 계산이 안 됐고, 컴퓨터가 등장하면서 "큰 연립방정식"이 드디어 풀 수 있는 물건이 됐다.
- **1960 · Clough** — 논문 "The Finite Element Method in Plane Stress Analysis"에서 **Finite Element(유한 요소)**라는 이름을 확정.

> 탄생 서사 한 줄: **수학(1943)은 먼저 있었고, 컴퓨터(1950s)가 그것을 쓸 수 있게 만들었다.** 그래서 FEM의 병목은 처음부터 지금까지 "행렬을 얼마나 빨리 푸느냐"다 — 현업 대화의 "행렬 풀이가 속도를 좌우한다"는 60년 된 사실의 재확인이다.

---

## 1. 한 줄 본질 — 무한을 유한으로

물리 법칙은 미분방정식이다: "**모든 점**에서 이 관계가 성립한다" (열전도, 응력, 전자기…). 문제는 '모든 점' — 연속체는 **자유도가 무한**이라 컴퓨터로 직접 못 다룬다.

FEM의 답:

1. 영역을 **유한 개의 조각(element)**으로 쪼갠다 → 메시(mesh)
2. 각 조각 안에서는 해가 **단순한 함수**(1차·2차 다항식 = shape function)라고 가정한다
3. 그러면 미지수는 "모든 점의 값"이 아니라 **꼭짓점(node) 값 몇 개**로 줄어든다
4. 물리 법칙을 "각 조각에서 평균적으로(적분으로) 만족하라"로 완화한다 → **약형식(weak form)**
5. 그 결과가 연립일차방정식:

$$K\,u = f$$

$K$ = 강성 행렬(stiffness matrix, 재료·기하가 만드는 관계), $u$ = 노드 값(변위·온도·전위), $f$ = 외력·소스.

**Java 개발자 번역**: 연속 함수를 그대로 다루는 건 무한 케이스 분기와 같다. FEM은 이를 **"작은 클래스(element) + 고정된 인터페이스(shape function)"로 분해**하고, 전역 행렬은 각 element가 기여분을 **`K.merge(i, j, value, Double::sum)`** 하듯 합산해 만든다 — 실제로 이 단계 이름이 **assembly(조립)**다. 코테에서 쓴 `Map.merge` 집계 패턴과 구조가 같다.

---

## 2. 파이프라인 — 영상(Part 1)이 다루는 직관의 위치

```
① 메시 생성 ──▶ ② 형상함수 가정 ──▶ ③ 약형식(적분) ──▶ ④ 조립(K, f) ──▶ ⑤ 행렬 풀이 (Ku=f)
   기하 쪼개기      요소 안은 단순하게     미분을 적분으로        희소 행렬 완성      ★속도의 지배 항
```

- **② 형상함수** — 요소 안의 값은 노드 값의 **보간(interpolation)**: $u(x) = \sum N_i(x)\,u_i$. $N_i$는 "노드 $i$에서 1, 다른 노드에서 0"인 단순 함수. 영상의 핵심 직관이 여기다: **복잡한 곡면 = 단순 조각의 이어붙임.**
- **③ 약형식** — 원래 식(강형식)은 2차 미분을 요구하지만, 시험 함수를 곱해 **적분**하고 부분적분하면 미분 차수가 내려간다. 1차 다항식 요소로도 2차 미분 방정식을 풀 수 있게 되는 트릭 — "요구 조건을 완화해서(평균으로 만족) 표현력을 얻는" 트레이드오프.
- **④ 조립** — 각 요소는 자기 노드끼리만 관계를 만든다 → $K$는 대부분 0인 **희소(sparse) 행렬**. 노드 100만 개면 $K$는 100만×100만이지만, 실제 저장은 행마다 이웃 몇 개뿐.
- **⑤ 풀이** — 아래 3장. 여기가 대화에서 말한 "속도를 좌우"하는 지점.

---

## 3. 현업 대화 해독 — 행렬 풀이가 속도를 좌우한다

### 3.1 FEM vs FVM — 왜 둘 다 지배적인가

| | FEM (유한 요소) | FVM (유한 체적) |
|---|---|---|
| 적분 방식 | 요소 **부피** 적분 (약형식) | 셀 **표면** 플럭스 적분 |
| 보존성 | 전역적으론 만족, 셀 단위 엄밀 보존은 아님 | **셀마다 엄밀 보존** (들어온 만큼 나간다) |
| 강점 | 응력·변형률 같은 **기울기 정확도**, 타원형 방정식(평형 문제) | 질량·운동량·에너지 **보존법칙** 그 자체인 유동 문제 |
| 주 무대 | 구조해석 (ANSYS Mechanical, COMSOL) | CFD (Fluent, OpenFOAM) |

> 유체의 지배방정식이 곧 보존법칙이라 CFD는 FVM이 자연스럽고, 평형·기울기가 본체인 구조·전자기는 FEM이 자연스럽다. **"둘 다 지배적"인 이유 = 도메인이 다르기 때문.** 그리고 둘 다 마지막엔 같은 곳에 도착한다: 큰 희소 연립방정식.

### 3.2 솔버 두 갈래 — 직접법 vs 반복법

| | 직접법 (Direct) | 반복법 (Iterative) |
|---|---|---|
| 대표 | **MUMPS, PARDISO, UMFPACK** (LU/Cholesky 분해) | **CG**(대칭 양정치), **GMRES/BiCGSTAB**(비대칭) |
| 성격 | 한 번 분해하면 답 확정. **강건**하고 예측 가능 | 근사 해를 반복 개선. 메모리 적고 대규모에 유리 |
| 약점 | 분해 중 fill-in으로 **메모리 폭발** (3D 대형에서 한계) | 조건수 나쁘면 **수렴이 한없이 느림** |
| 처방 | — | **전처리기(preconditioner)**: ILU, 그리고 확산 지배·대규모면 **AMG(대수적 멀티그리드)** |

- **멀티그리드 직관**: 오차의 저주파(넓게 퍼진) 성분은 촘촘한 격자에서 잘 안 죽는다 → **거친 격자에서 잡고 내려온다.** 잘 맞는 문제에선 미지수 개수에 비례하는 O(n) 급 — 반복법이 대규모의 기본이 되는 이유.
- 대화의 **"도메인 density에 따라 완전 딴 소리일 수도"** — 행렬의 희소 패턴·조건수는 문제(격자 밀도, 재료 대비, 물리 종류)에 따라 완전히 달라서, 어떤 문제에선 직접법이, 어떤 문제에선 AMG-전처리 반복법이 정답이 된다. **만능 솔버는 없다** — COMSOL 매뉴얼조차 "문제 보고 골라라"가 공식 가이드다.

**백엔드 번역**: 직접법 = **배치 전체 정렬**(비싸지만 결정적), 반복법 = **캐시를 얹은 조회**(평소 빠른데 히트율(=전처리 품질)이 나쁘면 오히려 느림). "행렬 풀이가 속도를 좌우"는 우리 세계의 "결국 DB가 병목"과 같은 문장이다 — 앞 단계(메시·조립)는 선형으로 끝나는데 풀이만 초선형으로 자란다.

---

## 4. 3단 요약 (암기)

- **① 결론 · WHAT** — FEM은 "무한 자유도의 미분방정식"을 "유한 개 노드의 연립일차방정식 $Ku=f$"로 바꾸는 방법이다. 조각(element) 안은 단순 함수로 가정하고, 법칙은 적분(약형식)으로 완화해서 만족시킨다.
- **② 원리 · HOW** — 메시 → 형상함수 보간 → 약형식 → 조립(희소 행렬) → 풀이. 각 요소가 이웃 노드끼리만 관계를 만들므로 $K$는 희소하고, 조립은 `Map.merge` 합산과 같은 구조다.
- **③ 확장 · TRADE-OFF** — 속도는 마지막 '행렬 풀이'가 지배한다. 직접법(MUMPS·PARDISO)은 강건하지만 메모리가, 반복법(CG·GMRES+AMG)은 확장성이 좋지만 조건수가 발목을 잡는다. FEM/FVM 선택도, 솔버 선택도 도메인(보존이 본체인가, 기울기가 본체인가, 행렬이 얼마나 못됐나)이 결정한다 — 만능은 없다.

## 용어 사전 (영 ↔ 한)

| 용어 | 뜻 |
|---|---|
| mesh / element / node | 격자 / 요소(조각) / 절점(꼭짓점 미지수) |
| shape function | 형상함수 — 요소 안 보간 함수 ("내 노드에서 1, 남의 노드에서 0") |
| weak form | 약형식 — 미분 조건을 적분(평균)으로 완화한 식 |
| stiffness matrix $K$ | 강성 행렬 — 재료·기하가 만드는 노드 간 관계 |
| assembly | 조립 — 요소별 기여를 전역 행렬로 합산 |
| sparse matrix | 희소 행렬 — 대부분 0, 이웃 관계만 저장 |
| direct / iterative solver | 직접법(분해) / 반복법(수렴) |
| preconditioner / AMG | 전처리기 / 대수적 멀티그리드 — 반복법의 수렴 가속 장치 |
| conservation (FVM) | 보존성 — 셀 경계 플럭스로 들어온 만큼 나가게 강제 |

---

## 출처

- 영상: [An Intuitive Introduction to FEA, Part 1](https://www.youtube.com/watch?v=lH1vgdJwlDQ)
- 역사: [Eighty Years of the Finite Element Method (arXiv)](https://arxiv.org/pdf/2107.04960) · [75 Years of FEM (SimScale)](https://www.simscale.com/blog/75-years-of-the-finite-element-method-fem/) · [CADFEM — FEM history](https://www.cadfem.net/en/cadfem-informs/media-center/cadfem-journal/fem-history.html)
- FEM vs FVM: [COMSOL Blog — FEM vs FVM](https://www.comsol.com/blogs/fem-vs-fvm) · [Nature Architects — FEM and FVM in CFD](https://nature-architects.com/en/blog/2260/)
- 솔버: [COMSOL — Choosing the Right Linear System Solver](https://doc.comsol.com/5.5/doc/com.comsol.help.comsol/comsol_ref_solver.27.118.html) · [Sparse Linear Solvers Survey (arXiv 2025)](https://arxiv.org/html/2504.11716) · [AMG preconditioning for 3-D FEM (Oxford GJI)](https://academic.oup.com/gji/article/197/3/1442/655984)

## 연결

- 수치의 바닥: [부동소수 (IEEE 754)](../cs/deep-floating-point.md) — 행렬 풀이의 오차가 사는 곳
- 같은 사고: [성능 공학](../cs/deep-performance-engineering.md) — "병목이 어디인가"를 먼저 묻는 습관
- 보간·기울기의 그래픽스판: [렌더링 수학](../graphics/deep-rendering-math.md)
