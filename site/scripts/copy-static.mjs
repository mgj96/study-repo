// study/ 안의 정적 파일(labs 실험 페이지, cs-qna.html 등)을 사이트 public/으로 복사한다.
// study/public/x  -> /x,  study/a/b.html -> /a/b.html (기존 주소 유지)
import fs from 'node:fs';
import path from 'node:path';

const STUDY = path.join(process.cwd(), 'study');
const PUBLIC = path.join(process.cwd(), 'site', 'public');

fs.rmSync(PUBLIC, {recursive: true, force: true});
fs.mkdirSync(PUBLIC, {recursive: true});
fs.cpSync(path.join(STUDY, 'public'), PUBLIC, {recursive: true});

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (['public', '.vitepress', 'node_modules'].includes(name)) continue;
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.html')) {
      const dest = path.join(PUBLIC, path.relative(STUDY, full));
      fs.mkdirSync(path.dirname(dest), {recursive: true});
      fs.copyFileSync(full, dest);
    }
  }
}
walk(STUDY);
// GitHub Pages가 _next 폴더를 무시하지 않게
fs.writeFileSync(path.join(PUBLIC, '.nojekyll'), '');
console.log('static files copied to site/public');
