# study — 책 목차

학습 노트를 **"구조를 설계하고 바꾸는 엔지니어"** 한 권으로 묶었다. 형식 규칙은 [CONVENTIONS.md](CONVENTIONS.md).

## 서문

- [서문 — 이 책을 읽는 법](book/preface/00-how-to-read.md)

## 1부 컴퓨터가 일하는 방식

- [1장 추상화와 복잡도](book/part1/ch01-abstraction-and-complexity.md)
- [2장 메모리 · 2.1 메모리 계층과 캐시](book/part1/ch02-1-memory-hierarchy.md)
- [2장 메모리 · 2.2 가상 메모리와 페이징](book/part1/ch02-2-virtual-memory.md)
- [3장 동시성 · 3.1 스레드와 자바 메모리 모델](book/part1/ch03-1-threads-and-jmm.md)
- [3장 동시성 · 3.2 GC 함정과 점검](book/part1/ch03-2-gc-and-review.md)
- [4장 데이터를 담는 구조 · 4.1 자료구조와 HashMap](book/part1/ch04-1-data-structures-and-hashmap.md)
- [4장 데이터를 담는 구조 · 4.2 B+트리와 DB 인덱스](book/part1/ch04-2-btree-index.md)
- [4장 데이터를 담는 구조 · 4.3 수를 담는 법: 부동소수](book/part1/ch04-3-floating-point.md)

## 2부 데이터와 일관성

- [5장 트랜잭션과 락](book/part2/ch05-transaction-and-lock.md)
- [6장 캐시와 분산 락](book/part2/ch06-cache-and-distributed-lock.md)
- [7장 분산 정합성 · 7.1 원자성을 포기한 대가](book/part2/ch07-1-distributed-consistency.md)
- [7장 분산 정합성 · 7.2 서비스 사이의 멱등성](book/part2/ch07-2-grpc-idempotency.md)
- [8장 통신](book/part2/ch08-communication.md)
- [9장 성능과 스케일](book/part2/ch09-performance-and-scale.md)

## 3부 경계를 긋는 법

- [10장 설계의 출발점](book/part3/ch10-design-starting-point.md)
- [11장 모듈성 이론](book/part3/ch11-modularity.md)
- [12장 콘웨이 법칙과 AI 에이전트](book/part3/ch12-conway-and-ai-agents.md)
- [13장 어디에 둘까: 온프레미스와 클라우드](book/part3/ch13-onprem-and-cloud.md)

## 4부 운영 중인 구조 바꾸기

- [14장 전환 사례와 판단 기준](book/part4/ch14-migration-case-studies.md)
- [15장 구조를 CI로 지키기](book/part4/ch15-architecture-fitness-ci.md)

## 5부 AI 시대의 검증

- [16장 검증의 시대 · 16.1 병목이 검증으로 옮겨갔다](book/part5/ch16-1-bottleneck-moved-to-verification.md)
- [16장 검증의 시대 · 16.2 pstack·하루 3만 건 머지·소프트웨어 팩토리](book/part5/ch16-2-pstack-and-merge-at-scale.md)
- [17장 테스트와 품질 게이트 · 17.1 테스트 전략과 팀 표준](book/part5/ch17-1-testing-and-standards.md)
- [17장 테스트와 품질 게이트 · 17.2 CI 품질 도구와 자동화](book/part5/ch17-2-ci-quality-automation.md)

## 부록

- [부록 A 언어와 도구 · A.1 Java](book/appendix/a1-java.md)
- [부록 A 언어와 도구 · A.2 다른 언어로 옮겨가기](book/appendix/a2-other-languages.md)
- [부록 A 언어와 도구 · A.3 개발 도구와 LLM](book/appendix/a3-tools-and-llm.md)
- [부록 B 수학](book/appendix/b-math.md)
- [부록 C AI·머신러닝 · C.1 큰 그림](book/appendix/c1-big-picture.md)
- [부록 C AI·머신러닝 · C.2 학습 경로와 신경망 종류](book/appendix/c2-curriculum-and-nn-types.md)
- [부록 C AI·머신러닝 · C.3 학습 신호와 역전파](book/appendix/c3-learning-signal-and-backprop.md)
- [부록 C AI·머신러닝 · C.4 순서와 어텐션](book/appendix/c4-sequence-and-attention.md)
- [부록 C AI·머신러닝 · C.5 LLM 정렬·구조·논문](book/appendix/c5-llm-alignment-and-papers.md)
- [부록 C AI·머신러닝 · C.6 깊이·층별 특화와 YOLO](book/appendix/c6-layers-and-yolo.md)
- [부록 C AI·머신러닝 · C.7 YOLO vs SAM 2](book/appendix/c7-yolo-vs-sam.md)
- [부록 C AI·머신러닝 · C.8 랭킹 알고리듬과 정리](book/appendix/c8-ranking-and-log.md)
- [부록 D 그래픽스와 Unity · D.1 컴퓨터 그래픽스](book/appendix/d1-graphics.md)
- [부록 D 그래픽스와 Unity · D.2 렌더링 수학과 ML 비교](book/appendix/d2-rendering-math.md)
- [부록 D 그래픽스와 Unity · D.3 Unity GC](book/appendix/d3-unity-gc.md)
- [부록 E 면접과 코딩테스트 · E.1 역량 로드맵과 코드 설명법](book/appendix/e1-roadmap-and-explain.md)
- [부록 E 면접과 코딩테스트 · E.2 코딩테스트 2주 압축](book/appendix/e2-coding-test-2week.md)
- [부록 E 면접과 코딩테스트 · E.3 기출 복기와 치트시트](book/appendix/e3-past-problems.md)
- [부록 E 면접과 코딩테스트 · E.4 유형 훈련](book/appendix/e4-pattern-drills.md)
