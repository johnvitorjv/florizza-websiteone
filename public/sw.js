// FLORIZZA Service Worker v1
// Strategy: Cache-First for static assets, Network-First for dynamic/API, SPA navigation fallback

const CACHE_VERSION = 'florizza-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Static assets to pre-cache on install
const PRE_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// Patterns that should NEVER be cached (dynamic e-commerce data)
const NEVER_CACHE_PATTERNS = [
    /supabase/,
    /\.supabase\./,
    /rest\/v1/,
    /auth\/v1/,
    /storage\/v1/,
    /\/admin/,
    /\/checkout/,
    /\/api\//,
];

// Patterns for static assets (cache-first)
const STATIC_PATTERNS = [
    /\.js$/,
    /\.css$/,
    /\.woff2?$/,
    /\.ttf$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.webp$/,
    /\.svg$/,
    /\.ico$/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
];

// ─── Install ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(PRE_CACHE))
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// ─── Activate ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key)) // Clean old caches
            )
        ).then(() => self.clients.claim()) // Take control of all pages
    );
});

// ─── Fetch ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http schemes
    if (!url.protocol.startsWith('http')) return;

    // ── Never cache dynamic/API requests ──
    if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(fetch(request));
        return;
    }

    // ── SPA Navigation: serve index.html for all HTML navigation requests ──
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // ── Static assets: Cache-First ──
    if (STATIC_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // ── Everything else: Network-First with fallback ──
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
