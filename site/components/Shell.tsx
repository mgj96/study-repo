'use client';

// 사이트 뼈대: 상단 바(제목·검색·테마), 왼쪽 메뉴, 본문.
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack} from '@astryxdesign/core/Stack';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Text} from '@astryxdesign/core/Text';
import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {MagnifyingGlassIcon, MoonIcon, SunIcon, ComputerDesktopIcon} from '@heroicons/react/24/outline';
import {CodeBracketIcon} from '@heroicons/react/24/outline';
import {SiteLink} from './SiteLink';
import {sidebar} from '../sidebar.mjs';
import type {SearchItem} from '../lib/content';

type Mode = 'system' | 'light' | 'dark';
type Entry = {text: string; link?: string; items?: Entry[]; collapsed?: boolean};

const MODE_KEY = 'study-theme-mode';
const NEXT_MODE: Record<Mode, Mode> = {system: 'light', light: 'dark', dark: 'system'};
const MODE_ICON = {system: ComputerDesktopIcon, light: SunIcon, dark: MoonIcon};
const MODE_LABEL = {system: '테마: 시스템', light: '테마: 라이트', dark: '테마: 다크'};

function containsRoute(entry: Entry, route: string): boolean {
  return entry.link === route || (entry.items ?? []).some(e => containsRoute(e, route));
}

function NavEntry({entry, route}: {entry: Entry; route: string}) {
  if (entry.items) {
    return (
      <SideNavItem
        label={entry.text}
        collapsible={{defaultIsCollapsed: !!entry.collapsed && !containsRoute(entry, route)}}>
        {entry.items.map(e => (
          <NavEntry key={e.text} entry={e} route={route} />
        ))}
      </SideNavItem>
    );
  }
  return <SideNavItem label={entry.text} href={entry.link} isSelected={entry.link === route} />;
}

export function Shell({children, searchItems}: {children: ReactNode; searchItems: SearchItem[]}) {
  const route = usePathname() || '/';
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('system');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const source = useMemo(
    () => createStaticSource(searchItems, {keywords: item => [item.auxiliaryData.doc]}),
    [searchItems],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY) as Mode | null;
      if (saved) setMode(saved);
    } catch {}
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const cycleMode = () => {
    const next = NEXT_MODE[mode];
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {}
  };

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <LinkProvider component={SiteLink}>
        <AppShell
          height="auto"
          topNav={
            <TopNav
              heading={<TopNavHeading heading="개발 학습 노트" headingHref="/" />}
              endContent={
                <HStack gap={1} vAlign="center">
                  <Button
                    label="검색"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={MagnifyingGlassIcon} />}
                    endContent={<Kbd keys="mod+k" />}
                    onClick={() => setIsSearchOpen(true)}
                  />
                  <IconButton
                    label={MODE_LABEL[mode]}
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={MODE_ICON[mode]} />}
                    onClick={cycleMode}
                  />
                  <IconButton
                    label="GitHub 저장소"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={CodeBracketIcon} />}
                    onClick={() => window.open('https://github.com/mgj96/study-repo', '_blank')}
                  />
                </HStack>
              }
            />
          }
          sideNav={
            <SideNav resizable={{defaultWidth: 280, minWidth: 220, maxWidth: 420, autoSaveId: 'study-sidenav'}}>
              {(sidebar as Entry[]).map(group => (
                <SideNavSection key={group.text} title={group.text}>
                  {(group.items ?? []).map(e => (
                    <NavEntry key={e.text} entry={e} route={route} />
                  ))}
                </SideNavSection>
              ))}
            </SideNav>
          }>
          {children}
        </AppShell>
        <CommandPalette
          isOpen={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          searchSource={source}
          label="문서 검색"
          emptySearchText="검색 결과가 없습니다"
          emptyBootstrapText="문서 제목이나 소제목을 입력하세요"
          onValueChange={id => {
            const item = searchItems.find(i => i.id === id);
            if (item) {
              setIsSearchOpen(false);
              router.push(item.auxiliaryData.route);
            }
          }}
          renderItem={item => (
            <HStack gap={2} vAlign="center">
              <Text type="body">{item.label}</Text>
              {item.label !== item.auxiliaryData.doc && (
                <Text type="supporting" color="secondary">
                  {item.auxiliaryData.doc}
                </Text>
              )}
            </HStack>
          )}
        />
      </LinkProvider>
    </Theme>
  );
}
