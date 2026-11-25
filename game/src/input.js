// Gelato Giardino — player input: mouse clicks on the stand's regions and
// keyboard shortcuts. Digits pick gelato flavors, Q/W/E pick a cone or cup,
// 7–0 add a topping, Enter/Space serves, Backspace bins the plate.

import { FLAVORS, CONES, TOPPINGS } from './recipes.js';
import { hitRegions } from './render.js';

// Wire pointer and keyboard controls to the game's action handlers.
export function attachInput(canvas, actions) {
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    for (const region of hitRegions()) {
      if (x >= region.x && x <= region.x + region.w && y >= region.y && y <= region.y + region.h) {
        actions.onRegion(region);
        return;
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      actions.onServe();
      return;
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      actions.onTrash();
      return;
    }
    const k = event.key.toLowerCase();
    const flavor = FLAVORS.find((f) => f.key === k);
    if (flavor) { actions.onRegion({ kind: 'flavor', id: flavor.id }); return; }
    const cone = CONES.find((c) => c.key.toLowerCase() === k);
    if (cone) { actions.onRegion({ kind: 'cone', id: cone.id }); return; }
    const topping = TOPPINGS.find((t) => t.key === k);
    if (topping) { actions.onRegion({ kind: 'topping', id: topping.id }); }
  });
}
