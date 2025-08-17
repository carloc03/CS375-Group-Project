let map;
let geocoder;

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

            searchLandmarks(results[0].geometry.location);

        } else {
            alert('Location not found: ' + status);
        }
    });
}

function searchLandmarks(location) {
    const service = new google.maps.places.PlacesService(map);

    const request = {
        location: location,
        radius: 5000,
        type: ['tourist_attraction', 'museum', 'park', 'church', 'monument']
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < Math.min(results.length, 10); i++) {
                createLandmarkMarker(results[i]);
            }
        }
    });
}

function createLandmarkMarker(place) {
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
                <p>Type: ${place.types[0].replace(/_/g, ' ')}</p>
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

window.initMap = initMap;