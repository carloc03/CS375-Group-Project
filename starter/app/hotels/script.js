let map;
let places;
let infoWindow;
let autocomplete;
let hotels = [];
let markers = [];
let selectedHotels = [];

const countryRestrict = { country: "fr" };
const countries = {
    // Top 10 Most Visited Countries
    fr: {
        center: { lat: 46.2276, lng: 2.2137 },
        zoom: 5,
    },
    es: {
        center: { lat: 40.4637, lng: -3.7492 },
        zoom: 5,
    },
    us: {
        center: { lat: 37.0902, lng: -95.7129 },
        zoom: 3,
    },
    cn: {
        center: { lat: 35.8617, lng: 104.1954 },
        zoom: 4,
    },
    it: {
        center: { lat: 41.8719, lng: 12.5674 },
        zoom: 5,
    },
    tr: {
        center: { lat: 38.9637, lng: 35.2433 },
        zoom: 5,
    },
    mx: {
        center: { lat: 23.6345, lng: -102.5528 },
        zoom: 4,
    },
    th: {
        center: { lat: 15.8700, lng: 100.9925 },
        zoom: 5,
    },
    de: {
        center: { lat: 51.1657, lng: 10.4515 },
        zoom: 5,
    },
    uk: {
        center: { lat: 55.3781, lng: -3.4360 },
        zoom: 5,
    },
    // Asia-Pacific
    jp: {
        center: { lat: 36.2048, lng: 138.2529 },
        zoom: 5,
    },
    at: {
        center: { lat: 47.5162, lng: 14.5501 },
        zoom: 6,
    },
    gr: {
        center: { lat: 39.0742, lng: 21.8243 },
        zoom: 6,
    },
    my: {
        center: { lat: 4.2105, lng: 101.9758 },
        zoom: 5,
    },
    ae: {
        center: { lat: 23.4241, lng: 53.8478 },
        zoom: 6,
    },
    pt: {
        center: { lat: 39.3999, lng: -8.2245 },
        zoom: 6,
    },
    ru: {
        center: { lat: 61.5240, lng: 105.3188 },
        zoom: 2,
    },
    ca: {
        center: { lat: 56.1304, lng: -106.3468 },
        zoom: 3,
    },
    nl: {
        center: { lat: 52.1326, lng: 5.2913 },
        zoom: 7,
    },
    sa: {
        center: { lat: 23.8859, lng: 45.0792 },
        zoom: 5,
    },
    hk: {
        center: { lat: 22.3193, lng: 114.1694 },
        zoom: 10,
    },
    hr: {
        center: { lat: 45.1000, lng: 15.2000 },
        zoom: 6,
    },
    eg: {
        center: { lat: 26.0975, lng: 31.2357 },
        zoom: 5,
    },
    pl: {
        center: { lat: 51.9194, lng: 19.1451 },
        zoom: 5,
    },
    in: {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 4,
    },
    hu: {
        center: { lat: 47.1625, lng: 19.5033 },
        zoom: 6,
    },
    cz: {
        center: { lat: 49.8175, lng: 15.4730 },
        zoom: 6,
    },
    ma: {
        center: { lat: 31.7917, lng: -7.0926 },
        zoom: 5,
    },
    sg: {
        center: { lat: 1.3521, lng: 103.8198 },
        zoom: 11,
    },
    tn: {
        center: { lat: 33.8869, lng: 9.5375 },
        zoom: 6,
    },
    dk: {
        center: { lat: 56.2639, lng: 9.5018 },
        zoom: 6,
    },
    cl: {
        center: { lat: -35.6751, lng: -71.5430 },
        zoom: 4,
    },
    fi: {
        center: { lat: 61.9241, lng: 25.7482 },
        zoom: 5,
    },
    ie: {
        center: { lat: 53.4129, lng: -8.2439 },
        zoom: 6,
    },
    kr: {
        center: { lat: 35.9078, lng: 127.7669 },
        zoom: 6,
    },
    no: {
        center: { lat: 60.4720, lng: 8.4689 },
        zoom: 4,
    },
    za: {
        center: { lat: -30.5595, lng: 22.9375 },
        zoom: 5,
    },
    au: {
        center: { lat: -25.2744, lng: 133.7751 },
        zoom: 4,
    },
    ar: {
        center: { lat: -38.4161, lng: -63.6167 },
        zoom: 4,
    },
    se: {
        center: { lat: 60.1282, lng: 18.6435 },
        zoom: 4,
    },
    id: {
        center: { lat: -0.7893, lng: 113.9213 },
        zoom: 4,
    },
    il: {
        center: { lat: 31.0461, lng: 34.8516 },
        zoom: 7,
    },
    be: {
        center: { lat: 50.5039, lng: 4.4699 },
        zoom: 7,
    },
    ph: {
        center: { lat: 12.8797, lng: 121.7740 },
        zoom: 5,
    },
    jo: {
        center: { lat: 30.5852, lng: 36.2384 },
        zoom: 7,
    },
    ba: {
        center: { lat: 43.9159, lng: 17.6791 },
        zoom: 7,
    },
    br: {
        center: { lat: -14.2350, lng: -51.9253 },
        zoom: 3,
    },
    tw: {
        center: { lat: 23.6978, lng: 120.9605 },
        zoom: 7,
    },
    bg: {
        center: { lat: 42.7339, lng: 25.4858 },
        zoom: 6,
    },
    vn: {
        center: { lat: 14.0583, lng: 108.2772 },
        zoom: 5,
    },
};

// Dynamically load Google Maps API with key from server
fetch('/mapV2/config/maps-api-url')
    .then(response => response.json())
    .then(data => {
        const script = document.createElement('script');
        script.src = `${data.url}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    })
    .catch(error => {
        console.error('Failed to load Maps API:', error);
        showError('Failed to load map. Please refresh the page and try again.');
    });

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: countries["fr"].zoom,
        center: countries["fr"].center,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false,
    });

    infoWindow = new google.maps.InfoWindow();
    places = new google.maps.places.PlacesService(map);

    // Create the autocomplete object and associate it with the UI input control.
    // Restrict the search to the default country (France), and to place type "cities".
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("city"),
        {
            types: ["(cities)"],
            componentRestrictions: countryRestrict,
            fields: ["geometry", "name"],
        }
    );

    autocomplete.addListener("place_changed", onPlaceChanged);

    // Add a DOM event listener to react when the user selects a country.
    const countrySelect = document.getElementById("country-select");
    if (countrySelect) {
        countrySelect.addEventListener("change", setAutocompleteCountry);
    }

    const searchButton = document.getElementById('search-btn');
    const clearButton = document.getElementById('clear-btn');
    const itineraryButton = document.getElementById('view-itinerary-btn');

    if (searchButton) searchButton.addEventListener('click', search);
    if (clearButton) clearButton.addEventListener('click', clearResults);
    if (itineraryButton) itineraryButton.addEventListener('click', viewItinerary);

    // Allow Enter key to trigger search
    document.getElementById('city').addEventListener('keypress', handleEnterKey);
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        search();
    }
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
    const place = autocomplete.getPlace();

    if (place.geometry && place.geometry.location) {
        map.panTo(place.geometry.location);
        map.setZoom(15);

        // Add location marker
        new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        search();
    } else {
        document.getElementById("city").placeholder = "Enter a city";
    }
}

// Search for hotels in the selected city, within the viewport of the map.
function search() {
    const bounds = map.getBounds();
    if (!bounds) {
        showError('Please select a city first');
        return;
    }

    setLoading(true);
    clearResults();

    const searchRequest = {
        bounds: bounds,
        types: ["lodging"],
    };

    places.nearbySearch(searchRequest, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            hotels = results.slice(0, 20); // Limit to 20 hotels
            setLoading(false);
            displayHotelsList();
            createHotelMarkers();
            document.getElementById('clear-btn').style.display = 'block';
        } else {
            setLoading(false);
            showError('No hotels found in this area. Try a different city or zoom out.');
        }
    });
}

// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
function setAutocompleteCountry() {
    const countrySelect = document.getElementById("country-select");
    const country = countrySelect.value;

    if (country === "all") {
        autocomplete.setComponentRestrictions({ country: [] });
        map.setCenter({ lat: 15, lng: 0 });
        map.setZoom(2);
    } else {
        autocomplete.setComponentRestrictions({ country: country });
        map.setCenter(countries[country].center);
        map.setZoom(countries[country].zoom);
    }

    clearResults();
}

function displayHotelsList() {
    const container = document.getElementById('hotels-container');

    if (hotels.length === 0) {
        container.innerHTML = '<div class="no-results">No hotels found in this area.</div>';
        return;
    }

    const hotelsHtml = `
    <div class="hotels-header">
      <h3>Nearby Hotels</h3>
      <div class="hotel-count">${hotels.length} hotels found</div>
    </div>
    ${hotels.map((hotel, index) => {
        const isSelected = selectedHotels.some(selected => selected.place_id === hotel.place_id);
        return `
      <div class="hotel-item">
        <div class="hotel-name">${hotel.name}</div>
        <div class="hotel-details">
          <div class="hotel-detail rating">
            ⭐ Rating: ${hotel.rating ? hotel.rating.toFixed(1) : 'Not rated'}
          </div>
          <div class="hotel-detail price-level">
            💰 Price: ${hotel.price_level ? '$'.repeat(hotel.price_level) : 'Price not available'}
          </div>
          <div class="hotel-detail">
            📍 ${hotel.vicinity || 'Address not available'}
          </div>
          ${hotel.opening_hours ?
                `<div class="hotel-detail">
              ${hotel.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}
            </div>` : ''
            }
        </div>
        <div class="hotel-actions">
          <button class="add-hotel-btn" onclick="addToSelectedHotels(${index})" ${isSelected ? 'disabled' : ''}>
            ${isSelected ? '✓ Added' : 'Add to List'}
          </button>
          <button class="view-on-map-btn" onclick="focusOnHotel(${index})">
            View on Map
          </button>
        </div>
      </div>
    `;
    }).join('')}
  `;

    container.innerHTML = hotelsHtml;
}

function createHotelMarkers() {
    // Clear existing hotel markers (keep location marker)
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    hotels.forEach((hotel, index) => {
        const marker = new google.maps.Marker({
            position: hotel.geometry.location,
            map: map,
            title: hotel.name,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        marker.placeResult = hotel;
        marker.addListener('click', showInfoWindow);
        markers.push(marker);
    });
}

function showInfoWindow() {
    const marker = this;

    places.getDetails(
        { placeId: marker.placeResult.place_id },
        (place, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            }

            // Close all other info windows
            infoWindow.close();

            const content = createDetailedInfoWindowContent(place);
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        }
    );
}

function createDetailedInfoWindowContent(place) {
    let ratingHtml = '';
    if (place.rating) {
        for (let i = 0; i < 5; i++) {
            if (place.rating < i + 0.5) {
                ratingHtml += "☆";
            } else {
                ratingHtml += "★";
            }
        }
    }

    let websiteHtml = '';
    if (place.website) {
        const hostnameRegexp = new RegExp("^https?://.+?/");
        let website = String(hostnameRegexp.exec(place.website));
        if (!website || website === 'null') {
            website = place.website;
        }
        websiteHtml = `<div style="margin-bottom: 4px;"><strong>Website:</strong> <a href="${place.website}" target="_blank">${website}</a></div>`;
    }

    return `
    <div style="max-width: 300px;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        ${place.icon ? `<img src="${place.icon}" style="width: 20px; height: 20px; margin-right: 8px;">` : ''}
        <h3 style="margin: 0; color: #2c3e50;">
          ${place.url ? `<a href="${place.url}" target="_blank" style="text-decoration: none; color: #2c3e50;">${place.name}</a>` : place.name}
        </h3>
      </div>
      <div style="margin-bottom: 4px;"><strong>Address:</strong> ${place.vicinity || place.formatted_address || 'Not available'}</div>
      ${place.formatted_phone_number ? `<div style="margin-bottom: 4px;"><strong>Phone:</strong> ${place.formatted_phone_number}</div>` : ''}
      ${place.rating ? `<div style="margin-bottom: 4px;"><strong>Rating:</strong> ${ratingHtml} (${place.rating.toFixed(1)})</div>` : ''}
      ${websiteHtml}
      ${place.price_level ? `<div style="margin-bottom: 4px;"><strong>Price Level:</strong> ${'$'.repeat(place.price_level)}</div>` : ''}
    </div>
  `;
}

function focusOnHotel(index) {
    const hotel = hotels[index];
    const marker = markers[index];

    // Center map on hotel
    map.setCenter(hotel.geometry.location);
    map.setZoom(16);

    // Close info window and open the selected one
    infoWindow.close();

    if (marker) {
        // Trigger the marker's click event to show detailed info
        google.maps.event.trigger(marker, 'click');
    }
}

function clearResults() {
    hotels = [];
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const container = document.getElementById('hotels-container');
    container.innerHTML = '<div class="no-results">Select a country and enter a city above to search for hotels</div>';

    document.getElementById('clear-btn').style.display = 'none';
}

function setLoading(loading) {
    const searchBtn = document.getElementById('search-btn');
    const container = document.getElementById('hotels-container');

    if (loading) {
        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.textContent = 'Searching...';
        }
        container.innerHTML = '<div class="loading">🔍 Searching for hotels...</div>';
    } else {
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search Hotels';
        }
    }
}

function showError(message) {
    const container = document.getElementById('hotels-container');
    container.innerHTML = `<div class="no-results">❌ ${message}</div>`;
}

function addToSelectedHotels(index) {
    const hotel = hotels[index];

    // Check if hotel is already selected
    if (selectedHotels.some(selected => selected.place_id === hotel.place_id)) {
        return;
    }

    selectedHotels.push(hotel);
    updateSelectedHotelsDisplay();
    displayHotelsList(); // Refresh to update button states
}

function removeFromSelectedHotels(placeId) {
    selectedHotels = selectedHotels.filter(hotel => hotel.place_id !== placeId);
    updateSelectedHotelsDisplay();
    displayHotelsList(); // Refresh to update button states
}

function updateSelectedHotelsDisplay() {
    const container = document.getElementById('selected-hotels-container');
    const countElement = document.querySelector('.selected-count');
    const itineraryButton = document.getElementById('view-itinerary-btn');

    // Update count
    countElement.textContent = `${selectedHotels.length} hotel${selectedHotels.length !== 1 ? 's' : ''} selected`;

    // Show/hide itinerary button
    if (selectedHotels.length > 0) {
        itineraryButton.style.display = 'block';
    } else {
        itineraryButton.style.display = 'none';
    }

    if (selectedHotels.length === 0) {
        container.innerHTML = '<div class="no-selected">No hotels selected yet. Click "Add to List" on any hotel to add it here.</div>';
        return;
    }

    const selectedHtml = selectedHotels.map(hotel => `
        <div class="selected-hotel-item">
            <button class="remove-hotel-btn" onclick="removeFromSelectedHotels('${hotel.place_id}')" title="Remove from list">
                ✕
            </button>
            <div class="selected-hotel-name">${hotel.name}</div>
            <div class="selected-hotel-details">
                <div class="selected-hotel-detail rating">
                    ⭐ ${hotel.rating ? hotel.rating.toFixed(1) : 'Not rated'}
                </div>
                <div class="selected-hotel-detail price-level">
                    💰 ${hotel.price_level ? '$'.repeat(hotel.price_level) : 'Price not available'}
                </div>
                <div class="selected-hotel-detail">
                    📍 ${hotel.vicinity || 'Address not available'}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = selectedHtml;
}

function viewItinerary() {
    const hotelData = selectedHotels.map(hotel => ({
        name: hotel.name,
        rating: hotel.rating,
        price_level: hotel.price_level,
        vicinity: hotel.vicinity,
        place_id: hotel.place_id,
        geometry: {
            location: {
                lat: hotel.geometry.location.lat(),
                lng: hotel.geometry.location.lng()
            }
        }
    }));

    // In a real application, you would navigate to another page
    // For demo purposes, we'll show an alert

    //alert(`Ready to view itinerary with ${selectedHotels.length} selected hotels!\n\nIn a real app, this would navigate to:\n/itinerary or /my-plans`);

    // Example of how you might navigate:
    // window.location.href = `/itinerary?hotels=${encodeURIComponent(JSON.stringify(hotelData))}`;
}

window.initMap = initMap;