/* Púlpito — service worker: guarda o app e a Bíblia no aparelho para funcionar sem internet.
   Ao publicar uma nova versão do app, aumente VERSAO. A Bíblia tem cache próprio (BIBLIA)
   e só é baixada de novo se esse número mudar. */
const VERSAO = "pulpito-v1";
const BIBLIA = "pulpito-biblia-1";
const ARQUIVOS = [
  "./", "index.html", "manifest.webmanifest", "config.js", "vendor/supabase.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png", "icons/favicon-48.png"
];
const ARQ_BIBLIA = "biblia/blivre.json";

self.addEventListener("install", (e) => {
  e.waitUntil(Promise.all([
    caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)),
    caches.open(BIBLIA).then(async (c) => { if (!(await c.match(ARQ_BIBLIA))) await c.add(ARQ_BIBLIA); })
  ]).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO && k !== BIBLIA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const caminho = url.pathname;

  /* Bíblia: sempre do aparelho; só vai à rede se ainda não estiver guardada */
  if (caminho.endsWith("/" + ARQ_BIBLIA)) {
    e.respondWith(caches.open(BIBLIA).then(async (c) => {
      const salvo = await c.match(ARQ_BIBLIA);
      if (salvo) return salvo;
      const resp = await fetch(req);
      if (resp.ok) c.put(ARQ_BIBLIA, resp.clone());
      return resp;
    }));
    return;
  }

  /* config.js: versão nova primeiro, para mudanças valerem logo */
  if (caminho.endsWith("/config.js")) {
    e.respondWith(fetch(req).then((resp) => {
      if (resp && resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then((c) => c.put("config.js", copia)); }
      return resp;
    }).catch(() => caches.match("config.js")));
    return;
  }

  /* Resto: responde do aparelho na hora e atualiza em segundo plano quando houver internet */
  const chave = req.mode === "navigate" ? "index.html" : req;
  e.respondWith(caches.open(VERSAO).then(async (cache) => {
    const salvo = await cache.match(chave, { ignoreSearch: req.mode === "navigate" });
    const rede = fetch(req).then((resp) => {
      if (resp && resp.ok) cache.put(chave, resp.clone());
      return resp;
    }).catch(() => null);
    return salvo || (await rede) || new Response("Sem conexão", { status: 503 });
  }));
});
