'use client';

// Astryx 컴포넌트가 쓰는 링크. 사이트 안 문서는 next/link(빠른 이동),
// .html 실험 페이지·외부 링크는 일반 <a>로 연다.
import NextLink from 'next/link';
import type {ComponentProps} from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function SiteLink({href = '', ...props}: ComponentProps<'a'>) {
  if (/^(https?:|mailto:)/.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer" {...props} />;
  }
  if (href.startsWith('#')) return <a href={href} {...props} />;
  if (/\.html(#.*)?$/.test(href)) return <a href={BASE + href} {...props} />;
  return <NextLink href={href} {...props} />;
}
