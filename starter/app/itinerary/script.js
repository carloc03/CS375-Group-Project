let params = new URL(document.location.toString()).searchParams;
let planId = params.get("id");
console.log("Plan ID:", planId);

// Airport code to city name mapping for weather API
const airportToCityMap = {
    'LAX': 'Los Angeles,US', 'JFK': 'New York,US', 'LGA': 'New York,US',
    'EWR': 'New York,US', 'LHR': 'London,UK', 'CDG': 'Paris,FR',
    'NRT': 'Tokyo,JP', 'HND': 'Tokyo,JP', 'DXB': 'Dubai,AE',
    'SIN': 'Singapore,SG', 'HKG': 'Hong Kong,HK', 'SYD': 'Sydney,AU',
    'MEL': 'Melbourne,AU', 'YYZ': 'Toronto,CA', 'YVR': 'Vancouver,CA',
    'ORD': 'Chicago,US', 'ATL': 'Atlanta,US', 'MIA': 'Miami,US',
    'DFW': 'Dallas,US', 'DEN': 'Denver,US', 'SEA': 'Seattle,US',
    'SFO': 'San Francisco,US', 'BOS': 'Boston,US', 'IAD': 'Washington DC,US',
    'DCA': 'Washington DC,US', 'FCO': 'Rome,IT', 'MAD': 'Madrid,ES',
    'BCN': 'Barcelona,ES', 'AMS': 'Amsterdam,NL', 'FRA': 'Frankfurt,DE',
    'MUC': 'Munich,DE', 'ZUR': 'Zurich,CH'
};

// Trip Map state
let itineraryPoints = [];
let landmarksMap, landmarksIW;
let mapInitialized = false;
let mapsScriptLoading = null;

function loadGoogleMapsApi() {
    if (window.google && window.google.maps) return Promise.resolve();
    if (mapsScriptLoading) return mapsScriptLoading;

    mapsScriptLoading = fetch("/mapV2/config/maps-api-url")
        .then(r => r.json())
        .then(({ url }) => {
            return new Promise((resolve, reject) => {
                const s = document.createElement("script");
                s.src = url;
                s.async = true;
                s.onload = () => resolve();
                s.onerror = () => reject(new Error("Failed to load Google Maps API"));
                document.head.appendChild(s);
            });
        });

    return mapsScriptLoading;
}

fetch("/get-plan?id=" + planId).then((response) => {
    response.json().then((body) => {
        let planNameLabel = document.getElementById("plan-name");
        planNameLabel.textContent = body['plan_name'];

        // Flight Cards - Handle both data structures
        if (body.flights && body.flights.hasOwnProperty("flightData")) {
            // Structure from first script
            let flightInfo = body.flights.flightData;

            let flightDetailInclude = {
                "cost": "Flight Cost", "travelClass": "Travel Class", "flightNumber": "Flight Number",
                "adults": "Adults", "infants": "Infants", "children": "Children"
            };

            document.getElementById("airport").textContent += flightInfo.origin;

            document.getElementById("startDate").textContent = flightInfo.departure;
            document.getElementById("endDate").textContent = flightInfo.returnDate;
            document.getElementById("destination").textContent = flightInfo.destination;

            let flightInfoCardRow1 = document.getElementById("flight-info-row-1");
            let flightInfoCardRow2 = document.getElementById("flight-info-row-2");

            let i = 0;
            for (var flightDetail in flightDetailInclude) {
                let detailCol = document.createElement("div");
                detailCol.className = "col-md-4";

                let detailP = document.createElement("p");
                detailP.className = "card-text";

                if (flightInfo[flightDetail]) {
                    detailP.textContent = flightDetailInclude[flightDetail] + ": " + flightInfo[flightDetail];
                } else {
                    detailP.textContent = flightDetailInclude[flightDetail] + ": N/A";
                }

                detailCol.appendChild(detailP);

                if (i < 3) {
                    flightInfoCardRow1.appendChild(detailCol);
                } else {
                    flightInfoCardRow2.appendChild(detailCol);
                }
                i++;
            }

            // Fetch weather using detailed flight info
            fetchWeatherForecast(flightInfo.destination, flightInfo.departure, flightInfo.returnDate);

        } else if (body.flights) {
            // Structure from second script (simpler)
            let flightInfo = body.flights;
            let flightInfoCard = document.getElementById("flight-info");
            let doNotInclude = ["origin", "departure", "duration", "returnDate", "destination"];

            document.getElementById("airport").textContent += flightInfo.origin;
            document.getElementById("startDate").textContent = flightInfo.departure;
            document.getElementById("endDate").textContent = flightInfo.returnDate;
            document.getElementById("destination").textContent = flightInfo.destination;

            for (var flightDetail in flightInfo) {
                if (!doNotInclude.includes(flightDetail)) {
                    let detailP = document.createElement("p");
                    detailP.className = "card-text";
                    detailP.textContent = flightDetail + ": " + flightInfo[flightDetail];
                    flightInfoCard.appendChild(detailP);
                }
            }

            // Fetch weather using simple flight info
            fetchWeatherForecast(flightInfo.destination, flightInfo.departure, flightInfo.returnDate);
        } else {
            console.log("No flight data found");
            document.getElementById("airport").textContent = "A flight was not selected.";
        }

        // Hotel Cards
        if (body.hotels && body.hotels.hasOwnProperty("hotelData")) {
            let hotelData = body.hotels.hotelData.data;
            let hotelContainer = document.getElementById("hotels");
            document.getElementById('hotels-amount').textContent += hotelData.hotels.length;
            for (var key in hotelData.hotels) {
                let hotel = hotelData.hotels[key];

                let hotelCard = document.createElement('div');
                hotelCard.className = "card";

                let divBody = document.createElement('div');
                divBody.className = "card-body";
                hotelCard.appendChild(divBody);

                let cardTitle = document.createElement("h5");
                cardTitle.className = "card-title";
                cardTitle.textContent = hotel.name;
                divBody.appendChild(cardTitle);

                let cardSubtitle = document.createElement("h6");
                cardSubtitle.className = "card-subtitle mb-2 text-muted";
                cardSubtitle.textContent = hotel.vicinity + "\r\n";
                cardSubtitle.textContent += "lat: " + hotel.coordinates.lat + ", long: " + hotel.coordinates.lng;
                cardSubtitle.setAttribute('style', 'white-space: pre;');
                divBody.appendChild(cardSubtitle);

                let cardText = document.createElement("p");
                cardText.className = "card-text";
                cardText.textContent = "Rating: " + hotel.rating + " stars out of " + hotel.user_ratings_total + " reviews";
                divBody.appendChild(cardText);

                hotelContainer.appendChild(hotelCard);
            }
        } else {
            document.getElementById("hotels-amount").textContent += "No Hotels were Selected";
        }

        // Landmarks
        let landMarks = body.landmarks || {};
        let landmarkContainer = document.getElementById("itinerary");

        for (var key in (landMarks.plan || {})) {
            let landmark = landMarks.plan[key];

            let landmarkCard = document.createElement('div');
            landmarkCard.className = "card";

            let divBody = document.createElement('div');
            divBody.className = "card-body";
            landmarkCard.appendChild(divBody);

            let cardTitle = document.createElement("h5");
            cardTitle.className = "card-title";
            cardTitle.textContent = landmark.name || landmark.address || "Landmark";
            divBody.appendChild(cardTitle);

            let cardSubtitle = document.createElement("h6");
            cardSubtitle.className = "card-subtitle mb-2 text-muted";
            cardSubtitle.textContent = (landmark.address || "") + "\r\n";
            cardSubtitle.textContent += "lat: " + landmark.lat + ", long: " + landmark.lng;
            cardSubtitle.setAttribute('style', 'white-space: pre;');
            divBody.appendChild(cardSubtitle);

            let cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.textContent = landmark.notes || "";
            divBody.appendChild(cardText);

            // Google Map Link (address-based)
            let mapLink = document.createElement("a");
            mapLink.textContent = "Google Maps Link";
            const query = landmark.address && landmark.address.trim().length
                ? landmark.address
                : `${landmark.lat},${landmark.lng}`;
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
            mapLink.target = "_blank";
            divBody.appendChild(mapLink);

            landmarkContainer.appendChild(landmarkCard);

            // Collect for map
            if (landmark.lat && landmark.lng) {
                itineraryPoints.push({
                    name: landmark.name || "Untitled",
                    address: landmark.address || "",
                    lat: Number(landmark.lat),
                    lng: Number(landmark.lng),
                    notes: landmark.notes || ""
                });
            }
        }

        // Enable/disable map button based on data
        const showMapBtn = document.getElementById("show-map");
        if (showMapBtn) {
            if (itineraryPoints.length === 0) {
                showMapBtn.disabled = true;
                showMapBtn.title = "Add landmarks to view them on the map";
            } else {
                showMapBtn.disabled = false;
            }
        }
    });
}).catch((error) => {
    console.log(error);
});

// Map open/close
const mapModal = document.getElementById("mapModal");
const openBtn = document.getElementById("show-map");
const closeBtn = document.getElementById("closeMap");

if (openBtn && mapModal && closeBtn) {
    openBtn.addEventListener("click", async () => {
        if (openBtn.disabled) return;

        mapModal.classList.add("show");

        try {
            await loadGoogleMapsApi();
            if (!mapInitialized) {
                initLandmarksMap(itineraryPoints);
                mapInitialized = true;
            } else {
                fitMapToPoints(itineraryPoints);
            }
        } catch (e) {
            console.error(e);
            document.getElementById("landmarksMap").innerHTML =
                `<div class="p-3 text-danger">Failed to load map. Please try again later.</div>`;
        }
    });

    closeBtn.addEventListener("click", () => mapModal.classList.remove("show"));
    mapModal.addEventListener("click", (e) => {
        if (e.target === mapModal) mapModal.classList.remove("show"); // click backdrop to close
    });
}

function initLandmarksMap(points) {
    const mapEl = document.getElementById("landmarksMap");
    if (!mapEl || !window.google || !google.maps) {
        console.warn("Google Maps not loaded or map element missing.");
        return;
    }

    landmarksMap = new google.maps.Map(mapEl, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    landmarksIW = new google.maps.InfoWindow();

    points.forEach((p, idx) => {
        const marker = new google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map: landmarksMap,
            title: p.name,
            label: String(idx + 1)
        });

        // Hover: quick name
        marker.addListener("mouseover", () => {
            landmarksIW.setContent(`<strong>${escapeHTML(p.name)}</strong>`);
            landmarksIW.open(landmarksMap, marker);
        });
        marker.addListener("mouseout", () => landmarksIW.close());

        // Click: details
        marker.addListener("click", () => {
            const html = `
        <div style="max-width:240px">
          <div style="font-weight:700;margin-bottom:.25rem">${escapeHTML(p.name)}</div>
          <div style="font-size:.9rem">${escapeHTML(p.address)}</div>
          ${p.notes ? `<div style="font-size:.85rem;margin-top:.35rem;color:#555">${escapeHTML(p.notes)}</div>` : ""}
          <div style="margin-top:.5rem">
            <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address || (p.lat + ',' + p.lng))}">Open in Google Maps</a>
          </div>
        </div>`;
            landmarksIW.setContent(html);
            landmarksIW.open(landmarksMap, marker);
        });
    });

    fitMapToPoints(points);
}

function fitMapToPoints(points) {
    if (!landmarksMap || points.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
    landmarksMap.fitBounds(bounds);
    google.maps.event.addListenerOnce(landmarksMap, 'bounds_changed', () => {
        if (landmarksMap.getZoom() > 15) landmarksMap.setZoom(15);
    });
}

// Weather forecast functions
function fetchWeatherForecast(destination, startDate, endDate) {
    // Convert airport code to city name
    let cityName = airportToCityMap[destination] || destination;

    // Show loading state
    showWeatherLoading();

    let weatherUrl = `/weather?location=${encodeURIComponent(cityName)}&startDate=${startDate}&endDate=${endDate}`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.forecast && data.forecast.list && data.forecast.list.length > 0) {
                const dailyForecasts = processForecastData(data.forecast.list, startDate, endDate);
                if (dailyForecasts.length > 0) {
                    displayWeatherForecast(dailyForecasts);
                } else {
                    showNoForecastMessage();
                }
            } else {
                showWeatherError("Weather forecast not available for this destination.");
            }
        })
        .catch(error => {
            console.error("Weather fetch error:", error);
            showWeatherError("Failed to load weather forecast. Please try again.");
        });
}

function displayWeatherForecast(dailyForecasts) {
    const weatherContent = document.getElementById("weatherContent");
    if (!weatherContent) return;

    let forecastHTML = `
    <div class="forecast-section">
      <h4>Weather Forecast</h4>
      <div class="forecast-grid">
  `;

    dailyForecasts.forEach(day => {
        forecastHTML += `
      <div class="forecast-day">
        <div class="day-name">${day.dayName}</div>
        <div class="day-date">${day.date}</div>
        <div class="temps">
          <span class="high">${Math.round(day.maxTemp)}°</span>
          <span class="low">${Math.round(day.minTemp)}°</span>
        </div>
        <div class="description">${day.description}</div>
      </div>
    `;
    });

    forecastHTML += `
      </div>
    </div>
  `;

    weatherContent.innerHTML = forecastHTML;
}

function showNoForecastMessage() {
    const weatherContent = document.getElementById("weatherContent");
    if (weatherContent) {
        weatherContent.innerHTML = `
      <div class="no-forecast">
        <h4>Weather Forecast</h4>
        <p>No weather forecast available for your travel dates.</p>
      </div>
    `;
    }
}

function processForecastData(forecastList, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const dailyData = {};

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (date >= start && date <= end) {
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: date,
                    temps: [],
                    descriptions: []
                };
            }

            dailyData[dateKey].temps.push(item.main.temp);
            dailyData[dateKey].descriptions.push(item.weather[0].description);
        }
    });

    const dailyForecasts = Object.keys(dailyData)
        .map(dateKey => {
            const dayData = dailyData[dateKey];

            return {
                dayName: dayData.date.toLocaleDateString('en-US', { weekday: 'long' }),
                date: dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                maxTemp: Math.max(...dayData.temps),
                minTemp: Math.min(...dayData.temps),
                description: getMostCommonDescription(dayData.descriptions),
                sortDate: dayData.date
            };
        })
        .sort((a, b) => a.sortDate - b.sortDate);

    return dailyForecasts;
}

function getMostCommonDescription(descriptions) {
    const counts = {};
    descriptions.forEach(desc => {
        counts[desc] = (counts[desc] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function showWeatherLoading() {
    const weatherContent = document.getElementById("weatherContent");
    if (weatherContent) {
        weatherContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Loading weather forecast...
      </div>
    `;
    }
}

function showWeatherError(message) {
    const weatherContent = document.getElementById("weatherContent");
    if (weatherContent) {
        weatherContent.innerHTML = `
      <div class="error">
        <p>${message}</p>
      </div>
    `;
    }
}

// helper
function escapeHTML(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}