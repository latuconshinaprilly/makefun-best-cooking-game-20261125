// Gelato Giardino — the order board: ticket creation and patience clocks.
// Guests arrive with a named sundae in mind; their patience drains while
// they wait in the garden queue, and a guest who waits too long walks away.

import { MENU, FLAVORS } from './recipes.js';

let nextTicketId = 1;

// Build one fresh ticket. Later in the shift (higher level) guests order an
// extra scoop more often and wait a little less patiently.
export function makeTicket(rng, level) {
  const dish = MENU[Math.floor(rng() * MENU.length)];
  const scoops = dish.scoops.slice();
  if (level >= 3 && rng() < 0.55) {
    const extra = FLAVORS[Math.floor(rng() * FLAVORS.length)].id;
    scoops.push(extra);
  }
  const patienceMax = Math.max(24, 44 - level * 2 + scoops.length * 7);
  return {
    id: nextTicketId++,
    name: dish.name,
    cone: dish.cone,
    scoops,
    topping: dish.topping,
    patience: patienceMax,
    patienceMax,
  };
}

// Advance every ticket's patience. Expired tickets are removed from the
// board and reported so the game can count a strike for the lost guest.
export function tickOrders(state, dt) {
  const expired = [];
  for (const ticket of state.tickets) {
    ticket.patience -= dt;
    if (ticket.patience <= 0) expired.push(ticket);
  }
  if (expired.length > 0) {
    state.tickets = state.tickets.filter((t) => t.patience > 0);
  }
  return expired;
}

// How long until the next guest wanders into the garden. The queue refills
// faster as the shift heats up, but never beyond three waiting tickets.
export function nextSpawnDelay(state) {
  if (state.tickets.length >= 3) return 1.2;
  return Math.max(2.2, 6.5 - state.level * 0.7);
}
