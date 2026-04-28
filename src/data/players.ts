export type Region = 'NA' | 'EU' | 'AS' | 'OC';
export type TierLevel = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | '-';

export interface RawTiers {
  current?: string | null;
  peak?: string | null;
  ogvanilla?: string | null;
  vanilla?: string | null;
  uhc?: string | null;
  pot?: string | null;
  nethop?: string | null;
  smp?: string | null;
  sword?: string | null;
  axe?: string | null;
  mace?: string | null;
  speed?: string | null;
}

export interface PlayerTiers {
  ogvanilla: TierLevel;
  vanilla: TierLevel;
  uhc: TierLevel;
  pot: TierLevel;
  nethop: TierLevel;
  smp: TierLevel;
  sword: TierLevel;
  axe: TierLevel;
  mace: TierLevel;
  speed: TierLevel;
}

export interface Player {
  id: string;
  username: string;
  uuid: string;
  region: Region;
  points: number;
  tiers: PlayerTiers;
  rawTiers?: RawTiers;
  currentTier?: TierLevel;
  peakTier?: TierLevel;
}

export const TIER_POINTS: Record<string, number> = {
  HT1: 60,
  LT1: 45,
  HT2: 30,
  LT2: 20,
  HT3: 10,
  LT3: 6,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
};

export function calculatePoints(rawTiers?: RawTiers | null): number {
  if (!rawTiers) return 0;
  let total = 0;
  const modeKeys: (keyof RawTiers)[] = ['ogvanilla', 'vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace', 'speed'];
  for (const key of modeKeys) {
    const tier = rawTiers[key];
    if (tier && tier !== '-') {
      total += TIER_POINTS[tier.toUpperCase()] ?? 0;
    }
  }
  return total;
}

export function getTitle(points: number): string {
  if (points >= 400) return 'Combat Grandmaster';
  if (points >= 250) return 'Combat Master';
  if (points >= 100) return 'Combat Ace';
  if (points >= 50)  return 'Combat Specialist';
  if (points >= 20)  return 'Combat Cadet';
  if (points >= 10)  return 'Combat Novice';
  return 'Rookie';
}

export const CATEGORIES = [
  { id: 'overall',   label: 'Overall',    icon: '/tier_icons/overall.svg' },
  { id: 'ogvanilla', label: 'OG Vanilla', icon: '/tier_icons/ogvanilla.png' },
  { id: 'vanilla',   label: 'Crystal',    icon: '/tier_icons/crystal.png' },
  { id: 'uhc',       label: 'UHC',        icon: '/tier_icons/uhc.png' },
  { id: 'pot',       label: 'Pot',        icon: '/tier_icons/pot.png' },
  { id: 'nethop',    label: 'NethOP',     icon: '/tier_icons/nethop.png' },
  { id: 'smp',       label: 'SMP',        icon: '/tier_icons/smp.png' },
  { id: 'sword',     label: 'Sword',      icon: '/tier_icons/sword.png' },
  { id: 'axe',       label: 'Axe',        icon: '/tier_icons/axe.png' },
  { id: 'mace',      label: 'Mace',       icon: '/tier_icons/mace.png' },
  { id: 'speed',     label: 'Speed',      icon: '/tier_icons/speed.png' },
];

export const TIER_COLS: (keyof PlayerTiers)[] = [
  'ogvanilla', 'vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace', 'speed'
];

export const PLAYERS: Player[] = [];

export function getCategoryTiers(
  category: keyof PlayerTiers,
  players: Player[] = PLAYERS
): { tier: TierLevel; players: Player[] }[] {
  const tierOrder: TierLevel[] = ['T1', 'T2', 'T3', 'T4', 'T5'];
  const grouped: Record<string, Player[]> = {};
  for (const player of players) {
    const tier = player.tiers[category];
    if (tier === '-') continue;
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(player);
  }
  return tierOrder
    .filter(t => grouped[t] && grouped[t].length > 0)
    .map(t => ({ tier: t as TierLevel, players: grouped[t] }));
}
