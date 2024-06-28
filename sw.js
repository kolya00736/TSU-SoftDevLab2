const PATH = '/TSU-SoftDevLab2';
const APP_PREFIX = 'password-manager-';
const CACHE_NAME = APP_PREFIX + 'cache-v1';

const URLS = [    
	`${PATH}/`,
	`${PATH}/index.html`,
	`${PATH}/styles.css`,
	`${PATH}/script.js`,
	`${PATH}/img/eye-slash.svg`,
	`${PATH}/img/eye.svg`,
	`${PATH}/img/sync-alt.svg`,
	`${PATH}/img/copy.svg`,
	`${PATH}/icons/favicon.ico`,
	`${PATH}/icons/apple-touch-icon.png`,
	`${PATH}/icons/icon-192x192.png`,
	`${PATH}/icons/icon-512x512.png`,
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			return cache.addAll(URLS);
		})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keyList => {
			const cacheWhitelist = keyList.filter(key => {
				return key.indexOf(APP_PREFIX) === 0;
			});
			cacheWhitelist.push(CACHE_NAME);

			return Promise.all(keyList.map((key, i) => {
				if (cacheWhitelist.indexOf(key) === -1) {
					return caches.delete(keyList[i]);
				}
			}));
		})
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			return response || fetch(event.request);
		})
	);
});