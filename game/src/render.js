// Gelato Giardino — all canvas drawing for the garden gelato stand.
// Palette: pistachio green, gelato cream, rose pink. Everything is drawn
// with code: the striped awning, the order board, the glass gelato case,
// the cone rack, the topping jars, the assembly plate and the serving pass.

import { FLAVORS, CONES, TOPPINGS, flavorById, coneById, toppingById } from './recipes.js';

export const W = 1280;
export const H = 800;

// Clickable regions, shared with input.js so what you see is what you hit.
export function hitRegions() {
  const regions = [];
  CONES.forEach((cone, i) => {
    regions.push({ kind: 'cone', id: cone.id, x: 36 + i * 148, y: 318, w: 132, h: 128 });
  });
  TOPPINGS.forEach((top, i) => {
    regions.push({ kind: 'topping', id: top.id, x: 500 + i * 108, y: 318, w: 96, h: 128 });
  });
  FLAVORS.forEach((flavor, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    regions.push({ kind: 'flavor', id: flavor.id, x: 36 + col * 296, y: 486 + row * 108, w: 280, h: 96 });
  });
  regions.push({ kind: 'serve', id: 'serve', x: 952, y: 668, w: 176, h: 64 });
  regions.push({ kind: 'trash', id: 'trash', x: 1144, y: 668, w: 112, h: 64 });
  regions.push({ kind: 'restart', id: 'restart', x: 490, y: 520, w: 300, h: 72 });
  return regions;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px Georgia, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One gelato scoop: a round dome with a scalloped lower edge and a drip.
function drawScoop(ctx, cx, cy, r, flavor) {
  ctx.fillStyle = flavor.color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.95, Math.PI * 2.05);
  const bumps = 5;
  for (let i = 0; i <= bumps; i++) {
    const bx = cx - r + (2 * r * i) / bumps;
    ctx.arc(bx, cy + r * 0.28, r * 0.22, Math.PI, 0, true);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = flavor.dark;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.16, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawToppingMark(ctx, cx, cy, toppingId) {
  if (!toppingId) return;
  const top = toppingById(toppingId);
  if (toppingId === 'cherry') {
    ctx.strokeStyle = '#4a7c3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 16);
    ctx.quadraticCurveTo(cx + 14, cy - 30, cx + 24, cy - 30);
    ctx.stroke();
    ctx.fillStyle = top.color;
    ctx.beginPath(); ctx.arc(cx, cy - 8, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(cx - 4, cy - 12, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (toppingId === 'wafer') {
    ctx.save();
    ctx.translate(cx + 16, cy - 18);
    ctx.rotate(0.5);
    ctx.fillStyle = top.color;
    ctx.fillRect(-5, -26, 10, 52);
    ctx.strokeStyle = '#b98d45';
    ctx.lineWidth = 1.5;
    for (let i = -20; i < 26; i += 9) {
      ctx.beginPath(); ctx.moveTo(-5, i); ctx.lineTo(5, i + 6); ctx.stroke();
    }
    ctx.restore();
  } else if (toppingId === 'nuts') {
    ctx.fillStyle = top.color;
    for (const [dx, dy] of [[-14, -6], [0, -12], [13, -5], [-7, 2], [8, 3]]) {
      ctx.beginPath(); ctx.ellipse(cx + dx, cy + dy, 5, 3, dx, 0, Math.PI * 2); ctx.fill();
    }
  } else if (toppingId === 'petals') {
    ctx.fillStyle = top.color;
    for (const [dx, dy, a] of [[-13, -8, 0.6], [2, -14, -0.4], [13, -6, 1.2], [-4, -2, 2.2]]) {
      ctx.save();
      ctx.translate(cx + dx, cy + dy);
      ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
}

// A full dish: cone or cup with its scoop stack and topping, drawn standing
// on a baseline y. Used for the assembly plate and the serving pass.
export function drawDish(ctx, cx, baseY, dish, scale = 1) {
  const cone = dish.cone ? coneById(dish.cone) : null;
  if (!cone) {
    text(ctx, 'empty plate', cx, baseY - 30 * scale, 15 * scale, '#9a8a76', 'center');
    return;
  }
  const topY = baseY - 118 * scale;
  if (cone.id === 'cup') {
    ctx.fillStyle = cone.color;
    ctx.beginPath();
    ctx.moveTo(cx - 40 * scale, topY);
    ctx.lineTo(cx + 40 * scale, topY);
    ctx.lineTo(cx + 30 * scale, baseY);
    ctx.lineTo(cx - 30 * scale, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = cone.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = cone.dark;
    ctx.fillRect(cx - 40 * scale, topY - 5 * scale, 80 * scale, 7 * scale);
  } else {
    ctx.fillStyle = cone.color;
    ctx.beginPath();
    ctx.moveTo(cx - 38 * scale, topY);
    ctx.lineTo(cx + 38 * scale, topY);
    ctx.lineTo(cx, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = cone.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (cone.id === 'waffle') {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(120,72,28,0.55)';
      ctx.lineWidth = 2;
      for (let i = -4; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 16 * scale - 30 * scale, topY);
        ctx.lineTo(cx + i * 16 * scale + 30 * scale, baseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + i * 16 * scale + 30 * scale, topY);
        ctx.lineTo(cx + i * 16 * scale - 30 * scale, baseY);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  const r = 34 * scale;
  dish.scoops.forEach((flavorId, i) => {
    const cy = topY - r * 0.55 - i * r * 1.05;
    drawScoop(ctx, cx, cy, r, flavorById(flavorId));
  });
  if (dish.scoops.length > 0) {
    const topCy = topY - r * 0.55 - (dish.scoops.length - 1) * r * 1.05;
    drawToppingMark(ctx, cx, topCy - r * 0.55, dish.topping);
  }
}

// One order ticket on the board: dish name, cone, scoop dots bottom-first,
// topping name, and the patience bar draining underneath.
function drawTicket(ctx, x, y, w, ticket) {
  rr(ctx, x, y, w, 128, 10);
  ctx.fillStyle = '#fffdf6';
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, ticket.name, x + 12, y + 20, 17, '#4a3520', 'left', true);
  text(ctx, coneById(ticket.cone).name, x + 12, y + 44, 13, '#8a6f4d');
  ticket.scoops.forEach((flavorId, i) => {
    const f = flavorById(flavorId);
    const cx = x + 22 + i * 30;
    ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.arc(cx, y + 72, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = f.dark; ctx.lineWidth = 1.5; ctx.stroke();
    text(ctx, String(i + 1), cx, y + 73, 10, '#4a3520', 'center', true);
  });
  const topLabel = ticket.topping ? toppingById(ticket.topping).name : 'no topping';
  text(ctx, topLabel, x + 12, y + 98, 13, '#b0526e', 'left', true);
  const frac = Math.max(0, ticket.patience / ticket.patienceMax);
  rr(ctx, x + 110, y + 90, w - 122, 14, 7);
  ctx.fillStyle = '#e8dcc4';
  ctx.fill();
  rr(ctx, x + 110, y + 90, Math.max(14, (w - 122) * frac), 14, 7);
  ctx.fillStyle = frac > 0.45 ? '#7fa653' : frac > 0.22 ? '#e0a83e' : '#d9534f';
  ctx.fill();
}

function drawAwning(ctx) {
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#d96c85' : '#fdf6ec';
    ctx.fillRect(i * 80, 64, 80, 34);
    ctx.beginPath();
    ctx.arc(i * 80 + 40, 98, 26, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = '#7fa653';
  ctx.fillRect(0, 60, W, 6);
}

function drawCase(ctx, state) {
  rr(ctx, 24, 470, 912, 224, 14);
  ctx.fillStyle = '#eaf3e2';
  ctx.fill();
  ctx.strokeStyle = '#7fa653';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'GELATO CASE — click a tub to scoop (keys 1–6)', 44, 462 - 6, 15, '#4a6335', 'left', true);
  FLAVORS.forEach((flavor, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 36 + col * 296;
    const y = 486 + row * 108;
    rr(ctx, x, y, 280, 96, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = flavor.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = flavor.color;
    ctx.beginPath();
    ctx.ellipse(x + 62, y + 48, 46, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = flavor.dark;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + 46, y + 38, 18, 9, -0.4, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, flavor.name, x + 122, y + 38, 19, '#4a3520', 'left', true);
    text(ctx, `key ${flavor.key}`, x + 122, y + 64, 13, '#8a6f4d');
    if (state.scoopJob && state.scoopJob.flavor === flavor.id) {
      const frac = state.scoopJob.t / state.scoopJob.dur;
      rr(ctx, x + 122, y + 76, 140, 10, 5);
      ctx.fillStyle = '#e8dcc4'; ctx.fill();
      rr(ctx, x + 122, y + 76, 140 * frac, 10, 5);
      ctx.fillStyle = '#d96c85'; ctx.fill();
      text(ctx, 'scooping…', x + 268, y + 22, 12, '#b0526e', 'right', true);
    }
  });
}

// The whole scene. `banner` shows the big title ribbon (cover shots, start).
export function draw(ctx, state, banner = false) {
  // Garden backdrop: cream wall, lawn strip, flower pots.
  ctx.fillStyle = '#fdf6ec';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#dcebc9';
  ctx.fillRect(0, 700, W, 100);
  ctx.fillStyle = '#c4dba6';
  for (let x = 10; x < W; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 800);
    ctx.lineTo(x + 8, 762);
    ctx.lineTo(x + 16, 800);
    ctx.fill();
  }

  // Top bar: stand name, shift clock, coins, strikes.
  ctx.fillStyle = '#44603c';
  ctx.fillRect(0, 0, W, 60);
  text(ctx, 'GELATO GIARDINO', 24, 30, 26, '#fdf6ec', 'left', true);
  const mm = Math.floor(Math.max(0, state.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, state.timeLeft) % 60);
  text(ctx, `SHIFT ${mm}:${String(ss).padStart(2, '0')}`, 640, 30, 26, state.timeLeft < 30 ? '#ffb3a0' : '#ffe9a8', 'center', true);
  text(ctx, `Coins ${state.coins}`, 1010, 30, 22, '#fdf6ec', 'center', true);
  text(ctx, `Served ${state.served}`, 1150, 30, 22, '#fdf6ec', 'center', true);
  text(ctx, `✖ ${state.strikes}/3`, 1248, 30, 20, '#ffb3a0', 'right', true);
  drawAwning(ctx);

  // Order board.
  text(ctx, 'ORDER BOARD', 36, 128, 16, '#4a6335', 'left', true);
  if (state.tickets.length === 0) {
    text(ctx, 'no guests yet — the garden gate is open…', 36, 168, 16, '#9a8a76');
  }
  state.tickets.forEach((ticket, i) => {
    drawTicket(ctx, 36 + i * 308, 142, 292, ticket);
  });

  // Cone rack.
  text(ctx, 'CONES (Q/W/E)', 36, 300, 15, '#4a6335', 'left', true);
  CONES.forEach((cone, i) => {
    const x = 36 + i * 148;
    rr(ctx, x, 318, 132, 128, 10);
    ctx.fillStyle = '#fffdf6'; ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2; ctx.stroke();
    drawDish(ctx, x + 66, 428, { cone: cone.id, scoops: [], topping: null }, 0.62);
    text(ctx, cone.name, x + 66, 334, 13, '#4a3520', 'center', true);
  });

  // Topping jars.
  text(ctx, 'TOPPINGS (7–0)', 500, 300, 15, '#4a6335', 'left', true);
  TOPPINGS.forEach((top, i) => {
    const x = 500 + i * 108;
    rr(ctx, x, 318, 96, 128, 10);
    ctx.fillStyle = '#fffdf6'; ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f3e8d2';
    ctx.beginPath(); ctx.arc(x + 48, 372, 30, 0, Math.PI * 2); ctx.fill();
    drawToppingMark(ctx, x + 48, 386, top.id);
    text(ctx, top.name.split(' ')[0], x + 48, 424, 13, '#4a3520', 'center', true);
    text(ctx, `key ${top.key}`, x + 48, 332, 11, '#8a6f4d', 'center');
  });

  // Assembly plate.
  rr(ctx, 952, 286, 304, 250, 14);
  ctx.fillStyle = '#fff8ea'; ctx.fill();
  ctx.strokeStyle = '#d96c85'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'ASSEMBLY PLATE', 1104, 306, 16, '#b0526e', 'center', true);
  ctx.fillStyle = '#e8dcc4';
  ctx.beginPath(); ctx.ellipse(1104, 512, 120, 16, 0, 0, Math.PI * 2); ctx.fill();
  drawDish(ctx, 1104, 506, state.plate, 0.92);
  if (state.plate.scoops.length > 0) {
    text(ctx, 'MELT', 968, 522, 13, '#b0526e', 'left', true);
    rr(ctx, 1012, 514, 228, 14, 7);
    ctx.fillStyle = '#e8dcc4'; ctx.fill();
    rr(ctx, 1012, 514, Math.max(14, 228 * Math.max(0, state.plate.melt)), 14, 7);
    ctx.fillStyle = state.plate.melt > 0.4 ? '#7fb3d9' : '#d9534f'; ctx.fill();
  }

  // Serving pass: the last finished dish waits here briefly.
  rr(ctx, 952, 548, 304, 104, 14);
  ctx.fillStyle = '#eaf3e2'; ctx.fill();
  ctx.strokeStyle = '#7fa653'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'PASS — ready to serve', 972, 568, 14, '#4a6335', 'left', true);
  if (state.passDish) {
    drawDish(ctx, 1104, 648, state.passDish, 0.4);
  } else {
    text(ctx, 'nothing waiting', 1104, 606, 14, '#9a8a76', 'center');
  }

  drawCase(ctx, state);

  // Buttons.
  const serveR = hitRegions().find((r) => r.kind === 'serve');
  rr(ctx, serveR.x, serveR.y, serveR.w, serveR.h, 12);
  ctx.fillStyle = '#7fa653'; ctx.fill();
  text(ctx, 'SERVE ⏎', serveR.x + serveR.w / 2, serveR.y + 32, 22, '#ffffff', 'center', true);
  const trashR = hitRegions().find((r) => r.kind === 'trash');
  rr(ctx, trashR.x, trashR.y, trashR.w, trashR.h, 12);
  ctx.fillStyle = '#b0526e'; ctx.fill();
  text(ctx, 'BIN ⌫', trashR.x + trashR.w / 2, trashR.y + 32, 20, '#ffffff', 'center', true);

  // Feedback message.
  if (state.message && state.msgT > 0) {
    rr(ctx, 340, 272, 600, 40, 12);
    ctx.fillStyle = 'rgba(68,96,60,0.92)'; ctx.fill();
    text(ctx, state.message, 640, 292, 19, '#fdf6ec', 'center', true);
  }

  if (banner) {
    rr(ctx, 190, 704, 740, 84, 14);
    ctx.fillStyle = 'rgba(217,108,133,0.96)'; ctx.fill();
    ctx.strokeStyle = '#fdf6ec'; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, 'GELATO GIARDINO', 560, 738, 36, '#ffffff', 'center', true);
    text(ctx, 'the garden gelato stand', 560, 770, 17, '#ffe9f0', 'center');
  }

  if (state.mode === 'over') {
    ctx.fillStyle = 'rgba(46,70,48,0.88)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'SHIFT OVER', 640, 330, 54, '#fdf6ec', 'center', true);
    text(ctx, `Coins earned: ${state.coins}   ·   Guests served: ${state.served}`, 640, 396, 24, '#ffe9a8', 'center');
    text(ctx, state.strikes >= 3 ? 'Too many guests walked away.' : 'The garden gate closes for today.', 640, 440, 20, '#fdf6ec', 'center');
    const r = hitRegions().find((h) => h.kind === 'restart');
    rr(ctx, r.x, r.y, r.w, r.h, 14);
    ctx.fillStyle = '#d96c85'; ctx.fill();
    text(ctx, 'NEW SHIFT', r.x + r.w / 2, r.y + 36, 24, '#ffffff', 'center', true);
  }
}
