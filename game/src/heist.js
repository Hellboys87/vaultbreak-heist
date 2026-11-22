// The heist itself: one state object, one fixed-step update. Movement,
// pickups, the alarm economy (guards shout louder than cameras, and the
// meter cools when nobody is watching) and the two ways a night can end —
// caught at a full meter, or out the door with the diamond.

import { ALARM, THIEF } from './config.js';
import { EXIT_PAD, pointInRect, resolveCircleCollisions } from './world.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { collectLootAt, createLoot, hasPrize, lootTotal } from './loot.js';

export const EVENT_CAUGHT = 1;
export const EVENT_ESCAPED = 2;
export const EVENT_TOOK_LOOT = 4;

export function createHeist(random) {
  const state = {
    thief: { x: THIEF.startX, y: THIEF.startY, facing: -Math.PI / 2, moving: false },
    guards: createGuards(random),
    cameras: createCameras(random),
    loot: createLoot(),
    alarm: 0,
    elapsed: 0,
    lootValue: 0,
    lastTakenName: '',
    seenByGuard: false,
    seenByCamera: false,
  };
  return state;
}

export function resetHeist(state, random) {
  const fresh = createHeist(random);
  state.thief = fresh.thief;
  state.guards = fresh.guards;
  state.cameras = fresh.cameras;
  state.loot = fresh.loot;
  state.alarm = 0;
  state.elapsed = 0;
  state.lootValue = 0;
  state.lastTakenName = '';
  state.seenByGuard = false;
  state.seenByCamera = false;
}

export function updateHeist(state, direction, dt) {
  let events = 0;
  state.elapsed += dt;

  // Thief movement, normalised so diagonals are not a speed cheat.
  const length = Math.hypot(direction.x, direction.y);
  state.thief.moving = length > 0;
  if (length > 0) {
    const nx = direction.x / length;
    const ny = direction.y / length;
    state.thief.facing = Math.atan2(ny, nx);
    const moved = resolveCircleCollisions(
      state.thief.x + nx * THIEF.walkSpeed * dt,
      state.thief.y + ny * THIEF.walkSpeed * dt,
      THIEF.radius,
    );
    state.thief.x = moved.x;
    state.thief.y = moved.y;
  }

  const taken = collectLootAt(state.loot, state.thief, THIEF.radius);
  if (taken.length > 0) {
    state.lootValue = lootTotal(state.loot);
    state.lastTakenName = taken[taken.length - 1].name;
    events |= EVENT_TOOK_LOOT;
  }

  state.seenByGuard = updateGuards(state.guards, state.thief, dt);
  state.seenByCamera = updateCameras(state.cameras, state.thief, state.elapsed, dt);

  if (state.seenByGuard) state.alarm += ALARM.guardRate * dt;
  else if (state.seenByCamera) state.alarm += ALARM.cameraRate * dt;
  else state.alarm -= ALARM.decayRate * dt;
  state.alarm = Math.max(0, Math.min(ALARM.max, state.alarm));

  if (state.alarm >= ALARM.max) {
    events |= EVENT_CAUGHT;
    return events;
  }

  if (hasPrize(state.loot) && pointInRect(state.thief.x, state.thief.y, EXIT_PAD)) {
    events |= EVENT_ESCAPED;
  }
  return events;
}

export function formatClock(totalSeconds) {
  const whole = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
