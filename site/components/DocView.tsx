'use client';

// 문서 한 장: 마크다운 본문 + 오른쪽 목차 + 이전/다음.
import {useEffect, useId, useMemo, useRef, useState} from 'react';
import katex from 'katex';
import {Markdown, type MarkdownComponents} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';
import {Outline, useOutlineFromMarkdown} from '@astryxdesign/core/Outline';
import {Layout, LayoutContent, LayoutPanel} from '@astryxdesign/core/Layout';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack, StackItem} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {useMediaQuery} from '@astryxdesign/core/hooks';

type NavLink = {text: string; link: string} | null;

function Math({value, display}: {value: string; display: 'inline' | 'block'}) {
  const html = useMemo(
    () => katex.renderToString(value, {displayMode: display === 'block', throwOnError: false, strict: false}),
    [value, display],
  );
  const Tag = display === 'block' ? 'div' : 'span';
  return <Tag className={display === 'block' ? 'study-math-block' : undefined} dangerouslySetInnerHTML={{__html: html}} />;
}

// 지금 화면이 다크 모드인지. Astryx Theme은 라이트/다크를 고르면 <html data-theme>를 붙이고,
// '시스템'이면 지운다(그때는 OS 설정을 따른다).
function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const read = () => {
      const attr = document.documentElement.getAttribute('data-theme');
      setDark(attr ? attr === 'dark' : mq.matches);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    mq.addEventListener('change', read);
    return () => {
      obs.disconnect();
      mq.removeEventListener('change', read);
    };
  }, []);
  return dark;
}

// Mermaid 도식은 브라우저에서 그린다. 그리기 전·실패 시에는 원문 코드를 보여준다.
function Mermaid({code}: {code: string}) {
  const id = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const dark = useIsDark();
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let alive = true;
    import('mermaid').then(async ({default: mermaid}) => {
      mermaid.initialize({startOnLoad: false, theme: dark ? 'dark' : 'neutral', fontFamily: 'inherit'});
      try {
        const {svg} = await mermaid.render(id + (dark ? 'd' : 'l'), code);
        if (alive) setSvg(svg);
      } catch {
        /* 문법 오류면 코드 그대로 둔다 */
      }
    });
    return () => {
      alive = false;
    };
  }, [code, id, dark]);
  if (!svg) return <CodeBlock code={code} language="mermaid" width="100%" />;
  return <div className="study-mermaid" dangerouslySetInnerHTML={{__html: svg}} />;
}

function makeComponents(): MarkdownComponents {
  const components: MarkdownComponents = {
    math: Math,
    code: ({code, language}) => {
      if (language === 'mermaid') return <Mermaid code={code} />;
      if (language === 'details') {
        const [title, ...rest] = code.split('\n');
        return (
          <Collapsible defaultIsOpen={false} trigger={<Text type="body" weight="semibold">{title}</Text>}>
            <Markdown components={components}>{rest.join('\n')}</Markdown>
          </Collapsible>
        );
      }
      return <CodeBlock code={code} language={language} width="100%" />;
    },
  };
  return components;
}

const components = makeComponents();

export function DocView({source, prev, next}: {source: string; prev: NavLink; next: NavLink}) {
  const headingLinks = useMemo(() => createMarkdownHeadingLinks({headingIdPrefix: 'doc'}), []);
  const plugins = useMemo(() => [headingLinks], [headingLinks]);
  const outline = useOutlineFromMarkdown(source, {plugins}).filter(i => i.level >= 2 && i.level <= 3);
  const isWide = useMediaQuery('(min-width: 1200px)');
  const topRef = useRef<HTMLDivElement>(null);

  return (
    <Layout
      height="auto"
      contentWidth={860}
      end={
        isWide && outline.length > 1 ? (
          <LayoutPanel isScrollable={false} label="이 문서 목차" role="complementary" width={260} style={{position: 'sticky', top: 72, alignSelf: 'start', maxHeight: 'calc(100dvh - 96px)', overflowY: 'auto'}}>
            <Outline items={outline} label="이 문서 목차" density="compact" offset={80} />
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent isScrollable={false} padding={8}>
          <div ref={topRef} className="study-doc">
            <Markdown id="doc" plugins={plugins} components={components} contentWidth="100%" autolink="gfm">
              {source}
            </Markdown>
          </div>
          {(prev || next) && (
            <VStack gap={4} style={{marginTop: 48}}>
              <Divider />
              <HStack gap={3}>
                <StackItem size="fill">
                  {prev && (
                    <ClickableCard href={prev.link}  label={`이전: ${prev.text}`}>
                      <Text type="supporting" color="secondary">이전</Text>
                      <Text type="body" weight="semibold">{prev.text}</Text>
                    </ClickableCard>
                  )}
                </StackItem>
                <StackItem size="fill">
                  {next && (
                    <ClickableCard href={next.link} label={`다음: ${next.text}`} style={{textAlign: 'end'}}>
                      <Text type="supporting" color="secondary">다음</Text>
                      <Text type="body" weight="semibold">{next.text}</Text>
                    </ClickableCard>
                  )}
                </StackItem>
              </HStack>
            </VStack>
          )}
        </LayoutContent>
      }
    />
  );
}
