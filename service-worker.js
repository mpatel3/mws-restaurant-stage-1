const APP_ENV = 'prod';

// create cachename.
const cacheName = 'restaurantApp-final-1';

if(APP_ENV === 'prod') {
    
    /**
     * Files requires to be cached.
     */
    var filesToCache = [
        '/',
        '/index.html',
        '/js/vendor.js',
        '/js/app_main.js',
        '/js/app_restaurant_info.js',
        '/css/vendor.css',
        '/css/app.css',
        '/css/images/layers-2x.png',
        '/css/images/layers.png',
        '/css/images/marker-icon-2x.png',
        '/css/images/marker-icon.png',
        '/css/images/marker-shadow.png'
    ];

    // images
    for (let i = 1; i <= 10; i++) {
        filesToCache.push(`/css/images/${i}.jpg`);
        filesToCache.push(`/css/images/${i}-320_1x.jpg`);
        filesToCache.push(`/css/images/${i}-400_1x.jpg`);
        filesToCache.push(`/css/images/${i}-600_2x.jpg`);
    }
} else {
     
    /**
     * Files requires to be cached.
     */
    var filesToCache = [
        '/',
        '/index.html',
        '/js/main.js',
        '/js/dbhelper.js',
        '/js/picturefill.min.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
    ];

    // images
    for (let i = 1; i <= 10; i++) {
        filesToCache.push(`/img/${i}.jpg`);
        filesToCache.push(`/img/${i}-320_1x.jpg`);
        filesToCache.push(`/img/${i}-400_1x.jpg`);
        filesToCache.push(`/img/${i}-600_2x.jpg`);
    }
}

/**
 * @description once service worker installed cached all the resources.
 * @param : event object consist of request,target and other paramters.
 */
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/**
 * @description: Once the service worker installed then fetch all the subsequent request and server them from the cache.
 * For any request for which we want fresh data create a fallback to call data from API and otherwise data will get fetched from the cache.
 * @param: event object.
 * 
 */
self.addEventListener('fetch', function (event) {
    
    if(APP_ENV === 'dev') {
        var dataUrl = 'http://localhost:8000/restaurant.html'; 
    } else {
        var dataUrl = 'http://localhost:8000/build/restaurant.html';
    }
    
    if (event.request.url.indexOf(dataUrl) > -1) {
        /*
         * If require fresh data the fetch fresh data first and then cache them.
         */
        event.respondWith(
            caches.open(cacheName).then(function (cache) {
                
                /**
                 * If a url is new then first capture it and then save it to cache so that It can be server from cache in future.
                 */
                
                return fetch(event.request).then(function (response) {
                    cache.put(event.request.url, response.clone());
                    return response;
                }).catch(function(error){
                    
                    /**
                     * Fallback for fetch event If Fetch fails and if we have last request url cached then serve response of that
                     * last URL. 
                     */
                    
                    return caches.match(event.request).then(function (response) {
                        console.log(response);
                        return response || fetch(event.request);
                    })
                });
            })
        );
    } else {
        /*
         * OFFline content - server them from cache.
         */
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
});