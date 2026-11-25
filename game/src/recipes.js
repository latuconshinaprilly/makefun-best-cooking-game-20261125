// Gelato Giardino — menu data: gelato flavors, cones, toppings, named dishes.
// Every ticket a guest orders is one of these garden sundaes (sometimes with
// an extra scoop once the stand gets busy).

export const FLAVORS = [
  { id: 'pistachio',  name: 'Pistachio',  color: '#9dbb6a', dark: '#74914a', key: '1' },
  { id: 'crema',      name: 'Crema',      color: '#f6ead2', dark: '#d9c49a', key: '2' },
  { id: 'rosa',       name: 'Rosa',       color: '#f2b8c6', dark: '#d9829c', key: '3' },
  { id: 'cioccolato', name: 'Cioccolato', color: '#7a4a2b', dark: '#54301b', key: '4' },
  { id: 'limone',     name: 'Limone',     color: '#f7dd7a', dark: '#d9b84a', key: '5' },
  { id: 'fragola',    name: 'Fragola',    color: '#ef7d8c', dark: '#cf5568', key: '6' },
];

export const CONES = [
  { id: 'waffle', name: 'Waffle Cone', color: '#c98d4e', dark: '#a06a34', key: 'Q' },
  { id: 'cake',   name: 'Cake Cone',   color: '#e8c07a', dark: '#c49a4e', key: 'W' },
  { id: 'cup',    name: 'Garden Cup',  color: '#a8c686', dark: '#7fa653', key: 'E' },
];

export const TOPPINGS = [
  { id: 'cherry', name: 'Cherry',          color: '#c2263f', key: '7' },
  { id: 'wafer',  name: 'Wafer Stick',     color: '#dcb06a', key: '8' },
  { id: 'nuts',   name: 'Pistachio Crumb', color: '#86a854', key: '9' },
  { id: 'petals', name: 'Rose Petals',     color: '#e58aa5', key: '0' },
];

// Named sundaes. scoops are listed bottom-first: the order they must be
// stacked on the cone. topping is null when the dish is served plain.
export const MENU = [
  { name: 'Giardino Classic', cone: 'waffle', scoops: ['pistachio', 'crema'],      topping: 'cherry' },
  { name: 'Rose Garden',      cone: 'cup',    scoops: ['rosa', 'crema'],           topping: 'petals' },
  { name: 'Choco Grove',      cone: 'waffle', scoops: ['cioccolato', 'pistachio'], topping: 'nuts' },
  { name: 'Lemon Bloom',      cone: 'cake',   scoops: ['limone', 'crema'],         topping: 'petals' },
  { name: 'Berry Trellis',    cone: 'cup',    scoops: ['fragola', 'rosa'],         topping: 'cherry' },
  { name: 'Nutty Vine',       cone: 'waffle', scoops: ['pistachio', 'cioccolato'], topping: 'nuts' },
  { name: 'Sunny Steps',      cone: 'cake',   scoops: ['limone', 'fragola'],       topping: 'wafer' },
  { name: 'Cream Pergola',    cone: 'cup',    scoops: ['crema', 'limone'],         topping: 'wafer' },
  { name: 'Single Stroll',    cone: 'cake',   scoops: ['pistachio'],               topping: null },
  { name: 'Rose Promenade',   cone: 'waffle', scoops: ['rosa'],                    topping: 'cherry' },
];

export function flavorById(id) { return FLAVORS.find((f) => f.id === id); }
export function coneById(id) { return CONES.find((c) => c.id === id); }
export function toppingById(id) { return TOPPINGS.find((t) => t.id === id); }

// Price of a finished dish: base plus per-scoop and topping charges.
export function priceOf(ticket) {
  return 8 + ticket.scoops.length * 3 + (ticket.topping ? 2 : 0);
}

// A plate matches a ticket only when cone, scoop stack (bottom-first) and
// topping all agree. Stacking order matters — a wobbly tower served in the
// wrong order is sent back.
export function plateMatches(ticket, plate) {
  if (!plate.cone || plate.cone !== ticket.cone) return false;
  if (plate.scoops.length !== ticket.scoops.length) return false;
  for (let i = 0; i < ticket.scoops.length; i++) {
    if (plate.scoops[i] !== ticket.scoops[i]) return false;
  }
  return (plate.topping || null) === (ticket.topping || null);
}
