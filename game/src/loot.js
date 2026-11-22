// Everything worth stealing. Walking over a piece bags it. One piece — the
// Meridian Diamond in the vault — is the prize the exit pad demands; the
// rest is gravy that only raises the score (and the risk).

export const LOOT_GEM = 'gem';
export const LOOT_GOLD = 'gold';
export const LOOT_PAINTING = 'painting';
export const LOOT_DIAMOND = 'diamond';

const CATALOGUE = [
  { kind: LOOT_PAINTING, name: 'Nocturne in Blue', x: 110, y: 170, value: 3000 },
  { kind: LOOT_GEM, name: 'Star Sapphire', x: 205, y: 300, value: 1500 },
  { kind: LOOT_GOLD, name: 'Gold Ingots', x: 300, y: 700, value: 2000 },
  { kind: LOOT_GEM, name: 'Emerald Cluster', x: 600, y: 360, value: 1800 },
  { kind: LOOT_PAINTING, name: 'The Night Watchman', x: 455, y: 665, value: 2500 },
  { kind: LOOT_GOLD, name: 'Bullion Crate', x: 665, y: 795, value: 2200 },
  { kind: LOOT_GEM, name: 'Ruby Pendant', x: 960, y: 690, value: 1700 },
  { kind: LOOT_GOLD, name: 'Vault Reserve Bars', x: 855, y: 545, value: 2400 },
  { kind: LOOT_GEM, name: 'Opal Brooch', x: 845, y: 130, value: 2000 },
  { kind: LOOT_DIAMOND, name: 'Meridian Diamond', x: 960, y: 245, value: 10000 },
];

export function createLoot() {
  return CATALOGUE.map((item) => ({ ...item, taken: false }));
}

/** Bag every piece the thief is standing on; returns what was just taken. */
export function collectLootAt(loot, thief, radius) {
  const justTaken = [];
  for (const item of loot) {
    if (item.taken) continue;
    if (Math.hypot(item.x - thief.x, item.y - thief.y) <= radius + 16) {
      item.taken = true;
      justTaken.push(item);
    }
  }
  return justTaken;
}

export function lootTotal(loot) {
  return loot.reduce((sum, item) => sum + (item.taken ? item.value : 0), 0);
}

export function hasPrize(loot) {
  return loot.some((item) => item.kind === LOOT_DIAMOND && item.taken);
}
