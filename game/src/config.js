// VAULTBREAK tuning: every size, speed and colour the rest of the game reads.
// The museum is one fixed logical floor plan; the renderer letterboxes it
// into whatever window it is given, so gameplay never depends on pixels.

export const VIEW = { width: 1152, height: 864, hudHeight: 64 };

export const TICK = 1 / 60;

export const THIEF = {
  radius: 15,
  walkSpeed: 212,
  startX: 258,
  startY: 756,
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 86,
  visionRange: 218,
  visionHalfAngle: 0.62,
  dwellSeconds: 0.7,
};

export const CAMERA = {
  visionRange: 196,
  visionHalfAngle: 0.46,
  sweepAmplitude: 0.85,
  sweepSpeed: 0.55,
};

export const ALARM = {
  max: 100,
  guardRate: 58,
  cameraRate: 42,
  decayRate: 9,
};

export const PRIZE_NAME = 'Meridian Diamond';

export const COLOURS = {
  night: '#0b0e16',
  hud: '#12172a',
  hudLine: '#2b3557',
  floorHall: '#232838',
  floorGallery: '#2a2438',
  floorVaultWing: '#24303a',
  floorVault: '#33291d',
  tileLine: 'rgba(255,255,255,0.045)',
  wall: '#0d101c',
  wallEdge: '#4a5578',
  doorMat: '#3d4b3a',
  exitPad: '#1f6f4a',
  exitPadLocked: '#5a3d2e',
  thief: '#39d0c4',
  thiefShade: '#167a72',
  guard: '#d84b4b',
  guardShade: '#7e2424',
  cameraBody: '#cfd6e4',
  coneGuard: 'rgba(255,196,64,0.20)',
  coneGuardHot: 'rgba(255,64,48,0.32)',
  coneCamera: 'rgba(96,190,255,0.16)',
  coneCameraHot: 'rgba(255,64,48,0.30)',
  gem: '#62e6ff',
  gold: '#f4c542',
  painting: '#c792ff',
  diamond: '#aefcff',
  text: '#eef1f8',
  muted: '#93a0bb',
  alarmTrack: '#2a2030',
  alarmFill: '#ff4747',
  alarmMid: '#ffb347',
};

export const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const BEST_KEY = 'vaultbreak.best-loot';
