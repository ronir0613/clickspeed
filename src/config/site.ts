export const SITE = {
  name: 'ClickSPEED.gg',
  domain: 'clickspeed.gg',
  url: 'https://clickspeed.gg',
  tagline: 'Free Click Speed & Reflex Tests — Precision Instruments for Gamers',
  description:
    'Test your clicks per second, reaction time, aim accuracy and more. Free browser-based tools with live analytics, tier ratings, and personal bests.',
  /** Set to true to render ad slot containers (empty divs with fixed height). */
  adsEnabled: false,
} as const;

export type TestSlug =
  | 'cps-test'
  | 'spacebar-counter'
  | 'jitter-click-test'
  | 'butterfly-click-test'
  | 'right-click-test'
  | 'reaction-time-test'
  | 'aim-trainer'
  | 'mobile-tap-test';

export interface NavTest {
  slug: TestSlug;
  label: string;
  shortLabel: string;
  keyHint: string;
  icon: string;
}

export const NAV_TESTS: NavTest[] = [
  { slug: 'cps-test',           label: 'CPS Test',           shortLabel: 'CPS',       keyHint: '[1]', icon: '⊕' },
  { slug: 'spacebar-counter',   label: 'Spacebar Counter',   shortLabel: 'SPACE',     keyHint: '[2]', icon: '⌨' },
  { slug: 'jitter-click-test',  label: 'Jitter Click',       shortLabel: 'JITTER',    keyHint: '[3]', icon: '⟳' },
  { slug: 'butterfly-click-test', label: 'Butterfly Click',  shortLabel: 'BFLY',      keyHint: '[4]', icon: '◈' },
  { slug: 'right-click-test',   label: 'Right-Click Test',   shortLabel: 'R-CLICK',   keyHint: '[5]', icon: '⊞' },
  { slug: 'reaction-time-test', label: 'Reaction Time',      shortLabel: 'REACT',     keyHint: '[6]', icon: '⚡' },
  { slug: 'aim-trainer',        label: 'Aim Trainer',        shortLabel: 'AIM',       keyHint: '[7]', icon: '◎' },
  { slug: 'mobile-tap-test',    label: 'Mobile Tap Test',    shortLabel: 'TAP',       keyHint: '[8]', icon: '⊡' },
];
