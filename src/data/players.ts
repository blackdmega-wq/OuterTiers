export type Region = 'NA' | 'EU' | 'AS' | 'OC';
export type TierLevel = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | '-';

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
  currentTier?: TierLevel;
  peakTier?: TierLevel;
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
  { id: 'ogvanilla', label: 'OG Vanilla', icon: '/tier_icons/ogvanilla.svg' },
  { id: 'vanilla',   label: 'Vanilla',    icon: '/tier_icons/vanilla.svg' },
  { id: 'uhc',       label: 'UHC',        icon: '/tier_icons/uhc.svg' },
  { id: 'pot',       label: 'Pot',        icon: '/tier_icons/pot.svg' },
  { id: 'nethop',    label: 'NethOP',     icon: '/tier_icons/nethop.svg' },
  { id: 'smp',       label: 'SMP',        icon: '/tier_icons/smp.svg' },
  { id: 'sword',     label: 'Sword',      icon: '/tier_icons/sword.svg' },
  { id: 'axe',       label: 'Axe',        icon: '/tier_icons/axe.svg' },
  { id: 'mace',      label: 'Mace',       icon: '/tier_icons/mace.svg' },
  { id: 'speed',     label: 'Speed',      icon: '/tier_icons/speed.svg' },
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
