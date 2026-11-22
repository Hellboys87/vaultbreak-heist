// Deterministic scenes for the screenshots (?shot=start|play|end&seed=1).
// Each scene poses the real state objects — thief, guards, cameras, loot,
// alarm — exactly where a moment of play would put them, then lets the real
// vision maths decide who can see whom, so a staged frame never lies about
// the cones it shows. Every scene is a live gameplay frame: the whole
// museum, at least one guard cone, one camera cone, loot and the HUD.

import { CAMERA, GUARD } from './config.js';
import { insideVisionCone } from './world.js';
import { lootTotal } from './loot.js';
import { SCREEN_PLAY } from './render.js';

function poseGuard(guard, x, y, facing) {
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
  guard.dwell = 1;
}

function aimCamera(camera, facing) {
  camera.centreAngle = facing;
  camera.facing = facing;
  camera.phase = 0;
}

function settleVision(state) {
  for (const guard of state.guards) {
    guard.seesThief = insideVisionCone(
      guard, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, state.thief,
    );
  }
  for (const camera of state.cameras) {
    camera.seesThief = insideVisionCone(
      camera, camera.facing, CAMERA.visionRange, CAMERA.visionHalfAngle, state.thief,
    );
  }
  state.seenByGuard = state.guards.some((guard) => guard.seesThief);
  state.seenByCamera = state.cameras.some((camera) => camera.seesThief);
  state.lootValue = lootTotal(state.loot);
}

function takeNamed(state, names) {
  for (const item of state.loot) {
    if (names.includes(item.name)) item.taken = true;
  }
}

export function stageShotScene(name, state) {
  const [g1, g2, g3, g4] = state.guards;
  const [cam1, cam2, cam3, cam4] = state.cameras;

  if (name === 'play') {
    // Mid-heist: the thief has slipped into the vault and is closing on the
    // diamond while the vault guard's cone rakes across him.
    state.elapsed = 107;
    state.alarm = 58;
    takeNamed(state, ['Nocturne in Blue', 'Star Sapphire', 'Emerald Cluster', 'The Night Watchman', 'Bullion Crate']);
    state.thief.x = 872;
    state.thief.y = 296;
    state.thief.facing = 0.9;
    poseGuard(g1, 560, 470, Math.PI);
    poseGuard(g2, 620, 760, -Math.PI / 2);
    poseGuard(g3, 900, 620, 0.4);
    poseGuard(g4, 1058, 322, Math.PI);
    aimCamera(cam1, 0.7);
    aimCamera(cam2, 2.2);
    aimCamera(cam3, 2.45);
    aimCamera(cam4, -2.4);
  } else if (name === 'end') {
    // The escape: bag full of almost everything, alarm nearly maxed, the
    // thief is standing on the exit pad with a guard's cone on his heels.
    state.elapsed = 151;
    state.alarm = 86;
    takeNamed(state, [
      'Nocturne in Blue', 'Star Sapphire', 'Gold Ingots', 'Emerald Cluster',
      'The Night Watchman', 'Bullion Crate', 'Ruby Pendant', 'Meridian Diamond',
    ]);
    state.thief.x = 82;
    state.thief.y = 758;
    state.thief.facing = Math.PI;
    poseGuard(g1, 292, 690, Math.atan2(758 - 690, 82 - 292));
    poseGuard(g2, 560, 700, Math.PI / 2);
    poseGuard(g3, 1000, 560, -0.6);
    poseGuard(g4, 950, 250, 0.8);
    aimCamera(cam1, 1.15);
    aimCamera(cam2, 2.2);
    aimCamera(cam3, 2.5);
    aimCamera(cam4, -2.4);
  } else {
    // Opening moment: first steps across the entrance hall, a sapphire in
    // reach, the hall guard's cone sweeping down the room toward him.
    state.elapsed = 8;
    state.alarm = 10;
    state.thief.x = 232;
    state.thief.y = 606;
    state.thief.facing = -0.5;
    poseGuard(g1, 196, 452, Math.atan2(606 - 452, 232 - 196));
    poseGuard(g2, 520, 720, 0);
    poseGuard(g3, 900, 640, Math.PI);
    poseGuard(g4, 900, 200, 0.6);
    aimCamera(cam1, 0.85);
    aimCamera(cam2, 2.2);
    aimCamera(cam3, 2.5);
    aimCamera(cam4, -2.4);
  }

  settleVision(state);
  return { screen: SCREEN_PLAY, note: name === 'end' ? 'The diamond is in the bag — out!' : '' };
}
