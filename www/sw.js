'use strict';
// StarPlay Web PWA - cross-origin traffic proxy.
// Browser fetch to CMS/m3u8 hosts fails on CORS; the local companion server
// (server.mjs) has no such limit. SW rewrites every cross-origin GET into
// /api/proxy?url=... which streams the response with original status/headers.
const SELF = new URL(self.registration.scope);
const PROXY_PREFIX = new URL("./api/", SELF).pathname;

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin === SELF.origin) return;
  if (url.pathname.startsWith(PROXY_PREFIX)) return;
  if (req.method !== "GET") return;
  const proxied = new URL(PROXY_PREFIX + "proxy?url=" + encodeURIComponent(req.url), SELF.origin);
  const headers = new Headers();
  const range = req.headers.get("range");
  if (range) headers.set("range", range);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);
  event.respondWith(fetch(proxied, { method: "GET", headers: headers, mode: "same-origin" }));
});