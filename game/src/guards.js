// Museum guards: each walks a closed loop of waypoints, pauses a beat at
// every corner, and turns smoothly toward where he is heading. A guard who
// can see the thief is flagged each tick so the alarm system can react.

import { GUARD } from './config.js';
import { insideVisionCone, resolveCircleCollisions } from './world.js';

const PATROLS = [
  // Hall and grand gallery loop.
  [{ x: 190, y: 210 }, { x: 560, y: 210 }, { x: 560, y: 470 }, { x: 190, y: 470 }],
  // South gallery sweep.
  [{ x: 480, y: 700 }, { x: 690, y: 700 }, { x: 690, y: 800 }, { x: 480, y: 800 }],
  // East wing rounds.
  [{ x: 850, y: 700 }, { x: 1050, y: 700 }, { x: 1050, y: 500 }, { x: 850, y: 500 }],
  // The vault's own guard, the one who matters most.
  [{ x: 845, y: 170 }, { x: 1055, y: 170 }, { x: 1055, y: 330 }, { x: 845, y: 330 }],
];

export function createGuards(random) {
  return PATROLS.map((route, index) => {
    const start = route[0];
    return {
      route,
      waypoint: 1 % route.length,
      x: start.x,
      y: start.y,
      facing: Math.atan2(route[1].y - start.y, route[1].x - start.x),
      dwell: 0,
      seesThief: false,
      speedJitter: random.between(0.9, 1.1),
      label: `G${index + 1}`,
    };
  });
}

function turnToward(guard, wanted, dt) {
  let diff = wanted - guard.facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const maxTurn = 3.4 * dt;
  guard.facing += Math.max(-maxTurn, Math.min(maxTurn, diff));
}

export function updateGuards(guards, thief, dt) {
  let anySees = false;
  for (const guard of guards) {
    if (guard.dwell > 0) {
      guard.dwell -= dt;
    } else {
      const target = guard.route[guard.waypoint];
      const dx = target.x - guard.x;
      const dy = target.y - guard.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) {
        guard.waypoint = (guard.waypoint + 1) % guard.route.length;
        guard.dwell = GUARD.dwellSeconds;
      } else {
        turnToward(guard, Math.atan2(dy, dx), dt);
        const step = GUARD.patrolSpeed * guard.speedJitter * dt;
        const moved = resolveCircleCollisions(
          guard.x + Math.cos(guard.facing) * Math.min(step, dist),
          guard.y + Math.sin(guard.facing) * Math.min(step, dist),
          GUARD.radius,
        );
        guard.x = moved.x;
        guard.y = moved.y;
      }
    }
    guard.seesThief = insideVisionCone(guard, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, thief);
    if (guard.seesThief) anySees = true;
  }
  return anySees;
}
