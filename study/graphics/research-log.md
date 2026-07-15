# 검색 기록 — 컴퓨터 그래픽스 (렌더링) 학습

> `graphics/concept.md`를 작성하며 실제로 검색·확인한 기록.
> 목적: 출처 추적, NotebookLM 소스 재현, 나중에 다시 찾을 때 참고.

## 2026-07-15

### 검색 1 — 렌더링 파이프라인·래스터화 학습 자료
- **쿼리**: `computer graphics rendering pipeline rasterization learn resources LearnOpenGL Scratchapixel PBR book`
- **찾은 핵심 소스**:
  - Scratchapixel — https://www.scratchapixel.com/
    - 래스터화·레이트레이싱을 바닥부터 설명하는 입문 교재.
  - LearnOpenGL (Joey de Vries) — https://learnopengl.com/
    - 실습 중심 OpenGL 튜토리얼(삼각형→조명→PBR).
  - Physically Based Rendering (PBRT, 무료) — https://pbr-book.org/
  - Khronos – Rendering Pipeline Overview — https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview
  - Fabian Giesen – A Trip Through the Graphics Pipeline — https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/
- **노트 반영**: 4~8단원(파이프라인·셰이더·래스터화).

### 검색 2 — 레이트레이싱·실시간 렌더링·GPU 단계
- **쿼리**: `Ray Tracing in One Weekend real-time rendering book The Book of Shaders GPU pipeline stages`
- **찾은 핵심 소스**:
  - Ray Tracing in One Weekend (Peter Shirley, 2016~, 무료) — https://raytracing.github.io/
    - 주말에 레이트레이서 하나 만들기. 입문 필독.
  - 실시간 레이트레이싱(RTX) 파이프라인 단계 설명 자료들 (Ray Generation → Traversal(BVH) → Intersection → Shading).
- **노트 반영**: 12·13단원(레이트레이싱·실시간 RT).

### 추가로 노트에 인용한 표준 자료 (기존에 알던 안정적 출처)
- The Book of Shaders — https://thebookofshaders.com/
- Real-Time Rendering (책 포털) — https://www.realtimerendering.com/
- WebGL Fundamentals — https://webglfundamentals.org/
- MIT OCW 6.837 Computer Graphics — https://ocw.mit.edu/courses/6-837-computer-graphics-fall-2012/
- NVIDIA – Ray Tracing — https://developer.nvidia.com/discover/ray-tracing

## 다음에 더 파볼 것 (TODO)
- [ ] 셰이더 언어(GLSL) 직접 작성 실습 (The Book of Shaders)
- [ ] 그림자 기법 (섀도우 매핑) 상세
- [ ] 전역 조명(GI)·앰비언트 오클루전
- [ ] BVH 자료구조 구현
- [ ] AI 디노이징·DLSS가 렌더링에 쓰이는 방식 (→ AI 노트와 연결)
