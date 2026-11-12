import type {Metadata} from 'next';
import './globals.css';
import {Shell} from '../components/Shell';
import {searchIndex} from '../lib/content';

export const metadata: Metadata = {
  title: {default: '개발 학습 노트', template: '%s | 개발 학습 노트'},
  description: 'CS · ML · 그래픽스 · 언어 · 면접 학습 정리 (쉽게 시작 → 논문까지)',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Shell searchItems={searchIndex()}>{children}</Shell>
      </body>
    </html>
  );
}
