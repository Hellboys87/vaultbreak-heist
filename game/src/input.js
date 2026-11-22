// Keyboard and pointer input. Movement keys are held state; start and
// restart are one-shot actions the main loop drains once per frame.

export const ACTION_START = 1;
export const ACTION_RESTART = 2;

const MOVE_KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export function createInput(canvas) {
  const held = { up: false, down: false, left: false, right: false };
  let pending = 0;

  window.addEventListener('keydown', (event) => {
    const move = MOVE_KEYS[event.code];
    if (move) {
      held[move] = true;
      event.preventDefault();
    } else if (event.code === 'Enter' || event.code === 'Space') {
      pending |= ACTION_START;
      event.preventDefault();
    } else if (event.code === 'KeyR') {
      pending |= ACTION_RESTART;
    }
  });
  window.addEventListener('keyup', (event) => {
    const move = MOVE_KEYS[event.code];
    if (move) held[move] = false;
  });
  canvas.addEventListener('pointerdown', () => {
    pending |= ACTION_START | ACTION_RESTART;
  });

  return {
    /** Unit-ish direction from the held keys; diagonals are normalised by the caller. */
    direction() {
      return {
        x: (held.right ? 1 : 0) - (held.left ? 1 : 0),
        y: (held.down ? 1 : 0) - (held.up ? 1 : 0),
      };
    },
    takeActions() {
      const taken = pending;
      pending = 0;
      return taken;
    },
  };
}
