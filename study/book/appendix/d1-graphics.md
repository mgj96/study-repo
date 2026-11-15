# 부록 D 그래픽스와 Unity · D.1 컴퓨터 그래픽스

> 부록

## 들어가며

렌더링에서 파이프라인, 레이트레이싱까지의 개념 노트와, 자바 개발자가 아는 것으로 그래픽스를 이해하는 법이다.

---

## 컴퓨터 그래픽스 (렌더링): 상세 학습 노트

> **용도**: NotebookLM 소스로 업로드해 요약·퀴즈·타임라인·개념정리에 활용.
> **읽는 순서**: 위에서 아래로 (개념이 계단식으로 쌓이도록 배치).
> **표기**: 한국어 설명 + (영어 용어). 각 단원 끝에 `참조` 링크. 문서 맨 끝에 전체 출처.
> **연결**: AI 학습 노트(`../ai-ml/concept.md`)와 GPU를 공유한다 — 12단원 참고.
> **주의**: 개념 이해용 요약. 정확한 수식·구현은 참조 원문 확인.

---

### 0. 큰 그림 — 3D 세계를 어떻게 "찍어" 화면에 담나

게임을 켜면 눈앞에 3D 세계가 펼쳐진다. 하지만 모니터는 결국 **납작한 픽셀 격자**일 뿐이다. 그러니 어딘가에서 누군가는 매 순간 "이 3차원 세계를, 지금 카메라 각도에서, 각 픽셀에 무슨 색으로 찍을지"를 **초당 수십 번** 계산하고 있어야 한다. 이 계산이 바로 **렌더링(rendering)** — 3D 장면(점·면·재질·빛·카메라)을 2D 픽셀 색으로 바꾸는 일이다. 사진사가 3D 세상을 필름 한 장에 담는 것과 본질이 같다.

이 "찍기"에는 오래된 두 철학이 있다. **래스터화(rasterization)**는 실용주의자다 — 물체를 이루는 삼각형들을 화면에 **빠르게 칠해** 치우고, 그림자·반사 같은 건 영리한 트릭으로 흉내 낸다. 속도가 생명인 **게임·실시간**의 방식이다. 반대로 **레이트레이싱(ray tracing)**은 이상주의자다 — 픽셀마다 **빛의 경로를 실제로 추적**해, 반사·굴절·그림자를 물리 그대로 계산한다. 느리지만 사실적이라 **영화·고품질**이 택한다. (요즘은 둘을 섞는다.)

두 방식 모두 픽셀·정점이 수백만 개라 **똑같은 계산을 대량으로 병렬** 수행해야 한다. 그래서 등장한 전용 하드웨어가 **GPU**다. 그리고 바로 이 "행렬을 대량으로 곱하는" 병렬성이 신경망 학습과 판박이라, 그래픽스용으로 태어난 GPU가 오늘날 **AI 붐**까지 떠받치게 됐다.

```mermaid
flowchart LR
  S["3D 장면<br/>점·면·재질·빛"] --> POS["① 어디에 찍힐지<br/>좌표 변환 (MVP)"]
  POS --> COL{"② 무슨 색일지"}
  COL -->|"빠르게 칠하기"| R["래스터화<br/>게임·실시간"]
  COL -->|"빛 경로 추적"| RT["레이트레이싱<br/>영화·고품질"]
  R --> PX["화면 픽셀"]
  RT --> PX
```

*(도식 설명: 3D 장면이 ① 좌표 변환(MVP)으로 '어디에 찍힐지'를 정한 뒤 ② 래스터화(빠르게 칠하기) 또는 레이트레이싱(빛 경로 추적)으로 '무슨 색일지'를 계산해 화면 픽셀이 된다.)*

**학습 지도**

| 부 | 단원 | 한 줄 |
|----|------|-------|
| 1부 | 1. 렌더링이란 | 3D → 2D 픽셀로 변환 |
| 1부 | 2. 3D 장면의 구성 | 정점·메시·좌표계 |
| 1부 | 3. 변환 행렬 | 모델·뷰·투영(MVP) |
| 2부 | 4. 그래픽스 파이프라인 | 정점→래스터→픽셀 흐름 |
| 2부 | 5. 정점 셰이더 | 위치를 화면 좌표로 |
| 2부 | 6. 래스터화 | 삼각형을 픽셀로 채움 |
| 2부 | 7. 프래그먼트·깊이버퍼 | 픽셀 색과 가림 처리 |
| 2부 | 8. 셰이더와 GPU | 병렬 프로그램 |
| 3부 | 9. 조명 모델 | 확산·반사·앰비언트 |
| 3부 | 10. 텍스처 매핑 | 표면에 이미지 입히기 |
| 3부 | 11. 물리 기반 렌더링(PBR) | 실제 빛 물리 흉내 |
| 4부 | 12. 레이트레이싱 | 빛의 경로 추적 |
| 4부 | 13. 실시간 레이트레이싱 | RTX와 하이브리드 |

---

## 1부. 기초 개념

### 1. 컴퓨터 그래픽스와 렌더링이란

**컴퓨터 그래픽스(computer graphics)**: 컴퓨터로 이미지를 생성·조작하는 분야.
**렌더링(rendering)**: 3D 장면 데이터(형태·재질·조명·카메라)를 입력받아 2D 이미지(픽셀 색 배열)를 만들어내는 과정.

**두 갈래**
- **실시간 렌더링(real-time)**: 초당 30~120장 이상을 즉시 생성. 게임·VR. 주로 래스터화.
- **오프라인 렌더링(offline)**: 한 장에 몇 초~몇 시간. 영화·CG. 주로 레이/패스 트레이싱. 품질 우선.

**핵심 요약**: 렌더링 = 3D 장면을 2D 픽셀 이미지로 바꾸는 계산. 속도 우선(실시간) vs 품질 우선(오프라인).

`참조`: [Scratchapixel – Rendering 입문](https://www.scratchapixel.com/) · [위키백과: 렌더링](https://ko.wikipedia.org/wiki/렌더링)

### 2. 3D 장면의 구성 요소

- **정점(vertex)**: 3D 공간의 한 점 (x, y, z). 색·법선·텍스처 좌표 등 추가 속성을 가짐.
- **삼각형(polygon/triangle)**: 정점 3개로 이루는 면. GPU가 다루는 기본 단위(면을 삼각형으로 쪼갬).
- **메시(mesh)**: 삼각형이 모여 이룬 하나의 3D 물체 표면.
- **법선(normal)**: 면이 향하는 방향 벡터. 조명 계산의 핵심.
- **좌표계(coordinate space)**: 로컬(물체 기준) → 월드(장면 기준) → 뷰(카메라 기준) → 클립/스크린(화면).

> 왜 삼각형? 세 점은 항상 한 평면을 이루고(평면성 보장), 볼록해서 래스터화·보간이 간단하다.

**핵심 요약**: 3D 물체 = 정점으로 만든 삼각형 메시. 각 정점은 위치+법선+텍스처좌표를 가진다.

`참조`: [LearnOpenGL – Hello Triangle](https://learnopengl.com/Getting-started/Hello-Triangle) · [Scratchapixel – Geometry](https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/)

### 3. 변환 행렬 (Model · View · Projection)

3D 물체를 화면에 놓으려면 좌표를 단계적으로 변환한다. 각 변환은 **4×4 행렬**로 표현하고, 곱해서 합친다.

1. **모델 행렬(Model)**: 물체를 월드 공간에 배치(이동·회전·크기).
2. **뷰 행렬(View)**: 카메라 시점으로 세상을 옮김(카메라가 원점을 보도록).
3. **투영 행렬(Projection)**: 3D를 2D 화면으로 눌러 담음.
   - *원근 투영(perspective)*: 멀수록 작게 (사람 눈처럼).
   - *직교 투영(orthographic)*: 거리와 무관하게 크기 유지 (설계도·2D).

```
화면 좌표 = Projection × View × Model × 정점좌표   (MVP)
```

> 3D 좌표에 w를 붙인 **동차좌표(homogeneous coordinates)**를 쓰면 이동·회전·투영을 모두 행렬 곱 하나로 통일할 수 있다.

**핵심 요약**: 정점은 Model→View→Projection 행렬을 거쳐 화면 좌표가 된다(MVP).

`참조`: [LearnOpenGL – Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems) · [Scratchapixel – Transforms](https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/row-major-vs-column-major-vector.html)

---

## 2부. 래스터화 파이프라인 (실시간 렌더링)

### 4. 그래픽스 파이프라인 개요

**그래픽스 파이프라인(graphics pipeline)**: 정점 데이터가 여러 단계를 거쳐 최종 픽셀이 되는 고정된 흐름. GPU가 이 단계들을 대량 병렬로 처리한다.

```mermaid
flowchart TB
  V["정점 데이터"] --> VS["정점 셰이더<br/>화면 좌표로 변환<br/>(프로그래머블)"]
  VS --> ASM["도형 조립<br/>정점 → 삼각형"]
  ASM --> RAS["래스터화<br/>삼각형 → 픽셀(프래그먼트)<br/>(고정)"]
  RAS --> FS["프래그먼트 셰이더<br/>픽셀 색 계산<br/>(프로그래머블)"]
  FS --> TB["테스트·블렌딩<br/>깊이 / 투명도"]
  TB --> OUT["화면 (프레임버퍼)"]
```

*(도식 설명: 정점 데이터가 위에서 아래로 흐르며 — 정점 셰이더로 화면 좌표 변환 → 삼각형 조립 → 래스터화로 픽셀 생성 → 프래그먼트 셰이더로 색 계산 → 깊이·투명도 처리 → 최종 화면 순으로 이어진다. 이 중 셰이더 단계는 개발자가 바꾸고, 래스터화 등은 GPU가 고정 처리한다.)*

- **프로그래머블 단계**: 정점·프래그먼트 셰이더 등 — 개발자가 코드(셰이더)로 바꿀 수 있음.
- **고정 단계**: 래스터화·깊이 테스트 등 — GPU 하드웨어가 정해진 방식으로 처리.

**핵심 요약**: 파이프라인 = 정점 셰이더 → 래스터화 → 프래그먼트 셰이더 → 출력. 일부는 프로그래머블, 일부는 고정.

`참조`: [Khronos – Rendering Pipeline Overview](https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview) · [LearnOpenGL – Hello Triangle](https://learnopengl.com/Getting-started/Hello-Triangle) · [Fabian Giesen – A Trip Through the Graphics Pipeline](https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/)

### 5. 정점 셰이더 (Vertex Shader)

각 정점마다 한 번씩 실행되는 작은 프로그램. 주 역할은 **MVP 변환**으로 정점의 최종 화면 위치를 계산하는 것. 그 외에 조명용 값, 텍스처 좌표 등을 다음 단계로 넘긴다.

- 입력: 정점 하나의 속성(위치·법선·색·UV).
- 출력: 클립 공간 좌표 + 프래그먼트 셰이더로 전달할 값들.
- 정점끼리 독립적이라 GPU가 수천 개를 동시에 처리한다.

**핵심 요약**: 정점 셰이더 = 정점 위치를 화면 좌표로 바꾸는 병렬 프로그램.

`참조`: [LearnOpenGL – Shaders](https://learnopengl.com/Getting-started/Shaders) · [WebGL Fundamentals](https://webglfundamentals.org/)

### 6. 래스터화 (Rasterization)

**래스터화**: 삼각형이 화면에서 덮는 픽셀들을 찾아내는 과정. 각 픽셀 후보를 **프래그먼트(fragment)**라 한다.

- 삼각형 내부에 들어오는 픽셀을 판정하고, 정점의 값(색·깊이·UV)을 내부 픽셀들에 **보간(interpolation)**한다.
- "벡터(도형) → 래스터(픽셀 격자)"로 바꾼다고 해서 래스터화.
- 매우 빠르다: 삼각형 하나를 픽셀로 채우는 건 단순·병렬 작업.

**핵심 요약**: 래스터화 = 삼각형을 덮는 픽셀(프래그먼트)들을 찾고 정점 값을 보간하는 고정 단계.

`참조`: [Scratchapixel – Rasterization](https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/) · [위키백과: 래스터화](https://ko.wikipedia.org/wiki/래스터화)

### 7. 프래그먼트 셰이딩과 깊이 버퍼

**프래그먼트 셰이더(fragment/pixel shader)**: 각 프래그먼트(픽셀 후보)마다 실행되어 **최종 색**을 계산. 조명·텍스처·그림자 등 대부분의 "보이는 품질"이 여기서 결정된다.

**가림 처리 – 깊이 버퍼(Z-buffer)**: 여러 삼각형이 같은 픽셀을 덮을 때, 각 픽셀의 깊이(카메라와의 거리)를 저장해 **더 가까운 것만** 남긴다. 덕분에 앞 물체가 뒤 물체를 자연스럽게 가린다.

- **블렌딩(blending)**: 반투명 물체는 뒤 색과 섞어 처리.
- **안티에일리어싱(anti-aliasing)**: 계단현상(삐죽삐죽한 가장자리)을 부드럽게(MSAA 등).

**핵심 요약**: 프래그먼트 셰이더가 픽셀 색을 정하고, 깊이 버퍼가 앞뒤 가림을 처리한다.

`참조`: [LearnOpenGL – Depth Testing](https://learnopengl.com/Advanced-OpenGL/Depth-testing) · [Scratchapixel – Rasterization Stage](https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/rasterization-stage.html)

### 8. 셰이더와 GPU

**셰이더(shader)**: 파이프라인의 프로그래머블 단계에서 도는 작은 프로그램. GLSL/HLSL 같은 언어로 작성.
**GPU(그래픽 처리 장치)**: 단순 계산 코어 수천 개로 **같은 연산을 대량 데이터에 동시에**(SIMD/병렬) 수행. 픽셀·정점이 수백만 개라도 병렬로 처리.

> **AI와의 연결**: 신경망 학습도 거대한 행렬 곱의 병렬 연산이라 GPU가 최적이다. 그래픽스용으로 발전한 GPU가 딥러닝 붐을 이끈 이유. (→ AI 노트 5~7단원과 연결)

**핵심 요약**: 셰이더 = GPU에서 도는 병렬 프로그램. GPU의 대량 병렬성이 그래픽스와 AI 모두를 떠받친다.

`참조`: [The Book of Shaders](https://thebookofshaders.com/) · [LearnOpenGL – Shaders](https://learnopengl.com/Getting-started/Shaders)

---

## 3부. 조명과 셰이딩

### 9. 조명 모델 (Lighting / Shading)

빛이 표면에 닿아 보이는 밝기를 근사하는 계산. 고전 **퐁 반사 모델(Phong)**은 세 성분의 합:

1. **앰비언트(ambient)**: 사방에서 오는 은은한 기본 밝기(간접광 근사).
2. **디퓨즈(diffuse, 확산)**: 표면이 빛을 사방으로 퍼뜨림. 빛 방향과 법선의 각도로 결정(정면일수록 밝음).
3. **스페큘러(specular, 반사)**: 매끈한 표면의 하이라이트(반짝임). 시선·반사 방향이 일치할수록 강함.

```mermaid
flowchart LR
  AM["앰비언트<br/>사방의 기본 밝기"] --> SUM["최종 밝기"]
  DF["디퓨즈<br/>법선·빛 각도 (N·L)"] --> SUM
  SP["스페큘러<br/>시선·반사 일치 (R·V)ⁿ"] --> SUM
```

*(도식 설명: 한 점의 밝기는 세 가지를 더한 값이다 — 어디서나 깔리는 은은한 앰비언트 + 빛을 마주한 각도에 따라 변하는 디퓨즈 + 매끈한 표면에서 반짝이는 스페큘러.)*

직관적으로, **무광 벽**은 디퓨즈만 도드라져 반짝임이 없고, **광택 나는 금속**은 스페큘러가 강해 하이라이트가 또렷하다. 이 세 성분의 비율을 조절해 "이 표면이 무슨 재질처럼 보이는가"를 만든다.

- 계산 위치에 따라: **플랫**(면 단위), **고러드(Gouraud)**(정점 단위 후 보간), **퐁 셰이딩**(픽셀 단위, 부드러움).

**핵심 요약**: 밝기 ≈ 앰비언트 + 디퓨즈(각도) + 스페큘러(반짝임). 법선과 빛/시선 방향으로 계산.

`참조`: [LearnOpenGL – Basic Lighting](https://learnopengl.com/Lighting/Basic-Lighting) · [위키백과: 퐁 반사 모델](https://ko.wikipedia.org/wiki/퐁_반사_모델)

### 10. 텍스처 매핑 (Texture Mapping)

3D 표면에 2D 이미지(텍스처)를 입혀 디테일을 준다. 각 정점의 **UV 좌표**(텍스처 상의 위치)를 지정하면, 래스터화가 픽셀마다 보간해 알맞은 텍스처 색을 가져온다.

- **밉맵(mipmap)**: 멀리 있는 텍스처용으로 미리 축소한 버전들. 반짝임(에일리어싱) 방지·속도 향상.
- 응용 텍스처: **노멀맵**(요철을 가짜로 표현), **러프니스/메탈릭 맵**(PBR 재질), **환경맵**(주변 반사).

**핵심 요약**: 텍스처 매핑 = UV 좌표로 표면에 이미지를 붙이기. 밉맵으로 원거리 품질·속도 확보.

`참조`: [LearnOpenGL – Textures](https://learnopengl.com/Getting-started/Textures) · [Scratchapixel – Texturing](https://www.scratchapixel.com/)

### 11. 물리 기반 렌더링 (PBR)

**PBR(Physically Based Rendering)**: 빛과 재질의 상호작용을 실제 물리 법칙에 가깝게 계산해, 어떤 조명에서도 일관되게 사실적인 결과를 내는 방식.

- **에너지 보존**: 반사된 빛이 들어온 빛보다 많을 수 없다.
- **재질 파라미터**: *알베도(기본색)*, *메탈릭(금속성)*, *러프니스(거칠기)*. 이 값으로 다양한 재질을 표현.
- **BRDF**: 표면이 빛을 어느 방향으로 얼마나 반사하는지 기술하는 함수.

> 실시간(게임)과 오프라인(영화) 모두 오늘날 PBR 재질 워크플로를 표준으로 쓴다.

**핵심 요약**: PBR = 빛의 물리를 흉내 내 어떤 조명에서도 사실적. 알베도·메탈릭·러프니스로 재질 표현.

`참조`: [LearnOpenGL – PBR Theory](https://learnopengl.com/PBR/Theory) · [Physically Based Rendering Book (무료)](https://pbr-book.org/)

---

## 4부. 레이트레이싱

### 12. 레이트레이싱 (Ray Tracing) 원리

**레이트레이싱**: 카메라(눈)에서 각 픽셀로 **광선(ray)**을 쏘아, 장면의 물체와 부딪히는 지점을 찾고, 그 지점에서 빛이 어떻게 오는지를 추적해 색을 계산한다. 빛의 물리를 직접 시뮬레이션하므로 사실적이다.

- **부딪힘(intersection)**: 광선과 삼각형·구 등의 교차점 계산.
- **그림자 광선**: 교차점에서 광원으로 광선을 쏴, 막히면 그림자.
- **반사·굴절 광선**: 거울·유리는 광선을 튕기거나 꺾어 재귀적으로 추적.
- **패스 트레이싱(path tracing)**: 광선을 여러 번 무작위로 튕겨 간접광까지 계산 → 매우 사실적(영화용).
- 단점: 광선이 매우 많아 **무겁다**. 그래서 오랫동안 오프라인 전용이었다.

**핵심 요약**: 레이트레이싱 = 픽셀마다 빛의 경로를 추적해 색 계산. 사실적이지만 무겁다.

`참조`: [Ray Tracing in One Weekend (Peter Shirley, 무료)](https://raytracing.github.io/) · [Scratchapixel – Ray Tracing](https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-ray-tracing/)

### 13. 실시간 레이트레이싱과 하이브리드 (RTX)

최근 GPU(예: NVIDIA RTX)는 광선-교차 계산을 가속하는 전용 하드웨어를 넣어 **실시간 레이트레이싱**을 가능케 했다. 다만 전부 레이트레이싱하면 여전히 무거워, 보통 **하이브리드**로 쓴다.

- **하이브리드 렌더링**: 기본 화면은 빠른 **래스터화**로 그리고, 반사·그림자·전역조명 등 어려운 부분만 **레이트레이싱**으로 보강.
- **가속 구조(BVH)**: 광선이 매번 모든 삼각형을 검사하지 않도록 공간을 트리로 나눠 빠르게 찾음.
- **디노이징(denoising)**: 광선을 적게 쏴 생긴 노이즈를 AI 등으로 깨끗하게 — 여기서도 AI가 그래픽스와 만난다.

**핵심 요약**: 실시간 RT = 래스터화(빠름) + 레이트레이싱(사실적)을 섞고, BVH·디노이징으로 가속.

`참조`: [Real-Time Rendering (책 포털·자료)](https://www.realtimerendering.com/) · [NVIDIA – Ray Tracing 소개](https://developer.nvidia.com/discover/ray-tracing)

---

### 래스터화 vs 레이트레이싱 한눈 비교

| 항목 | 래스터화 | 레이트레이싱 |
|------|----------|--------------|
| 방식 | 도형을 픽셀로 투영·채움 | 픽셀에서 빛 경로를 추적 |
| 속도 | 매우 빠름 | 무거움 |
| 사실성 | 조명은 근사(트릭 필요) | 반사·그림자·굴절이 자연스러움 |
| 주 용도 | 게임·실시간·VR | 영화·CG·고품질, 최근 실시간 보강 |
| 그림자·반사 | 별도 기법으로 흉내 | 물리적으로 자동 |

---

### 한 줄 용어 사전 (한↔영)

| 한국어 | English | 뜻 |
|--------|---------|-----|
| 렌더링 | rendering | 3D 장면을 2D 이미지로 변환 |
| 정점 | vertex | 3D 공간의 점(속성 포함) |
| 메시 | mesh | 삼각형이 모인 3D 표면 |
| 법선 | normal | 면이 향하는 방향 벡터 |
| MVP | model/view/projection | 좌표 변환 3단계 행렬 |
| 파이프라인 | graphics pipeline | 정점→픽셀 처리 흐름 |
| 셰이더 | shader | GPU에서 도는 병렬 프로그램 |
| 래스터화 | rasterization | 삼각형을 픽셀로 채우기 |
| 프래그먼트 | fragment | 픽셀 후보(색 계산 대상) |
| 깊이 버퍼 | z-buffer | 앞뒤 가림 처리용 거리 저장 |
| 보간 | interpolation | 정점 값을 픽셀에 나눠 채움 |
| 텍스처 | texture | 표면에 입히는 이미지 |
| UV 좌표 | UV coordinates | 텍스처 상의 위치 |
| 밉맵 | mipmap | 축소 텍스처 버전들 |
| 디퓨즈/스페큘러 | diffuse/specular | 확산광/반사 하이라이트 |
| PBR | physically based rendering | 물리 기반 렌더링 |
| 알베도 | albedo | 재질의 기본색 |
| 레이트레이싱 | ray tracing | 빛 경로 추적 렌더링 |
| 패스 트레이싱 | path tracing | 간접광까지 추적하는 방식 |
| BVH | bounding volume hierarchy | 광선 교차 가속 트리 |

---

### NotebookLM 활용 팁

- 시켜볼 만한 것:
  - "래스터화와 레이트레이싱을 비교 표로 정리하고 5문항 퀴즈 만들어줘"
  - "그래픽스 파이프라인 단계를 순서도처럼 설명해줘"
  - "MVP 변환을 중학생에게 설명하듯 다시 써줘"
  - "이 노트와 AI 노트에서 GPU가 공통으로 쓰이는 이유를 요약해줘"

#### NotebookLM에 소스로 직접 추가하면 좋은 링크 (복사용)

```
https://learnopengl.com/
https://www.scratchapixel.com/
https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview
https://thebookofshaders.com/
https://pbr-book.org/
https://raytracing.github.io/
https://www.realtimerendering.com/
https://webglfundamentals.org/
https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/
```

---

### 전체 참조 출처

**입문·전반**
- Scratchapixel — https://www.scratchapixel.com/
- LearnOpenGL (Joey de Vries) — https://learnopengl.com/
- WebGL Fundamentals — https://webglfundamentals.org/
- MIT OpenCourseWare 6.837 Computer Graphics — https://ocw.mit.edu/courses/6-837-computer-graphics-fall-2012/

**파이프라인·GPU**
- Khronos OpenGL Wiki – Rendering Pipeline Overview — https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview
- Fabian Giesen – A Trip Through the Graphics Pipeline — https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/
- The Book of Shaders — https://thebookofshaders.com/

**조명·PBR·레이트레이싱**
- Physically Based Rendering (Pharr, Jakob, Humphreys, 무료) — https://pbr-book.org/
- Ray Tracing in One Weekend (Peter Shirley) — https://raytracing.github.io/
- Real-Time Rendering (Akenine-Möller 외, 자료 포털) — https://www.realtimerendering.com/
- NVIDIA – Ray Tracing — https://developer.nvidia.com/discover/ray-tracing

_작성: 2026-07 · 개념 이해용 학습 노트 (정확한 수식·구현은 원문 확인). 링크는 접속 시점에 따라 변동될 수 있음._

---

## 자바 개발자를 위한 컴퓨터 그래픽스 — 아는 걸로 이해하기

> 관점: 그래픽스도 **아는 Java 개념의 재배치**로 볼 수 있다. 특히 **파이프라인 = Stream, 셰이더 = 람다, GPU = parallelStream 극한, 레이트레이싱 = 재귀**.
> 관련: [D.1 컴퓨터 그래픽스](d1-graphics.md) · [C.2 학습 경로와 신경망 종류](c2-curriculum-and-nn-types.md) · [C.1 큰 그림](c1-big-picture.md).

---

### 0. 한 장 요약 — 그래픽스 ↔ Java 대응표

| 그래픽스 개념 | Java로 치면 | 한 줄 |
|--------------|------------|-------|
| **정점(Vertex)·메시** | POJO + 리스트 | `class Vertex{float x,y,z;}`, mesh = `List<Vertex>` |
| **변환행렬 MVP** | **함수 합성/데코레이터** | model→view→proj = `f(g(h(x)))`, 행렬곱 = 합성 |
| **렌더링 파이프라인** | **Stream 파이프라인** | 정점 → 변환 → 래스터화 → 픽셀, 단계마다 `.map()` |
| **정점/프래그먼트 셰이더** | **파이프라인에 꽂는 람다(콜백)** | 각 원소에 적용하는 `Function` |
| **GPU 병렬** | **`parallelStream()`의 극한(SIMD)** | 같은 함수를 수백만 개에 동시에 |
| **셰이더 uniform** | **`final` 상수 필드(config)** | 모든 호출에 공통 값 |
| **정점 attribute** | **메서드 파라미터** | 원소마다 다른 입력 |
| **깊이 버퍼(z-buffer)** | **`float[][]` + "더 가까우면 덮어쓰기"** | 픽셀별 최소 z 유지(reduce/min) |
| **텍스처** | **룩업 테이블·`BufferedImage` 인덱싱** | `texture[u][v]` 샘플 |
| **레이트레이싱** | **재귀(recursion)** | 광선이 맞으면 반사·굴절 광선 재귀 호출, 깊이 제한 = base case |
| **draw call** | **GPU에 메서드 호출** | 그려라 명령 1건 |
| **GLSL** | **JVM 밖 별도 미니 언어(DSL)** | GPU에서 컴파일·실행 |
| **조명(Phong)** | **순수 함수** | normal·light·view로 색 계산 |

---

### 1. 렌더링 파이프라인 = Stream 파이프라인 (핵심)

그래픽스 파이프라인은 데이터가 **단계를 거치며 변환**된다 — 정확히 자바 Stream이다.

```java
// 개념적 의사코드
List<Pixel> frame = mesh.vertices.stream()
    .map(v -> vertexShader(v))      // 정점 변환 (MVP)
    .collect(rasterize())            // 삼각형 → 픽셀 조각
    .stream()
    .map(frag -> fragmentShader(frag))  // 픽셀 색 결정
    .collect(toFrameBuffer());
```

- 각 **단계(stage)** = `.map()` 하나. 데이터(정점→조각→픽셀)가 흐르며 모양이 바뀐다.
- (→ [D.1 컴퓨터 그래픽스](d1-graphics.md) 4장 파이프라인 개요와 같은 그림.)

---

### 2. 셰이더 = 람다 콜백, GPU = parallelStream 극한

- **셰이더**는 파이프라인 단계에 **당신이 꽂는 함수**다. `Function<Vertex, Vertex>`(정점) / `Function<Fragment, Color>`(프래그먼트).
- **GPU**는 이 함수를 **수백만 개 데이터에 동시에** 실행한다. `vertices.parallelStream().map(shader)`의 **극한판**(SIMD).
  - 차이: 자바 `parallelStream`은 CPU 코어 몇 개. GPU는 코어 **수천 개**가 같은 코드를 일제히.
- **uniform** = 모든 호출이 공유하는 `final` 상수(예: 카메라 위치). **attribute** = 원소마다 다른 파라미터(예: 각 정점 좌표).

---

### 3. 변환행렬(MVP) = 함수 합성

- 모델→월드→뷰→투영은 **변환을 차례로 적용**하는 것. 자바로는 **함수 합성**:
  ```java
  Matrix mvp = projection.multiply(view).multiply(model); // f∘g∘h
  Vertex clip = mvp.apply(vertex);
  ```
- **행렬 곱 = 함수 합성**이라는 한 문장이 핵심. (데코레이터로 변환을 겹겹이 감싸는 것과 같은 감각.)

---

### 4. 레이트레이싱 = 재귀

- 광선을 쏘고, 물체에 **맞으면** 그 지점에서 **반사·굴절 광선을 또 쏜다** → **재귀 호출**.
  ```java
  Color trace(Ray ray, int depth) {
      if (depth == 0) return BLACK;              // base case (재귀 종료)
      Hit hit = scene.intersect(ray);
      if (hit == null) return background;
      Color reflected = trace(hit.reflectRay(), depth - 1); // 재귀
      return shade(hit) .add(reflected);
  }
  ```
- **깊이 제한(depth)** = 재귀 스택 폭발을 막는 base case. 래스터화(2장)가 Stream이라면, 레이트레이싱은 **재귀**다.

---

### 5. 비유가 깨지는 지점 (주의)

- **GPU는 JVM이 아니다**: 셰이더(GLSL)는 자바처럼 JVM에서 안 돈다. **별도로 컴파일**돼 GPU에서 실행되는 **다른 언어**(C 비슷). 자바에서 문자열/파일로 넘겨 올린다.
- **분기(if)가 비싸다**: 자바 스레드는 각자 다른 길을 가도 되지만, GPU는 **수천 코어가 보조를 맞춰** 실행(SIMD)해서 셰이더 안 `if`로 갈라지면 성능이 뚝 떨어진다(divergence). "병렬 = 공짜"가 아니다.
- **객체지향보다 데이터지향**: 그래픽스는 `List<Vertex>` 같은 **거대한 배열을 통째로** 빠르게 미는 게 핵심(캐시·SIMD). OOP 추상화보다 **데이터 배치(layout)**가 성능을 지배한다.

---

### 6. 누가 언제 그리나 — CPU·GPU·병렬 (실행 모델)

처음 배울 때 가장 헷갈리는 부분: 그래픽은 **CPU 한 스레드가 하나씩 그리는 게 아니다.** CPU는 **명령만** 내리고, **GPU 수천 코어가 픽셀을 동시에** 칠한다.

| | CPU | GPU |
|---|-----|-----|
| 일꾼 수 | 소수(4~16) | **수천** |
| 성격 | 똑똑, 복잡한 일 | 단순, 같은 일 반복 |
| 역할 | 장면 준비·**명령(draw call)**·게임 로직 | **실제 그리기**(정점 변환·픽셀 색칠) |

**자바 렌즈**: GPU는 `parallelStream()`의 극한 — 코어가 수천 개.
```java
// CPU 방식이면 느림 — 한 스레드가 픽셀 하나씩
for (Pixel p : pixels) p.color = shade(p);

// GPU 방식 — 픽셀마다 일꾼이 붙어 동시에 (코어 수천 개)
pixels.parallelStream().forEach(p -> p.color = shade(p));
```

```mermaid
flowchart LR
  subgraph CPU["CPU · 소수 · 똑똑"]
    P["장면 준비<br/>게임 로직"] --> DC["draw call<br/>그려!"]
  end
  DC --> G
  subgraph GPU["GPU · 수천 코어 · 병렬"]
    G["정점 전부<br/>동시 변환"] --> R["래스터화"] --> FR["픽셀 200만 개<br/>동시 색칠"]
  end
  FR --> SC["화면"]
```

*(도식 설명: CPU가 장면을 준비하고 'draw call'로 명령하면, GPU가 정점을 동시에 변환하고 래스터화한 뒤 수백만 픽셀을 동시에 색칠해 화면에 낸다. CPU는 그동안 다음 프레임을 준비한다.)*

- **왜 병렬 가능?** 픽셀 하나 계산은 **옆 픽셀과 독립**(embarrassingly parallel) → 다 동시에. 반대로 게임 로직은 순서 의존이라 CPU가 맡는다.
- **CPU·GPU는 동시에**(비동기): CPU가 다음 프레임 준비하는 동안 GPU가 현재 프레임을 그린다. (작업을 큐에 `submit`하는 비동기 워커 풀 감각)
- **스레드 성격 차이**: 자바 스레드 = 수십 개가 **각자 다른 일**(MIMD). GPU = 수천 개가 **전부 같은 셰이더**를 다른 픽셀에(SIMD) → 그래서 셰이더 `if` 분기가 비싸다(§5 divergence).

---

### 한 줄 요약

그래픽스를 자바로 번역하면: **파이프라인 = Stream, 셰이더 = 람다 콜백, GPU = parallelStream의 극한, MVP = 함수 합성, 레이트레이싱 = 재귀.** 단 **GPU는 JVM 밖 별도 언어이고, 분기가 비싸며, OOP보다 데이터 배치가 성능을 좌우**한다는 세 가지가 다르다.

### 참조
- [D.1 컴퓨터 그래픽스](d1-graphics.md) · [D.2 렌더링 수학·ML 비교](d2-rendering-math.md) · [C.2 학습 경로와 신경망 종류](c2-curriculum-and-nn-types.md)

---

## 다음으로

D.2에서 렌더링 수학과, 그래픽스와 ML의 비교를 본다.

👉 [부록 D 그래픽스와 Unity · D.2 렌더링 수학과 ML 비교](d2-rendering-math.md)
