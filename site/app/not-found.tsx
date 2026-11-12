import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{padding: 48}}>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>
        <Link href="/">홈으로</Link>
      </p>
    </div>
  );
}
