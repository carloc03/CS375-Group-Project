let map;
let geocoder;

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
    });

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: { lat: 20, lng: 0 },
    });

    geocoder = new google.maps.Geocoder();

    const searchButton = document.getElementById('search-btn');
    searchButton.addEventListener('click', searchLocation);
}

function searchLocation() {
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!city || !country) {
        alert('Please enter both city and country');
        return;
    }

    const address = `${city}, ${country}`;

    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            map.setZoom(12);

            new google.maps.Marker({
                position: results[0].geometry.location,
                map: map,
                title: address
            });

            searchHotels(results[0].geometry.location);

        } else {
            alert('Location not found: ' + status);
        }
    });
}

function searchHotels(location) {
    const service = new google.maps.places.PlacesService(map);

    // Try text search first - more reliable for hotels
    const request = {
        location: location,
        radius: 10000, // Increased radius to 10km
        query: 'hotels'
    };

    service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            for (let i = 0; i < Math.min(results.length, 10); i++) {
                createHotelMarker(results[i]);
            }
        } else {
            // Fallback to nearby search with multiple types
            const nearbyRequest = {
                location: location,
                radius: 10000,
                type: ['lodging', 'establishment']
            };

            service.nearbySearch(nearbyRequest, (nearbyResults, nearbyStatus) => {
                if (nearbyStatus === google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < Math.min(nearbyResults.length, 10); i++) {
                        createHotelMarker(nearbyResults[i]);
                    }
                } else {
                    alert('No hotels found in this area. Try a larger city nearby.');
                }
            });
        }
    });
}

function createHotelMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div>
                <h3>${place.name}</h3>
                <p>Rating: ${place.rating || 'N/A'}</p>
                <p>Price Level: ${place.price_level ? '$'.repeat(place.price_level) : 'N/A'}</p>
                <p>Type: Hotel/Lodging</p>
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

window.initMap = initMap;