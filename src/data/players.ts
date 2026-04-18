export type Region = 'NA' | 'EU' | 'AS' | 'OC';
export type TierLevel = 'HT1' | 'HT2' | 'HT3' | 'HT4' | 'LT1' | 'LT2' | 'LT3' | 'LT4' | 'LT5' | '-';

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

export const PLAYERS: Player[] = [
  {
    id: '1', username: 'Marlowww', uuid: 'f6489b79-c14a-4d4f-ba0e-a8f71b4f85e3',
    region: 'NA', points: 450,
    tiers: { ltms: 'HT1', vanilla: 'HT1', uhc: 'LT1', pot: 'HT1', nethop: 'HT1', smp: 'HT1', sword: 'LT1', axe: 'LT1', mace: 'HT1' }
  },
  {
    id: '2', username: 'ItzRealMe', uuid: 'a6b2fb1c-9db0-41ae-9cf2-2c60b1f7e63b',
    region: 'NA', points: 330,
    tiers: { ltms: 'HT3', vanilla: 'HT1', uhc: 'HT1', pot: 'HT1', nethop: 'HT1', smp: 'LT2', sword: 'LT2', axe: 'LT2', mace: 'HT2' }
  },
  {
    id: '3', username: 'coldified', uuid: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890',
    region: 'EU', points: 311,
    tiers: { ltms: 'LT1', vanilla: 'HT2', uhc: 'LT3', pot: 'HT1', nethop: 'HT1', smp: 'LT1', sword: 'LT1', axe: 'LT2', mace: 'HT1' }
  },
  {
    id: '4', username: 'Swight', uuid: 'd2e3f4a5-b6c7-8901-bcde-f12345678901',
    region: 'NA', points: 290,
    tiers: { ltms: 'HT3', vanilla: 'HT3', uhc: 'LT3', pot: 'HT1', nethop: 'HT1', smp: 'HT1', sword: 'HT2', axe: 'LT2', mace: 'HT2' }
  },
  {
    id: '5', username: 'janekv', uuid: 'e3f4a5b6-c7d8-9012-cdef-012345678902',
    region: 'EU', points: 245,
    tiers: { ltms: 'LT3', vanilla: 'HT4', uhc: 'HT1', pot: 'HT1', nethop: 'LT1', smp: 'HT2', sword: 'LT2', axe: 'LT2', mace: 'LT1' }
  },
  {
    id: '6', username: 'BlvckWlf', uuid: 'f4a5b6c7-d8e9-0123-def0-123456789003',
    region: 'EU', points: 226,
    tiers: { ltms: 'HT2', vanilla: 'HT3', uhc: 'LT3', pot: 'LT3', nethop: 'HT1', smp: 'HT1', sword: 'HT2', axe: 'LT2', mace: 'HT2' }
  },
  {
    id: '7', username: 'Kylaz', uuid: 'a5b6c7d8-e9f0-1234-ef01-234567890104',
    region: 'NA', points: 226,
    tiers: { ltms: 'HT3', vanilla: 'LT3', uhc: 'LT3', pot: 'HT1', nethop: 'HT1', smp: 'HT1', sword: 'LT2', axe: '-', mace: 'LT2' }
  },
  {
    id: '8', username: 'ninorc15', uuid: 'b6c7d8e9-f0a1-2345-f012-345678901205',
    region: 'EU', points: 211,
    tiers: { ltms: 'HT1', vanilla: 'LT3', uhc: 'LT1', pot: 'LT2', nethop: 'LT2', smp: 'LT1', sword: 'LT2', axe: 'LT2', mace: 'HT1' }
  },
  {
    id: '9', username: 'Lurrn', uuid: 'c7d8e9f0-a1b2-3456-0123-456789012306',
    region: 'NA', points: 186,
    tiers: { ltms: 'HT1', vanilla: 'LT2', uhc: 'LT1', pot: 'LT2', nethop: 'LT3', smp: 'LT2', sword: 'LT3', axe: '-', mace: 'LT1' }
  },
  {
    id: '10', username: 'SkyWarrior', uuid: 'd8e9f0a1-b2c3-4567-1234-567890123407',
    region: 'EU', points: 172,
    tiers: { ltms: 'LT1', vanilla: 'LT2', uhc: 'HT2', pot: 'LT3', nethop: 'LT2', smp: 'LT3', sword: 'LT2', axe: 'LT3', mace: 'LT2' }
  },
  {
    id: '11', username: 'xXProGamerXx', uuid: 'e9f0a1b2-c3d4-5678-2345-678901234508',
    region: 'NA', points: 158,
    tiers: { ltms: 'LT2', vanilla: 'LT3', uhc: 'LT2', pot: 'LT3', nethop: 'LT3', smp: 'LT2', sword: 'LT3', axe: 'LT2', mace: 'LT3' }
  },
  {
    id: '12', username: 'NinjaStrike', uuid: 'f0a1b2c3-d4e5-6789-3456-789012345609',
    region: 'AS', points: 143,
    tiers: { ltms: 'LT3', vanilla: 'LT4', uhc: 'LT3', pot: 'LT4', nethop: 'LT3', smp: 'LT4', sword: 'LT3', axe: 'LT4', mace: 'LT3' }
  },
  {
    id: '13', username: 'PvPLegend', uuid: 'a1b2c3d4-e5f6-7890-4567-890123456710',
    region: 'EU', points: 131,
    tiers: { ltms: 'LT3', vanilla: 'LT4', uhc: 'LT3', pot: 'LT4', nethop: 'LT4', smp: 'LT3', sword: 'LT4', axe: 'LT3', mace: 'LT4' }
  },
  {
    id: '14', username: 'DragonSlayer', uuid: 'b2c3d4e5-f6a7-8901-5678-901234567811',
    region: 'NA', points: 119,
    tiers: { ltms: 'LT4', vanilla: 'LT5', uhc: 'LT4', pot: 'LT5', nethop: 'LT4', smp: 'LT5', sword: 'LT4', axe: 'LT5', mace: 'LT4' }
  },
  {
    id: '15', username: 'StealthArcher', uuid: 'c3d4e5f6-a7b8-9012-6789-012345678912',
    region: 'EU', points: 105,
    tiers: { ltms: 'LT4', vanilla: 'LT5', uhc: 'LT4', pot: 'LT5', nethop: 'LT5', smp: 'LT4', sword: 'LT5', axe: 'LT4', mace: 'LT5' }
  },
];

export function getCategoryTiers(category: keyof PlayerTiers): { tier: TierLevel; players: Player[] }[] {
  const tierOrder: TierLevel[] = ['HT1', 'HT2', 'HT3', 'HT4', 'LT1', 'LT2', 'LT3', 'LT4', 'LT5'];
  const grouped: Record<string, Player[]> = {};
  for (const player of PLAYERS) {
    const tier = player.tiers[category];
    if (tier === '-') continue;
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(player);
  }
  return tierOrder
    .filter(t => grouped[t] && grouped[t].length > 0)
    .map(t => ({ tier: t, players: grouped[t] }));
}
