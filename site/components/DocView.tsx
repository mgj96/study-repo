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
import {Button} from '@astryxdesign/core/Button';
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

// 코드 블록: 폰에서는 화면 폭에 맞춰 줄바꿈·작은 글씨, 긴 코드는 접어 둔다.
// 언어가 없거나 text인 블록(아스키 그림·표)은 줄바꿈하면 모양이 깨지므로 옆으로 밀어 보기를 유지한다.
function Code({code, language}: {code: string; language?: string}) {
  const isPhone = useMediaQuery('(max-width: 700px)');
  const isAscii = !language || language === 'text' || language === 'plaintext';
  const wrap = isPhone && !isAscii;
  const ref = useRef<HTMLDivElement>(null);
  // 줄바꿈된 줄이 그 줄의 들여쓰기 위치에서 이어지도록(내어쓰기) 줄마다 여백을 맞춘다.
  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>('pre code > div').forEach(line => {
      const indent = wrap ? (line.textContent ?? '').match(/^ */)![0].length + 2 : 0;
      line.style.paddingInlineStart = indent ? `${indent}ch` : '';
      line.style.textIndent = indent ? `-${indent}ch` : '';
    });
  }, [wrap, code]);
  return (
    <div ref={ref}>
    <CodeBlock
      code={code}
      language={language}
      width="100%"
      isWrapped={wrap}
      size={isPhone ? 'sm' : 'md'}
      isCollapsible
      collapsibleThreshold={15}
    />
    </div>
  );
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
      return <Code code={code} language={language} />;
    },
  };
  return components;
}

const components = makeComponents();

const RAW_BASE = 'https://raw.githubusercontent.com/mgj96/study-repo/main/study/';

// Gemini·NotebookLM에 바로 붙여넣을 원문(마크다운) 주소를 복사한다.
function CopyRawLink({file}: {file: string}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(RAW_BASE + encodeURI(file));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return <Button label={copied ? '복사됨' : '원문 링크 복사'} variant="secondary" size="sm" onClick={copy} />;
}

export function DocView({source, file, prev, next}: {source: string; file: string; prev: NavLink; next: NavLink}) {
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
          <HStack gap={2} style={{justifyContent: 'flex-end', marginBottom: 8}}>
            <CopyRawLink file={file} />
          </HStack>
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
