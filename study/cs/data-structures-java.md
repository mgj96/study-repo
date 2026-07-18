# 자바로 보는 자료구조 — 뭘 언제 쓰나 + 놓치기 쉬운 함정

> 관점: 추상 자료구조를 **실제 Java Collections**에 매핑하고, 자바 개발자가 **자주 놓치는 함정**을 필수부터 정리.
> 추상 선택 가이드(결정 트리)는 [concept.md](concept.md) 4장. 자바 렌즈 전반: [../ai-ml/for-java-devs.md](../ai-ml/for-java-devs.md).

---

## 0. 추상 자료구조 ↔ Java Collections 지도

| 추상 | Java 클래스 | 핵심 연산 | 언제 |
|------|------------|-----------|------|
| 동적 배열 | `ArrayList` | get O(1), 끝 add 분할상환 O(1) | **기본 리스트** (대부분 이거) |
| 연결 리스트 | `LinkedList` | 양끝 O(1), get O(n) | 거의 안 씀 (§1 함정) |
| 해시맵 | `HashMap` | 평균 O(1) | **키로 조회** |
| 정렬맵 | `TreeMap` | O(log n), 정렬 유지 | 정렬·범위 검색 |
| 삽입순서맵 | `LinkedHashMap` | O(1) + 순서 보존 | **LRU 캐시**, 순서 필요할 때 |
| 셋 | `HashSet` / `TreeSet` | O(1) / O(log n) | 중복 제거 / 정렬 집합 |
| 스택·큐 | `ArrayDeque` | 양끝 O(1) | **스택·큐 둘 다** (Stack/LinkedList 대신) |
| 우선순위 큐 | `PriorityQueue` | peek O(1), poll O(log n) | top-K, 다익스트라 |

> 감각: **리스트=`ArrayList`, 맵=`HashMap`, 스택/큐=`ArrayDeque`, 우선순위=`PriorityQueue`** 만 기본으로 손에 익혀도 90%.

---

## 1. 놓치기 쉬운 함정 (필수부터)

### ① `LinkedList`는 거의 쓰지 마라 (제일 흔한 오해)
- 이론상 "중간 삽입 O(1)"이지만, **그 위치를 찾는 데 O(n)** 이고 **캐시 지역성이 나빠** 실측은 거의 항상 `ArrayList`가 빠르다.
- 노드마다 객체 + 포인터 → **메모리·GC 부담**도 큼. → **의심되면 `ArrayList`.**

### ② `Stack` 클래스 쓰지 마라
- `java.util.Stack`은 **레거시**(`Vector` 기반, 불필요한 동기화). → **`ArrayDeque`** 를 스택으로: `push`/`pop`.

### ③ `HashMap` 키엔 `equals` + `hashCode` **둘 다** 오버라이드
- 커스텀 객체를 키로 쓰는데 하나만 재정의하면 **조회 실패**(넣었는데 못 찾음). 계약: **같으면 hashCode도 같아야.**
  ```java
  // record는 equals/hashCode 자동 → 키로 안전
  record Point(int x, int y) {}
  ```

### ④ 오토박싱 비용 (자바 렌즈의 핵심)
- `HashMap<Integer, Integer>` 는 `int`를 **`Integer`로 박싱** → 힙 할당·GC 부담 (→ [../lang/java/types-boxing.md](../lang/java/types-boxing.md)).
- 핫패스·대용량이면 primitive 특화 컬렉션(예: Eclipse Collections, fastutil) 고려.

### ⑤ 초기 용량 · load factor
- `HashMap` 기본 용량 16, **load factor 0.75** 초과 시 **rehash**(재해시 비용). 큰 데이터면 `new HashMap<>(expectedSize)`.
- `ArrayList`도 크기 알면 초기 용량 지정 → 재할당 회피.

### ⑥ 순회 중 수정 → `ConcurrentModificationException`
- for-each 도는 중 `remove` 하면 fail-fast 예외. → `Iterator.remove()` 또는 `removeIf()`.

### ⑦ 정렬 컬렉션 주의
- `TreeMap`/`TreeSet`은 **`Comparable` 또는 `Comparator` 필요**, **null 키 불가**.
- `HashMap` 순회 순서는 **보장 없음**(버전 따라 다를 수 있음). 순서 필요하면 `LinkedHashMap`.

---

## 2. 면접 3단 Q&A (자바 기준)

### Q1. `ArrayList` vs `LinkedList` 언제?
- **① 결론** 거의 항상 **`ArrayList`**. `LinkedList`는 특수 경우만.
- **② 원리** ArrayList=연속 배열(인덱스 O(1), 캐시 친화). LinkedList=노드 흩어짐(get O(n), 캐시·GC 불리).
- **③ 확장** "양끝 삽입·삭제만 잦다"면 `ArrayDeque`가 LinkedList보다 낫다.

### Q2. `HashMap`은 어떻게 평균 O(1)? 최악은?
- **① 결론** 해시로 **바로 버킷을 계산**해 접근 → 평균 O(1). 최악 O(n)(또는 O(log n)).
- **② 원리** key의 hashCode로 버킷 인덱스 결정. 충돌 시 버킷에 체이닝. 자바 8+는 버킷이 커지면 **트리화**해 최악을 O(log n)으로 완화.
- **③ 확장** hashCode가 나쁘면 충돌 폭증 → 성능 저하. equals/hashCode 계약이 성능의 전제.

### Q3. 스택이 필요하면?
- **① 결론** `Stack` 말고 **`ArrayDeque`**.
- **② 원리** Stack은 Vector 기반 동기화라 느리고 낡음. ArrayDeque는 배열 기반 비동기 덱.
- **③ 확장** 큐도 `ArrayDeque`, 우선순위는 `PriorityQueue`. LinkedList를 큐로 쓰지 말 것.

### Q4. 커스텀 객체를 `HashMap` 키로 쓸 때 주의?
- **① 결론** `equals`+`hashCode` **둘 다** 재정의(또는 `record` 사용).
- **② 원리** 조회는 hashCode로 버킷 찾고 equals로 확인. 불일치면 넣고도 못 찾음.
- **③ 확장** 키는 **불변(immutable)** 이어야 안전 — 넣은 뒤 필드 바뀌면 버킷이 어긋남.

### Q5. 우선순위 큐는 언제?
- **① 결론** "가장 크거나 작은 걸 **반복해서** 꺼낼 때" — `PriorityQueue`(힙).
- **② 원리** peek O(1), 삽입·삭제 O(log n). 전체 정렬은 아님(부분 순서).
- **③ 확장** top-K, 다익스트라, 이벤트 스케줄러. 기본은 최소힙 → 최대힙은 `Comparator.reverseOrder()`.

---

## 한 줄 요약
자바에선 **리스트=`ArrayList`, 맵=`HashMap`, 스택·큐=`ArrayDeque`, 우선순위=`PriorityQueue`** 가 기본. 함정은 **LinkedList·Stack 지양, equals+hashCode 계약, 오토박싱 비용, rehash·fail-fast**. → 추상 선택 기준은 [concept.md](concept.md), GC 함정은 [gc-gotchas.md](gc-gotchas.md).

## 참조
- [Java Collections 튜토리얼](https://docs.oracle.com/javase/tutorial/collections/) · [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
