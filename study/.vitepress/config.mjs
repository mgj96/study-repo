import { defineConfig } from 'vitepress'

// GitHub Pages(project site)용 base. Vercel로 배포하면 '/'로 바꾸세요.
export default defineConfig({
  title: '개발 학습 노트',
  description: 'CS · ML · 그래픽스 · 언어 · 면접 학습 정리 (쉽게 시작 → 논문까지)',
  lang: 'ko-KR',
  base: '/study-repo/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  markdown: {
    math: true,
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '검색',
            buttonAriaLabel: '검색',
          },
          modal: {
            displayDetails: '상세 보기',
            resetButtonTitle: '검색어 지우기',
            backButtonTitle: '뒤로',
            noResultsText: '검색 결과가 없습니다',
            footer: {
              selectText: '선택',
              selectKeyAriaLabel: '선택',
              navigateText: '이동',
              navigateUpKeyAriaLabel: '위로',
              navigateDownKeyAriaLabel: '아래로',
              closeText: '닫기',
              closeKeyAriaLabel: '닫기',
            },
          },
        },
      },
    },
    nav: [
      { text: '홈', link: '/' },
      { text: '로드맵', link: '/roadmap' },
      { text: 'CS', link: '/cs/concept' },
      { text: 'GitHub', link: 'https://github.com/mgj96/study-repo' },
    ],
    sidebar: [
      {
        text: '🗺️ 상위 · 계획',
        items: [
          { text: '학습 로드맵', link: '/roadmap' },
          { text: '개념 지도 (6렌즈)', link: '/engineering-concepts-map' },
          { text: '그래픽스 ↔ ML', link: '/graphics-vs-ml' },
          { text: '형식 표준 (CONVENTIONS)', link: '/CONVENTIONS' },
          { text: 'NotebookLM 소스', link: '/notebooklm-sources' },
        ],
      },
      {
        text: '🧠 AI · 머신러닝',
        collapsed: false,
        items: [
          { text: '개념 노트', link: '/ai-ml/concept' },
          { text: '암기 Q&A', link: '/ai-ml/qna' },
          { text: '🔬 어텐션·트랜스포머 (논문)', link: '/ai-ml/deep-attention' },
          { text: '🔬 역전파 수학', link: '/ai-ml/deep-neural-backprop' },
          { text: '검색 기록', link: '/ai-ml/research-log' },
        ],
      },
      {
        text: '🎨 컴퓨터 그래픽스',
        collapsed: false,
        items: [
          { text: '개념 노트', link: '/graphics/concept' },
          { text: '암기 Q&A', link: '/graphics/qna' },
          { text: '🔬 렌더링 수학', link: '/graphics/deep-rendering-math' },
          { text: '검색 기록', link: '/graphics/research-log' },
        ],
      },
      {
        text: '🧮 CS 핵심',
        collapsed: false,
        items: [
          { text: '개념 (Big-O·추상화)', link: '/cs/concept' },
          { text: 'Q&A · 운영체제', link: '/cs/qna/os' },
          { text: 'Q&A · 네트워크', link: '/cs/qna/network' },
          { text: 'Q&A · 데이터베이스', link: '/cs/qna/database' },
          { text: 'Q&A · 자료구조·알고리즘', link: '/cs/qna/ds-algorithm' },
        ],
      },
      {
        text: '💬 언어',
        collapsed: false,
        items: [
          { text: 'Java · 개념', link: '/lang/java/concept' },
          { text: 'Java · 타입/박싱', link: '/lang/java/types-boxing' },
          { text: 'Java · Q&A', link: '/lang/java/qna' },
          { text: 'C# · 개념', link: '/lang/csharp/concept' },
          { text: 'C# · Q&A', link: '/lang/csharp/qna' },
        ],
      },
      {
        text: '🎮 Unity',
        collapsed: false,
        items: [
          { text: '개념 (GC)', link: '/unity/concept' },
          { text: '암기 Q&A', link: '/unity/qna' },
          { text: '🔬 GC 내부 (공식문서)', link: '/unity/deep-gc' },
        ],
      },
      {
        text: '🎯 면접',
        collapsed: false,
        items: [
          { text: '코드 설명 프레임워크', link: '/interview/explain-your-code' },
        ],
      },
    ],
    outline: { level: [2, 3], label: '이 문서 목차' },
    docFooter: { prev: '이전', next: '다음' },
    darkModeSwitchLabel: '테마',
    lightModeSwitchTitle: '라이트 모드로',
    darkModeSwitchTitle: '다크 모드로',
    sidebarMenuLabel: '메뉴',
    returnToTopLabel: '맨 위로',
    skipToContentLabel: '본문으로 건너뛰기',
    lastUpdatedText: '마지막 수정',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/mgj96/study-repo' },
    ],
  },
})
