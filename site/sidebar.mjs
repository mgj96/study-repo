// 사이트 왼쪽 메뉴 = 책 목차. 순서가 곧 이전/다음 장 순서다.
// link는 study/ 기준 경로에서 .md를 뺀 것.

export const topNav = [
  {
    "text": "홈",
    "link": "/"
  },
  {
    "text": "서문",
    "link": "/book/preface/00-how-to-read"
  },
  {
    "text": "GitHub",
    "link": "https://github.com/mgj96/study-repo"
  }
];

export const sidebar = [
  {
    "text": "📖 시작",
    "items": [
      {
        "text": "서문 — 이 책을 읽는 법",
        "link": "/book/preface/00-how-to-read"
      }
    ]
  },
  {
    "text": "1부 컴퓨터가 일하는 방식",
    "collapsed": false,
    "items": [
      {
        "text": "1장 추상화와 복잡도",
        "link": "/book/part1/ch01-abstraction-and-complexity"
      },
      {
        "text": "2.1 메모리 계층과 캐시",
        "link": "/book/part1/ch02-1-memory-hierarchy"
      },
      {
        "text": "2.2 가상 메모리와 페이징",
        "link": "/book/part1/ch02-2-virtual-memory"
      },
      {
        "text": "3.1 스레드와 JMM",
        "link": "/book/part1/ch03-1-threads-and-jmm"
      },
      {
        "text": "3.2 GC 함정과 점검",
        "link": "/book/part1/ch03-2-gc-and-review"
      },
      {
        "text": "4.1 자료구조와 HashMap",
        "link": "/book/part1/ch04-1-data-structures-and-hashmap"
      },
      {
        "text": "4.2 B+트리와 DB 인덱스",
        "link": "/book/part1/ch04-2-btree-index"
      },
      {
        "text": "4.3 부동소수 (IEEE 754)",
        "link": "/book/part1/ch04-3-floating-point"
      }
    ]
  },
  {
    "text": "2부 데이터와 일관성",
    "collapsed": false,
    "items": [
      {
        "text": "5장 트랜잭션과 락",
        "link": "/book/part2/ch05-transaction-and-lock"
      },
      {
        "text": "6장 캐시와 분산 락",
        "link": "/book/part2/ch06-cache-and-distributed-lock"
      },
      {
        "text": "7.1 멱등성·Outbox·Saga",
        "link": "/book/part2/ch07-1-distributed-consistency"
      },
      {
        "text": "7.2 gRPC 멱등성·fan-out",
        "link": "/book/part2/ch07-2-grpc-idempotency"
      },
      {
        "text": "8장 통신",
        "link": "/book/part2/ch08-communication"
      },
      {
        "text": "9장 성능과 스케일",
        "link": "/book/part2/ch09-performance-and-scale"
      }
    ]
  },
  {
    "text": "3부 경계를 긋는 법",
    "collapsed": false,
    "items": [
      {
        "text": "10장 설계의 출발점",
        "link": "/book/part3/ch10-design-starting-point"
      },
      {
        "text": "11장 모듈성 이론",
        "link": "/book/part3/ch11-modularity"
      },
      {
        "text": "12장 콘웨이 법칙과 AI 에이전트",
        "link": "/book/part3/ch12-conway-and-ai-agents"
      },
      {
        "text": "13장 온프레미스와 클라우드",
        "link": "/book/part3/ch13-onprem-and-cloud"
      }
    ]
  },
  {
    "text": "4부 운영 중인 구조 바꾸기",
    "collapsed": false,
    "items": [
      {
        "text": "14장 전환 사례와 판단 기준",
        "link": "/book/part4/ch14-migration-case-studies"
      },
      {
        "text": "15장 구조를 CI로 지키기",
        "link": "/book/part4/ch15-architecture-fitness-ci"
      }
    ]
  },
  {
    "text": "5부 AI 시대의 검증",
    "collapsed": false,
    "items": [
      {
        "text": "16.1 병목이 검증으로",
        "link": "/book/part5/ch16-1-bottleneck-moved-to-verification"
      },
      {
        "text": "16.2 pstack·3만 건 머지",
        "link": "/book/part5/ch16-2-pstack-and-merge-at-scale"
      },
      {
        "text": "17.1 테스트 전략과 팀 표준",
        "link": "/book/part5/ch17-1-testing-and-standards"
      },
      {
        "text": "17.2 CI 품질 도구와 자동화",
        "link": "/book/part5/ch17-2-ci-quality-automation"
      }
    ]
  },
  {
    "text": "📎 부록",
    "collapsed": false,
    "items": [
      {
        "text": "부록 A 언어와 도구",
        "collapsed": true,
        "items": [
          {
            "text": "A.1 Java",
            "link": "/book/appendix/a1-java"
          },
          {
            "text": "A.2 다른 언어 (C++·C#·Kotlin)",
            "link": "/book/appendix/a2-other-languages"
          },
          {
            "text": "A.3 개발 도구와 LLM",
            "link": "/book/appendix/a3-tools-and-llm"
          }
        ]
      },
      {
        "text": "부록 B 수학",
        "collapsed": true,
        "items": [
          {
            "text": "B 수학",
            "link": "/book/appendix/b-math"
          }
        ]
      },
      {
        "text": "부록 C AI·머신러닝",
        "collapsed": true,
        "items": [
          {
            "text": "C.1 큰 그림",
            "link": "/book/appendix/c1-big-picture"
          },
          {
            "text": "C.2 학습 경로와 신경망 종류",
            "link": "/book/appendix/c2-curriculum-and-nn-types"
          },
          {
            "text": "C.3 학습 신호와 역전파",
            "link": "/book/appendix/c3-learning-signal-and-backprop"
          },
          {
            "text": "C.4 RNN·임베딩·어텐션",
            "link": "/book/appendix/c4-sequence-and-attention"
          },
          {
            "text": "C.5 정렬·MoE·논문",
            "link": "/book/appendix/c5-llm-alignment-and-papers"
          },
          {
            "text": "C.6 층별 특화와 YOLO",
            "link": "/book/appendix/c6-layers-and-yolo"
          },
          {
            "text": "C.7 YOLO vs SAM 2",
            "link": "/book/appendix/c7-yolo-vs-sam"
          },
          {
            "text": "C.8 X 랭킹 알고리듬·정리",
            "link": "/book/appendix/c8-ranking-and-log"
          }
        ]
      },
      {
        "text": "부록 D 그래픽스와 Unity",
        "collapsed": true,
        "items": [
          {
            "text": "D.1 컴퓨터 그래픽스",
            "link": "/book/appendix/d1-graphics"
          },
          {
            "text": "D.2 렌더링 수학·ML 비교",
            "link": "/book/appendix/d2-rendering-math"
          },
          {
            "text": "D.3 Unity GC",
            "link": "/book/appendix/d3-unity-gc"
          }
        ]
      },
      {
        "text": "부록 E 면접과 코딩테스트",
        "collapsed": true,
        "items": [
          {
            "text": "E.1 역량 로드맵·코드 설명법",
            "link": "/book/appendix/e1-roadmap-and-explain"
          },
          {
            "text": "E.2 코딩테스트 2주 압축",
            "link": "/book/appendix/e2-coding-test-2week"
          },
          {
            "text": "E.3 기출 복기·치트시트",
            "link": "/book/appendix/e3-past-problems"
          },
          {
            "text": "E.4 유형 훈련",
            "link": "/book/appendix/e4-pattern-drills"
          }
        ]
      }
    ]
  },
  {
    "text": "🛠 이 저장소",
    "collapsed": true,
    "items": [
      {
        "text": "형식 표준 (CONVENTIONS)",
        "link": "/CONVENTIONS"
      },
      {
        "text": "글쓰기 가이드",
        "link": "/writing-guide"
      }
    ]
  }
];

// 부 합본(NotebookLM·Gemini용). 빌드 때 site/scripts/copy-static.mjs가 /bundle/<id>.md로 만든다.
export const parts = [
  {
    "id": "preface",
    "title": "서문",
    "files": [
      "book/preface/00-how-to-read.md"
    ]
  },
  {
    "id": "part1",
    "title": "1부 컴퓨터가 일하는 방식",
    "files": [
      "book/part1/ch01-abstraction-and-complexity.md",
      "book/part1/ch02-1-memory-hierarchy.md",
      "book/part1/ch02-2-virtual-memory.md",
      "book/part1/ch03-1-threads-and-jmm.md",
      "book/part1/ch03-2-gc-and-review.md",
      "book/part1/ch04-1-data-structures-and-hashmap.md",
      "book/part1/ch04-2-btree-index.md",
      "book/part1/ch04-3-floating-point.md"
    ]
  },
  {
    "id": "part2",
    "title": "2부 데이터와 일관성",
    "files": [
      "book/part2/ch05-transaction-and-lock.md",
      "book/part2/ch06-cache-and-distributed-lock.md",
      "book/part2/ch07-1-distributed-consistency.md",
      "book/part2/ch07-2-grpc-idempotency.md",
      "book/part2/ch08-communication.md",
      "book/part2/ch09-performance-and-scale.md"
    ]
  },
  {
    "id": "part3",
    "title": "3부 경계를 긋는 법",
    "files": [
      "book/part3/ch10-design-starting-point.md",
      "book/part3/ch11-modularity.md",
      "book/part3/ch12-conway-and-ai-agents.md",
      "book/part3/ch13-onprem-and-cloud.md"
    ]
  },
  {
    "id": "part4",
    "title": "4부 운영 중인 구조 바꾸기",
    "files": [
      "book/part4/ch14-migration-case-studies.md",
      "book/part4/ch15-architecture-fitness-ci.md"
    ]
  },
  {
    "id": "part5",
    "title": "5부 AI 시대의 검증",
    "files": [
      "book/part5/ch16-1-bottleneck-moved-to-verification.md",
      "book/part5/ch16-2-pstack-and-merge-at-scale.md",
      "book/part5/ch17-1-testing-and-standards.md",
      "book/part5/ch17-2-ci-quality-automation.md"
    ]
  },
  {
    "id": "appendix",
    "title": "부록",
    "files": [
      "book/appendix/a1-java.md",
      "book/appendix/a2-other-languages.md",
      "book/appendix/a3-tools-and-llm.md",
      "book/appendix/b-math.md",
      "book/appendix/c1-big-picture.md",
      "book/appendix/c2-curriculum-and-nn-types.md",
      "book/appendix/c3-learning-signal-and-backprop.md",
      "book/appendix/c4-sequence-and-attention.md",
      "book/appendix/c5-llm-alignment-and-papers.md",
      "book/appendix/c6-layers-and-yolo.md",
      "book/appendix/c7-yolo-vs-sam.md",
      "book/appendix/c8-ranking-and-log.md",
      "book/appendix/d1-graphics.md",
      "book/appendix/d2-rendering-math.md",
      "book/appendix/d3-unity-gc.md",
      "book/appendix/e1-roadmap-and-explain.md",
      "book/appendix/e2-coding-test-2week.md",
      "book/appendix/e3-past-problems.md",
      "book/appendix/e4-pattern-drills.md"
    ]
  }
];
