# Obsidian이란

## 개요

Obsidian은 로컬 마크다운 파일 기반의 지식 관리 도구다.  
모든 노트가 `.md` 파일로 저장되어 Git으로 관리 가능하고, LLM에 그대로 제공할 수 있다.

**핵심 특징:**
- 파일이 로컬에 저장 (클라우드 종속 없음)
- 노트 간 링크로 지식 그래프 형성
- 마크다운 그대로 GitHub에서 읽힘

---

## 핵심 개념

### 1. 노트 링크
```markdown
[[다른 노트 제목]]          # 같은 vault 내 노트 연결
[[노트 제목#섹션]]          # 특정 섹션으로 연결
[[노트 제목|표시할 텍스트]] # 별칭 사용
```

### 2. 백링크 (Backlinks)
A노트에서 B노트를 링크하면, B노트에서 "어디서 나를 링크했는지" 자동으로 보임.  
→ 지식이 자연스럽게 연결됨.

### 3. 그래프 뷰
노트들의 연결 관계를 시각화.  
많이 연결된 노트 = 핵심 개념.

---

## GitHub 레포와 함께 쓰는 방법

```
study-repo/ (Git 레포)
  ↕ (같은 폴더)
Obsidian Vault (study-repo를 vault로 열기)
```

1. Obsidian 앱 설치
2. "Open folder as Vault" → `study-repo` 폴더 선택
3. 이제 study-repo의 모든 `.md` 파일이 Obsidian 노트로 보임
4. Git push하면 GitHub에도 반영

---

## LLM 지식 유지에 활용하는 방법

→ [LLM 지식 관리](llm-knowledge-management.md) 참고

## 관련 문서

- [노트 링크 가이드](linking-guide.md)
- [LLM 지식 관리](llm-knowledge-management.md)
