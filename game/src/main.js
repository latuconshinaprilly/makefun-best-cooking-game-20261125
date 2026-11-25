// Gelato Giardino — Garden Gelato Stand.
// Run a sunny gelato stand in a flower garden: take sundae tickets from the
// order board, set a cone or cup on the plate, dig scoops at the case (each
// one takes time, and the stack starts melting the moment it lands), finish
// with the right topping and serve before the guest's patience runs out.
// Three guests walking away — or the shift clock hitting zero — ends the day.

import { priceOf, plateMatches } from './recipes.js';
import { makeTicket, tickOrders, nextSpawnDelay } from './orders.js';
import { startScoop, placeCone, addTopping, clearPlate, updateStations } from './stations.js';
import { draw } from './render.js';
import { attachInput } from './input.js';

const SHIFT_SECONDS = 150;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Small deterministic RNG so screenshot scenes are identical every load.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function freshState(rng) {
  return {
    mode: 'play',
    rng,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    strikes: 0,
    level: 1,
    tickets: [],
    spawnT: 0.5,
    plate: { cone: null, scoops: [], topping: null, melt: 1 },
    scoopJob: null,
    passDish: null,
    passT: 0,
    message: '',
    msgT: 0,
  };
}

let state = freshState(mulberry32(20261125));

function say(message) {
  state.message = message;
  state.msgT = 1.8;
}

function serve() {
  if (state.mode !== 'play') return;
  if (!state.plate.cone || state.plate.scoops.length === 0) {
    say('The plate is empty — build a sundae first!');
    return;
  }
  const idx = state.tickets.findIndex((t) => plateMatches(t, state.plate));
  if (idx === -1) {
    state.strikes += 1;
    clearPlate(state);
    say('No guest ordered that — the tower goes in the bin!');
    if (state.strikes >= 3) state.mode = 'over';
    return;
  }
  const [ticket] = state.tickets.splice(idx, 1);
  const tip = Math.round(6 * (ticket.patience / ticket.patienceMax)) + Math.round(4 * state.plate.melt);
  const perfectBonus = state.plate.melt > 0.85 ? 3 : 0;
  state.coins += priceOf(ticket) + tip + perfectBonus;
  state.served += 1;
  state.passDish = { cone: state.plate.cone, scoops: state.plate.scoops.slice(), topping: state.plate.topping };
  state.passT = 3;
  clearPlate(state);
  say(perfectBonus > 0
    ? `${ticket.name} served — perfect, barely melted! +${priceOf(ticket) + tip + perfectBonus} coins`
    : `${ticket.name} served! +${priceOf(ticket) + tip} coins`);
  if (state.served > 0 && state.served % 5 === 0) {
    state.level += 1;
    say(`The garden rush picks up — level ${state.level}!`);
  }
}

const actions = {
  onRegion(region) {
    if (region.kind === 'restart') {
      if (state.mode === 'over') state = freshState(mulberry32(Date.now() % 2147483647));
      return;
    }
    if (state.mode !== 'play') return;
    if (region.kind === 'cone') {
      if (!placeCone(state, region.id)) say('Finish or bin the current plate first!');
    } else if (region.kind === 'flavor') {
      if (!state.plate.cone) say('Pick a cone or cup first!');
      else if (!startScoop(state, region.id)) say('Hands busy — one scoop at a time!');
    } else if (region.kind === 'topping') {
      if (!addTopping(state, region.id)) say('Toppings go on a finished stack, once!');
    } else if (region.kind === 'serve') {
      serve();
    } else if (region.kind === 'trash') {
      clearPlate(state);
      say('Plate binned. Fresh start!');
    }
  },
  onServe: serve,
  onTrash() {
    if (state.mode !== 'play') return;
    clearPlate(state);
    say('Plate binned. Fresh start!');
  },
};

function update(dt) {
  if (state.mode !== 'play') return;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.mode = 'over';
    return;
  }
  state.spawnT -= dt;
  if (state.spawnT <= 0) {
    if (state.tickets.length < 3) state.tickets.push(makeTicket(state.rng, state.level));
    state.spawnT = nextSpawnDelay(state);
  }
  const expired = tickOrders(state, dt);
  if (expired.length > 0) {
    state.strikes += expired.length;
    say(expired.length > 1 ? 'Guests walked away!' : `${expired[0].name} waited too long — guest gone!`);
    if (state.strikes >= 3) { state.mode = 'over'; return; }
  }
  if (updateStations(state, dt) === 'melted') {
    say('The tower melted into soup — binned!');
  }
  if (state.passT > 0) {
    state.passT -= dt;
    if (state.passT <= 0) state.passDish = null;
  }
  if (state.msgT > 0) state.msgT -= dt;
}

// --- Deterministic screenshot scenes (?shot=cover|rush|serve&seed=N) ---
// Each frozen scene shows the full stand: order board with live tickets,
// tubs and jars on the counter, one sundae mid-assembly on the plate with
// its melt bar draining, the shift clock, and a finished dish on the pass.
function buildShotScene(kind, seed) {
  const rng = mulberry32(seed);
  const s = freshState(rng);
  const t1 = makeTicket(rng, 2);
  let t2 = makeTicket(rng, 2);
  for (let i = 0; i < 6 && t2.name === t1.name; i++) t2 = makeTicket(rng, 2);
  let t3 = makeTicket(rng, 3);
  for (let i = 0; i < 6 && (t3.name === t1.name || t3.name === t2.name); i++) t3 = makeTicket(rng, 3);
  if (kind === 'cover') {
    s.tickets = [t1, t2];
    s.plate = { cone: t1.cone, scoops: t1.scoops.slice(0, 1), topping: null, melt: 0.82 };
    s.scoopJob = { flavor: t1.scoops[1] || 'crema', t: 0.65, dur: 1.1 };
    s.passDish = { cone: 'cup', scoops: ['rosa', 'crema'], topping: 'petals' };
    s.timeLeft = 118; s.coins = 145; s.served = 6;
  } else if (kind === 'rush') {
    t2.patience = t2.patienceMax * 0.3;
    t3.patience = t3.patienceMax * 0.55;
    s.tickets = [t1, t2, t3];
    s.plate = { cone: t2.cone, scoops: t2.scoops.slice(0, 2), topping: null, melt: 0.47 };
    s.scoopJob = { flavor: 'pistachio', t: 0.4, dur: 1.1 };
    s.passDish = { cone: 'waffle', scoops: ['cioccolato', 'pistachio'], topping: 'nuts' };
    s.timeLeft = 41; s.coins = 268; s.served = 11; s.strikes = 1; s.level = 3;
  } else {
    // serve: the plate holds t1's exact order, ready to hand over.
    s.tickets = [t1, t2];
    s.plate = { cone: t1.cone, scoops: t1.scoops.slice(), topping: t1.topping, melt: 0.76 };
    s.passDish = { cone: 'cake', scoops: ['limone', 'fragola'], topping: 'wafer' };
    s.timeLeft = 96; s.coins = 187; s.served = 8;
  }
  return s;
}

const params = new URLSearchParams(window.location.search);
if (params.get('shot')) {
  const seed = Number(params.get('seed') || 7);
  state = buildShotScene(params.get('shot'), seed);
  draw(ctx, state, params.get('shot') === 'cover');
} else {
  attachInput(canvas, actions);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw(ctx, state, false);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
