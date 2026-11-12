'use client';

// 홈: study/index.md 앞부분(hero·features)을 Astryx 카드로, 본문은 마크다운으로.
import {Markdown} from '@astryxdesign/core/Markdown';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Button} from '@astryxdesign/core/Button';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {SiteLink} from './SiteLink';

type Hero = {name: string; text?: string; tagline?: string; actions?: {theme: string; text: string; link: string}[]};
type Feature = {icon?: string; title: string; details: string; link: string};

export function HomeView({hero, features, body}: {hero: Hero; features: Feature[]; body: string}) {
  return (
    <Layout
      height="auto"
      contentWidth={1040}
      content={
        <LayoutContent isScrollable={false} padding={8}>
          <VStack gap={10}>
            <VStack gap={3} style={{paddingBlock: 24}}>
              <Text type="display-1">{hero.name}</Text>
              {hero.text && <Text type="display-3" color="secondary">{hero.text}</Text>}
              {hero.tagline && <Text type="body" color="secondary">{hero.tagline}</Text>}
              <HStack gap={2} style={{flexWrap: 'wrap', marginTop: 8}}>
                {(hero.actions ?? []).map(a => (
                  <Button
                    key={a.text}
                    label={a.text}
                    variant={a.theme === 'brand' ? 'primary' : 'secondary'}
                    href={a.link}
                    as={SiteLink}
                  />
                ))}
              </HStack>
            </VStack>
            <Grid columns={{minWidth: 280, max: 3}} gap={4}>
              {features.map(f => (
                <ClickableCard key={f.title} href={f.link} label={f.title}>
                  <VStack gap={2}>
                    <Text type="large" weight="semibold">
                      {f.icon ? `${f.icon} ` : ''}
                      {f.title}
                    </Text>
                    <Text type="body" color="secondary">{f.details}</Text>
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
            <Markdown contentWidth="100%">{body}</Markdown>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
