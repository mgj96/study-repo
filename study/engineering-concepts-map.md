# 분야별 "알아야 할 개념 지도" — 재사용 렌즈 (Java → ML → 그래픽스)

> **아이디어**: 어떤 분야든 "핵심 이론"만으로는 못 쓴다. 그 분야를 **실제로 구축·운영하려면** 알아야 하는 주변 개념(설계 원칙·개발 실천·도구·배포)이 따로 있다.
> **방법**: 아래 **6개 카테고리 렌즈**를 정하고 → 잘 아는 **Java로 채운 뒤** → 같은 렌즈를 **ML·그래픽스에 대입**해 대응 개념을 찾는다.
> **관련**: [roadmap.md](roadmap.md) · [lang/java-oop.md](lang/java-oop.md)(패러다임 심화) · [ai-ml/](ai-ml/) · [graphics/](graphics/)

---

## 0. 재사용 렌즈 — 6개 카테고리

| # | 카테고리 | 묻는 질문 |
|---|----------|-----------|
| 1 | **어원·역사** | 왜 생겼나? 어떤 문제를 풀려고? |
| 2 | **핵심 패러다임** | 어떤 사고방식으로 문제를 보나? |
| 3 | **설계 원칙** | 좋게 만들기 위한 규칙은? (YAGNI, DRY…) |
| 4 | **개발 실천** | 어떻게 협업·검증하나? (버전관리, 테스트, CI/CD) |
| 5 | **도구·생태계** | 무엇으로 만드나? (언어, 빌드, 프레임워크) |
| 6 | **배포·운영** | 어떻게 세상에 내보내고 유지하나? |

> 1~2는 "이해", 3~4는 "잘 만들기", 5~6은 "실제로 굴리기". 이론(2)만 알고 3~6을 모르면 "책은 읽었는데 못 만드는" 상태가 된다.

---

## 1. Java로 채운 개념 지도 (기준 예시)

### ① 어원·역사
- Simula(1967, 객체·상속) → Smalltalk(Alan Kay, "OOP" 용어) → C++ → **Java(1991 Oak→1995)**.
- 목적: "복잡·위험한 C++"의 대안 — 단순·안전·이식성. → 상세: [lang/java-oop.md](lang/java-oop.md)

### ② 핵심 패러다임
- **객체지향(OOP)**: 캡슐화·상속·다형성·추상화. 현실을 객체로 모델링해 복잡도 관리.
- 최근엔 함수형(람다·스트림, Java 8+)도 혼용.

### ③ 설계 원칙 (좋은 코드의 규칙)
| 원칙 | 뜻 |
|------|-----|
| **YAGNI** | "지금 필요 없으면 만들지 마라." 상상 속 미래를 위한 과잉 설계 금지 (익스트림 프로그래밍에서 유래) |
| **DRY** | "같은 지식을 반복하지 마라." 중복 제거, 한 곳에만 |
| **KISS** | "단순하게 유지하라." 문제가 허용하는 한 가장 단순한 설계 |
| **SOLID** | 객체지향 5원칙(단일책임·개방폐쇄·리스코프치환·인터페이스분리·의존역전). Robert C. Martin이 2000년대 초 정리 |

### ④ 개발 실천 (협업·검증)
- **버전관리(Git)**: 코드 이력·협업. (이 저장소도!)
- **테스트 / TDD**: 단위 테스트(JUnit), 테스트 먼저 짜기.
- **코드 리뷰**: PR로 상호 검토.
- **CI/CD**: *지속적 통합*(변경마다 자동 빌드·테스트) + *지속적 배포*(자동 릴리스). 익스트림 프로그래밍에서 대중화.

### ⑤ 도구·생태계
| 용도 | Java |
|------|------|
| 언어/런타임 | Java + **JVM**(바이트코드 실행) |
| 빌드·의존성 | **Maven**, **Gradle** |
| 테스트 | **JUnit** |
| IDE | **IntelliJ IDEA**, Eclipse |
| 대표 프레임워크 | **Spring**(웹·엔터프라이즈) |

### ⑥ 배포·운영
- 패키징: **JAR/WAR** → 컨테이너(**Docker**) → 서버/클라우드 배포.
- 운영: 로깅·모니터링, CI/CD 파이프라인으로 자동화.

`참조`: [YAGNI (Martin Fowler)](https://martinfowler.com/bliki/Yagni.html) · [SOLID/DRY/KISS 정리](https://scalastic.io/en/solid-dry-kiss/) · [Continuous Integration (Fowler)](https://martinfowler.com/articles/continuousIntegration.html) · [Maven](https://maven.apache.org/) · [Gradle](https://gradle.org/) · [Spring](https://spring.io/)

---

## 2. 같은 렌즈로 본 ML vs 그래픽스 (대응표)

각 카테고리에서 "Java의 그 개념"이 **다른 분야에선 무엇에 해당하는가**.

| 카테고리 | Java | 머신러닝 | 컴퓨터 그래픽스 |
|----------|------|----------|-----------------|
| **① 어원** | Simula→Java, C++ 대안 | 통계·퍼셉트론(1958)→딥러닝 부흥(2012 AlexNet) | 기하·광학→Sketchpad(1963)→래스터/레이트레이싱 |
| **② 패러다임** | 객체지향 | 데이터로 학습(규칙 안 짬) | 3D→2D 렌더링(정답 공식) |
| **③ 설계 원칙** | YAGNI·DRY·SOLID | 재현성, 데이터 누수 방지, "단순 모델·베이스라인 먼저" | 성능 예산(frame budget), LOD, "측정 먼저(프로파일)" |
| **④ 개발 실천** | Git·JUnit·CI/CD | 실험추적·데이터버전관리·CI/CD+**CT(지속훈련)** | 애셋 파이프라인·이미지 회귀테스트·프로파일링 |
| **⑤ 도구** | JVM·Maven·Spring | **Python·PyTorch·MLflow·DVC·W&B** | **C++·GLSL·Visual Studio·RenderDoc·엔진** |
| **⑥ 배포·운영** | JAR·Docker | 모델 서빙(API)·드리프트 모니터·재훈련 → **MLOps** | 빌드·셰이더 컴파일·플랫폼별 최적화 |

> **핵심 통찰**: Java의 "CI/CD·버전관리·의존성 관리"는 ML에선 **MLOps**(데이터·모델 버전관리, 지속훈련), 그래픽스에선 **애셋 파이프라인·프로파일링**으로 *같은 문제를 다른 이름*으로 푼다.

---

## 3. 분야별로 더 파볼 "주변 개념" 목록 (다음 학습 후보)

### 머신러닝 (MLOps 계열)
- **데이터 버전관리**: DVC, LakeFS
- **실험 추적·모델 레지스트리**: MLflow, Weights & Biases
- **지속훈련(CT)·CI/CD for ML**: 데이터 바뀌면 자동 재훈련·평가·롤백
- **서빙·모니터링**: 모델 API 배포, 데이터/개념 드리프트 감지
- **피처 스토어**: Feast / 클라우드: SageMaker, Vertex AI, Azure ML

`참조`: [MLflow](https://mlflow.org/) · [DVC](https://dvc.org/) · [Google Cloud – MLOps](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning)

### 컴퓨터 그래픽스
- **애셋 파이프라인**: 모델·텍스처를 게임/앱에 넣는 변환 흐름
- **프로파일링·디버깅**: RenderDoc, NVIDIA Nsight (프레임 분석)
- **성능 개념**: 배칭(draw call 줄이기), LOD(거리별 디테일), 컬링
- **엔진 아키텍처**: 씬 그래프, ECS(엔티티-컴포넌트-시스템)
- **대용량 버전관리**: Git LFS (텍스처·모델 파일)

`참조`: [RenderDoc](https://renderdoc.org/) · [NVIDIA Nsight](https://developer.nvidia.com/nsight-graphics) · [Real-Time Rendering](https://www.realtimerendering.com/)

---

## 4. 한 줄 정리

> 어떤 분야든 **①어원 ②패러다임 ③설계원칙 ④개발실천 ⑤도구 ⑥배포·운영** 6렌즈로 보면 "이론 너머 실제로 만드는 데 필요한 개념"이 한눈에 잡힌다. Java의 CI/CD·의존성 관리가 ML에선 **MLOps**, 그래픽스에선 **애셋 파이프라인**으로 대응된다.

---

## 검색 기록 (2026-07-15)
- 쿼리: `software engineering principles YAGNI DRY KISS SOLID CI/CD Martin Fowler build tools Maven Gradle`
  - 소스: [Martin Fowler – YAGNI](https://martinfowler.com/bliki/Yagni.html), [scalastic – SOLID/DRY/KISS](https://scalastic.io/en/solid-dry-kiss/). SOLID는 Robert C. Martin(2000년대 초) 정리, YAGNI·CI/CD는 익스트림 프로그래밍 유래 확인.
- 쿼리: `MLOps concepts data versioning DVC experiment tracking MLflow model serving CI/CD for machine learning 2026`
  - 소스: [MLflow](https://mlflow.org/), [DVC](https://dvc.org/), Walmart/DEV 블로그. CT(지속훈련)·모델 레지스트리·드리프트 모니터링 개념 확인.
- 반영: 1~3장(Java 채움, 대응표, 다음 학습 후보).

## 전체 참조 출처
- Martin Fowler – YAGNI — https://martinfowler.com/bliki/Yagni.html
- Martin Fowler – Continuous Integration — https://martinfowler.com/articles/continuousIntegration.html
- SOLID/DRY/KISS 개요 — https://scalastic.io/en/solid-dry-kiss/
- Maven — https://maven.apache.org/ · Gradle — https://gradle.org/ · Spring — https://spring.io/
- MLflow — https://mlflow.org/ · DVC — https://dvc.org/
- Google Cloud – MLOps — https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
- RenderDoc — https://renderdoc.org/ · NVIDIA Nsight — https://developer.nvidia.com/nsight-graphics

_작성: 2026-07 · 개념 지도(렌즈) + 분야 대응. 도구·관행은 빠르게 바뀌므로 최신은 검색 확인._
