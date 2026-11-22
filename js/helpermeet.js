/* HelperMeet prototype — screens, navigation and the simulated backend. Everything lives in this browser. */
'use strict';
(() => {
const { geo, createMap, HOME, AWAY, CATS, EST, DAY } = HM;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const STORE = 'helpermeet-v2', LIFE = 30 * DAY, WARN = 3 * DAY;
const EXTEND = [[7, '1 week'], [14, '2 weeks'], [21, '3 weeks'], [30, '30 days']];
/* The one word for the thing people post. Change it here (e.g. to "opportunity") and every screen follows.
   A neighbor's reply to one is always an "offer". */
const N = { one: 'request', many: 'requests', a: 'a request', One: 'Request' };
const REPORT_REASONS = ['Spam or a scam', 'Unsafe or threatening', 'Doesn’t seem to be a real neighbor', 'Inappropriate content', 'Something else'];

const I = {
  brand: '<path d="M4 11.5 12 4l8 7.5V20H4z"/><path d="M12 17s-3.2-2-3.2-4.2a1.8 1.8 0 0 1 3.2-1.1 1.8 1.8 0 0 1 3.2 1.1C15.2 15 12 17 12 17z"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
  map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4zM9 4v14M15 6v14"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  chat: '<path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.4A7.5 7.5 0 1 1 20 12.5z"/>',
  clip: '<path d="M8 4H5v17h14V4h-3M9 3h6v3H9zM8 11h8M8 15h5"/>',
  gear: '<path d="m9 3 1-1h4l1 3 3 1 3 1-1 3 1 3-2 3-3 1-1 3h-4l-1-3-3-1-2-3 1-3-1-3 3-1z"/><circle cx="12" cy="11" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12 4 4L19 6"/>', back: '<path d="m14.5 5-7 7 7 7"/>', chev: '<path d="m9.5 5 7 7-7 7"/>',
  dots: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>', block: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  heart: '<path d="M12 20s-7-4.4-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.6 12 20 12 20z"/>',
  photo: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 5-4.5 3.5 3 2.5-2 3.5 3.5"/>',
  send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  home: '<path d="M4 11.5 12 4l8 7.5V20h-5.5v-5h-5v5H4z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c2-4 5-7 9-9"/>',
  box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5L4 16.7 7.3 20l5.2-5.2a4 4 0 0 0 5-5.3l-2.6 2.6-2.3-.7-.7-2.3z"/>',
  car: '<path d="M4 17v-4.5l2-5.5h12l2 5.5V17zM4 12.5h16M5.5 17v2M18.5 17v2"/>',
  bowl: '<path d="M4 11h16a8 8 0 0 1-16 0zM9 8c0-1.5 1-1.5 1-3M13.5 8c0-1.5 1-1.5 1-3"/>',
  device: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  paw: '<circle cx="6.5" cy="11" r="1.5"/><circle cx="10" cy="7" r="1.5"/><circle cx="14" cy="7" r="1.5"/><circle cx="17.5" cy="11" r="1.5"/><path d="M8.5 17.5c0-2 1.5-4 3.5-4s3.5 2 3.5 4-1.5 2.5-3.5 2.5-3.5-.5-3.5-2.5z"/>',
  spark: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"/>',
  shield: '<path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 21h4"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.5-3 2.7-5 5.5-5s5 2 5.5 5M15.5 5.7a3 3 0 0 1 0 5.6M17 14.3c2 .6 3.2 2.3 3.5 4.7"/>',
  undo: '<path d="M8 5 4 9l4 4M4 9h10a5 5 0 0 1 0 10h-3"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
  radius: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="1.5"/><path d="M12 12h8"/>',
  draw: '<path d="M5 9l6-5 8 5-2 9-9 2z"/><circle cx="5" cy="9" r="1.4"/><circle cx="11" cy="4" r="1.4"/><circle cx="19" cy="9" r="1.4"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
};
const icon = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${I[n] || I.spark}</svg>`;

/* ================= state ================= */
function load() { try { localStorage.removeItem('helpermeet-v1'); const s = JSON.parse(localStorage.getItem(STORE)); return s && s.v === 2 ? s : null; } catch (e) { return null; } }
function persist() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { toast('Storage is full or unavailable. Changes last until you close this page.'); } }
let state = load() || HM.seed(Date.now());
const blankUi = () => ({ onboard: 'welcome', signup: { first: '', last: '', email: '', address: '' }, tab: 'nearby', stack: [], nearby: { scope: 'boundary', view: 'map', sel: null, refit: true }, mine: { tab: 'active' }, bd: null, form: null, drafts: {}, scroll: {}, key: '', bannered: new Set(), expired: [], nudgedAt: 0 });
let ui = blankUi();
const now = () => Date.now() + (state.clockOffset || 0);

/* ---------- formatting ---------- */
const fmtDate = t => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' });
const fmtDay = t => new Date(t).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
const fmtTime = t => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const calDays = t => Math.round((dayStart(t) - dayStart(now())) / DAY);
const daysLeft = t => Math.max(0, Math.ceil((t - now()) / DAY));
const inDays = t => { const d = daysLeft(t); return d <= 1 ? (t - now() < DAY / 2 ? 'today' : 'tomorrow') : `in ${d} days`; };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const fmtMi = m => m < 0.095 ? `${Math.max(50, Math.round(m * 5280 / 50) * 50)} ft` : `${m.toFixed(1)} mi`;
const fmtRadius = m => `${+m.toFixed(2)} mi`;
function ago(t) { const d = now() - t; if (d < 6e4) return 'just now'; if (d < 36e5) return `${Math.floor(d / 6e4)} min ago`; if (d < DAY) return `${Math.floor(d / 36e5)} hr ago`; const n = Math.floor(d / DAY); return n === 1 ? 'yesterday' : `${n} days ago`; }
const stamp = t => calDays(t) === 0 ? fmtTime(t) : calDays(t) > -7 ? new Date(t).toLocaleDateString([], { weekday: 'short' }) : fmtDate(t);
const isoDate = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/* ---------- people and names ---------- */
const person = id => id === 'me' ? state.me : state.users[id];
const full = u => `${u.first} ${u.last}`;
/* "James Jackson" → "James J***n": enough for a neighbor to recognize, not enough for a stranger to look up. */
const mask = u => u.last ? `${u.first} ${u.last[0]}***${u.last.length > 2 ? u.last.slice(-1) : ''}` : u.first;
const revealed = id => state.threads.some(t => t.withId === id && t.status === 'accepted');
const nameOf = id => id === 'me' ? full(state.me) : revealed(id) ? full(person(id)) : mask(person(id));
const verifiedLine = u => u.verified ? `<span class="verified">${icon('check')}Verified neighbor</span>` : 'Address not verified';
const TINTS = ['#b0763a', '#4f7a5e', '#657ba0', '#a0617a', '#786da8', '#4b8892', '#927548', '#617d58'];
function avatar(id, size = '') { const u = person(id), n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0); return `<span class="avatar ${size}" style="background:${id === 'me' ? 'var(--green)' : TINTS[n % TINTS.length]}">${esc((u.first[0] || '') + (u.last[0] || '')).toUpperCase()}</span>`; }

/* ---------- boundaries and visibility ---------- */
const namedB = id => state.boundaries.find(b => b.id === id);
const enclosing = () => state.boundaries.filter(b => geo.pip(HOME, b.points));
function bContains(b, center, p) { if (b.type === 'radius') return geo.dist(center, p) <= b.miles * 1000; const nb = namedB(b.id); return !!nb && geo.pip(p, nb.points); }
const bLabel = b => b.type === 'radius' ? `${fmtRadius(b.miles)} around home` : (namedB(b.id) || {}).name || 'My boundary';
const inMine = p => bContains(state.me.boundary, state.me.home, p);
const curLoc = () => state.away ? AWAY : state.me.home;
const opp = id => state.opps.find(o => o.id === id);
const thread = id => state.threads.find(t => t.id === id);
const threadWith = uidd => state.threads.find(t => t.withId === uidd);
const topicOf = t => opp(t.topicId || t.oppId);
const about = (t, id) => t.oppId === id || t.topicId === id;
/* A neighbor's request reaches me if they shared it with anyone, or my home is inside the boundary they shared it with. */
const canSee = o => o.scope === 'anyone' || bContains(person(o.ownerId).boundary, person(o.ownerId).home, state.me.home);
/* What I could help with: other people's active requests only. My own live under "My requests". */
function nearbyList() {
  const here = curLoc(), all = ui.nearby.scope === 'all';
  return state.opps.filter(o => o.status === 'active' && o.ownerId !== 'me' && !state.blocked.includes(o.ownerId) && !state.hidden.includes(o.id) && canSee(o) && (all ? geo.dist(o.loc, here) <= 1000 : inMine(o.loc)))
    .map(o => ({ o, mi: geo.dist(o.loc, here) / 1000 })).sort((a, b) => a.mi - b.mi);
}
const myOpps = which => state.opps.filter(o => o.ownerId === 'me' && (which === 'active' ? o.status === 'active' : o.status !== 'active'));
const sharedWith = o => o.scope === 'anyone' ? 'anyone within a mile' : o.ownerId === 'me' ? bLabel(state.me.boundary) : person(o.ownerId).boundary.type === 'named' ? bLabel(person(o.ownerId).boundary) : 'their neighborhood';
/* Helpers lined up so far. My own requests track who; sample neighbors' just carry a count. */
const foundN = o => o.helperIds ? o.helperIds.length : o.found || 0;
const arranged = o => foundN(o) >= o.helpers;
const urgent = o => !!o.deadline && calDays(o.deadline) <= 3 && calDays(o.deadline) >= 0;
const helpChip = o => arranged(o) ? `<span class="chip green">${icon('check')}Help arranged</span>` : foundN(o) ? `<span class="chip">${icon('users')}${foundN(o)} of ${o.helpers} helpers found</span>` : '';

/* ---------- lifecycle: 30-day expiry, reminders ---------- */
function sweep() {
  const t = now(); let changed = false;
  for (const o of state.opps) if (o.status === 'active' && o.expiresAt <= t) {
    if (o.ownerId === 'me') { o.status = 'expired'; o.closedAt = o.expiresAt; ui.expired.push(o.id); }
    else while (o.expiresAt <= t) o.expiresAt += LIFE; // sample neighbors always choose to extend
    changed = true;
  }
  if (changed) persist();
}
/* What an active request of mine needs from me, if anything. */
function attention(o) {
  if (o.status !== 'active') return null;
  const t = now();
  if (o.expiresAt - t <= WARN) return { type: 'expiring' };
  const last = o.checkedAt || o.renewedAt || o.createdAt;
  const helper = state.threads.find(th => about(th, o.id) && th.status === 'accepted' && th.acceptedAt <= t - 2 * DAY && th.acceptedAt > last);
  if (o.deadline && o.deadline < t && last < o.deadline) return { type: 'checkin', why: 'The date you needed this by has passed.' };
  if (helper) return { type: 'checkin', why: `${person(helper.withId).first} offered to help ${ago(helper.acceptedAt)}.` };
  if (t - last >= 7 * DAY) return { type: 'checkin', why: `It has been up for ${plural(Math.floor((t - (o.renewedAt || o.createdAt)) / DAY), 'day')}.` };
  return null;
}
/* One reminder banner at a time, and no more than one every ten minutes unless something just changed (force). */
function remind(force) {
  if (!state.me || !state.settings.reminders || ov.classList.contains('open')) return;
  if (ui.expired.length) {
    const o = opp(ui.expired.shift()); ui.expired = [];
    if (o) return banner(`${N.One} expired`, `“${o.title}” came down after 30 days. Renew it any time from My ${N.many}.`, () => { ui.tab = 'mine'; ui.stack = []; ui.mine.tab = 'past'; render(); });
  }
  if (Date.now() - ui.nudgedAt < (force ? 4000 : 6e5)) return;
  for (const o of myOpps('active')) {
    const a = attention(o), key = o.id + ':' + o.expiresAt + ':' + (o.checkedAt || 0);
    if (!a || ui.bannered.has(key) || (o.snoozeUntil || 0) > now()) continue;
    ui.bannered.add(key); ui.nudgedAt = Date.now();
    if (a.type === 'expiring') return banner('Still need help?', `“${o.title}” expires ${inDays(o.expiresAt)}. Extend it or mark it done.`, () => A.extendSheet({ id: o.id }));
    return banner('Checking in', `Still need help with “${o.title}”?`, () => A.checkinSheet({ id: o.id }));
  }
}

/* ================= overlays ================= */
const app = $('#app'), ov = $('#overlay');
let toastT, bannerT, bannerFn, confirmFn, opener;
function toast(t) { const el = $('#toast'); el.textContent = t; el.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => el.style.display = 'none', 4500); }
function banner(title, body, fn) {
  const b = $('#banner'); b.innerHTML = `<span class="brand-icon">${icon('brand')}</span><span><strong>${esc(title)}</strong><span>${esc(body)}</span></span>`;
  bannerFn = fn; b.classList.add('show'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), 9000);
}
/* Sheets take focus when they open, keep Tab inside, and hand focus back when they close. */
function sheet(html) {
  if (!ov.classList.contains('open')) opener = document.activeElement;
  $('#toast').style.display = 'none';
  ov.innerHTML = `<div class="backdrop" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`; ov.classList.add('open');
  (ov.querySelector('[autofocus]') || ov.querySelector('.sheet')).focus();
}
function closeSheet() { ov.classList.remove('open'); ov.innerHTML = ''; if (opener && document.contains(opener)) opener.focus(); opener = null; }
function confirmSheet(title, body, ok, fn, danger) { confirmFn = fn; sheet(`<h2>${title}</h2><p>${body}</p><div class="stack"><button class="primary ${danger ? 'danger' : ''}" data-act="confirmOk">${ok}</button><button class="secondary" data-act="closeSheet">Cancel</button></div>`); }

/* ================= shell ================= */
function navHtml() {
  const msgs = state.threads.reduce((n, t) => n + (t.status === 'request' ? 1 : t.unread || 0), 0), mine = myOpps('active').filter(attention).length;
  const tab = (t, i, l, b) => `<button data-act="tab" data-tab="${t}" class="${ui.tab === t ? 'active' : ''}" ${ui.tab === t ? 'aria-current="page"' : ''}>${icon(i)}${l}${b ? `<span class="badge" aria-label="${b} need attention">${b}</span>` : ''}</button>`;
  return `<nav aria-label="Main navigation">${tab('nearby', 'pin', 'Lend a hand', 0)}${tab('messages', 'chat', 'Messages', msgs)}<button class="ask" data-act="newOpp" aria-label="Ask for help"><span>${icon('plus')}</span>Ask</button>${tab('mine', 'clip', `My ${N.many}`, mine)}${tab('settings', 'gear', 'Settings', 0)}</nav>`;
}
function shell({ label, title, head, back, actions = '', pre = '', body, footer = '', flush }) {
  return `<header class="${back ? 'sub' : ''}">${back ? `<button class="icon-button" data-act="back" aria-label="Back">${icon('back')}</button>` : ''}${head || `<div>${label ? `<div class="label">${label}</div>` : ''}<h2>${title}</h2></div>`}${actions}</header>${pre}<div class="content ${flush ? 'flush' : ''}" id="content">${body}</div>${footer}${back ? '' : navHtml()}`;
}
const top = () => ui.stack[ui.stack.length - 1];
function push(v) { ui.stack.push(v); delete ui.scroll[v.name + ':' + (v.id || '')]; render(); }
function viewKey() { if (!state.me) return 'onboard:' + ui.onboard; const t = top(); return t ? t.name + ':' + (t.id || '') : 'tab:' + ui.tab + (ui.tab === 'nearby' ? ui.nearby.view : ''); }
function render() {
  sweep();
  const old = $('#content'); if (old && ui.key) ui.scroll[ui.key] = old.scrollTop;
  const t = top();
  app.innerHTML = !state.me ? (ui.onboard === 'signup' ? signupView() : ui.onboard === 'boundary' ? boundaryView() : welcomeView())
    : t ? ({ detail: detailView, chat: chatView, form: formView, boundary: boundaryView, blocked: blockedView })[t.name](t)
    : ({ nearby: nearbyView, messages: messagesView, mine: mineView, settings: settingsView })[ui.tab]();
  ui.key = viewKey();
  const c = $('#content'); if (c) c.scrollTop = ui.scroll[ui.key] || 0;
  if ($('#nearbyMap')) mountNearby();
  if ($('#bdMap')) mountBd();
  if ($('#miniMap')) mountMini(opp(t.id));
  if (t && t.name === 'chat' && c) { c.scrollTop = c.scrollHeight; const inp = $('#chatInput'); if (inp) { inp.value = ui.drafts[t.id] || ''; syncComposer(); } }
  syncTools();
}

/* ================= onboarding ================= */
function welcomeView() {
  return `<div class="welcome"><span class="brand-icon">${icon('brand')}</span><div class="eyebrow">NEIGHBORS HELPING NEIGHBORS</div><h1>Lend a hand.<br>Ask for one.<br><em>Right next door.</em></h1><p>Find ways to serve the people living around you, and ask for help when you need it.</p>
  <ul class="points"><li>${icon('draw')}<span><strong>Set your neighborhood</strong>Join a boundary your neighbors drew, or make your own.</span></li><li>${icon('pin')}<span><strong>See who needs a hand</strong>On a map or a list, closest first.</span></li><li>${icon('lock')}<span><strong>Chat privately</strong>Your full name stays hidden until you accept a chat.</span></li></ul>
  <button class="primary" data-act="start">Get started</button><button class="text-button" data-act="demo">Explore with a sample account</button></div>`;
}
const shownAs = () => { const s = ui.signup, f = s.first.trim(), l = s.last.trim(); return f && l ? mask({ first: f, last: l }) : 'First L***t'; };
function signupView() {
  const s = ui.signup, f = (k, label, type, ph, auto) => `<div class="field"><label for="su-${k}">${label}</label><input id="su-${k}" type="${type}" data-su="${k}" value="${esc(s[k])}" placeholder="${ph}" autocomplete="${auto}"></div>`;
  return shell({ back: true, label: 'Step 1 of 2', title: 'About you', body: `<p class="body-copy">Tell us who you are and where home is, so we can show you the neighbors around you.</p>
    <div class="two">${f('first', 'First name', 'text', 'James', 'given-name')}${f('last', 'Last name', 'text', 'Jackson', 'family-name')}</div>${f('email', 'Email', 'email', 'you@example.com', 'email')}${f('address', 'Home address', 'text', '214 Alder Court', 'street-address')}
    <div class="shown-as">Neighbors will see you as<b id="shownAs">${esc(shownAs())}</b>Your full name is shared only with people whose offer you accept, or who accept yours.</div>
    <div class="tip">${icon('lock')}<span>Your address only places your home on the map. Other people see an approximate spot, never the address. You can verify it later in Settings to earn a “Verified neighbor” mark.</span></div><div class="error" id="suErr" role="alert"></div>`,
    footer: `<div class="footer-bar"><button class="primary" data-act="signupNext">Continue</button></div>` });
}

/* ================= boundary: choose, radius or draw ================= */
const newBd = () => { const b = state.me && state.me.boundary; return { mode: 'choose', pick: b && b.type === 'named' ? b.id : null, miles: b && b.type === 'radius' ? b.miles : 0.5, pts: [], closed: false, name: '', err: '', fit: true }; };
const ptsAttr = p => p.map(q => `${q.x},${q.y}`).join(' ');
function bdPanel() {
  const b = ui.bd, found = enclosing(), cur = state.me && state.me.boundary;
  const pan = (body, foot) => `<div class="bd-scroll">${body}</div><div class="bd-foot">${foot}</div>`;
  if (b.mode === 'radius') return pan(`<h3>Radius around your home</h3><div class="radius-value" id="radVal">${b.miles.toFixed(2)} <span>mile around home</span></div><input type="range" id="radRange" min="0.1" max="1" step="0.05" value="${b.miles}" aria-label="Radius in miles"><p class="fine">A radius is private. It isn’t named and never appears in the list other neighbors choose from.</p>`, `<button class="primary" data-act="bdSaveRadius">Use this radius</button>`);
  if (b.mode === 'draw' && b.closed) return pan(`<h3>Name your neighborhood</h3><p>Drawn boundaries are named and listed, so neighbors whose homes are inside can choose it too.</p><div class="field"><label for="bdName">Neighborhood name</label><input type="text" id="bdName" data-bd="name" maxlength="40" placeholder="e.g. Alder Court Neighbors" value="${esc(b.name)}"></div><div class="error" role="alert">${esc(b.err)}</div><button class="text-button" data-act="bdReopen">Redraw the shape</button>`, `<button class="primary" data-act="bdSaveDraw">Save and use this boundary</button>`);
  if (b.mode === 'draw') return pan(`<h3>Draw your neighborhood</h3><p>Tap the map to drop a point at each corner. Tap the first point again to close the shape. Your home must be inside it.</p><div class="draw-status">${icon('draw')}${b.pts.length ? plural(b.pts.length, 'point') + ' placed' + (b.pts.length < 3 ? ', at least 3 needed' : '') : 'No points yet'}</div><div class="error" role="alert">${esc(b.err)}</div><div class="row-actions"><button class="secondary small" data-act="bdUndo" ${b.pts.length ? '' : 'disabled'}>${icon('undo')}Undo</button><button class="secondary small" data-act="bdClear" ${b.pts.length ? '' : 'disabled'}>Clear</button></div>`, `<button class="primary" data-act="bdClose" ${b.pts.length >= 3 ? '' : 'disabled'}>Close shape</button>`);
  return pan(`<h3>${found.length ? `Your home is inside ${plural(found.length, 'neighborhood')}` : 'No neighborhood covers your home yet'}</h3><p>${found.length ? 'Choose one your neighbors already use, or create your own.' : 'Create the first one for your area.'} You can change this any time in Settings.</p>
    ${cur && cur.type === 'radius' ? `<div class="tip" style="margin-bottom:10px">${icon('radius')}<span>You’re currently using a private radius: <strong>${bLabel(cur)}</strong>.</span></div>` : ''}
    ${found.map(nb => `<button class="radio-card ${b.pick === nb.id ? 'on' : ''}" data-act="bdPick" data-id="${nb.id}" role="radio" aria-checked="${b.pick === nb.id}"><span class="dot"></span><div><strong>${esc(nb.name)}</strong><small>${plural(nb.members, 'neighbor')} · drawn by ${nb.createdBy === 'me' ? 'you' : esc(mask(person(nb.createdBy)))}${cur && cur.type === 'named' && cur.id === nb.id ? ' · current' : ''}</small></div></button>`).join('')}
    <div class="field"><span class="lbl">Or create your own</span><div class="row-actions"><button class="secondary small" data-act="bdMode" data-v="radius">${icon('radius')}Radius</button><button class="secondary small" data-act="bdMode" data-v="draw">${icon('draw')}Draw on map</button></div></div>`,
    `<button class="primary" data-act="bdUse" ${b.pick ? '' : 'disabled'}>${b.pick ? `Use ${esc(namedB(b.pick).name)}` : 'Choose a neighborhood'}</button>`);
}
function boundaryView() {
  if (!ui.bd) ui.bd = newBd();
  return shell({ back: true, label: state.me ? 'Settings' : 'Step 2 of 2', title: 'Your neighborhood', flush: true, body: `<div id="bdMap"></div><div class="bd-panel" id="bdPanel">${bdPanel()}</div>` });
}
let bdMap;
function mountBd() { bdMap = createMap($('#bdMap'), { key: 'bd', onTap: bdTap, onPin: id => { if (id === 'v0') A.bdClose(); } }); drawBd(); }
function drawBd() {
  const b = ui.bd, r = b.miles * 1000, cur = state.me && state.me.boundary; let svg = '', fit = null;
  const pins = [{ x: HOME.x, y: HOME.y, cls: 'nohit', html: `<div class="pin-home">${icon('home')}</div>` }];
  const circle = rr => `<circle class="b-mine" cx="${HOME.x}" cy="${HOME.y}" r="${rr}"/>`, around = rr => [{ x: HOME.x - rr, y: HOME.y - rr }, { x: HOME.x + rr, y: HOME.y + rr }];
  if (b.mode === 'choose') {
    const found = enclosing();
    svg = found.map(nb => `<polygon class="${b.pick === nb.id ? 'b-mine' : 'b-faint'}" points="${ptsAttr(nb.points)}"/>`).join('');
    if (!b.pick && cur && cur.type === 'radius') svg += circle(cur.miles * 1000);
    fit = b.pick ? namedB(b.pick).points : found.length ? found.flatMap(nb => nb.points) : around(500);
  } else if (b.mode === 'radius') { svg = circle(r); fit = around(r); }
  else {
    if (b.pts.length) svg = b.closed ? `<polygon class="b-draw" points="${ptsAttr(b.pts)}"/>` : `<polyline class="b-draw open" points="${ptsAttr(b.pts)}"/>`;
    b.pts.forEach((p, i) => { const first = i === 0 && !b.closed && b.pts.length >= 3; pins.push({ x: p.x, y: p.y, id: 'v' + i, cls: first ? 'first' : 'nohit', html: first ? '<button type="button" class="pin-vertex" aria-label="Close the shape"></button>' : '<div class="pin-vertex"></div>' }); });
    if (b.fit) fit = around(480);
  }
  bdMap.el.classList.toggle('drawing', b.mode === 'draw' && !b.closed);
  bdMap.setOverlay(svg); bdMap.setPins(pins);
  if (fit && (b.fit || b.mode !== 'draw')) bdMap.fit(fit, 0.22);
  b.fit = false;
}
const refreshBd = () => { $('#bdPanel').innerHTML = bdPanel(); drawBd(); };
function bdTap(pt) {
  const b = ui.bd; if (b.mode !== 'draw' || b.closed) return;
  if (b.pts.length >= 3 && geo.dist(pt, b.pts[0]) * bdMap.px() < 22) return A.bdClose();
  b.pts.push({ x: Math.round(pt.x), y: Math.round(pt.y) }); b.err = ''; refreshBd();
}
function finishBoundary(b, isNew) {
  const prev = state.me && state.me.boundary, same = prev && prev.type === 'named' && b.type === 'named' && prev.id === b.id;
  if (prev && prev.type === 'named' && !same && namedB(prev.id)) namedB(prev.id).members = Math.max(1, namedB(prev.id).members - 1);
  if (b.type === 'named' && !same && !isNew) namedB(b.id).members++;
  if (!state.me) {
    const s = ui.signup; state.me = { id: 'me', verified: false, first: s.first.trim(), last: s.last.trim(), email: s.email.trim(), address: s.address.trim(), home: { ...HOME }, boundary: b };
    ui.tab = 'nearby'; ui.stack = []; toast(`Welcome, ${state.me.first}. Here’s who could use a hand nearby.`);
  } else { state.me.boundary = b; ui.stack.pop(); toast(`Boundary set to ${bLabel(b)}.`); }
  ui.bd = null; ui.nearby.refit = true; ui.nearby.sel = null; persist(); render();
}

/* ================= lend a hand: map and list ================= */
function dueText(o) { const d = calDays(o.deadline); return d < 0 ? 'Past the date needed' : d === 0 ? 'Needed today' : d === 1 ? 'Needed by tomorrow' : 'Needed by ' + fmtDay(o.deadline); }
const dueChip = o => o.deadline ? `<span class="chip ${urgent(o) ? 'warm' : ''}">${icon('cal')}${dueText(o)}</span>` : '';
function oppRow(o, mi) {
  return `<button class="opp-row" data-act="open" data-id="${o.id}"><span class="cat-tile">${icon(CATS[o.cat][1])}</span><span class="info"><strong>${esc(o.title)}</strong><span class="meta">${esc(nameOf(o.ownerId))} · ${fmtMi(mi)} · ${CATS[o.cat][0]}</span><span class="chips">${dueChip(o)}${helpChip(o)}${!inMine(o.loc) ? '<span class="chip">Outside your boundary</span>' : ''}</span></span>${o.photos[0] ? `<img class="thumb" src="${o.photos[0]}" alt="">` : ''}</button>`;
}
function nearbyView() {
  const n = ui.nearby, items = nearbyList(), sel = items.find(x => x.o.id === n.sel), all = n.scope === 'all';
  const seg = (act, v, label, on) => `<button data-act="${act}" data-v="${v}" class="${on ? 'on' : ''}" aria-pressed="${on}">${label}</button>`;
  const none = `<div class="empty">${all ? 'Nothing within a mile of you right now.' : 'No one in your boundary is asking for help right now.'}<br>${all ? 'Check back soon.' : 'Try “Within 1 mile” to look a little farther.'}</div>`;
  return shell({ label: `${plural(items.length, N.one, N.many)} ${all ? 'within 1 mile of you' : 'in ' + esc(bLabel(state.me.boundary))}`, title: 'Lend a hand',
    pre: `<div class="controls"><div class="seg">${seg('scope', 'boundary', 'My boundary', !all)}${seg('scope', 'all', 'Within 1 mile', all)}</div><div class="seg">${seg('mode', 'map', icon('map') + '<span class="sr">Map</span>', n.view === 'map')}${seg('mode', 'list', icon('list') + '<span class="sr">List</span>', n.view === 'list')}</div></div>`,
    flush: n.view === 'map',
    body: n.view === 'map' ? `<div class="map-wrap"><div id="nearbyMap"></div><div class="map-legend"><div><i></i>${esc(bLabel(state.me.boundary))}</div>${all ? `<div><i class="mile"></i>1 mile from ${state.away ? 'you' : 'home'}</div>` : ''}${items.some(x => urgent(x.o)) ? '<div><b class="soon"></b>Needed within 3 days</div>' : ''}</div>${sel ? `<div class="map-card">${oppRow(sel.o, sel.mi)}</div>` : items.length ? '' : `<div class="map-card">${none}</div>`}</div>`
      : (items.map(x => oppRow(x.o, x.mi)).join('') || none) + (state.away ? `<p class="fine">Sorted by distance from where you are now, not from home.</p>` : '') });
}
let nearMap;
/* Pins that would overlap on screen merge into a numbered cluster; tapping one zooms in until they separate. */
function nearbyPins() {
  const n = ui.nearby, me = state.me, here = curLoc(), px = nearMap.px(), groups = [];
  for (const { o } of nearbyList()) {
    const g = groups.find(q => Math.hypot(q.x - o.loc.x, q.y - o.loc.y) * px < 34);
    if (g) { g.items.push(o); g.x = g.items.reduce((s, i) => s + i.loc.x, 0) / g.items.length; g.y = g.items.reduce((s, i) => s + i.loc.y, 0) / g.items.length; }
    else groups.push({ x: o.loc.x, y: o.loc.y, items: [o] });
  }
  const pins = [{ x: me.home.x, y: me.home.y, cls: 'nohit', html: `<div class="pin-home" title="Home">${icon('home')}</div>` }];
  if (state.away) pins.push({ x: here.x, y: here.y, cls: 'nohit', html: '<div class="pin-me" title="You are here"></div>' });
  for (const g of groups) {
    const o = g.items[0];
    if (g.items.length > 1) pins.push({ x: g.x, y: g.y, id: 'c:' + g.items.map(i => i.id).join(','), cls: 'cluster', html: `<button type="button" class="pin-cluster ${g.items.some(urgent) ? 'urgent' : ''}" aria-label="${g.items.length} ${N.many} here, zoom in">${g.items.length}</button>` });
    else pins.push({ x: o.loc.x, y: o.loc.y, id: o.id, cls: n.sel === o.id ? 'sel' : '', html: `<button type="button" class="pin-opp ${urgent(o) ? 'urgent' : ''} ${arranged(o) ? 'done' : ''}" aria-label="${esc(o.title)}${o.deadline ? ', ' + dueText(o) : ''}${arranged(o) ? ', help arranged' : ''}">${icon(arranged(o) ? 'check' : CATS[o.cat][1])}</button>` });
  }
  nearMap.setPins(pins);
}
function mountNearby() {
  const n = ui.nearby, me = state.me, here = curLoc();
  nearMap = createMap($('#nearbyMap'), { key: 'nearby', onZoom: () => nearbyPins(), onTap: () => { if (n.sel) { n.sel = null; render(); } },
    onPin: id => { if (id.startsWith('c:')) { n.sel = null; return nearMap.fit(id.slice(2).split(',').map(i => opp(i).loc), 1.2); } n.sel = n.sel === id ? null : id; render(); } });
  const b = me.boundary, r = b.type === 'radius' ? b.miles * 1000 : 0;
  nearMap.setOverlay((b.type === 'radius' ? `<circle class="b-mine" cx="${me.home.x}" cy="${me.home.y}" r="${r}"/>` : namedB(b.id) ? `<polygon class="b-mine" points="${ptsAttr(namedB(b.id).points)}"/>` : '') + (n.scope === 'all' ? `<circle class="b-mile" cx="${here.x}" cy="${here.y}" r="1000"/>` : ''));
  if (n.refit || nearMap.fresh) {
    n.refit = false;
    if (n.scope === 'all') nearMap.fit([{ x: here.x - 1000, y: here.y - 1000 }, { x: here.x + 1000, y: here.y + 1000 }], 0.08);
    else nearMap.fit(b.type === 'radius' ? [{ x: me.home.x - r, y: me.home.y - r }, { x: me.home.x + r, y: me.home.y + r }] : namedB(b.id).points, 0.3);
  } else nearbyPins();
}

/* ================= request detail ================= */
function facts(o) {
  const f = foundN(o);
  return `<div class="facts"><div><small>Time needed</small>${esc(o.est)}</div><div><small>Helpers</small>${f ? `${f} of ${o.helpers} found` : `${o.helpers} needed`}</div>${o.bring ? `<div class="wide"><small>What to bring</small>${esc(o.bring)}</div>` : ''}${o.times ? `<div class="wide"><small>Good times</small>${esc(o.times)}</div>` : ''}</div>`;
}
function detailView({ id }) {
  const o = opp(id);
  if (!o) return shell({ back: true, title: N.One, body: `<div class="empty">This ${N.one} is no longer available.</div>` });
  const mine = o.ownerId === 'me', owner = person(o.ownerId), mi = geo.dist(o.loc, curLoc()) / 1000, first = owner.first, t = threadWith(o.ownerId), d = o.deadline ? calDays(o.deadline) : null;
  const offers = mine ? state.threads.filter(th => about(th, o.id)) : [], a = mine ? attention(o) : null;
  let status = '', footer;
  if (mine && o.status === 'active') {
    status = a && a.type === 'expiring' ? `<div class="callout">${icon('clock')}<span><strong>Expires ${inDays(o.expiresAt)}</strong>Still need help? Extend it, or it comes down on ${fmtDay(o.expiresAt)}.</span></div>`
      : `<div class="callout calm">${icon('check')}<span><strong>Live for ${esc(sharedWith(o))}</strong>Up until ${fmtDay(o.expiresAt)}. We’ll check in 3 days before.</span></div>`;
    footer = `<div class="footer-bar">${a && a.type === 'expiring' ? `<button class="primary" data-act="extendSheet" data-id="${o.id}">${icon('clock')}Extend this ${N.one}</button><div class="row-actions" style="margin-top:8px"><button class="secondary small" data-act="complete" data-id="${o.id}">${icon('check')}Mark completed</button>` : `<button class="primary" data-act="complete" data-id="${o.id}">${icon('check')}Mark as completed</button><div class="row-actions" style="margin-top:8px">`}<button class="secondary small" data-act="editOpp" data-id="${o.id}">Edit</button><button class="secondary small danger" data-act="del" data-id="${o.id}">Delete</button></div></div>`;
  } else if (mine) {
    const helpers = (o.helperIds || []).filter(person).map(h => esc(nameOf(h)));
    status = `<div class="callout ${o.status === 'completed' ? 'calm' : ''}">${icon(o.status === 'completed' ? 'check' : 'clock')}<span><strong>${o.status === 'completed' ? 'Completed' : 'Expired'} ${fmtDate(o.closedAt)}</strong>${o.status === 'completed' && helpers.length ? `With help from ${list(helpers)}.` : 'No longer shown to neighbors.'}</span></div>`;
    footer = `<div class="footer-bar"><button class="primary" data-act="renewSheet" data-id="${o.id}">${o.status === 'expired' ? `Renew this ${N.one}` : 'Post it again'}</button><div class="row-actions" style="margin-top:8px"><button class="secondary small danger" data-act="del" data-id="${o.id}">Delete</button></div></div>`;
  } else {
    footer = `<div class="footer-bar">${t ? '' : `<p>${esc(first)} will see you as <strong>${esc(mask(state.me))}</strong> until they accept.</p>`}<button class="primary" data-act="offer" data-id="${o.id}">${icon('chat')}${t ? `Open your chat with ${esc(first)}` : `Message ${esc(first)} to offer help`}</button></div>`;
  }
  return shell({ back: true, label: CATS[o.cat][0], title: mine ? `Your ${N.one}` : N.One, footer, body: `<div class="detail">
    ${o.photos.length ? `<div class="photos">${o.photos.map(p => `<img src="${p}" alt="Photo from ${mine ? `your ${N.one}` : esc(first)}" data-act="zoom">`).join('')}</div>` : ''}
    <h1>${esc(o.title)}</h1>
    ${mine ? status : `<div class="who">${avatar(o.ownerId)}<div><strong>${esc(nameOf(o.ownerId))}</strong><small>${verifiedLine(owner)} · posted ${ago(o.createdAt)}</small></div><span class="dist">${fmtMi(mi)} away</span></div>`}
    ${!mine && arranged(o) ? `<div class="callout calm">${icon('check')}<span><strong>Help is arranged</strong>${esc(first)} has the ${o.helpers === 1 ? 'helper' : 'helpers'} they need. You can still message in case plans change.</span></div>` : ''}
    ${d !== null && o.status === 'active' ? `<div class="callout ${d > 3 ? 'calm' : ''}">${icon('cal')}<span><strong>${d < 0 ? 'The date needed has passed' : 'Needed by ' + fmtDay(o.deadline)}</strong>${d < 0 ? '' : d === 0 ? 'That’s today.' : d === 1 ? 'That’s tomorrow.' : `${d} days from now.`}</span></div>` : ''}
    <p class="desc">${esc(o.desc)}</p>${facts(o)}
    ${offers.length ? `<div class="section-title"><h3>Neighbors who offered</h3><span>${offers.length}</span></div>${offers.map(th => threadRow(th, (o.helperIds || []).includes(th.withId))).join('')}` : ''}
    ${mine ? '' : `<div class="section-title"><h3>Where</h3><span>${fmtMi(mi)} from ${state.away ? 'you' : 'home'}</span></div><div id="miniMap" class="mini-map"></div><p class="fine">Approximate area only. ${esc(first)} can share the address once you’re chatting.</p>`}
    <p class="fine">Posted ${fmtDate(o.createdAt)} · Shared with ${esc(sharedWith(o))}${mine && !state.me.verified ? '<br>Neighbors see “Address not verified” next to your name. You can verify in Settings.' : ''}</p>
    ${mine ? '' : `<button class="text-button quiet" data-act="more" data-kind="opp" data-id="${o.id}">${icon('flag')}Report or block</button>`}</div>` });
}
function mountMini(o) {
  if (!o) return;
  const map = createMap($('#miniMap'), { key: 'mini' });
  map.setOverlay(`<circle class="b-approx" cx="${o.loc.x}" cy="${o.loc.y}" r="75"/>`);
  map.setPins([{ x: state.me.home.x, y: state.me.home.y, cls: 'nohit', html: `<div class="pin-home">${icon('home')}</div>` }]);
  map.fit([{ x: o.loc.x - 150, y: o.loc.y - 150 }, { x: o.loc.x + 150, y: o.loc.y + 150 }, state.me.home], 0.3);
}

/* ================= ask for help: create / edit ================= */
function newForm(o) {
  return o ? { id: o.id, title: o.title, cat: o.cat, desc: o.desc, est: o.est, helpers: o.helpers, bring: o.bring, times: o.times, photos: o.photos.slice(), hasDeadline: !!o.deadline, deadline: o.deadline ? isoDate(o.deadline) : '', scope: o.scope, err: '' }
    : { id: null, title: '', cat: null, desc: '', est: EST[1], helpers: 1, bring: '', times: '', photos: [], hasDeadline: false, deadline: '', scope: 'boundary', err: '' };
}
function formView() {
  const f = ui.form, bl = bLabel(state.me.boundary);
  return shell({ back: true, label: f.id ? 'Edit' : `New ${N.one}`, title: f.id ? `Update your ${N.one}` : 'Ask for help', footer: `<div class="footer-bar"><button class="primary" data-act="saveOpp">${f.id ? 'Save changes' : `Post ${N.one}`}</button></div>`, body: `
    <div class="field"><label for="f-title">What do you need help with?</label><input type="text" id="f-title" data-f="title" maxlength="70" placeholder="e.g. Rake leaves before the snow" value="${esc(f.title)}"></div>
    <div class="field"><span class="lbl">Kind of help</span><div class="choice-chips">${Object.entries(CATS).map(([k, [l, i]]) => `<button data-act="setF" data-k="cat" data-v="${k}" class="${f.cat === k ? 'on' : ''}" aria-pressed="${f.cat === k}">${icon(i)}${l}</button>`).join('')}</div></div>
    <div class="field"><label for="f-desc">Describe the need</label><textarea id="f-desc" data-f="desc" placeholder="What needs doing, how big the job is, anything a helper should know before they offer.">${esc(f.desc)}</textarea></div>
    <div class="two"><div class="field"><label for="f-est">Time needed</label><select id="f-est" data-f="est">${EST.map(e => `<option ${f.est === e ? 'selected' : ''}>${e}</option>`).join('')}</select></div>
    <div class="field"><span class="lbl">Helpers needed</span><div class="stepper"><button data-act="step" data-d="-1" aria-label="Fewer helpers">−</button><b id="helpersN">${f.helpers}</b><button data-act="step" data-d="1" aria-label="More helpers">+</button></div></div></div>
    <div class="field"><label for="f-bring">What to bring <span class="opt">(optional)</span></label><input type="text" id="f-bring" data-f="bring" maxlength="90" placeholder="Tools, gloves, a truck…" value="${esc(f.bring)}"></div>
    <div class="field"><label for="f-times">Good times <span class="opt">(optional)</span></label><input type="text" id="f-times" data-f="times" maxlength="90" placeholder="Weekday evenings, Saturday morning…" value="${esc(f.times)}"></div>
    <div class="field"><span class="lbl">Photos <span class="opt">(optional)</span></span><div class="photo-grid">${f.photos.map((p, i) => `<div class="ph"><img src="${p}" alt="Photo ${i + 1}"><button data-act="rmPhoto" data-i="${i}" aria-label="Remove photo ${i + 1}">×</button></div>`).join('')}${f.photos.length < 6 ? `<label class="photo-add" tabindex="0">${icon('photo')}Add photo<input type="file" accept="image/*" multiple hidden data-file="form"></label>` : ''}</div></div>
    <div class="settings-group"><label class="setting"><span>Needed by a certain date<small>Only if there’s a pressing deadline.</small></span><input type="checkbox" class="switch" data-f="hasDeadline" data-re="1" ${f.hasDeadline ? 'checked' : ''}></label>${f.hasDeadline ? `<div class="setting"><label for="f-deadline">Finish by</label><input type="date" id="f-deadline" data-f="deadline" min="${isoDate(now())}" value="${f.deadline}" class="date"></div>` : ''}</div>
    <div class="field"><span class="lbl">Who can see this</span>
      <button class="radio-card ${f.scope === 'boundary' ? 'on' : ''}" data-act="setF" data-k="scope" data-v="boundary" role="radio" aria-checked="${f.scope === 'boundary'}"><span class="dot"></span><div><strong>My boundary</strong><small>${esc(bl)}</small></div>${icon('users')}</button>
      <button class="radio-card ${f.scope === 'anyone' ? 'on' : ''}" data-act="setF" data-k="scope" data-v="anyone" role="radio" aria-checked="${f.scope === 'anyone'}"><span class="dot"></span><div><strong>Anyone nearby</strong><small>Also people outside your boundary, within a mile</small></div>${icon('globe')}</button>
      ${f.scope === 'anyone' ? `<div class="tip caution">${icon('shield')}<span><strong>People you may not know will see this.</strong> Leave out details like being home alone, away, or unable to get around. Save those for the chat.</span></div>` : ''}</div>
    <div class="tip">${icon('clock')}<span>It stays up for <strong>30 days</strong>. We’ll check in 3 days before so you can extend it or mark it done.</span></div><div class="error" id="formErr" role="alert">${esc(f.err)}</div>` });
}
function readImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.78)); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('unreadable')); };
    img.src = url;
  });
}
async function addPhotos(input) {
  const files = [...input.files], kind = input.dataset.file, t = top(); input.value = '';
  for (const f of files) {
    try { const url = await readImage(f); if (kind === 'chat') sendMsg(thread(t.id), { photo: url }); else if (ui.form && ui.form.photos.length < 6) ui.form.photos.push(url); }
    catch (e) { toast('That file couldn’t be read as a photo.'); }
  }
  if (kind !== 'chat') render();
}

/* ================= my requests ================= */
function nudge(o, a) {
  const exp = a.type === 'expiring';
  return `<div class="nudge ${exp ? '' : 'calm'}"><div class="over">${icon(exp ? 'clock' : 'bell')}${exp ? `Expires ${inDays(o.expiresAt)}` : 'Checking in'}</div><strong>${exp ? '' : 'Still need help with '}“${esc(o.title)}”${exp ? '' : '?'}</strong><p>${exp ? `Still need help? Extend it, or mark it completed so the list stays current. With no answer by ${fmtDay(o.expiresAt)} it comes down automatically.` : esc(a.why) + ' If you’re all set, mark it completed so neighbors see an up-to-date list.'}</p><div class="row-actions">${exp ? `<button class="secondary small" data-act="extendSheet" data-id="${o.id}">Extend</button>` : `<button class="secondary small" data-act="still" data-id="${o.id}">Still need it</button>`}<button class="secondary small" data-act="complete" data-id="${o.id}">${icon('check')}It’s done</button></div></div>`;
}
function mineCard(o) {
  const offers = state.threads.filter(t => about(t, o.id)).length, left = Math.max(0, Math.min(1, (o.expiresAt - now()) / LIFE));
  if (o.status === 'active') return `<div class="mine-card"><button class="top" data-act="open" data-id="${o.id}"><span class="cat-tile">${icon(CATS[o.cat][1])}</span><div><strong>${esc(o.title)}</strong><div class="meta">Posted ${fmtDate(o.createdAt)} · expires ${inDays(o.expiresAt)}<br>${offers ? plural(offers, 'offer') : 'No offers yet'} · ${foundN(o)} of ${plural(o.helpers, 'helper')} found</div></div>${icon('chev')}</button><div class="life ${o.expiresAt - now() <= WARN ? 'low' : ''}" role="img" aria-label="${daysLeft(o.expiresAt)} days left"><i style="width:${(left * 100).toFixed(0)}%"></i></div><div class="row-actions"><button class="secondary small" data-act="complete" data-id="${o.id}">${icon('check')}Mark completed</button><button class="secondary small" data-act="editOpp" data-id="${o.id}">Edit</button></div></div>`;
  const done = o.status === 'completed', helpers = done ? (o.helperIds || []).filter(person).map(h => esc(nameOf(h))) : [];
  return `<div class="mine-card past"><button class="top" data-act="open" data-id="${o.id}"><span class="cat-tile">${icon(CATS[o.cat][1])}</span><div><strong>${esc(o.title)}</strong><div class="meta"><span class="chip ${done ? 'green' : 'warm'}">${icon(done ? 'check' : 'clock')}${done ? 'Completed' : 'Expired'} ${fmtDate(o.closedAt)}</span>${helpers.length ? `<br>${icon('heart')} Helped by ${list(helpers)}` : ''}</div></div>${icon('chev')}</button><div class="row-actions"><button class="secondary small" data-act="renewSheet" data-id="${o.id}">${done ? 'Post again' : 'Renew'}</button><button class="secondary small danger" data-act="del" data-id="${o.id}">Delete</button></div></div>`;
}
function mineView() {
  const act = myOpps('active').sort((a, b) => a.expiresAt - b.expiresAt), past = myOpps('past').sort((a, b) => b.closedAt - a.closedAt), showPast = ui.mine.tab === 'past';
  const nudges = act.map(o => [o, attention(o)]).filter(x => x[1]);
  return shell({ label: `${act.length} active · ${past.length} past`, title: `My ${N.many}`, body: `
    ${nudges.map(([o, a]) => nudge(o, a)).join('')}
    <div class="seg" style="margin:6px 0 14px"><button data-act="mineTab" data-v="active" class="${showPast ? '' : 'on'}" aria-pressed="${!showPast}">Active (${act.length})</button><button data-act="mineTab" data-v="past" class="${showPast ? 'on' : ''}" aria-pressed="${showPast}">Past (${past.length})</button></div>
    ${showPast ? (past.map(mineCard).join('') || `<div class="empty">Completed and expired ${N.many} are kept here.</div>`) + (past.length ? `<p class="fine">Expired ${N.many} can be renewed for 1, 2 or 3 weeks, or another 30 days.</p>` : '')
      : act.map(mineCard).join('') || `<div class="empty">You haven’t asked for help yet.<br>Everyone needs a hand sometimes.</div><button class="primary" style="margin-top:14px" data-act="newOpp">${icon('plus')}Ask for help</button>`}` });
}

/* ================= messages ================= */
const lastMsg = t => t.messages[t.messages.length - 1];
function threadRow(t, helping) {
  const m = lastMsg(t), o = topicOf(t), txt = m.photo ? 'Photo' : m.text;
  return `<button class="thread-row ${t.unread ? 'unread' : ''}" data-act="openChat" data-id="${t.id}">${avatar(t.withId)}<div><div class="line1"><strong>${esc(nameOf(t.withId))}</strong><time>${stamp(m.at)}</time></div><div class="about">${helping ? 'Helping · ' : ''}${o ? '“' + esc(o.title) + '”' : `${N.One} removed`}</div><div class="last">${t.status === 'pending' ? 'Waiting for them to accept' : t.status === 'request' ? 'Offered to help: ' + esc(txt) : (m.from === 'me' ? 'You: ' : '') + esc(txt)}</div></div>${t.unread ? '<span class="unread-dot" aria-label="Unread"></span>' : ''}</button>`;
}
function messagesView() {
  const reqs = state.threads.filter(t => t.status === 'request').sort((a, b) => lastMsg(b).at - lastMsg(a).at), rest = state.threads.filter(t => t.status !== 'request').sort((a, b) => lastMsg(b).at - lastMsg(a).at);
  return shell({ label: `${plural(reqs.length, 'offer')} · ${plural(rest.length, 'conversation')}`, title: 'Messages', body: `
    ${reqs.length ? `<div class="section-title"><h3>Offers of help</h3><span>Accept to see full names</span></div>${reqs.map(t => { const o = opp(t.oppId), u = person(t.withId); return `<div class="req-card"><button class="top" data-act="openChat" data-id="${t.id}">${avatar(t.withId)}<div><strong>${esc(nameOf(t.withId))}</strong><small>${verifiedLine(u)} · ${ago(lastMsg(t).at)}</small><small>For ${o ? '“' + esc(o.title) + '”' : `your ${N.one}`}</small></div></button><blockquote>${esc(t.messages[0].text || 'Photo')}</blockquote><div class="row-actions"><button class="secondary small" data-act="decline" data-id="${t.id}">No thanks</button><button class="primary small" data-act="accept" data-id="${t.id}">Accept</button></div><button class="text-button quiet" data-act="more" data-kind="person" data-id="${t.withId}">${icon('flag')}Report or block</button></div>`; }).join('')}` : ''}
    <div class="section-title"><h3>Conversations</h3><span>${rest.length || ''}</span></div>
    ${rest.map(t => threadRow(t)).join('') || '<div class="empty">No conversations yet.<br>Offer to help a neighbor from Lend a hand to start one.</div>'}
    <div class="tip" style="margin-top:18px">${icon('lock')}<span>New people show up as an <strong>offer</strong>. Accept to chat and see each other’s full names. Say “No thanks” to pass politely; they can offer again another time. Block is separate, for people you don’t want to hear from.</span></div>` });
}
function chatView({ id }) {
  const t = thread(id);
  if (!t) return shell({ back: true, title: 'Chat', body: '<div class="empty">This conversation is no longer available.</div>' });
  const o = topicOf(t), u = person(t.withId), first = u.first; let day = '', log = '';
  for (const m of t.messages) {
    const d = fmtDay(m.at); if (d !== day) { log += `<div class="msg-sys">${d}</div>`; day = d; }
    if (m.from === 'system') { log += `<div class="msg-sys">${esc(m.text)}</div>`; continue; }
    const side = m.from === 'me' ? 'me' : 'them';
    log += (m.photo ? `<div class="msg photo ${side}"><img src="${m.photo}" alt="Photo from ${side === 'me' ? 'you' : esc(first)}" data-act="zoom"></div>` : `<div class="msg ${side}">${esc(m.text)}</div>`) + `<div class="msg-time ${side}">${fmtTime(m.at)}</div>`;
  }
  /* If this chat is about one of my open requests, let me say whether they are actually helping. */
  const mineOpp = t.status === 'accepted' && [opp(t.oppId), opp(t.topicId)].find(x => x && x.ownerId === 'me' && x.status === 'active'), helping = mineOpp && mineOpp.helperIds.includes(t.withId);
  const strip = !mineOpp ? '' : helping ? `<div class="helper-strip on">${icon('check')}<span>${esc(first)} is helping with this</span><button class="text-button" data-act="helper" data-id="${t.id}" data-opp="${mineOpp.id}">Undo</button></div>`
    : `<div class="helper-strip"><span>Is ${esc(first)} going to help with this?</span><button class="secondary small" data-act="helper" data-id="${t.id}" data-opp="${mineOpp.id}">${icon('check')}Count as helper</button></div>`;
  const footer = t.status === 'accepted' ? `<div class="composer"><button class="icon-button" data-act="pickPhoto" aria-label="Send a photo">${icon('photo')}</button><input type="file" accept="image/*" hidden id="chatFile" data-file="chat"><textarea id="chatInput" rows="1" placeholder="Message ${esc(first)}" aria-label="Message ${esc(first)}"></textarea><button class="icon-button send" data-act="send" aria-label="Send" disabled>${icon('send')}</button></div>`
    : t.status === 'pending' ? `<div class="footer-bar"><p>${icon('clock')} Waiting for <strong>${esc(mask(u))}</strong> to accept. You can keep chatting, and you’ll see each other’s full names, once they do.</p><button class="secondary small" data-act="withdraw" data-id="${t.id}">Withdraw my offer</button></div>`
    : `<div class="footer-bar"><p><strong>${esc(mask(u))}</strong> is offering to help. Accept to reply and see each other’s full names, or pass politely.</p><div class="row-actions"><button class="secondary" data-act="decline" data-id="${t.id}">No thanks</button><button class="primary" data-act="accept" data-id="${t.id}">Accept</button></div></div>`;
  return shell({ back: true, footer, actions: `<button class="icon-button" data-act="more" data-kind="person" data-id="${t.withId}" aria-label="Report or block ${esc(first)}">${icon('dots')}</button>`,
    head: `<div class="chat-head">${avatar(t.withId, 'sm')}<div><h2>${esc(nameOf(t.withId))}</h2><div class="label">${t.status === 'accepted' ? 'Full names shared' : 'Name hidden until accepted'} · ${u.verified ? 'Verified neighbor' : 'Address not verified'}</div></div></div>`,
    body: `<div class="chat">${o ? `<button class="chat-context" data-act="open" data-id="${o.id}">${icon(CATS[o.cat][1])}<span>${o.ownerId === 'me' ? `Your ${N.one}` : `${esc(first)}’s ${N.one}`}: ${esc(o.title)}</span>${icon('chev')}</button>` : ''}${strip}${log}</div>` });
}
function syncComposer() { const inp = $('#chatInput'), s = $('.composer .send'); if (!inp) return; s.disabled = !inp.value.trim(); inp.style.height = '44px'; inp.style.height = Math.min(120, inp.scrollHeight + 2) + 'px'; }
const viewing = id => { const t = top(); return !!t && t.name === 'chat' && t.id === id; };
function sendMsg(t, m) {
  if (!t || t.status !== 'accepted') return;
  t.messages.push({ id: uid(), from: 'me', at: now(), ...m }); persist(); render();
  const tid = t.id; setTimeout(() => {
    const th = thread(tid); if (!th || th.status !== 'accepted') return;
    incoming(th, HM.REPLIES[(th.replies = (th.replies || 0) + 1) % HM.REPLIES.length]);
  }, 2400);
}
function incoming(t, text) {
  t.messages.push({ id: uid(), from: t.withId, at: now(), text });
  if (viewing(t.id)) { const inp = $('#chatInput'); if (inp) ui.drafts[t.id] = inp.value; }
  else { t.unread = (t.unread || 0) + 1; if (state.settings.messages) banner(nameOf(t.withId), text, () => A.openChat({ id: t.id })); }
  persist(); render();
}
function acceptOutgoing(id) {
  const t = thread(id); if (!t || t.status !== 'pending') return;
  t.status = 'accepted'; t.acceptedAt = now();
  t.messages.push({ id: uid(), from: 'system', at: now(), text: `${person(t.withId).first} accepted. You can now see each other’s names.` });
  incoming(t, 'Thank you, that would be a big help! What day works for you?');
}
/* Blocking removes every trace of the person from my side: chats, helper marks, and any screen showing them. */
function doBlock(who) {
  state.threads = state.threads.filter(t => t.withId !== who);
  if (!state.blocked.includes(who)) state.blocked.push(who);
  (state.blockedAt = state.blockedAt || {})[who] = now();
  for (const o of myOpps('active')) o.helperIds = o.helperIds.filter(h => h !== who);
  ui.stack = ui.stack.filter(v => !(v.name === 'chat' && !thread(v.id)) && !(v.name === 'detail' && opp(v.id) && opp(v.id).ownerId === who));
}
function finishComplete(o, helperIds, thanks) {
  const helped = [];
  o.status = 'completed'; o.closedAt = now(); o.helperIds = helperIds;
  for (const t of state.threads.filter(th => about(th, o.id) && th.status === 'accepted')) {
    if (helperIds.includes(t.withId) && thanks) { t.messages.push({ id: uid(), from: 'me', at: now(), text: thanks }); helped.push(person(t.withId).first); }
    else t.messages.push({ id: uid(), from: 'system', at: now(), text: `You marked “${o.title}” as completed. ${person(t.withId).first} was told you’re all set.` });
  }
  const waiting = state.threads.filter(th => th.oppId === o.id && th.status === 'request');
  state.threads = state.threads.filter(th => !waiting.includes(th)); // open offers are answered with a polite "all set, thank you"
  closeSheet(); persist(); render();
  toast(`Marked completed.${helped.length ? ` Thanks sent to ${list(helped)}.` : ''}${waiting.length ? ` ${plural(waiting.length, 'open offer')} told you’re all set.` : ''}`);
}

/* ================= settings ================= */
function toolsHtml() {
  return `<div class="only-mobile"><div class="section-title"><h3>Prototype tools</h3></div><div class="settings-group">${[['demo', '', 'Load sample account'], ['simRequest', '', 'Simulate a neighbor’s offer of help'], ['simAccept', '', 'Have neighbors accept my offers'], ['skip', '1', 'Fast-forward 1 day'], ['skip', '7', 'Fast-forward 1 week'], ['away', '', state.away ? 'Bring me back home' : 'Move me away from home']].map(([a, d, l]) => `<button class="setting" data-act="${a}" ${d ? `data-days="${d}"` : ''}><span>${l}</span>${icon('chev')}</button>`).join('')}</div></div>`;
}
function settingsView() {
  const me = state.me, b = me.boundary, nb = b.type === 'named' && namedB(b.id), s = state.settings;
  const tog = (k, label, sub) => `<label class="setting"><span>${label}<small>${sub}</small></span><input type="checkbox" class="switch" data-set="${k}" ${s[k] ? 'checked' : ''}></label>`;
  return shell({ label: 'You and your neighborhood', title: 'Settings', body: `
    <div class="settings-group"><div class="setting">${avatar('me', 'lg')}<span><strong style="font-size:16px">${esc(full(me))}</strong><small>Shown to neighbors as <strong>${esc(mask(me))}</strong><br>${esc(me.email)} · ${esc(me.address)}</small></span></div>
      ${me.verified ? `<div class="setting"><span class="verified">${icon('check')}Address verified</span></div>` : `<button class="setting" data-act="verifySheet"><span>Verify my address<small>Neighbors see “Address not verified” until you do</small></span>${icon('chev')}</button>`}
      <button class="setting" data-act="editProfile"><span>Edit profile</span>${icon('chev')}</button></div>
    <div class="section-title"><h3>My neighborhood</h3></div>
    <div class="settings-group"><button class="setting" data-act="changeBoundary"><span>${esc(bLabel(b))}<small>${nb ? `Drawn boundary · ${plural(nb.members, 'neighbor')}` : 'Private radius · not listed for others'}</small></span>${icon('chev')}</button></div>
    <div class="section-title"><h3>Safety</h3></div>
    <div class="settings-group"><button class="setting" data-act="openBlocked"><span>Blocked neighbors<small>They can’t contact you and you don’t see their ${N.many}</small></span><span class="chip">${state.blocked.length}</span>${icon('chev')}</button></div>
    <div class="section-title"><h3>Notifications</h3></div>
    <div class="settings-group">${tog('requests', 'Offers of help', 'When a neighbor offers to help')}${tog('messages', 'Messages', 'Replies in your conversations')}${tog('reminders', 'Check-ins and expiry', `Reminders to extend or close your ${N.many}`)}</div>
    ${toolsHtml()}
    <button class="text-button danger" data-act="signOut">Sign out</button>
    <p class="fine">HelperMeet prototype. Neighbors, map and messages are sample data saved only in this browser.</p>` });
}
function blockedView() {
  return shell({ back: true, label: 'Settings', title: 'Blocked neighbors', body: `<p class="body-copy">People you block can’t send you offers or messages, and their ${N.many} are hidden from you. They aren’t told. Passing on an offer with “No thanks” does not block anyone.</p>
    ${state.blocked.map(id => `<div class="thread-row">${avatar(id)}<div><div class="line1"><strong>${esc(mask(person(id)))}</strong></div><div class="last">Blocked ${fmtDate((state.blockedAt || {})[id] || now())}</div></div><button class="secondary small" data-act="unblock" data-id="${id}">Unblock</button></div>`).join('') || '<div class="empty">No one is blocked.</div>'}` });
}

/* ================= actions ================= */
const durations = (act, id, base) => `<div class="extend-grid">${EXTEND.map(([d, l]) => `<button data-act="${act}" data-id="${id}" data-days="${d}"><strong>${l}</strong><small>until ${fmtDate(base + d * DAY)}</small></button>`).join('')}</div>`;
const needMe = () => { if (state.me) return true; toast('Sign up or load the sample account first.'); return false; };
const A = {
  /* onboarding */
  start() { ui.onboard = 'signup'; render(); },
  demo() { const t = Date.now(); state = HM.seedDemo(HM.seed(t), t); ui = blankUi(); closeSheet(); persist(); render(); toast('Signed in as James Jackson, a sample account.'); setTimeout(() => remind(true), 1200); },
  restart() { state = HM.seed(Date.now()); ui = blankUi(); closeSheet(); $('#banner').classList.remove('show'); persist(); render(); },
  signupNext() {
    const s = ui.signup, err = !s.first.trim() || !s.last.trim() ? 'Enter your first and last name.' : !/^\S+@\S+\.\S+$/.test(s.email.trim()) ? 'Enter a valid email address.' : s.address.trim().length < 4 ? 'Enter your home address so we can find your neighborhood.' : '';
    if (err) { $('#suErr').textContent = err; return; }
    ui.onboard = 'boundary'; ui.bd = newBd(); render();
  },
  back() {
    if (ui.bd && ui.bd.mode !== 'choose' && (!state.me || (top() && top().name === 'boundary'))) { ui.bd = { ...newBd(), pick: ui.bd.pick }; return render(); }
    if (!state.me) { ui.onboard = ui.onboard === 'boundary' ? 'signup' : 'welcome'; ui.bd = null; return render(); }
    const t = ui.stack.pop(); if (t && t.name === 'boundary') ui.bd = null; if (t && t.name === 'form') ui.form = null;
    render();
  },
  tab({ tab }) { ui.tab = tab; ui.stack = []; ui.bd = null; render(); },
  /* boundary */
  bdPick({ id }) { ui.bd.pick = id; refreshBd(); },
  bdMode({ v }) { Object.assign(ui.bd, { mode: v, pts: [], closed: false, err: '', name: '', fit: true }); refreshBd(); },
  bdUse() { if (ui.bd.pick) finishBoundary({ type: 'named', id: ui.bd.pick }); },
  bdSaveRadius() { finishBoundary({ type: 'radius', miles: ui.bd.miles }); },
  bdUndo() { ui.bd.pts.pop(); ui.bd.err = ''; refreshBd(); },
  bdClear() { ui.bd.pts = []; ui.bd.err = ''; refreshBd(); },
  bdReopen() { ui.bd.closed = false; ui.bd.err = ''; refreshBd(); },
  bdClose() {
    const b = ui.bd; if (b.pts.length < 3) return;
    b.err = geo.selfIntersects(b.pts) ? 'Those lines cross each other. Undo a point and try again.' : !geo.pip(HOME, b.pts) ? 'Your home (the house marker) has to be inside the shape. Undo a point, or clear and draw around it.' : '';
    b.closed = !b.err; refreshBd(); if (b.closed) { const n = $('#bdName'); if (n) n.focus(); }
  },
  bdSaveDraw() {
    const b = ui.bd, name = b.name.trim().replace(/\s+/g, ' ');
    b.err = name.length < 3 ? 'Give your neighborhood a name of at least 3 characters.' : state.boundaries.some(x => x.name.toLowerCase() === name.toLowerCase()) ? 'A neighborhood with that name already exists. Choose a different name.' : '';
    if (b.err) { refreshBd(); const n = $('#bdName'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } return; }
    const nb = { id: 'b' + uid(), name, points: b.pts.slice(), members: 1, createdBy: 'me' }; state.boundaries.push(nb);
    finishBoundary({ type: 'named', id: nb.id }, true);
  },
  changeBoundary() { ui.bd = newBd(); push({ name: 'boundary' }); },
  /* lend a hand */
  scope({ v }) { Object.assign(ui.nearby, { scope: v, sel: null, refit: true }); render(); },
  mode({ v }) { ui.nearby.view = v; render(); },
  open({ id }) { const t = top(); if (t && t.name === 'detail' && t.id === id) return; push({ name: 'detail', id }); },
  zoom(d, el) { opener = el; ov.innerHTML = `<div class="lightbox" data-act="closeSheet"><img src="${el.getAttribute('src')}" alt="${esc(el.alt)}"></div>`; ov.classList.add('open'); },
  /* ask for help */
  newOpp() { ui.form = newForm(); ui.stack = ui.stack.filter(v => v.name !== 'form'); push({ name: 'form' }); },
  editOpp({ id }) { ui.form = newForm(opp(id)); push({ name: 'form', id }); },
  setF({ k, v }) { ui.form[k] = v; ui.form.err = ''; render(); },
  step({ d }) { const f = ui.form; f.helpers = Math.max(1, Math.min(12, f.helpers + +d)); $('#helpersN').textContent = f.helpers; },
  rmPhoto({ i }) { ui.form.photos.splice(+i, 1); render(); },
  saveOpp() {
    const f = ui.form, title = f.title.trim(), desc = f.desc.trim(), due = f.hasDeadline && f.deadline ? HM.endOfDay(new Date(f.deadline + 'T12:00').getTime()) : null;
    f.err = title.length < 4 ? 'Add a short title so neighbors know what you need.' : !f.cat ? 'Choose the kind of help you need.' : desc.length < 15 ? 'Describe the need in a sentence or two so helpers know what to expect.' : f.hasDeadline && !due ? 'Pick the date you need this finished by, or turn the deadline off.' : due && due < now() ? 'The deadline can’t be in the past.' : '';
    if (f.err) { render(); const e = $('#formErr'); if (e) e.scrollIntoView({ block: 'nearest' }); return; }
    const vals = { title, desc, cat: f.cat, est: f.est, helpers: f.helpers, bring: f.bring.trim(), times: f.times.trim(), photos: f.photos.slice(), deadline: due, scope: f.scope };
    let o = f.id && opp(f.id);
    if (o) { Object.assign(o, vals); toast('Changes saved.'); ui.stack.pop(); }
    else {
      const t = now(), n = myOpps('active').length + myOpps('past').length, ang = n * 2.4;
      o = { id: 'm' + uid(), ownerId: 'me', status: 'active', helperIds: [], createdAt: t, expiresAt: t + LIFE, loc: { x: Math.round(state.me.home.x + 36 * Math.cos(ang)), y: Math.round(state.me.home.y + 36 * Math.sin(ang)) }, ...vals };
      state.opps.push(o); ui.stack.pop(); ui.tab = 'mine'; ui.mine.tab = 'active'; ui.stack.push({ name: 'detail', id: o.id });
      toast(`Posted to ${o.scope === 'anyone' ? 'anyone within a mile' : bLabel(state.me.boundary)}. It stays up for 30 days.`);
    }
    ui.form = null; persist(); render();
  },
  /* my requests */
  mineTab({ v }) { ui.mine.tab = v; render(); },
  /* Completing asks who helped, so their thanks go out and everyone else hears you are all set. */
  complete({ id }) {
    const o = opp(id), people = [...new Set(state.threads.filter(t => about(t, id) && t.status === 'accepted').map(t => t.withId))];
    if (!people.length) return confirmSheet('All set?', `“${esc(o.title)}” will come down from the neighborhood list and move to your past ${N.many}.`, 'Yes, mark completed', () => finishComplete(o, [], ''));
    sheet(`<h2>All set?</h2><p>“${esc(o.title)}” will come down from the neighborhood list and move to your past ${N.many}.</p>
      <div class="field"><span class="lbl">Who helped?</span>${people.map(p => `<label class="check-line"><input type="checkbox" name="helped" value="${p}" ${o.helperIds.includes(p) || people.length === 1 ? 'checked' : ''}>${avatar(p, 'sm')}<span>${esc(nameOf(p))}</span></label>`).join('')}</div>
      <div class="field"><label for="thanksText">Your thanks <span class="opt">(sent to the neighbors you tick)</span></label><textarea id="thanksText">Thank you so much for helping with “${esc(o.title)}”. It made a real difference.</textarea></div>
      <div class="stack"><button class="primary" data-act="completeOk" data-id="${id}">${icon('heart')}Mark completed</button><button class="secondary" data-act="closeSheet">Cancel</button></div>`);
  },
  completeOk({ id }) { finishComplete(opp(id), [...ov.querySelectorAll('input[name=helped]:checked')].map(i => i.value), $('#thanksText').value.trim()); },
  del({ id }) {
    const o = opp(id);
    confirmSheet(`Delete this ${N.one}?`, `“${esc(o.title)}” will be removed for good, including from your past ${N.many}. This can’t be undone.`, 'Delete', () => { state.opps = state.opps.filter(x => x.id !== id); ui.stack = ui.stack.filter(v => !(v.name === 'detail' && v.id === id)); persist(); render(); toast(`${N.One} deleted.`); }, true);
  },
  still({ id }) { const o = opp(id); o.checkedAt = now(); closeSheet(); persist(); render(); toast('Great, it stays up. We’ll check in again in a week.'); },
  checkinSheet({ id }) {
    const o = opp(id), a = o && attention(o); if (!o || o.status !== 'active') return;
    sheet(`<h2>Still need help?</h2><p>“${esc(o.title)}” is still showing for your neighbors. ${a ? esc(a.why) : ''}</p><div class="stack"><button class="primary" data-act="still" data-id="${id}">Yes, still need it</button><button class="secondary" data-act="complete" data-id="${id}">${icon('check')}It’s done, mark completed</button><button class="secondary danger" data-act="del" data-id="${id}">Delete it</button></div>`);
  },
  extendSheet({ id }) {
    const o = opp(id); if (!o || o.status !== 'active') return;
    sheet(`<h2>Keep this open?</h2><p>“${esc(o.title)}” expires ${inDays(o.expiresAt)}, on ${fmtDay(o.expiresAt)}. Extend it, or let neighbors know you’re all set.</p>${durations('extend', id, o.expiresAt)}<div class="stack"><button class="secondary" data-act="complete" data-id="${id}">${icon('check')}No longer needed, mark completed</button><button class="text-button" data-act="later" data-id="${id}">Decide later</button></div><p class="fine">With no answer by ${fmtDay(o.expiresAt)}, it’s removed automatically. You can renew it afterward from your past ${N.many}.</p>`);
  },
  extend({ id, days }) { const o = opp(id); o.expiresAt += days * DAY; o.checkedAt = now(); delete o.snoozeUntil; closeSheet(); persist(); render(); toast(`Extended. Open until ${fmtDay(o.expiresAt)}.`); },
  later({ id }) { opp(id).snoozeUntil = now() + DAY; closeSheet(); persist(); toast('Okay. We’ll ask again tomorrow.'); },
  renewSheet({ id }) {
    const o = opp(id);
    sheet(`<h2>${o.status === 'expired' ? `Renew this ${N.one}` : 'Post it again'}</h2><p>“${esc(o.title)}” will show up for neighbors again. How long should it stay up?</p>${durations('renew', id, now())}<div class="stack"><button class="secondary" data-act="closeSheet">Cancel</button></div>`);
  },
  renew({ id, days }) {
    const o = opp(id), t = now(); Object.assign(o, { status: 'active', expiresAt: t + days * DAY, renewedAt: t, checkedAt: t, helperIds: [] }); delete o.closedAt; delete o.snoozeUntil;
    if (o.deadline && o.deadline < t) o.deadline = null;
    ui.mine.tab = 'active'; closeSheet(); persist(); render(); toast(`Back up for neighbors until ${fmtDay(o.expiresAt)}.`);
  },
  helper({ id, opp: oid }) {
    const t = thread(id), o = opp(oid), on = !o.helperIds.includes(t.withId), first = person(t.withId).first;
    o.helperIds = on ? [...o.helperIds, t.withId] : o.helperIds.filter(h => h !== t.withId);
    persist(); render(); toast(on ? `${first} counted as a helper. ${arranged(o) ? 'Neighbors now see “Help arranged”.' : `Neighbors see ${foundN(o)} of ${o.helpers} helpers found.`}` : `${first} is no longer counted as a helper.`);
  },
  /* messages */
  openChat({ id }) { const t = thread(id); if (!t) return; if (t.status !== 'request') t.unread = 0; if (!viewing(id)) { ui.stack = ui.stack.filter(v => v.name !== 'chat'); push({ name: 'chat', id }); } persist(); },
  offer({ id }) {
    const o = opp(id), t = threadWith(o.ownerId), first = person(o.ownerId).first;
    if (t) { if ((t.topicId || t.oppId) !== o.id && t.status === 'accepted') { t.topicId = o.id; t.messages.push({ id: uid(), from: 'system', at: now(), text: `Now talking about “${o.title}”` }); } return A.openChat({ id: t.id }); }
    sheet(`<h2>Offer to help</h2><p>${esc(first)} will see you as <strong>${esc(mask(state.me))}</strong>${state.me.verified ? ', a verified neighbor' : ''}. Once they accept, you’ll see each other’s full names and can work out the details.</p><textarea id="offerText" aria-label="Your message" autofocus>Hi ${esc(first)}, I’d be glad to help with “${esc(o.title)}”. When works for you?</textarea><div class="stack"><button class="primary" data-act="sendOffer" data-id="${id}">${icon('send')}Send offer</button><button class="secondary" data-act="closeSheet">Cancel</button></div>`);
  },
  sendOffer({ id }) {
    const o = opp(id), text = $('#offerText').value.trim(); if (!text) return toast('Write a short message first.');
    const t = { id: 't' + uid(), withId: o.ownerId, oppId: o.id, status: 'pending', unread: 0, messages: [{ id: uid(), from: 'me', at: now(), text }] };
    state.threads.push(t); closeSheet(); persist(); push({ name: 'chat', id: t.id });
    setTimeout(() => acceptOutgoing(t.id), 6000);
  },
  withdraw({ id }) { const t = thread(id); if (!t || t.status !== 'pending') return; state.threads = state.threads.filter(x => x.id !== id); ui.stack = ui.stack.filter(v => !(v.name === 'chat' && v.id === id)); persist(); render(); toast('Offer withdrawn.'); },
  accept({ id }) {
    const t = thread(id); if (!t || t.status !== 'request') return;
    Object.assign(t, { status: 'accepted', acceptedAt: now(), unread: 0 });
    t.messages.push({ id: uid(), from: 'system', at: now(), text: `You accepted. You and ${full(person(t.withId))} can now see each other’s names.` });
    persist(); if (viewing(id)) render(); else push({ name: 'chat', id });
  },
  /* "No thanks" passes on one offer. It never blocks; the neighbor can offer again another time. */
  decline({ id }) {
    const t = thread(id); if (!t || t.status !== 'request') return; const who = mask(person(t.withId));
    state.threads = state.threads.filter(x => x.id !== id); ui.stack = ui.stack.filter(v => !(v.name === 'chat' && v.id === id));
    persist(); render(); toast(`Passed on ${who}’s offer with a thank-you. They can offer again another time.`);
  },
  more({ kind, id }) {
    const who = kind === 'opp' ? opp(id).ownerId : id, name = esc(nameOf(who));
    sheet(`<h2>${name}</h2><p>Reporting and blocking are private. ${esc(person(who).first)} isn’t told.</p><div class="stack"><button class="secondary" data-act="reportSheet" data-kind="${kind}" data-id="${id}">${icon('flag')}Report ${kind === 'opp' ? `this ${N.one}` : name}</button><button class="secondary danger" data-act="block" data-id="${who}">${icon('block')}Block ${name}</button><button class="text-button" data-act="closeSheet">Cancel</button></div>`);
  },
  block({ id }) {
    const who = esc(nameOf(id));
    confirmSheet(`Block ${who}?`, `They won’t be able to send you offers or messages, your conversation with them is removed, and their ${N.many} are hidden from you. You can unblock them any time in Settings.`, 'Block', () => { const m = mask(person(id)); doBlock(id); persist(); render(); toast(`${m} is blocked. Manage this in Settings.`); }, true);
  },
  reportSheet({ kind, id }) {
    const who = kind === 'opp' ? opp(id).ownerId : id, name = esc(nameOf(who));
    sheet(`<h2>Report ${kind === 'opp' ? `this ${N.one}` : name}</h2><p>Tell us what’s wrong. Reports are reviewed by the HelperMeet team${kind === 'opp' ? ` and the ${N.one} is hidden from you right away` : ''}.</p>
      <div class="field" role="radiogroup" aria-label="Reason">${REPORT_REASONS.map((r, i) => `<label class="check-line"><input type="radio" name="reason" value="${i}"><span>${r}</span></label>`).join('')}</div>
      <div class="field"><label for="reportNote">Anything else we should know? <span class="opt">(optional)</span></label><textarea id="reportNote"></textarea></div>
      <label class="check-line"><input type="checkbox" id="reportBlock" checked><span>Also block ${name}</span></label><div class="error" id="reportErr" role="alert"></div>
      <div class="stack"><button class="primary" data-act="sendReport" data-kind="${kind}" data-id="${id}" data-who="${who}">Send report</button><button class="secondary" data-act="closeSheet">Cancel</button></div><p class="fine">In an emergency, call 911. Prototype: nothing is actually sent.</p>`);
  },
  sendReport({ kind, id, who }) {
    const r = ov.querySelector('input[name=reason]:checked'); if (!r) { $('#reportErr').textContent = 'Choose a reason so we know what to look at.'; return; }
    const also = $('#reportBlock').checked;
    state.reports.push({ kind, id, who, reason: REPORT_REASONS[+r.value], note: $('#reportNote').value.trim(), at: now() });
    if (kind === 'opp') { state.hidden.push(id); ui.stack = ui.stack.filter(v => !(v.name === 'detail' && v.id === id)); if (ui.nearby.sel === id) ui.nearby.sel = null; }
    if (also) doBlock(who);
    closeSheet(); persist(); render(); toast(`Report sent. Thank you for looking out for the neighborhood.${also ? ' They’re blocked too.' : ''}`);
  },
  pickPhoto() { $('#chatFile').click(); },
  send() { const inp = $('#chatInput'), text = inp.value.trim(), t = thread(top().id); if (!text) return; ui.drafts[t.id] = ''; sendMsg(t, { text }); const n = $('#chatInput'); if (n) n.focus(); },
  /* settings */
  openBlocked() { push({ name: 'blocked' }); },
  unblock({ id }) { state.blocked = state.blocked.filter(x => x !== id); persist(); render(); toast(`${mask(person(id))} is unblocked and can offer to help again.`); },
  verifySheet() {
    sheet(`<h2>Verify your address</h2><p>We’ll mail a postcard with a 6-digit code to <strong>${esc(state.me.address)}</strong>. Enter it here and your ${N.many} and offers carry a “Verified neighbor” mark, so people know you really live nearby.</p><div class="stack"><button class="primary" data-act="verify">Simulate entering the code</button><button class="secondary" data-act="closeSheet">Not now</button></div><p class="fine">Prototype: no postcard is sent.</p>`);
  },
  verify() { state.me.verified = true; closeSheet(); persist(); render(); toast('Address verified. Neighbors now see “Verified neighbor” next to your name.'); },
  editProfile() {
    const me = state.me, f = (id, label, v) => `<div class="field"><label for="${id}">${label}</label><input type="text" id="${id}" value="${esc(v)}"></div>`;
    sheet(`<h2>Edit profile</h2><p>Neighbors see your first name and a shortened last name until a chat is accepted.</p><div class="two">${f('pfFirst', 'First name', me.first)}${f('pfLast', 'Last name', me.last)}</div>${f('pfAddr', 'Home address', me.address)}<div class="error" id="pfErr" role="alert"></div><div class="stack"><button class="primary" data-act="saveProfile">Save</button><button class="secondary" data-act="closeSheet">Cancel</button></div>`);
  },
  saveProfile() {
    const first = $('#pfFirst').value.trim(), last = $('#pfLast').value.trim(), address = $('#pfAddr').value.trim(), me = state.me;
    if (!first || !last || address.length < 4) { $('#pfErr').textContent = 'Enter your first name, last name and home address.'; return; }
    const moved = address !== me.address; if (moved) me.verified = false;
    Object.assign(me, { first, last, address }); closeSheet(); persist(); render(); toast(moved ? 'Saved. Your new address needs verifying again.' : `Neighbors now see you as ${mask(me)}.`);
  },
  signOut() { confirmSheet('Sign out?', 'This prototype keeps everything in this browser, so signing out clears your account and returns to the welcome screen.', 'Sign out', () => A.restart(), true); },
  /* overlays */
  closeSheet() { closeSheet(); },
  confirmOk() { const fn = confirmFn; confirmFn = null; closeSheet(); if (fn) fn(); },
  banner() { $('#banner').classList.remove('show'); const fn = bannerFn; bannerFn = null; if (fn) { closeSheet(); fn(); } },
  /* prototype tools */
  skip({ days }) { if (!needMe()) return; state.clockOffset = (state.clockOffset || 0) + days * DAY; closeSheet(); persist(); render(); toast(`Jumped ahead ${plural(+days, 'day')}. It’s now ${fmtDay(now())}.`); setTimeout(() => remind(true), 700); },
  away() { if (!needMe()) return; state.away = !state.away; ui.nearby.refit = true; ui.nearby.sel = null; persist(); render(); toast(state.away ? 'You’re now at Elm Park, half a mile from home.' : 'You’re back at home.'); },
  simRequest() {
    if (!needMe()) return;
    const mine = myOpps('active'); if (!mine.length) return toast('Ask for help first, so a neighbor has something to offer help with.');
    const pool = HM.SIM.filter(([id]) => !threadWith(id)); if (!pool.length) return toast('All the sample neighbors have already reached out.');
    const [id, text] = pool[0], o = mine[state.sim++ % mine.length], who = mask(person(id));
    if (state.blocked.includes(id)) return toast(`${who} tried to reach you, but they’re blocked. Nothing gets through.`);
    state.threads.push({ id: 't' + uid(), withId: id, oppId: o.id, status: 'request', unread: 1, messages: [{ id: uid(), from: id, at: now(), text }] });
    persist(); render();
    if (state.settings.requests) banner('New offer of help', `${who} wants to help with “${o.title}”.`, () => { ui.tab = 'messages'; ui.stack = []; render(); });
  },
  simAccept() { if (!needMe()) return; const p = state.threads.filter(t => t.status === 'pending'); if (!p.length) return toast('You have no offers waiting to be accepted.'); p.forEach(t => acceptOutgoing(t.id)); },
};

/* ================= wiring ================= */
function syncTools() {
  const info = $('#simInfo'), away = $('#awayBtn');
  if (away) away.firstChild.textContent = state.away ? 'Bring me back home ' : 'Move me away from home ';
  if (info) info.textContent = `${state.me ? `Signed in as ${full(state.me)}.` : 'Not signed in.'} Prototype date: ${fmtDay(now())}${state.clockOffset ? ` (+${Math.round(state.clockOffset / DAY)} days)` : ''}. Sample neighbors and messages are fictional and saved only in this browser.`;
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (A[el.dataset.act]) A[el.dataset.act](el.dataset, el, e);
});
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.f) { ui.form[d.f] = t.type === 'checkbox' ? t.checked : t.value; if (d.re) render(); }
  else if (d.su) { ui.signup[d.su] = t.value; $('#shownAs').textContent = shownAs(); }
  else if (d.bd) ui.bd[d.bd] = t.value;
  else if (d.set) { state.settings[d.set] = t.checked; persist(); }
  else if (t.id === 'radRange') { ui.bd.miles = +t.value; $('#radVal').firstChild.textContent = ui.bd.miles.toFixed(2) + ' '; drawBd(); }
  else if (t.id === 'chatInput') { ui.drafts[top().id] = t.value; syncComposer(); }
});
document.addEventListener('change', e => { if (e.target.dataset.file) addPhotos(e.target); });
document.addEventListener('keydown', e => {
  const open = ov.classList.contains('open');
  if (e.key === 'Escape' && open) return closeSheet();
  if (e.key === 'Tab' && open) { // keep focus inside the open sheet
    const f = [...ov.querySelectorAll('button, input, textarea, select, [tabindex="0"]')].filter(x => !x.disabled && x.offsetParent);
    if (!f.length) return e.preventDefault();
    const first = f[0], last = f[f.length - 1], cur = document.activeElement;
    if (!ov.contains(cur) || (e.shiftKey && (cur === first || cur === ov.querySelector('.sheet')))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
    return;
  }
  if (e.key !== 'Enter') return;
  if (e.target.id === 'chatInput' && !e.shiftKey) { e.preventDefault(); A.send(); }
  else if (e.target.dataset.su) A.signupNext();
  else if (e.target.id === 'bdName') A.bdSaveDraw();
  else if (e.target.classList.contains('photo-add')) e.target.querySelector('input').click();
});
const tick = () => { $('#clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, ''); };
tick(); setInterval(tick, 15000);
setInterval(() => { const had = ui.expired.length; sweep(); if (ui.expired.length > had && !ov.classList.contains('open') && !ui.form) render(); remind(); }, 30000);
$('.brand-icon').innerHTML = icon('brand');
render();
if (state.me) setTimeout(() => remind(true), 1200);
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
