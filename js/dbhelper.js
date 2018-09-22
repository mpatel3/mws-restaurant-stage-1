/**
 * Common database helper functions.
 */
class DBHelper {
  
  /**
   * Application Enviornment
   * Change to prod if you want to generate proper build
   */
  static get APP_ENVIORNMENT() {
    let APP_ENV = 'prod';
    return APP_ENV;
  }
  
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    if(DBHelper.APP_ENVIORNMENT === 'prod') {
      const port = 1337 // Change this to your server port
      return `http://localhost:${port}/restaurants`;  
    } else {
      const port = 8000 // Change this to your server port
      return `http://localhost:${port}/data/restaurants.json`;
    }
  }

  /**
   * Are there any tile in the view?
   */
  static isShowingRestaurantList() {
    return !!document.querySelector("figure");
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(dbPromise, callback) {
    
    // First check through IndexDB if availble server from there.
    indexedDBHelper.getRestaurantList(dbPromise).then(function(restaurants){
      // if not available then get fetch the data and store them into indexedDB.
      if(!restaurants.length) {
          fetch(DBHelper.DATABASE_URL)
          .then(response => {
            if (!response.ok) { throw response } 
            return response.json()
          })
          .then(responseSuccess)
          .catch(requestError);
      }
      callback(null, restaurants);
    });
    // response
    function responseSuccess(data) {
      const restaurants = DBHelper.APP_ENVIORNMENT === 'prod' ? data : data.restaurants; // local
      indexedDBHelper.storeValuesinIndexedDB(dbPromise,restaurants);
      callback(null, restaurants);
    }
    // failure
    function requestError(e) {
      const error = (`Request failed`);
      //callback(error, null);
    }

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(dbPromise, id, callback) {
    // fetch all restaurants with proper error handling.
    indexedDBHelper.getRestaurantList(dbPromise).then(function(restaurants){
      
      if(!restaurants.length) {
          fetch(DBHelper.DATABASE_URL)
          .then(response => {
            if (!response.ok) { throw response } 
            return response.json()
          })
          .then(responseSuccess)
          .catch(requestError);
      }
      const restaurant = restaurants.find(r => r.id == id);
      callback(null, restaurant);
    });

    function responseSuccess(data) {
      const restaurant = DBHelper.APP_ENVIORNMENT === 'prod' ? data.find(r => r.id == id) : data.restaurants.find(r => r.id == id);
      callback(null, restaurants);
    }

    function requestError(e) {
      const error = (`Request failed`);
      //callback(error, null);
    }
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(dbPromise, cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(dbPromise, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(dbPromise,callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(dbPromise, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(dbPromise, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(dbPromise, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(DBHelper.APP_ENVIORNMENT === 'dev')
      return (`/img/${restaurant.photograph}`);
    return (`/css/images/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

  /***
   * @description: This function is used to create a picture element for the application.
   * @param: AppFLow - Will decide whether picture element is requires to be created in Main page or sub page.
   * @param: imgSrc - URL of the image
   * @param: restaurantName - Name of the restaurant.
   */
  static createPictureElement(AppFlow,imgSrc,restaurantName) {
    const appEnv = DBHelper.APP_ENVIORNMENT;
    let pictureElement = ``;
    // switch case statement to provide combination based on the flow and enviorment.
    switch(appEnv + "|" + AppFlow) {
      case 'prod|MAIN':
        pictureElement += `<picture><source media="(max-width: 385px)" srcset="${imgSrc}-320_1x.jpg 1x, ${imgSrc}-400_1x.jpg 2x">
        <source media="(min-width: 386px) and (max-width: 550px)" srcset="${imgSrc}-400_1x.jpg, ${imgSrc}-600_2x.jpg 2x">
        <source media="(min-width: 551px) and (max-width: 736px)" srcset="${imgSrc}-320_1x.jpg, ${imgSrc}-400_1x.jpg 2x">
        <source media="(min-width: 737px) and (max-width: 1455px)" srcset="${imgSrc}-400_1x.jpg, ${imgSrc}-600_2x.jpg 2x">
        <source media="(min-width: 1456px)" srcset="${imgSrc}-600_2x.jpg, ${imgSrc}.jpg 2x">
        <img class="restaurant-img" tabindex="0" src="${imgSrc}.jpg" alt="Picture of a restaurant named ${restaurantName}"></picture>`;
        break;
      case 'prod|SINGLE_RESTAURANT':
        pictureElement += `<picture><source media="(max-width: 550px)" srcset="${imgSrc}-400_1x.jpg 1x">
        <source media="(min-width: 551px) and (max-width: 736px)" srcset="${imgSrc}.jpg">
        <source media="(min-width: 737px) and (max-width: 1180px)" srcset="${imgSrc}-400_1x.jpg">
        <source media="(min-width: 1181px)" srcset="${imgSrc}-600_2x.jpg 1x, ${imgSrc}.jpg 2x">
        <img class="restaurant-img" src="${imgSrc}.jpg" alt="This is image of a restaurant named ${restaurantName}"></picture>`;
        break;
      case 'dev|MAIN':
        pictureElement += `<picture><source media="(max-width: 385px)" srcset="${imgSrc[0]}-320_1x.${imgSrc[1]} 1x, ${imgSrc[0]}-400_1x.${imgSrc[1]} 2x">
        <source media="(min-width: 386px) and (max-width: 550px)" srcset="${imgSrc[0]}-400_1x.${imgSrc[1]}, ${imgSrc[0]}-600_2x.${imgSrc[1]} 2x">
        <source media="(min-width: 551px) and (max-width: 736px)" srcset="${imgSrc[0]}-320_1x.${imgSrc[1]}, ${imgSrc[0]}-400_1x.${imgSrc[1]} 2x">
        <source media="(min-width: 737px) and (max-width: 1455px)" srcset="${imgSrc[0]}-400_1x.${imgSrc[1]}, ${imgSrc[0]}-600_2x.${imgSrc[1]} 2x">
        <source media="(min-width: 1456px)" srcset="${imgSrc[0]}-600_2x.${imgSrc[1]}, ${imgSrc[0]}.${imgSrc[1]} 2x">
        <img class="restaurant-img" tabindex="0" src="${imgSrc[0]}.${imgSrc[1]}" alt="Picture of a restaurant named ${restaurantName}"></picture>`;
        break;
      case 'dev|SINGLE_RESTAURANT':
        pictureElement += `<picture><source media="(max-width: 550px)" srcset="${imgSrc[0]}-400_1x.${imgSrc[1]} 1x">
        <source media="(min-width: 551px) and (max-width: 736px)" srcset="${imgSrc[0]}.${imgSrc[1]}">
        <source media="(min-width: 737px) and (max-width: 1180px)" srcset="${imgSrc[0]}-400_1x.${imgSrc[1]}">
        <source media="(min-width: 1181px)" srcset="${imgSrc[0]}-600_2x.${imgSrc[1]} 1x, ${imgSrc[0]}.${imgSrc[1]} 2x">
        <img class="restaurant-img" src="${imgSrc[0]}.${imgSrc[1]}" alt="This is image of a restaurant named ${restaurantName}"></picture>`;
        break;
      default:
        pictureElement += `<picture><img class="restaurant-img" src="${imgSrc[0]}.${imgSrc[1]}" alt="This is image of a restaurant named ${restaurantName}"></picture>`;
    }
    return pictureElement;
  }
  
  
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

