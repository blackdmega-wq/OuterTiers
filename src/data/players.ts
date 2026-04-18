export type Region = 'NA' | 'EU' | 'AS' | 'OC';
export type TierLevel = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | '-';

export interface PlayerTiers {
  ltms: TierLevel;
  vanilla: TierLevel;
  uhc: TierLevel;
  pot: TierLevel;
  nethop: TierLevel;
  smp: TierLevel;
  sword: TierLevel;
  axe: TierLevel;
  mace: TierLevel;
}

export interface Player {
  id: string;
  username: string;
  uuid: string;
  region: Region;
  points: number;
  tiers: PlayerTiers;
}

export function getTitle(points: number): string {
  if (points >= 400) return 'Combat Grandmaster';
  if (points >= 280) return 'Combat Master';
  if (points >= 180) return 'Combat Ace';
  if (points >= 100) return 'Combat Expert';
  return 'Combat Rookie';
}

export const CATEGORIES = [
  { id: 'overall',  label: 'Overall',  icon: '/tier_icons/overall.svg' },
  { id: 'ltms',    label: 'LTMs',     icon: '/tier_icons/2v2.svg' },
  { id: 'vanilla', label: 'Vanilla',  icon: '/tier_icons/vanilla.svg' },
  { id: 'uhc',     label: 'UHC',      icon: '/tier_icons/uhc.svg' },
  { id: 'pot',     label: 'Pot',      icon: '/tier_icons/pot.svg' },
  { id: 'nethop',  label: 'NethOP',   icon: '/tier_icons/nethop.svg' },
  { id: 'smp',     label: 'SMP',      icon: '/tier_icons/smp.svg' },
  { id: 'sword',   label: 'Sword',    icon: '/tier_icons/sword.svg' },
  { id: 'axe',     label: 'Axe',      icon: '/tier_icons/axe.svg' },
  { id: 'mace',    label: 'Mace',     icon: '/tier_icons/mace.svg' },
];

export const TIER_COLS: (keyof PlayerTiers)[] = [
  'ltms', 'vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace'
];

// No players — to be filled with real data
export const PLAYERS: Player[] = [];

export function getCategoryTiers(category: keyof PlayerTiers): { tier: TierLevel; players: Player[] }[] {
  const tierOrder: TierLevel[] = ['T1', 'T2', 'T3', 'T4', 'T5'];
  const grouped: Record<string, Player[]> = {};
  for (const player of PLAYERS) {
    const tier = player.tiers[category];
    if (tier === '-') continue;
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(player);
  }
  return tierOrder
    .filter(t => grouped[t] && grouped[t].length > 0)
    .map(t => ({ tier: t as TierLevel, players: grouped[t] }));
}
