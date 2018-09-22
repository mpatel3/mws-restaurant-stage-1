class indexedDBHelper {

    static createAppIndexedDB() {
        
        if (!('indexedDB' in window)) {
            return;
        }
        
        return idb.open('mws-restaurant-app', 1, function(upgradeDb) {
            if(!upgradeDb.objectStoreNames.contains('restaurantList')) {
                var restaurantListStore = upgradeDb.createObjectStore('restaurantList', {
                    keyPath: 'id'
                });
                restaurantListStore.createIndex('by-name', 'name');
            }
        });
    }

    static storeValuesinIndexedDB(dbPromise, restaurants) {
        
        dbPromise.then(function(db) {
            if (!db) return;
        
            var tx = db.transaction('restaurantList', 'readwrite');
            var store = tx.objectStore('restaurantList');
            restaurants.forEach(function(restaurant) {
              store.put(restaurant);
            });
          
        });
    }

    static getRestaurantList(dbPromise) {
        
        return dbPromise.then(function(db) {
       
            var index = db.transaction('restaurantList')
                .objectStore('restaurantList').index('by-name');
        
            return index.getAll().then(function(restaurants) {
                return restaurants
            });
        });
    }
}