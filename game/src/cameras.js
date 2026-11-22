// Fixed security cameras. Each is bolted to a wall point and sweeps its
// lens back and forth on a sine, out of phase with the others, so a patient
// thief can time a dash through the gap in the sweep.

import { CAMERA } from './config.js';
import { insideVisionCone } from './world.js';

const MOUNTS = [
  { x: 44, y: 104, centreAngle: 0.7, name: 'CAM 1 · HALL' },
  { x: 736, y: 104, centreAngle: 2.2, name: 'CAM 2 · GALLERY' },
  { x: 1108, y: 104, centreAngle: 2.5, name: 'CAM 3 · VAULT' },
  { x: 1108, y: 812, centreAngle: -2.4, name: 'CAM 4 · EAST' },
];

export function createCameras(random) {
  return MOUNTS.map((mount) => ({
    ...mount,
    phase: random.between(0, Math.PI * 2),
    facing: mount.centreAngle,
    seesThief: false,
  }));
}

export function updateCameras(cameras, thief, elapsed, dt) {
  let anySees = false;
  for (const camera of cameras) {
    camera.facing = camera.centreAngle
      + Math.sin(elapsed * CAMERA.sweepSpeed + camera.phase) * CAMERA.sweepAmplitude;
    camera.seesThief = insideVisionCone(
      camera, camera.facing, CAMERA.visionRange, CAMERA.visionHalfAngle, thief,
    );
    if (camera.seesThief) anySees = true;
  }
  return anySees;
}
