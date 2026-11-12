import {notFound} from 'next/navigation';
import {DocView} from '../../components/DocView';
import {getDocByRoute, getDocs, loadMarkdown, prevNext} from '../../lib/content';

type Params = {slug: string[]};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getDocs().map(d => ({slug: d.route.slice(1).split('/')}));
}

function routeOf(slug: string[]) {
  return '/' + slug.map(decodeURIComponent).join('/');
}

export async function generateMetadata({params}: {params: Promise<Params>}) {
  const doc = getDocByRoute(routeOf((await params).slug));
  return {title: doc?.title};
}

export default async function DocPage({params}: {params: Promise<Params>}) {
  const doc = getDocByRoute(routeOf((await params).slug));
  if (!doc) notFound();
  const {source} = loadMarkdown(doc.file);
  const {prev, next} = prevNext(doc.route);
  return <DocView source={source} prev={prev} next={next} />;
}
