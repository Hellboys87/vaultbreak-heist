// A tiny seeded random generator (mulberry-style mixing) so a given seed
// always deals the same guard jitter and camera phases, which is what makes
// the staged screenshots reproducible.

export function createSeededRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  function nextFloat() {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  }
  return {
    nextFloat,
    between(low, high) {
      return low + (high - low) * nextFloat();
    },
    pickIndex(count) {
      return Math.floor(nextFloat() * count) % count;
    },
  };
}
