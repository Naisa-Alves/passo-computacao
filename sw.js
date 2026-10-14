const CACHE = "passo-app-4e1c37b6cc61";
const ASSETS = ["./", "index.html", "style.css", "lessons.js", "steps.js", "curriculum.js", "lesson-refinements.js", "code-lessons.js", "code-practice.js", "code-worker.js", "skulpt.min.js", "skulpt-stdlib.js", "sql-asm.js", "SKULPT-LICENSE.txt", "SQLJS-LICENSE.txt", "app.js", "pwa.js", "manifest.webmanifest", "icon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
const URLS = ASSETS.map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(CACHE);
   for(const url of URLS){
    const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));
    if(!response.ok||response.redirected)throw new Error('Asset unavailable');
    await cache.put(url,response);
   }
  }catch(error){await caches.delete(CACHE);throw error}
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('passo-app-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
 if(event.data?.type==='OFFLINE_STATUS')event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  const entries=await Promise.all(URLS.map(url=>cache.match(url)));
  event.source?.postMessage({type:'OFFLINE_STATUS',ready:entries.every(Boolean)});
 })());
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  const base=new URL(self.registration.scope);
  if(url.pathname!==base.pathname && url.pathname!==new URL('index.html',base).pathname)return;
  event.respondWith((async()=>{
   // Keep the HTML and scripts in the same version until an explicit update.
   const cache=await caches.open(CACHE);
   const cached=await cache.match(new URL('./',self.registration.scope).href);
   return cached||fetch(event.request);
  })());return;
 }
 if(!URLS.includes(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  return await cache.match(event.request)||fetch(event.request);
 })());
});
