# 학습 로드맵 — 개념 중심 (ML · 그래픽스)

> **원칙**: 공부의 본체는 **개념·수학**, 언어는 **실습 도구**. (→ Java 문법 떼듯 하지 않는다)
> **관련 노트**: [ai-ml/](ai-ml/) · [graphics/](graphics/) · [graphics-vs-ml.md](graphics-vs-ml.md) · [lang/java/concept.md](lang/java/concept.md)

---

## 전체 그림

```
0단계 ─ 공통 뿌리 (선형대수)  ← ML·그래픽스 둘 다의 "어원"
              │
     ┌────────┴────────┐
     ▼                 ▼
 [트랙 A] ML        [트랙 B] 그래픽스
 언어: Python       경로: 브라우저 → C++
     └────────┬────────┘
              ▼
        융합 (NeRF·디퓨전·DLSS)
```

---

## 0단계 · 공통 뿌리: 선형대수 (며칠~2주)

ML도 그래픽스도 결국 **행렬·벡터 연산**이다. 여기만 잡으면 어느 트랙이든 수월해진다.
- 벡터, 행렬 곱, 내적(dot product), 기저·변환의 직관.
- **추천**: 3Blue1Brown, *Essence of Linear Algebra* (영상, 직관 최고) — https://www.3blue1brown.com/topics/linear-algebra
- **핵심 감각**: "행렬 곱 = 좌표(또는 특징)를 변환한다" 한 문장.

---

## 트랙 A · 머신러닝 (언어: Python 확정)

**개념 순서** (→ [ai-ml/concept.md](ai-ml/concept.md) 그대로)
1. 머신러닝이란 · 학습의 종류 → 2. 훈련·손실·경사하강 → 3. 과적합
4. 뉴런·신경망·순전파 → 5. 역전파 → 6. 어텐션 → 7. 트랜스포머 → 8. LLM

**도구**
| 용도 | 도구 |
|------|------|
| 언어 | **Python** |
| 라이브러리 | PyTorch(추천) 또는 TensorFlow, NumPy |
| 실습 환경 | **Google Colab**(설치 0, 무료 GPU) 또는 로컬 Jupyter |
| IDE | VS Code / PyCharm(JetBrains, IntelliJ 계열) |

> 언어는 "떼는" 게 아니라 개념 실험할 만큼만. Java 하셨으면 Python은 며칠이면 손에 익음.

---

## 트랙 B · 그래픽스 (경로: 브라우저 → C++)

### B-1. 브라우저로 개념 손맛보기 (설치 0)
- **도구**: **Shadertoy**(브라우저에서 프래그먼트 셰이더 즉시), The Book of Shaders.
- 배우는 것: 픽셀 셰이더, 색·좌표·시간으로 그림 그리기 → 셰이더 감각.
- 자료: The Book of Shaders — https://thebookofshaders.com/

### B-2. C++/OpenGL로 파이프라인 제대로
- **언어**: C++ + OpenGL, 셰이더는 GLSL.
- **IDE(IntelliJ 자리)**: **Visual Studio**(Windows 대표) 또는 **CLion**(JetBrains, 익숙한 조작).
- **디버깅 툴**: **RenderDoc**(프레임 뜯어보기, 무료).
- **개념 순서** (→ [graphics/concept.md](graphics/concept.md) 그대로)
  1. 3D 장면·정점·메시 → 2. 변환행렬(MVP) → 3. 파이프라인
  4. 정점셰이더 → 5. 래스터화 → 6. 프래그먼트·깊이버퍼
  7. 조명(Phong) → 8. 텍스처 → 9. PBR → 10. 레이트레이싱
- 자료: LearnOpenGL — https://learnopengl.com/ · Scratchapixel — https://www.scratchapixel.com/

**그래픽스 도구 요약표**
| 용도 | 도구 |
|------|------|
| 즉시 실험 | **Shadertoy** (브라우저) |
| 언어/API | C++ + OpenGL, GLSL |
| IDE | **Visual Studio** 또는 CLion |
| 디버깅 | **RenderDoc** |

---

## 융합 단계 (나중에)
두 트랙이 익으면 합류: NeRF·가우시안 스플래팅, 디퓨전 모델, DLSS·AI 디노이징, 미분 가능 렌더링.
→ [graphics-vs-ml.md](graphics-vs-ml.md) 참고.

---

## 별첨 · 언어를 "개념"으로 이해하기
언어는 도구지만, 언어가 **추구하는 설계 철학**을 알면 도구를 더 잘 쓴다.
- [lang/java/concept.md](lang/java/concept.md) — Java의 OOP·상속을 개념·어원·철학으로 정리 (이미 아는 Java를 깊이 이해).

## 추천 진행 순서 (한 줄)
> **0단계 선형대수 → (관심 따라) ML은 Python으로 / 그래픽스는 Shadertoy→C++로 → 융합.** 언어는 그때그때 필요한 만큼만.

_작성: 2026-07 · 자료 링크는 접속 시점에 따라 변동될 수 있음._
