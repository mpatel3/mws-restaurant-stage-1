let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();

  /**
   * Focus on header 
   */
  const header = document.getElementById("page-header");
  header.focus();

  //registerServicework.
  registerServiceWorker();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibWFudGhhbnAiLCJhIjoiY2pqZmJxZm5tMnR6ZDN2dGV0YWE5Y215dSJ9.eWjbH9wUZVx6IfnnfwOAag',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const figure = document.createElement('figure');
  const imgSrc = DBHelper.imageUrlForRestaurant(restaurant).split('.');
  const pictureElement = `<picture><source media="(max-width: 385px)" srcset="${imgSrc[0]}-320_1x.${imgSrc[1]} 1x, ${imgSrc[0]}-400_1x.${imgSrc[1]} 2x">
  <source media="(min-width: 386px) and (max-width: 550px)" srcset="${imgSrc[0]}-400_1x.${imgSrc[1]}, ${imgSrc[0]}-600_2x.${imgSrc[1]} 2x">
  <source media="(min-width: 551px) and (max-width: 736px)" srcset="${imgSrc[0]}-320_1x.${imgSrc[1]}, ${imgSrc[0]}-400_1x.${imgSrc[1]} 2x">
  <source media="(min-width: 737px) and (max-width: 1455px)" srcset="${imgSrc[0]}-400_1x.${imgSrc[1]}, ${imgSrc[0]}-600_2x.${imgSrc[1]} 2x">
  <source media="(min-width: 1456px)" srcset="${imgSrc[0]}-600_2x.${imgSrc[1]}, ${imgSrc[0]}.${imgSrc[1]} 2x">
  <img class="restaurant-img" tabindex="0" src="${imgSrc[0]}.${imgSrc[1]}" alt="Picture of a restaurant named ${restaurant.name}"></picture>`;
  figure.innerHTML = pictureElement;
  li.append(figure);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  name.setAttribute("aria-label",`Restaurant name is ${restaurant.name}`);
  name.setAttribute("tabindex","0");
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.setAttribute("aria-label",`Restaurant placed at ${restaurant.neighborhood}`);
  neighborhood.setAttribute("tabindex","0");
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.setAttribute("aria-label",`Restaurant address is ${restaurant.address}`);
  address.setAttribute("tabindex","0");
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute("aria-label",`Hit Enter or click to know more information about restaurnat`);
  more.setAttribute("tabindex","0");
  more.href = DBHelper.urlForRestaurant(restaurant);
  //li.append(more);

  const div = document.createElement('div');
  div.className = "innder-div";
  div.append(more);
  li.append(div);
  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}

// Register service worker.
registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service worker is been registered'); });
  }
}