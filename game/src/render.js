// Canvas painting for VAULTBREAK. Everything is flat shapes drawn from the
// state: floors and walls, vision cones under the actors, loot that glints,
// and the HUD bar (loot, alarm meter, timer) that never leaves the top.

import { COLOURS, FONT_STACK, PRIZE_NAME, VIEW } from './config.js';
import { EXIT_PAD, ROOMS, WALLS } from './world.js';
import { LOOT_DIAMOND, LOOT_GEM, LOOT_GOLD, LOOT_PAINTING, hasPrize } from './loot.js';
import { formatClock } from './heist.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_ESCAPED = 'escaped';

const ROOM_TINTS = {
  hall: COLOURS.floorHall,
  gallery: COLOURS.floorGallery,
  wing: COLOURS.floorVaultWing,
  vault: COLOURS.floorVault,
};

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;

  function cone(origin, facing, range, halfAngle, fill) {
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.arc(origin.x, origin.y, range, facing - halfAngle, facing + halfAngle);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawFloor() {
    ctx.fillStyle = COLOURS.night;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    for (const room of ROOMS) {
      ctx.fillStyle = ROOM_TINTS[room.tint];
      ctx.fillRect(room.x, room.y, room.width, room.height);
      ctx.strokeStyle = COLOURS.tileLine;
      ctx.lineWidth = 1;
      for (let gx = room.x + 44; gx < room.x + room.width; gx += 44) {
        ctx.beginPath(); ctx.moveTo(gx, room.y); ctx.lineTo(gx, room.y + room.height); ctx.stroke();
      }
      for (let gy = room.y + 44; gy < room.y + room.height; gy += 44) {
        ctx.beginPath(); ctx.moveTo(room.x, gy); ctx.lineTo(room.x + room.width, gy); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(238,241,248,0.20)';
      ctx.font = `600 13px ${FONT_STACK}`;
      ctx.textAlign = 'left';
      ctx.fillText(room.name, room.x + 14, room.y + 24);
    }
  }

  function drawExit(state) {
    const unlocked = hasPrize(state.loot);
    ctx.fillStyle = unlocked ? COLOURS.exitPad : COLOURS.exitPadLocked;
    ctx.fillRect(EXIT_PAD.x, EXIT_PAD.y, EXIT_PAD.width, EXIT_PAD.height);
    ctx.strokeStyle = unlocked ? '#7dffb0' : '#a97c50';
    ctx.lineWidth = 3;
    ctx.strokeRect(EXIT_PAD.x + 3, EXIT_PAD.y + 3, EXIT_PAD.width - 6, EXIT_PAD.height - 6);
    ctx.fillStyle = COLOURS.text;
    ctx.font = `700 15px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', EXIT_PAD.x + EXIT_PAD.width / 2, EXIT_PAD.y + 36);
    ctx.font = `11px ${FONT_STACK}`;
    ctx.fillText(unlocked ? 'GET OUT!' : 'NEEDS THE', EXIT_PAD.x + EXIT_PAD.width / 2, EXIT_PAD.y + 56);
    if (!unlocked) ctx.fillText('DIAMOND', EXIT_PAD.x + EXIT_PAD.width / 2, EXIT_PAD.y + 70);
  }

  function drawWalls() {
    for (const rect of WALLS) {
      ctx.fillStyle = COLOURS.wall;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeStyle = COLOURS.wallEdge;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
    }
  }

  function drawLootItem(item) {
    if (item.taken) return;
    const { x, y } = item;
    ctx.save();
    if (item.kind === LOOT_GEM || item.kind === LOOT_DIAMOND) {
      const r = item.kind === LOOT_DIAMOND ? 17 : 11;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      ctx.fillStyle = item.kind === LOOT_DIAMOND ? COLOURS.diamond : COLOURS.gem;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (item.kind === LOOT_DIAMOND) {
        ctx.beginPath();
        ctx.arc(x, y, 26 + Math.sin(performance.now() / 300) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(174,252,255,0.5)';
        ctx.stroke();
      }
    } else if (item.kind === LOOT_GOLD) {
      ctx.fillStyle = COLOURS.gold;
      ctx.fillRect(x - 14, y - 4, 26, 9);
      ctx.fillRect(x - 11, y - 13, 26, 9);
      ctx.strokeStyle = '#8a6414';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 14, y - 4, 26, 9);
      ctx.strokeRect(x - 11, y - 13, 26, 9);
    } else if (item.kind === LOOT_PAINTING) {
      ctx.fillStyle = '#5a4020';
      ctx.fillRect(x - 17, y - 13, 34, 26);
      ctx.fillStyle = COLOURS.painting;
      ctx.fillRect(x - 13, y - 9, 26, 18);
      ctx.beginPath();
      ctx.arc(x - 4, y - 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2c2140';
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(238,241,248,0.75)';
    ctx.font = `10px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.fillText(`$${item.value.toLocaleString('en-US')}`, x, y + 30);
  }

  function drawThief(thief) {
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.thiefShade;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.thief;
    ctx.fill();
    const noseX = thief.x + Math.cos(thief.facing) * 13;
    const noseY = thief.y + Math.sin(thief.facing) * 13;
    ctx.beginPath();
    ctx.arc(noseX, noseY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#062a28';
    ctx.fill();
    // The loot bag on his back.
    ctx.beginPath();
    ctx.arc(thief.x - Math.cos(thief.facing) * 10, thief.y - Math.sin(thief.facing) * 10, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#8a6d2f';
    ctx.fill();
  }

  function drawGuard(guard) {
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.guardShade;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 10.5, 0, Math.PI * 2);
    ctx.fillStyle = COLOURS.guard;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.facing) * 12, guard.y + Math.sin(guard.facing) * 12, 4, 0, Math.PI * 2);
    ctx.fillStyle = guard.seesThief ? '#ffffff' : '#3d0d0d';
    ctx.fill();
    if (guard.seesThief) {
      ctx.fillStyle = '#ff4747';
      ctx.font = `800 20px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 22);
    }
  }

  function drawCamera(camera) {
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.rotate(camera.facing);
    ctx.fillStyle = COLOURS.cameraBody;
    ctx.fillRect(-4, -4, 16, 8);
    ctx.fillStyle = camera.seesThief ? '#ff4747' : '#20242f';
    ctx.beginPath();
    ctx.arc(13, 0, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#59637c';
    ctx.fill();
  }

  function drawHud(state) {
    ctx.fillStyle = COLOURS.hud;
    ctx.fillRect(0, 0, VIEW.width, VIEW.hudHeight);
    ctx.fillStyle = COLOURS.hudLine;
    ctx.fillRect(0, VIEW.hudHeight - 2, VIEW.width, 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = COLOURS.text;
    ctx.font = `800 21px ${FONT_STACK}`;
    ctx.fillText('VAULTBREAK', 18, 40);
    ctx.font = `600 15px ${FONT_STACK}`;
    ctx.fillStyle = COLOURS.gold;
    ctx.fillText(`LOOT  $${state.lootValue.toLocaleString('en-US')}`, 218, 40);
    // Alarm meter: the heart of the HUD.
    ctx.fillStyle = COLOURS.muted;
    ctx.font = `700 13px ${FONT_STACK}`;
    ctx.fillText('ALARM', 470, 40);
    ctx.fillStyle = COLOURS.alarmTrack;
    ctx.fillRect(528, 22, 240, 20);
    const fillWidth = (state.alarm / 100) * 240;
    ctx.fillStyle = state.alarm > 55 ? COLOURS.alarmFill : COLOURS.alarmMid;
    ctx.fillRect(528, 22, fillWidth, 20);
    ctx.strokeStyle = COLOURS.hudLine;
    ctx.strokeRect(528.5, 22.5, 240, 20);
    if (state.seenByGuard || state.seenByCamera) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = `800 13px ${FONT_STACK}`;
      ctx.fillText(state.seenByGuard ? 'SPOTTED BY GUARD!' : 'ON CAMERA!', 782, 40);
    } else {
      ctx.fillStyle = COLOURS.muted;
      ctx.font = `600 13px ${FONT_STACK}`;
      ctx.fillText(hasPrize(state.loot) ? 'Diamond bagged — reach the EXIT' : `Objective: steal the ${PRIZE_NAME}`, 782, 40);
    }
    ctx.fillStyle = COLOURS.text;
    ctx.font = `700 16px ${FONT_STACK}`;
    ctx.textAlign = 'right';
    ctx.fillText(formatClock(state.elapsed), VIEW.width - 18, 40);
    ctx.textAlign = 'left';
  }

  function banner(title, subtitle, accent) {
    ctx.fillStyle = 'rgba(5,7,13,0.62)';
    ctx.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
    ctx.textAlign = 'center';
    ctx.fillStyle = accent;
    ctx.font = `800 52px ${FONT_STACK}`;
    ctx.fillText(title, VIEW.width / 2, 420);
    ctx.fillStyle = COLOURS.text;
    ctx.font = `500 21px ${FONT_STACK}`;
    const lines = subtitle.split('\n');
    lines.forEach((line, index) => ctx.fillText(line, VIEW.width / 2, 462 + index * 30));
    ctx.textAlign = 'left';
  }

  function draw(state, screen, bestLoot, note = '') {
    drawFloor();
    drawExit(state);
    // Cones first, under everything that walks.
    for (const camera of state.cameras) {
      cone(camera, camera.facing, 196, 0.46, camera.seesThief ? COLOURS.coneCameraHot : COLOURS.coneCamera);
    }
    for (const guard of state.guards) {
      cone(guard, guard.facing, 218, 0.62, guard.seesThief ? COLOURS.coneGuardHot : COLOURS.coneGuard);
    }
    for (const item of state.loot) drawLootItem(item);
    drawWalls();
    for (const camera of state.cameras) drawCamera(camera);
    for (const guard of state.guards) drawGuard(guard);
    drawThief(state.thief);
    drawHud(state);
    if (note) {
      ctx.fillStyle = 'rgba(10,12,20,0.82)';
      ctx.fillRect(VIEW.width / 2 - 210, VIEW.height - 52, 420, 34);
      ctx.fillStyle = COLOURS.gold;
      ctx.font = `600 15px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.fillText(note, VIEW.width / 2, VIEW.height - 30);
      ctx.textAlign = 'left';
    }
    if (screen === SCREEN_TITLE) {
      banner('VAULTBREAK', 'The Meridian Job — one thief, one diamond, four guards.\nSneak with WASD or the arrow keys. Grab loot by walking over it.\nStay out of the cones: being seen fills the ALARM meter.\nPress Enter or click to start.', COLOURS.diamond);
    } else if (screen === SCREEN_CAUGHT) {
      banner('CAUGHT!', `The alarm hit full and the guards closed in.\nLoot grabbed: $${state.lootValue.toLocaleString('en-US')} · Best: $${bestLoot.toLocaleString('en-US')}\nPress R or click to try the job again.`, COLOURS.alarmFill);
    } else if (screen === SCREEN_ESCAPED) {
      banner('CLEAN GETAWAY!', `Out the door with $${state.lootValue.toLocaleString('en-US')} in ${formatClock(state.elapsed)}.\nBest haul: $${bestLoot.toLocaleString('en-US')}\nPress R or click to run it again.`, '#7dffb0');
    }
  }

  return { draw };
}
