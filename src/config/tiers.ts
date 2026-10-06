export interface Tier {
  id: string;
  label: string;
  min: number;   // inclusive
  max: number;   // exclusive (use Infinity for last)
  color: string; // CSS value — only --accent or --text, never new colors
}

/** CPS tiers (clicks per second) */
export const CPS_TIERS: Tier[] = [
  { id: 'IDLE',     label: 'IDLE',     min: 0,   max: 3,        color: 'var(--faint)' },
  { id: 'STANDARD', label: 'STANDARD', min: 3,   max: 7,        color: 'var(--dim)' },
  { id: 'FAST',     label: 'FAST',     min: 7,   max: 10,       color: 'var(--text)' },
  { id: 'ELITE',    label: 'ELITE',    min: 10,  max: 14,       color: 'var(--accent)' },
  { id: 'INHUMAN',  label: 'INHUMAN',  min: 14,  max: Infinity, color: 'var(--accent)' },
];

/** Reaction time tiers (milliseconds — lower is better) */
export const REACTION_TIERS: Tier[] = [
  { id: 'SLOW',     label: 'SLOW',     min: 400, max: Infinity, color: 'var(--dim)' },
  { id: 'AVERAGE',  label: 'AVERAGE',  min: 280, max: 400,      color: 'var(--text)' },
  { id: 'FAST',     label: 'FAST',     min: 200, max: 280,      color: 'var(--text)' },
  { id: 'ELITE',    label: 'ELITE',    min: 150, max: 200,      color: 'var(--accent)' },
  { id: 'INHUMAN',  label: 'INHUMAN',  min: 0,   max: 150,      color: 'var(--accent)' },
];

/** Aim trainer accuracy tiers (percentage 0–100) */
export const AIM_TIERS: Tier[] = [
  { id: 'TRAINING', label: 'TRAINING', min: 0,   max: 50,       color: 'var(--faint)' },
  { id: 'STANDARD', label: 'STANDARD', min: 50,  max: 70,       color: 'var(--dim)' },
  { id: 'SHARP',    label: 'SHARP',    min: 70,  max: 85,       color: 'var(--text)' },
  { id: 'ELITE',    label: 'ELITE',    min: 85,  max: 95,       color: 'var(--accent)' },
  { id: 'INHUMAN',  label: 'INHUMAN',  min: 95,  max: 101,      color: 'var(--accent)' },
];

export function getTier(tiers: Tier[], value: number): Tier {
  // For reaction tiers: lower is better — find where value falls by min/max
  return tiers.find(t => value >= t.min && value < t.max) ?? tiers[0];
}

export function getCpsTier(cps: number): Tier {
  return getTier(CPS_TIERS, cps);
}

export function getReactionTier(ms: number): Tier {
  // Reaction: lower is better, tiers sorted high-to-low min
  const sorted = [...REACTION_TIERS].sort((a, b) => a.min - b.min);
  return sorted.find(t => ms >= t.min && ms < t.max) ?? REACTION_TIERS[0];
}

export function getAimTier(accuracy: number): Tier {
  return getTier(AIM_TIERS, accuracy);
}
