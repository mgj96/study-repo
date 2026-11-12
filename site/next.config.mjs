// GitHub Pages(project site)용 정적 사이트. 저장소 이름이 바뀌면 BASE_PATH도 바꾼다.
export const BASE_PATH = '/study-repo';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  images: {unoptimized: true},
  env: {NEXT_PUBLIC_BASE_PATH: BASE_PATH},
};

export default nextConfig;
