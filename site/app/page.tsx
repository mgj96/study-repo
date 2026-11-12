import {HomeView} from '../components/HomeView';
import {loadMarkdown} from '../lib/content';

export default function HomePage() {
  const {data, source} = loadMarkdown('index.md');
  return <HomeView hero={data.hero} features={data.features ?? []} body={source} />;
}
