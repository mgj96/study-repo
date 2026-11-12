// study/ 폴더의 마크다운을 읽어 페이지 목록·제목·목차·링크를 만든다.
// 빌드 시점(서버)에서만 실행된다.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {sidebar} from '../sidebar.mjs';

export const STUDY_DIR = path.join(process.cwd(), 'study');
const SKIP_DIRS = new Set(['.vitepress', 'public', 'node_modules']);

export type Doc = {
  route: string; // '/architecture/concept' (basePath 제외)
  file: string; // 'architecture/concept.md'
  title: string;
};

export type NavLink = {text: string; link: string};

function walk(dir: string, out: string[]) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.md')) out.push(path.relative(STUDY_DIR, full));
  }
}

function fileToRoute(file: string) {
  return '/' + file.replace(/\\/g, '/').replace(/\.md$/, '');
}

function firstHeading(src: string) {
  const m = src.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

let cache: Doc[] | null = null;

export function getDocs(): Doc[] {
  if (cache) return cache;
  const files: string[] = [];
  walk(STUDY_DIR, files);
  cache = files
    .filter(f => f !== 'index.md')
    .map(file => {
      const src = fs.readFileSync(path.join(STUDY_DIR, file), 'utf8');
      const route = fileToRoute(file);
      return {route, file, title: firstHeading(src) || route.split('/').pop()!};
    })
    .sort((a, b) => a.route.localeCompare(b.route));
  return cache;
}

export function getDocByRoute(route: string) {
  return getDocs().find(d => d.route === route);
}

// ---------------------------------------------------------------------------
// 마크다운 전처리
// ---------------------------------------------------------------------------

// <details><summary>제목</summary> ... </details> 를 Astryx Markdown이 다룰 수 있는
// 펜스 블록으로 바꾼다. (Astryx Markdown은 원시 HTML을 렌더링하지 않는다)
// 안쪽에 ``` 코드블록이 있어도 깨지지 않게 물결 5개로 감싼다.
function convertDetails(src: string) {
  return src.replace(
    /<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
    (_m, title: string, body: string) =>
      `\n~~~~~details\n${title.replace(/\s+/g, ' ').trim()}\n${body.trim()}\n~~~~~\n`,
  );
}

const REPO_BLOB = 'https://github.com/mgj96/study-repo/blob/main/';

function exists(rel: string) {
  return fs.existsSync(path.join(STUDY_DIR, rel));
}

// 상대 링크(../x.md, x.md, 폴더/)를 사이트 경로(/a/b)로 바꾼다.
function resolveLink(fromFile: string, href: string) {
  if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
  const [rawPath, hash] = href.split('#');
  if (!rawPath) return href;
  const fromDir = path.posix.dirname(fromFile.replace(/\\/g, '/'));
  let target = path.posix.normalize(path.posix.join(fromDir, decodeURI(rawPath)));
  // study/ 밖 파일(HANDOVER.md 등)은 사이트에 없으니 GitHub 원문으로 연결
  if (target.startsWith('..')) return REPO_BLOB + target.replace(/^\.\.\//, '');
  const isDir = href.endsWith('/') || (exists(target) && fs.statSync(path.join(STUDY_DIR, target)).isDirectory());
  if (isDir) {
    const dir = target.replace(/\/$/, '');
    // 폴더 링크: README → index → concept 순서로 있는 것
    const pick = ['README.md', 'index.md', 'concept.md'].find(n => exists(`${dir}/${n}`));
    target = pick ? `${dir}/${pick}` : `${dir}/README.md`;
  }
  if (!/\.(md|html)$/.test(target) && exists(target + '.md')) target += '.md';
  const route = '/' + target.replace(/\.md$/, '');
  return hash ? `${route}#${hash}` : route;
}

function rewriteLinks(fromFile: string, src: string) {
  // 코드 블록 안은 건드리지 않는다
  return src
    .split(/(^(?:```|~~~)[\s\S]*?^(?:```|~~~)[^\n]*$)/m)
    .map((chunk, i) =>
      i % 2 === 1
        ? chunk
        : chunk.replace(/\]\(([^)\s]+)\)/g, (_m, href: string) => `](${resolveLink(fromFile, href)})`),
    )
    .join('');
}

export function loadMarkdown(file: string) {
  const raw = fs.readFileSync(path.join(STUDY_DIR, file), 'utf8');
  const {content, data} = matter(raw);
  return {data, source: convertDetails(rewriteLinks(file, content))};
}

// ---------------------------------------------------------------------------
// 사이드바 순서 기반 이전/다음
// ---------------------------------------------------------------------------

type SidebarEntry = {text: string; link?: string; items?: SidebarEntry[]; collapsed?: boolean};

export function flatSidebar(): NavLink[] {
  const out: NavLink[] = [];
  const visit = (items: SidebarEntry[]) =>
    items.forEach(it => {
      if (it.link) out.push({text: it.text, link: it.link});
      if (it.items) visit(it.items);
    });
  visit(sidebar as SidebarEntry[]);
  return out;
}

export function prevNext(route: string) {
  const flat = flatSidebar();
  const i = flat.findIndex(x => x.link === route);
  if (i < 0) return {prev: null, next: null};
  return {prev: flat[i - 1] ?? null, next: flat[i + 1] ?? null};
}

// ---------------------------------------------------------------------------
// 검색 색인: 문서 제목 + ## / ### 제목
// ---------------------------------------------------------------------------

export type SearchItem = {id: string; label: string; auxiliaryData: {route: string; doc: string}};

export function searchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const d of getDocs()) {
    items.push({id: d.route, label: d.title, auxiliaryData: {route: d.route, doc: d.title}});
    const src = fs.readFileSync(path.join(STUDY_DIR, d.file), 'utf8');
    let inFence = false;
    src.split('\n').forEach((line, n) => {
      if (/^(```|~~~)/.test(line)) inFence = !inFence;
      const m = !inFence && line.match(/^#{2,3}\s+(.+)$/);
      if (m) {
        items.push({
          id: `${d.route}::${n}`,
          label: m[1].replace(/[*`]/g, '').trim(),
          auxiliaryData: {route: d.route, doc: d.title},
        });
      }
    });
  }
  return items;
}
