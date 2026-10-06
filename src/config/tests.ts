export type InputType = 'click' | 'spacebar' | 'rightclick' | 'touch';
export type TestType = 'cps' | 'reaction' | 'aim';

export interface TestConfig {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  inputType: InputType;
  testType: TestType;
  defaultDuration: number;
  durations: number[];
  /** Short phrase for the arena button */
  ctaLabel: string;
  /** Copy headline shown in SEO section */
  copyHeadline: string;
}

export const TEST_CONFIGS: Record<string, TestConfig> = {
  'cps-test': {
    slug: 'cps-test',
    title: 'CPS Test — Clicks Per Second Counter',
    h1: 'CPS Test — How Fast Can You Click?',
    metaDescription:
      'Measure your clicks per second with our free CPS test. Choose 1 to 60-second durations, see live stats, tier rating, and personal best. No install needed.',
    inputType: 'click',
    testType: 'cps',
    defaultDuration: 5,
    durations: [1, 2, 5, 10, 15, 30, 60],
    ctaLabel: 'CLICK TO START',
    copyHeadline: 'What Is a CPS Test and Why Does It Matter?',
  },
  'spacebar-counter': {
    slug: 'spacebar-counter',
    title: 'Spacebar Counter — Spacebar Speed Test',
    h1: 'Spacebar Counter — Test Your Spacebar Speed',
    metaDescription:
      'Count spacebar presses per second with our free spacebar speed test. Multiple durations, tier ratings, and personal bests tracked in your browser.',
    inputType: 'spacebar',
    testType: 'cps',
    defaultDuration: 5,
    durations: [1, 5, 10, 30, 60],
    ctaLabel: 'PRESS SPACE TO START',
    copyHeadline: 'What Is a Spacebar Speed Test?',
  },
  'jitter-click-test': {
    slug: 'jitter-click-test',
    title: 'Jitter Click Test — Test Your Jitter Clicking Speed',
    h1: 'Jitter Click Test — How Fast Is Your Jitter Click?',
    metaDescription:
      'Test your jitter clicking speed with our precision CPS counter. Live stats, peak detection, and tier ratings. Master the jitter click technique.',
    inputType: 'click',
    testType: 'cps',
    defaultDuration: 5,
    durations: [1, 5, 10, 30],
    ctaLabel: 'CLICK TO START JITTER TEST',
    copyHeadline: 'What Is Jitter Clicking?',
  },
  'butterfly-click-test': {
    slug: 'butterfly-click-test',
    title: 'Butterfly Click Test — Measure Butterfly Clicking CPS',
    h1: 'Butterfly Click Test — Two-Finger Clicking Speed',
    metaDescription:
      'Measure your butterfly clicking speed with our CPS test. Test the two-finger alternating click technique, track peak rates, and compare tier ratings.',
    inputType: 'click',
    testType: 'cps',
    defaultDuration: 5,
    durations: [1, 5, 10, 30],
    ctaLabel: 'CLICK TO START BUTTERFLY TEST',
    copyHeadline: 'What Is Butterfly Clicking?',
  },
  'right-click-test': {
    slug: 'right-click-test',
    title: 'Right Click Test — Right-Click Speed Counter',
    h1: 'Right-Click Speed Test — CPS for Your Right Mouse Button',
    metaDescription:
      'Test how fast you can right-click per second. Context menu suppressed inside the arena. Live CPS tracking, tier ratings, and personal bests.',
    inputType: 'rightclick',
    testType: 'cps',
    defaultDuration: 5,
    durations: [1, 5, 10, 30],
    ctaLabel: 'RIGHT-CLICK TO START',
    copyHeadline: 'Why Test Your Right-Click Speed?',
  },
  'reaction-time-test': {
    slug: 'reaction-time-test',
    title: 'Reaction Time Test — How Fast Are Your Reflexes?',
    h1: 'Reaction Time Test — Measure Your Reflex Speed in Milliseconds',
    metaDescription:
      'Test your human reaction time in milliseconds. 5-round average, early-click detection, tier ratings from SLOW to INHUMAN. Free, instant, browser-based.',
    inputType: 'click',
    testType: 'reaction',
    defaultDuration: 0,
    durations: [],
    ctaLabel: 'CLICK TO START ROUND',
    copyHeadline: 'What Is Reaction Time and How Is It Measured?',
  },
  'aim-trainer': {
    slug: 'aim-trainer',
    title: 'Aim Trainer — Free Browser Aim Training Tool',
    h1: 'Aim Trainer — Improve Your Mouse Accuracy in 30 Seconds',
    metaDescription:
      'Free browser-based aim trainer. 30-second sessions, random targets, accuracy %, average ms per hit. No download. Track your improvement over time.',
    inputType: 'click',
    testType: 'aim',
    defaultDuration: 30,
    durations: [30],
    ctaLabel: 'CLICK TO START AIM TRAINING',
    copyHeadline: 'Does Aim Training Actually Help?',
  },
  'mobile-tap-test': {
    slug: 'mobile-tap-test',
    title: 'Mobile Tap Test — Multi-Touch Tap Speed Counter',
    h1: 'Mobile Tap Speed Test — Count Every Finger',
    metaDescription:
      'Tap speed test built for phones. Counts every simultaneous finger touch. Multi-touch aware, optimized for mobile, no install. Test your tap rate now.',
    inputType: 'touch',
    testType: 'cps',
    defaultDuration: 5,
    durations: [1, 5, 10, 30],
    ctaLabel: 'TAP TO START',
    copyHeadline: 'What Makes Mobile Tapping Different?',
  },
};

/** Sub-pages for CPS test with pre-selected durations */
export const CPS_DURATION_PAGES = [
  { duration: 1,  slug: '1-second-cps-test',  label: '1 Second CPS Test' },
  { duration: 2,  slug: '2-second-cps-test',  label: '2 Second CPS Test' },
  { duration: 5,  slug: '5-second-cps-test',  label: '5 Second CPS Test' },
  { duration: 10, slug: '10-second-cps-test', label: '10 Second CPS Test' },
  { duration: 15, slug: '15-second-cps-test', label: '15 Second CPS Test' },
  { duration: 30, slug: '30-second-cps-test', label: '30 Second CPS Test' },
  { duration: 60, slug: '60-second-cps-test', label: '60 Second CPS Test' },
];
