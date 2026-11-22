/* HelperMeet prototype — fictional neighborhood: geometry helpers, the drawn map, and sample data.
   World units are thousandths of a mile (1000 units = 1 mile), y grows southward. */
'use strict';
window.HM = {};
(() => {
const DAY = 864e5, WORLD = 3200;
const HOME = { x: 1625, y: 1625 }, AWAY = { x: 2100, y: 1450 };

/* ---------- geometry ---------- */
const geo = {
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  pip(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  },
  cross(a, b, c, d) {
    const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
  },
  /* True when any two non-adjacent edges of the closed shape cross. */
  selfIntersects(poly) {
    const n = poly.length;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (geo.cross(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return true;
    }
    return false;
  },
};

/* ---------- the drawn map ---------- */
const V = [[200], [420], [620, 'Creek Rd'], [850], [1050], [1250, 'Oak Ave'], [1400], [1550], [1700], [1850], [2000, 'Birch Rd'], [2200], [2400], [2600], [2800, 'Highland Ave'], [3000]];
const H = [[200], [400], [600, 'Northgate Blvd'], [800], [1000], [1200, 'Elm St'], [1350], [1550], [1700], [1850, 'Maple St'], [2050], [2250], [2450, 'Cedar Ln'], [2650], [2850], [3050]];
const GAPS = { v2200: [1200, 1550], h1350: [2000, 2400], v1850: [1000, 1200], v1550: [1850, 2050] }; // streets stop at the parks and the school
function baseSvg() {
  const seg = (key, vertical, at) => {
    const g = GAPS[key], parts = g ? [[0, g[0]], [g[1], WORLD]] : [[0, WORLD]];
    return parts.map(([a, b]) => vertical ? `M${at} ${a}V${b}` : `M${a} ${at}H${b}`).join('');
  };
  let minor = '', major = 'M0 1500L3200 3100', labels = '';
  for (const [x, name] of V) {
    const d = seg('v' + x, true, x);
    if (name) { major += d; for (const y of [450, 1480, 2360, 2950]) labels += `<text transform="translate(${x} ${y}) rotate(-90)" class="m-road">${name}</text>`; }
    else minor += d;
  }
  for (const [y, name] of H) {
    const d = seg('h' + y, false, y);
    if (name) { major += d; for (const x of [330, 1150, 1775, 2600]) labels += `<text x="${x}" y="${y}" class="m-road">${name}</text>`; }
    else minor += d;
  }
  return `<rect x="-400" y="-400" width="4000" height="4000" fill="#ecebe1"/>
<rect x="2000" y="1200" width="400" height="350" rx="26" fill="#d6e2c9"/><ellipse cx="2265" cy="1410" rx="82" ry="48" fill="#c3d5d8"/>
<rect x="1400" y="1850" width="150" height="200" rx="18" fill="#d6e2c9"/>
<rect x="1700" y="1000" width="150" height="200" fill="#e6ddca"/>
<path d="M-50 2750C450 2600 650 2200 700 1600S900 500 760-50" fill="none" stroke="#c3d5d8" stroke-width="30" stroke-linecap="round"/>
<path d="${minor}" fill="none" stroke="#d6d5c7" stroke-width="20"/><path d="${major}" fill="none" stroke="#d0cfbf" stroke-width="32"/>
<path d="${minor}" fill="none" stroke="#fbfaf4" stroke-width="14"/><path d="${major}" fill="none" stroke="#fbfaf4" stroke-width="25"/>
${labels}<text transform="translate(1790 2395) rotate(26.6)" class="m-road">Old Mill Rd</text>
<text x="2130" y="1300" class="m-place">Elm Park</text><text x="1475" y="1955" class="m-place m-small">Hollow<tspan x="1475" dy="26">Green</tspan></text>
<text x="1775" y="1095" class="m-place m-small m-tan">Maple<tspan x="1775" dy="26">Elementary</tspan></text>
<text transform="translate(745 1050) rotate(-80)" class="m-place m-small m-water">Cedar Creek</text>`;
}
const BASE = baseSvg(), views = {};

/* A pannable, zoomable map. Shapes go in the SVG overlay (world units); pins are HTML so they keep their size. */
function createMap(el, o = {}) {
  el.classList.add('map');
  el.innerHTML = `<svg class="map-svg" preserveAspectRatio="none" aria-hidden="true">${BASE}<g class="map-ov"></g></svg><div class="map-pins"></div><div class="map-zoom"><button type="button" data-zoom="0.6" aria-label="Zoom in">+</button><button type="button" data-zoom="1.6" aria-label="Zoom out">−</button></div>`;
  const svg = el.firstChild, ov = svg.querySelector('.map-ov'), pinLayer = el.querySelector('.map-pins');
  const fresh = !views[o.key], view = views[o.key] || (views[o.key] = { cx: HOME.x, cy: HOME.y, w: 1100 });
  let pins = [];
  const size = () => ({ W: el.clientWidth || 1, H: el.clientHeight || 1 });
  const box = () => { const { W, H: hh } = size(), h = view.w * hh / W; return { x: view.cx - view.w / 2, y: view.cy - h / 2, w: view.w, h }; };
  const place = () => { const b = box(), { W, H: hh } = size(); for (const p of pins) { p.el.style.left = (p.x - b.x) / b.w * W + 'px'; p.el.style.top = (p.y - b.y) / b.h * hh + 'px'; } };
  function apply() {
    view.w = Math.min(3600, Math.max(260, view.w));
    view.cx = Math.min(WORLD, Math.max(0, view.cx)); view.cy = Math.min(WORLD, Math.max(0, view.cy));
    const b = box(); svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`); place();
  }
  const unproject = (cx, cy) => { const r = el.getBoundingClientRect(), b = box(); return { x: b.x + (cx - r.left) / r.width * b.w, y: b.y + (cy - r.top) / r.height * b.h }; };
  function zoomAt(pt, f) { const w0 = view.w; view.w = Math.min(3600, Math.max(260, w0 * f)); const k = view.w / w0; view.cx = pt.x + (view.cx - pt.x) * k; view.cy = pt.y + (view.cy - pt.y) * k; apply(); if (o.onZoom && view.w !== w0) o.onZoom(); }
  const map = {
    el, view, fresh,
    px: () => size().W / view.w, // screen pixels per map unit
    setOverlay(s) { ov.innerHTML = s; },
    setPins(list) {
      pinLayer.innerHTML = list.map(p => `<div class="pin ${p.cls || ''}" ${p.id ? `data-pin="${p.id}"` : ''}>${p.html}</div>`).join('');
      pins = list.map((p, i) => ({ x: p.x, y: p.y, el: pinLayer.children[i] })); place();
    },
    fit(points, pad = 0.2) {
      const xs = points.map(p => p.x), ys = points.map(p => p.y), { W, H: hh } = size();
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      view.cx = (x0 + x1) / 2; view.cy = (y0 + y1) / 2; view.w = Math.max(x1 - x0, (y1 - y0) * W / hh, 300) * (1 + pad); apply(); if (o.onZoom) o.onZoom();
    },
  };
  /* Drag to pan, pinch or wheel to zoom, tap to pick. A press that moves under 5px counts as a tap. */
  const down = new Map(); let moved = false, start = null, pinch = 0;
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('.map-zoom')) return;
    down.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (down.size === 1) { moved = false; start = { x: e.clientX, y: e.clientY, target: e.target }; }
    else { moved = true; const [a, b] = [...down.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  el.addEventListener('pointermove', e => {
    const p = down.get(e.pointerId); if (!p) return;
    const r = el.getBoundingClientRect(), k = view.w / r.width;
    if (down.size === 1) {
      if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5) return;
      if (!moved) { moved = true; try { el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ } el.classList.add('dragging'); }
      view.cx -= (e.clientX - p.x) * k; view.cy -= (e.clientY - p.y) * k; apply();
    } else if (down.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...down.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch && d) zoomAt(unproject((a.x + b.x) / 2, (a.y + b.y) / 2), pinch / d);
      pinch = d; return;
    }
    p.x = e.clientX; p.y = e.clientY;
  });
  const up = e => {
    if (!down.delete(e.pointerId)) return;
    el.classList.remove('dragging');
    if (e.type === 'pointerup' && !moved && down.size === 0 && start) {
      const pin = start.target.closest && start.target.closest('[data-pin]');
      if (pin) { if (o.onPin) o.onPin(pin.dataset.pin); } else if (o.onTap) o.onTap(unproject(e.clientX, e.clientY), e);
    }
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); zoomAt(unproject(e.clientX, e.clientY), Math.exp(e.deltaY * 0.0015)); }, { passive: false });
  pinLayer.addEventListener('click', e => { const p = e.detail === 0 && e.target.closest('[data-pin]'); if (p && o.onPin) o.onPin(p.dataset.pin); }); // keyboard activation; pointer taps are handled above
  el.querySelector('.map-zoom').addEventListener('click', e => { const b = e.target.closest('[data-zoom]'); if (b) zoomAt({ x: view.cx, y: view.cy }, +b.dataset.zoom); });
  if (window.ResizeObserver) new ResizeObserver(apply).observe(el);
  apply();
  return map;
}

/* ---------- sample photos (drawn, so the prototype works offline) ---------- */
const uri = s => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${s}</svg>`);
function dots(n, seed, x0, y0, w, h, colors, r = 5) {
  let s = seed, out = ''; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) out += `<ellipse cx="${(x0 + rnd() * w).toFixed(0)}" cy="${(y0 + rnd() * h).toFixed(0)}" rx="${r}" ry="${r * 0.6}" fill="${colors[i % colors.length]}"/>`;
  return out;
}
const AUTUMN = ['#c9843f', '#d79a4c', '#b5652f', '#e0b062'];
const house = `<rect x="235" y="118" width="135" height="92" fill="#ebe4d2"/><path d="M222 122 302 68l81 54z" fill="#8a5b45"/><rect x="290" y="158" width="28" height="52" fill="#6f7f6b"/><rect x="250" y="140" width="26" height="26" fill="#c9d8dc"/><rect x="332" y="140" width="26" height="26" fill="#c9d8dc"/>`;
const PHOTOS = {
  leaves: uri(`<rect width="400" height="300" fill="#d3e0e2"/><rect y="195" width="400" height="105" fill="#a3b381"/>${house}<rect x="88" y="95" width="18" height="118" fill="#6b5240"/><circle cx="96" cy="82" r="62" fill="#c9843f"/><circle cx="146" cy="108" r="40" fill="#d79a4c"/>${dots(70, 7, 10, 200, 380, 90, AUTUMN)}`),
  yard: uri(`<rect width="400" height="300" fill="#d3e0e2"/><rect y="150" width="400" height="150" fill="#a3b381"/><rect x="0" y="120" width="400" height="34" fill="#c7b89a"/>${dots(110, 21, 0, 160, 400, 135, AUTUMN, 6)}<path d="M300 300 330 170" stroke="#6b5240" stroke-width="7"/><path d="M312 178h36l6 26h-48z" fill="#8c9aa0"/>`),
  couch: uri(`<rect width="400" height="300" fill="#e9dfd0"/><rect y="215" width="400" height="85" fill="#b99b7c"/><rect x="40" y="40" width="90" height="110" fill="#cfe0e4" stroke="#fffaf0" stroke-width="8"/><rect x="95" y="140" width="250" height="78" rx="16" fill="#5f7d8c"/><rect x="80" y="160" width="46" height="74" rx="14" fill="#557180"/><rect x="314" y="160" width="46" height="74" rx="14" fill="#557180"/><rect x="126" y="182" width="94" height="40" rx="8" fill="#6d8c9b"/><rect x="220" y="182" width="94" height="40" rx="8" fill="#6d8c9b"/>`),
  fence: uri(`<rect width="400" height="300" fill="#d3e0e2"/><rect y="200" width="400" height="100" fill="#a3b381"/>${Array.from({ length: 9 }, (_, i) => i === 4 || i === 5 ? '' : `<path d="M${14 + i * 43} 220V112l15-16 15 16v108z" fill="#ebe4d2" stroke="#cfc6ae"/>`).join('')}<g transform="rotate(7 186 220)"><path d="M186 220V118h86v102z" fill="#e3dbc5" stroke="#b9ae93" stroke-width="2"/><path d="M190 216 268 124" stroke="#b9ae93" stroke-width="6"/></g><rect x="0" y="140" width="186" height="10" fill="#d9d0b9"/><rect x="272" y="140" width="128" height="10" fill="#d9d0b9"/>`),
  gutter: uri(`<rect width="400" height="300" fill="#cfdde3"/><path d="M0 150 400 60V0H0z" fill="#7d6557"/><path d="M0 150 400 60v22L0 172z" fill="#e9e4d6"/><rect y="172" width="400" height="128" fill="#ded6c4"/>${dots(34, 3, 20, 96, 340, 60, AUTUMN, 6)}<path d="M300 300 330 96M348 300l30-204M306 250h46M312 200h46M320 150h46" stroke="#9aa3a6" stroke-width="6" fill="none"/>`),
  lights: uri(`<rect width="400" height="300" fill="#34425a"/><rect y="150" width="400" height="150" fill="#27324a"/><rect y="240" width="400" height="60" fill="#dfe6ea"/><rect x="80" y="130" width="240" height="120" fill="#1f2a36"/><path d="M60 136 200 50l140 86z" fill="#17202a"/><rect x="118" y="165" width="42" height="42" fill="#e9c877"/><rect x="240" y="165" width="42" height="42" fill="#e9c877"/><rect x="182" y="190" width="36" height="60" fill="#3d2f2a"/>${Array.from({ length: 13 }, (_, i) => `<circle cx="${68 + i * 11}" cy="${132 - i * 6.6}" r="4" fill="${['#e9c877', '#d9694f', '#7fb38a'][i % 3]}"/>`).join('')}`),
  mattress: uri(`<rect width="400" height="300" fill="#d9d5c8"/><rect y="230" width="400" height="70" fill="#a8a79c"/><g transform="rotate(-9 200 150)"><rect x="110" y="40" width="170" height="210" rx="14" fill="#f3eee0" stroke="#cfc6ae" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${140 + (i % 3) * 55}" cy="${75 + Math.floor(i / 3) * 48}" r="3" fill="#cfc6ae"/>`).join('')}</g><rect x="300" y="170" width="70" height="62" fill="#b99b7c"/>`),
  crib: uri(`<rect width="400" height="300" fill="#e6e3d6"/><rect y="215" width="400" height="85" fill="#c4ae8e"/><rect x="60" y="165" width="200" height="60" fill="#c9a77a"/><path d="M60 165h200M160 165v60" stroke="#a78659" stroke-width="3"/><rect x="230" y="60" width="130" height="14" rx="4" fill="#f4efe2"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${238 + i * 16}" y="74" width="6" height="110" fill="#f4efe2"/>`).join('')}<rect x="230" y="184" width="130" height="14" rx="4" fill="#f4efe2"/>`),
};

/* ---------- people, boundaries, opportunities ---------- */
const PEOPLE = {
  u1: ['Priya', 'Sharma', 1470, 1480, 'b1'], u2: ['Marcus', 'Turner', 1780, 1780, 'b1'], u3: ['Eleanor', 'Whitfield', 1330, 1950, 'b1'],
  u4: ['Daniel', 'Okafor', 2110, 1100, 'b2'], u5: ['Sofia', 'Ramirez', 1130, 1780, 'b3'], u6: ['Tom', 'Becker', 2300, 2150, 0.4],
  u7: ['Grace', 'Lindqvist', 1780, 900, 'b4'], u8: ['Hannah', 'Nguyen', 520, 820, 0.5], u9: ['Walter', 'Pruitt', 1640, 1440, 'b1'],
  u10: ['Aisha', 'Bello', 1930, 1640, 'b1'], u11: ['Ben', 'Castillo', 1150, 1100, 'b4'], u12: ['Derek', 'Vaughn', 1500, 1770, 'b1'],
  u13: ['Lucy', 'Abernathy', 1760, 1500, 'b1'], u14: ['Omar', 'Haddad', 1320, 1600, 'b1'], u15: ['Nina', 'Petrov', 1900, 1900, 'b1'], u16: ['Caleb', 'Winters', 1480, 1300, 'b3'],
};
const pts = a => { const out = []; for (let i = 0; i < a.length; i += 2) out.push({ x: a[i], y: a[i + 1] }); return out; };
const jitter = (p, n) => ({ x: p.x + ((n * 37) % 41) - 20, y: p.y + ((n * 53) % 37) - 18 });
const endOfDay = t => { const d = new Date(t); d.setHours(23, 59, 0, 0); return d.getTime(); };

function seed(now) {
  const ago = n => now - n * DAY;
  const users = {};
  for (const [id, [first, last, x, y, b]] of Object.entries(PEOPLE)) users[id] = { first, last, verified: !['u6', 'u8', 'u11', 'u16'].includes(id), home: { x, y }, boundary: typeof b === 'number' ? { type: 'radius', miles: b } : { type: 'named', id: b } };
  const boundaries = [
    { id: 'b1', name: 'Maple Hollow', members: 48, createdBy: 'u3', points: pts([1250, 1350, 1850, 1350, 2000, 1550, 2000, 1850, 1700, 2050, 1250, 2050]) },
    { id: 'b2', name: 'Elm Park Neighbors', members: 112, createdBy: 'u4', points: pts([1550, 1000, 2400, 1000, 2400, 1700, 1850, 1850, 1550, 1700]) },
    { id: 'b3', name: 'Creekside Blocks', members: 31, createdBy: 'u5', points: pts([700, 1200, 1700, 1200, 1700, 1850, 1250, 2050, 700, 2050]) },
    { id: 'b4', name: 'Northgate Commons', members: 67, createdBy: 'u7', points: pts([1050, 400, 2000, 400, 2000, 1200, 1050, 1200]) },
  ];
  let n = 0;
  const opp = (ownerId, days, o) => ({ id: 'o' + (++n), ownerId, status: 'active', cat: 'other', est: 'About 1 hour', helpers: 1, bring: '', times: '', photos: [], deadline: null, scope: 'boundary', createdAt: ago(days), expiresAt: ago(days) + 30 * DAY, loc: jitter(users[ownerId].home, n), ...o, deadline: o.due ? endOfDay(now + o.due * DAY) : null });
  const opps = [
    opp('u3', 4, { title: 'Rake leaves before the first snow', cat: 'yard', est: '2–3 hours', helpers: 2, due: 6, photos: [PHOTOS.leaves, PHOTOS.yard], bring: 'A rake if you have one. I have bags and gloves.', times: 'Any afternoon, or Saturday morning', desc: 'My two big maples dropped everything at once and I can’t manage the raking with my hip this year. The front and side yards need raking and bagging. City pickup is next Monday, so the bags need to be at the curb by then. Cider and cookies provided!' }),
    opp('u1', 1, { title: 'Carry a couch to the curb for pickup', cat: 'lifting', est: 'Under 30 minutes', helpers: 1, due: 2, photos: [PHOTOS.couch], times: 'Weeknights after 6', desc: 'Bulk pickup is Wednesday morning and our old three-seat couch needs to get from the living room to the curb. It’s one step down from the front door. I can lift one end, I just need a second set of hands.' }),
    opp('u2', 9, { title: 'Fix a sagging fence gate', cat: 'repairs', est: 'About 1 hour', scope: 'anyone', photos: [PHOTOS.fence], bring: 'A drill would help. I have screws and a new hinge.', desc: 'The side gate has dropped and drags on the ground, so it no longer latches and the dog keeps getting out. I think it needs a new top hinge and maybe a brace. I’m not handy but I’m happy to hold things and hand over tools.' }),
    opp('u9', 2, { title: 'Ride to a medical appointment', cat: 'rides', est: '2–3 hours', due: 3, times: 'Pickup 9:15 am, done by about 11:30', desc: 'I have an eye appointment and won’t be able to drive home afterward. The clinic is on Highland Ave, about ten minutes away. I’d need a ride there, and back once they’re finished with me.' }),
    opp('u10', 6, { title: 'Meals for a family with a new baby', cat: 'meals', est: 'Ongoing', helpers: 4, found: 2, bring: 'Disposable containers, please. No nuts.', desc: 'We brought our daughter home last week and are running on very little sleep. If anyone could drop off a dinner over the next couple of weeks we would be so grateful. Two adults and a hungry four-year-old.' }),
    opp('u4', 3, { title: 'Set up a new phone for my dad', cat: 'tech', est: 'About 1 hour', found: 1, scope: 'anyone', times: 'Weekends', desc: 'My father just got his first smartphone and I live out of state half the month. He needs help moving his contacts over, making the text bigger, and learning how to video call the grandkids. He’s patient and makes great coffee.' }),
    opp('u6', 5, { title: 'Clear gutters before the freeze', cat: 'yard', est: '2–3 hours', helpers: 2, due: 8, scope: 'anyone', photos: [PHOTOS.gutter], bring: 'Work gloves. Ladder is here.', desc: 'Single-story house with gutters packed full on the north side. I have the ladder and a scoop, but need someone steady to hold the ladder or take a turn going up.' }),
    opp('u7', 2, { title: 'Assemble a crib', cat: 'repairs', est: 'About 1 hour', scope: 'anyone', photos: [PHOTOS.crib], bring: 'Nothing. Tools are in the box.', desc: 'The crib arrived flat-packed with forty-odd bolts and my husband is deployed until spring. An extra pair of hands to hold the sides while I bolt it together would make this possible.' }),
    opp('u5', 7, { title: 'Walk our dog while I recover', cat: 'pets', est: 'Under 30 minutes', times: 'Mornings or late afternoon', desc: 'I’m off my feet for three weeks after knee surgery. Biscuit is a calm eight-year-old lab who needs one walk a day. Even one or two days a week would be a huge help.' }),
    opp('u8', 2, { title: 'Stack a cord of firewood', cat: 'lifting', est: 'Half a day', scope: 'anyone', desc: 'A cord of split wood was dumped in the driveway and needs stacking along the garage.' }),
    opp('u11', 3, { title: 'Borrow a snow blower for the season', cat: 'other', desc: 'Looking to borrow or share a snow blower with a Northgate neighbor this winter.' }),
  ];
  return { v: 2, me: null, users, boundaries, opps, threads: [], blocked: [], hidden: [], reports: [], settings: { requests: true, messages: true, reminders: true }, clockOffset: 0, away: false, sim: 0 };
}

/* The sample account: James Jackson in Maple Hollow, with posts in every lifecycle state and chats in every state. */
function seedDemo(state, now) {
  const ago = n => now - n * DAY; let k = 0;
  state.me = { id: 'me', verified: true, first: 'James', last: 'Jackson', email: 'james@example.com', address: '214 Alder Court', home: { ...HOME }, boundary: { type: 'named', id: 'b1' } };
  const mine = (id, days, o) => ({ id, ownerId: 'me', status: 'active', cat: 'other', est: 'About 1 hour', helpers: 1, bring: '', times: '', photos: [], deadline: null, scope: 'boundary', helperIds: [], createdAt: ago(days), expiresAt: ago(days) + 30 * DAY, loc: { x: Math.round(HOME.x + 36 * Math.cos(k * 2.4)), y: Math.round(HOME.y + 36 * Math.sin(k++ * 2.4)) }, ...o });
  state.opps.push(
    mine('m1', 28, { title: 'Hang Christmas lights along the roofline', cat: 'other', est: '2–3 hours', helpers: 1, photos: [PHOTOS.lights], bring: 'A tall ladder if you have one', times: 'Any dry Saturday', desc: 'I have the lights and clips but no ladder tall enough for the peak, and I’d rather not be up there alone. Looking for someone with a ladder and a steady hand for a couple of hours.' }),
    mine('m2', 5, { title: 'Borrow a ladder and a hand with the gutters', cat: 'yard', est: 'About 1 hour', helpers: 2, helperIds: ['u1'], deadline: endOfDay(now + 10 * DAY), bring: 'Extension ladder', desc: 'Our gutters are full of maple seeds. I can do the scooping if someone can lend an extension ladder and hold it steady for an hour.' }),
    mine('m3', 20, { title: 'Jump-start for a dead car battery', cat: 'rides', est: 'Under 30 minutes', status: 'completed', closedAt: ago(19), desc: 'Car won’t start in the driveway. I have cables but need a second car.' }),
    mine('m4', 38, { title: 'Haul an old mattress to the dump', cat: 'lifting', est: 'About 1 hour', status: 'expired', closedAt: ago(8), photos: [PHOTOS.mattress], bring: 'A truck or trailer', desc: 'Queen mattress and box spring need to go to the transfer station. I’ll cover the dump fee and lunch, I just don’t have a vehicle that fits them.' }),
  );
  const msg = (from, hours, text) => ({ id: 'x' + Math.random().toString(36).slice(2, 9), from, at: now - hours * 36e5, text });
  state.threads.push(
    { id: 't1', withId: 'u1', oppId: 'm2', status: 'accepted', acceptedAt: ago(3), unread: 0, messages: [msg('u1', 74, 'Hi! I saw your post about the gutters. We have a 20 ft extension ladder you can borrow, and I can hold it steady on Saturday morning.'), msg('system', 72, 'You accepted. You and Priya Sharma can now see each other’s names.'), msg('me', 71.5, 'That would be wonderful, thank you! Is 9:30 too early?'), msg('u1', 70, '9:30 is perfect. I’ll bring gloves too.')] },
    { id: 't2', withId: 'u3', oppId: 'o1', status: 'accepted', acceptedAt: ago(1), unread: 1, messages: [msg('me', 30, 'Hi Eleanor, I’d be glad to help rake this weekend. I can bring a rake and my teenager.'), msg('system', 26, 'Eleanor accepted. You can now see each other’s names.'), msg('u3', 3, 'Oh bless you, James. Saturday afternoon would be lovely. I have plenty of bags.')] },
    { id: 't3', withId: 'u2', oppId: 'o3', status: 'pending', unread: 0, messages: [msg('me', 2, 'Hi, I’ve got a drill and a spare gate brace. Happy to come take a look at the gate this week.')] },
    { id: 't4', withId: 'u12', oppId: 'm1', status: 'request', unread: 1, messages: [msg('u12', 5, 'Hi! I’ve got a 24 ft ladder and a free Saturday morning if you still need a hand with the lights.')] },
    { id: 't5', withId: 'u13', oppId: 'm2', status: 'request', unread: 1, messages: [msg('u13', 22, 'Hello neighbor. We cleaned our gutters last week and still have the scoop and bags out. Want us to swing by?')] },
  );
  return state;
}

Object.assign(HM, {
  DAY, HOME, AWAY, geo, createMap, seed, seedDemo, endOfDay,
  CATS: { yard: ['Yard work', 'leaf'], lifting: ['Moving & lifting', 'box'], repairs: ['Repairs & assembly', 'wrench'], rides: ['Rides & errands', 'car'], meals: ['Meals', 'bowl'], tech: ['Tech help', 'device'], pets: ['Pet care', 'paw'], other: ['Something else', 'spark'] },
  EST: ['Under 30 minutes', 'About 1 hour', '2–3 hours', 'Half a day', 'Ongoing'],
  /* Neighbors who offer help when "Simulate a chat request" is pressed. */
  SIM: [['u14', 'Hi there, I’m two streets over and free most evenings. Glad to help with this.'], ['u15', 'Hello! My son and I would love to pitch in. When were you thinking?'], ['u16', 'Saw your post. I have the tools for this and Sunday is open.']],
  REPLIES: ['Sounds good!', 'That works for me. See you then.', 'Thank you so much, I really appreciate it.', 'Let me check and get back to you.'],
});
})();
