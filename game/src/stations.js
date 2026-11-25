// Gelato Giardino — work stations: the scooping case and the melt clock.
// Scooping is real work: each scoop takes a moment at the case while the
// server digs into the tub. And once the first scoop lands, the tower starts
// melting — dawdle and the whole plate slumps into soup.

export const SCOOP_SECONDS = 1.1;   // time to dig one scoop out of a tub
export const MELT_SECONDS = 26;     // seconds from first scoop to full melt

// Start digging a scoop of the given flavor. Refused while another scoop is
// already being dug, or when there is no cone/cup on the plate yet.
export function startScoop(state, flavorId) {
  if (state.scoopJob) return false;
  if (!state.plate.cone) return false;
  state.scoopJob = { flavor: flavorId, t: 0, dur: SCOOP_SECONDS };
  return true;
}

// Put a fresh empty cone or cup on the plate. Only allowed on a clean plate.
export function placeCone(state, coneId) {
  if (state.plate.cone || state.plate.scoops.length > 0) return false;
  state.plate.cone = coneId;
  return true;
}

// Add a topping to the finished stack. One topping only; it goes on last.
export function addTopping(state, toppingId) {
  if (!state.plate.cone || state.plate.scoops.length === 0) return false;
  if (state.plate.topping) return false;
  state.plate.topping = toppingId;
  return true;
}

// Throw the current plate away (melted, wrong, or just hopeless).
export function clearPlate(state) {
  state.plate = { cone: null, scoops: [], topping: null, melt: 1 };
  state.scoopJob = null;
}

// Advance the scoop job and the melt clock. Returns 'melted' when the stack
// slumped before it could be served, otherwise null.
export function updateStations(state, dt) {
  if (state.scoopJob) {
    state.scoopJob.t += dt;
    if (state.scoopJob.t >= state.scoopJob.dur) {
      state.plate.scoops.push(state.scoopJob.flavor);
      if (state.plate.scoops.length === 1) state.plate.melt = 1;
      state.scoopJob = null;
    }
  }
  if (state.plate.scoops.length > 0) {
    state.plate.melt -= dt / MELT_SECONDS;
    if (state.plate.melt <= 0) {
      clearPlate(state);
      return 'melted';
    }
  }
  return null;
}
