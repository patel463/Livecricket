const CACHE_NAME = 'fastipl-v1';
const API_CACHE_NAME = 'fastipl-api-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // API रिक्वेस्ट को कैच करें
  if(event.request.url.includes('cricapi.com')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return fetch(event.request).then(response => {
          // केवल सफल रिस्पॉन्स को कैच करें
          if(response.status === 200) {
            cache.put(event.request.url, response.clone());
          }
          return response;
        }).catch(() => {
          // ऑफलाइन होने पर कैश से डेटा दें
          return cache.match(event.request);
        })
      })
    );
  } else {
    // अन्य रिक्वेस्ट के लिए नेटवर्क फर्स्ट स्ट्रेटेजी
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
