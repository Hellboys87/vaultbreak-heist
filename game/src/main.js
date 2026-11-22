// VAULTBREAK boot and game loop. Fixed-step simulation, four screens
// (title, play, caught, escaped), best haul kept in local storage, and the
// ?shot= staging hook the screenshots are taken through: it poses one
// deterministic scene, paints it twice and raises window.__shotReady.

import { BEST_KEY, TICK } from './config.js';
import { createSeededRandom } from './random.js';
import { createHeist, resetHeist, updateHeist, EVENT_CAUGHT, EVENT_ESCAPED } from './heist.js';
import { ACTION_RESTART, ACTION_START, createInput } from './input.js';
import { createRenderer, SCREEN_CAUGHT, SCREEN_ESCAPED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShotScene } from './shots.js';

const MAX_FRAME_SECONDS = 0.25;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261122;

const canvas = document.getElementById('game');
const statusLine = document.getElementById('status');
const random = createSeededRandom(seed);
const state = createHeist(random);
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private windows may refuse storage; the best haul then lasts a visit.
  }
}

if (shotName) {
  const scene = stageShotScene(shotName, state);
  let painted = 0;
  const paintShot = () => {
    renderer.draw(state, scene.screen, readBest(), scene.note);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paintShot);
    else window.__shotReady = true;
  };
  requestAnimationFrame(paintShot);
} else {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let lastStamp = performance.now();

  function announce(message) {
    statusLine.textContent = message;
  }

  function beginJob() {
    resetHeist(state, createSeededRandom(Math.floor(Math.random() * 4294967296)));
    screen = SCREEN_PLAY;
    announce('The heist is on. Steal the Meridian Diamond and reach the exit.');
  }

  function finishJob(escaped) {
    screen = escaped ? SCREEN_ESCAPED : SCREEN_CAUGHT;
    if (state.lootValue > best) {
      best = state.lootValue;
      saveBest(best);
    }
    announce(escaped
      ? `Clean getaway with $${state.lootValue}.`
      : `Caught. Loot grabbed: $${state.lootValue}.`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - lastStamp) / 1000, MAX_FRAME_SECONDS);
    lastStamp = now;

    const actions = input.takeActions();
    if (screen === SCREEN_TITLE && (actions & ACTION_START)) beginJob();
    else if ((screen === SCREEN_CAUGHT || screen === SCREEN_ESCAPED) && (actions & (ACTION_START | ACTION_RESTART))) beginJob();
    else if (screen === SCREEN_PLAY && (actions & ACTION_RESTART)) beginJob();

    if (screen === SCREEN_PLAY) {
      while (accumulator >= TICK && screen === SCREEN_PLAY) {
        const events = updateHeist(state, input.direction(), TICK);
        accumulator -= TICK;
        if (events & EVENT_CAUGHT) finishJob(false);
        else if (events & EVENT_ESCAPED) finishJob(true);
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    lastStamp = performance.now();
  });

  announce('VAULTBREAK. Press Enter or click to start the heist.');
  requestAnimationFrame(frame);
}
