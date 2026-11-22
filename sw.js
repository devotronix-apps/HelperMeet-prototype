/* Network first, so edits to the prototype show up on reload; the cache is only the offline fallback. */
const CACHE='helpermeet-v1';
const FILES=['./','index.html','css/helpermeet.css','js/hm-data.js','js/helpermeet.js','icon.svg','manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>{
  const old=keys.filter(k=>k!==CACHE&&/^(wd-prototype-|turkeytimer-|helpermeet-)/.test(k));
  return Promise.all(old.map(k=>caches.delete(k))).then(()=>self.clients.claim()).then(()=>old.length?self.clients.matchAll({type:'window'}).then(cs=>cs.forEach(c=>c.navigate(c.url))):null);
})));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return res;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
