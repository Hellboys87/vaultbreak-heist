// The Meridian Museum floor plan: outer walls, the dividing walls between
// its four rooms (with door gaps left as open floor), the escape pad, and
// the collision / line-of-sight geometry every other system shares.

import { VIEW } from './config.js';

function wall(x, y, width, height) {
  return { x, y, width, height };
}

/** Solid rectangles. Doorways are simply the gaps between wall segments. */
export const WALLS = [
  // Outer shell (the top edge sits under the HUD bar).
  wall(0, VIEW.hudHeight, VIEW.width, 16),
  wall(0, VIEW.height - 16, VIEW.width, 16),
  wall(0, VIEW.hudHeight, 16, VIEW.height - VIEW.hudHeight),
  wall(VIEW.width - 16, VIEW.hudHeight, 16, VIEW.height - VIEW.hudHeight),
  // Hall | Gallery divider at x=368, door gap y 404..468.
  wall(368, VIEW.hudHeight, 18, 340),
  wall(368, 468, 18, VIEW.height - 468),
  // Gallery | East wing divider at x=760, door gap y 296..360.
  wall(760, VIEW.hudHeight, 18, 232),
  wall(760, 360, 18, VIEW.height - 360),
  // Gallery split at y=560, door gap x 548..628.
  wall(386, 560, 162, 18),
  wall(628, 560, 132, 18),
  // Vault door wall at y=420 across the east wing, door gap x 912..976.
  wall(778, 420, 134, 18),
  wall(976, 420, 160, 18),
  // Display plinths the thief and guards must walk around.
  wall(150, 330, 90, 26),
  wall(500, 250, 110, 26),
  wall(880, 610, 120, 26),
  wall(120, 560, 26, 110),
];

/** Decorative room labels with the floor tint each room is painted in. */
export const ROOMS = [
  { name: 'ENTRANCE HALL', x: 16, y: VIEW.hudHeight, width: 352, height: VIEW.height - VIEW.hudHeight - 16, tint: 'hall' },
  { name: 'GRAND GALLERY', x: 386, y: VIEW.hudHeight, width: 374, height: 480, tint: 'gallery' },
  { name: 'SOUTH GALLERY', x: 386, y: 578, width: 374, height: VIEW.height - 578 - 16, tint: 'gallery' },
  { name: 'EAST WING', x: 778, y: 438, width: 358, height: VIEW.height - 438 - 16, tint: 'wing' },
  { name: 'THE VAULT', x: 778, y: VIEW.hudHeight, width: 358, height: 356, tint: 'vault' },
];

/** Where the thief gets out — only once the Meridian Diamond is in the bag. */
export const EXIT_PAD = { x: 40, y: 716, width: 84, height: 84 };

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

/** Push a circle out of every wall it overlaps; returns the corrected centre. */
export function resolveCircleCollisions(x, y, radius) {
  let cx = x;
  let cy = y;
  for (const rect of WALLS) {
    const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    const distSq = dx * dx + dy * dy;
    if (distSq >= radius * radius) continue;
    if (distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      cx = nearestX + (dx / dist) * radius;
      cy = nearestY + (dy / dist) * radius;
    } else {
      // Centre is inside the slab: leave by the shallowest side.
      const left = cx - rect.x;
      const right = rect.x + rect.width - cx;
      const top = cy - rect.y;
      const bottom = rect.y + rect.height - cy;
      const shallowest = Math.min(left, right, top, bottom);
      if (shallowest === left) cx = rect.x - radius;
      else if (shallowest === right) cx = rect.x + rect.width + radius;
      else if (shallowest === top) cy = rect.y - radius;
      else cy = rect.y + rect.height + radius;
    }
  }
  return { x: cx, y: cy };
}

function segmentTouchesRect(x1, y1, x2, y2, rect) {
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.width, rect.y],
    [rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height],
    [rect.x, rect.y + rect.height, rect.x, rect.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    const denom = (x2 - x1) * (by - ay) - (y2 - y1) * (bx - ax);
    if (denom === 0) continue;
    const t = ((ax - x1) * (by - ay) - (ay - y1) * (bx - ax)) / denom;
    const u = ((ax - x1) * (y2 - y1) - (ay - y1) * (x2 - x1)) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}

/** True when no wall blocks the straight line between two points. */
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const rect of WALLS) {
    if (segmentTouchesRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

/** Is the target inside a vision cone (range + half-angle + clear sight line)? */
export function insideVisionCone(origin, facing, range, halfAngle, target) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 1) return false;
  const angle = Math.atan2(dy, dx);
  let diff = angle - facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > halfAngle) return false;
  return hasLineOfSight(origin.x, origin.y, target.x, target.y);
}
