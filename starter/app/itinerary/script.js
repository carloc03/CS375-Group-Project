let params = new URL(document.location.toString()).searchParams;
let planId = params.get("id");
console.log(planId);

// Airport code to city name mapping for weather API
const airportToCityMap = {
    'LAX': 'Los Angeles,US',
    'JFK': 'New York,US',
    'LGA': 'New York,US',
    'EWR': 'New York,US',
    'LHR': 'London,UK',
    'CDG': 'Paris,FR',
    'NRT': 'Tokyo,JP',
    'HND': 'Tokyo,JP',
    'DXB': 'Dubai,AE',
    'SIN': 'Singapore,SG',
    'HKG': 'Hong Kong,HK',
    'SYD': 'Sydney,AU',
    'MEL': 'Melbourne,AU',
    'YYZ': 'Toronto,CA',
    'YVR': 'Vancouver,CA',
    'ORD': 'Chicago,US',
    'ATL': 'Atlanta,US',
    'MIA': 'Miami,US',
    'DFW': 'Dallas,US',
    'DEN': 'Denver,US',
    'SEA': 'Seattle,US',
    'SFO': 'San Francisco,US',
    'BOS': 'Boston,US',
    'IAD': 'Washington DC,US',
    'DCA': 'Washington DC,US',
    'FCO': 'Rome,IT',
    'MAD': 'Madrid,ES',
    'BCN': 'Barcelona,ES',
    'AMS': 'Amsterdam,NL',
    'FRA': 'Frankfurt,DE',
    'MUC': 'Munich,DE',
    'ZUR': 'Zurich,CH'
    // Add more airport codes as needed
};

fetch("/get-plan?id=" + planId).then((response) => {
    response.json().then((body) => {
        let planNameLabel = document.getElementById("plan-name");
        planNameLabel.textContent = body['plan_name']

        console.log(body.flights);

        // Flight Cards - Handle both data structures
        if (body.flights && body.flights.hasOwnProperty("flightData")) {
            // Structure from first script (more detailed)
            let flightInfo = body.flights.flightData;

            let flightDetailInclude = {
                "cost": "Flight Cost", "travelClass": "Travel Class", "flightNumber": "FlightNumber",
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
                    detailP.textContent = flightDetailInclude[flightDetail] + ": N/A"
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
                    console.log(flightDetail);
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
            document.getElementById('hotels-amount').textContent += hotelData.hotels.length
            for (var key in hotelData.hotels) {
                let hotel = hotelData.hotels[key];
                console.log(hotel)

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
                cardText.textContent = "Rating: " + hotel.rating + " stars out of " + hotel.user_ratings_total + " reviews"
                divBody.appendChild(cardText);

                hotelContainer.appendChild(hotelCard);
            }
        } else {
            document.getElementById("hotels-amount").textContent += "No Hotels were Selected"
        }

        // Landmarks
        let landMarks = body.landmarks;
        let landmarkContainer = document.getElementById("itinerary");
        console.log(landMarks.plan)

        for (var key in landMarks.plan) {
            let landmark = landMarks.plan[key];
            console.log(landmark);

            let landmarkCard = document.createElement('div');
            landmarkCard.className = "card";

            let divBody = document.createElement('div');
            divBody.className = "card-body";
            landmarkCard.appendChild(divBody);

            let cardTitle = document.createElement("h5");
            cardTitle.className = "card-title";
            cardTitle.textContent = landmark.name;
            divBody.appendChild(cardTitle);

            let cardSubtitle = document.createElement("h6");
            cardSubtitle.className = "card-subtitle mb-2 text-muted";
            cardSubtitle.textContent = landmark.address + "\r\n";
            cardSubtitle.textContent += "lat: " + landmark.lat + ", long: " + landmark.lng;
            cardSubtitle.setAttribute('style', 'white-space: pre;');
            divBody.appendChild(cardSubtitle);

            let cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.textContent = landmark.notes;
            divBody.appendChild(cardText);

            // Google Map Link TODO
            let mapLink = document.createElement("a");
            mapLink.textContent = "Google Maps Link";
            mapLink.href = "https://www.google.com/maps";
            divBody.appendChild(mapLink);

            landmarkContainer.appendChild(landmarkCard);
        }
    })
}).catch((error) => {
    console.log(error);
});

// Weather forecast functions
function fetchWeatherForecast(destination, startDate, endDate) {
    // Convert airport code to city name
    let cityName = airportToCityMap[destination] || destination;

    console.log("Original destination:", destination);
    console.log("City for weather:", cityName);
    console.log("Start date:", startDate);
    console.log("End date:", endDate);
    console.log("Parsed start date:", new Date(startDate));
    console.log("Parsed end date:", new Date(endDate));

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
            console.log("Weather data received:", data);
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
// let flightInfo = {"cost": 302.6, 
// "adults": 1, 
// "origin": "ATL", 
// "infants": 0, 
// "children": 0, 
// "duration": "PT10H50M", 
// "departure": "2025-08-17T13:33:00", 
// "returnDate": "2025-08-17T23:23:00", 
// "destination": "AUS", 
// "travelClass": "", 
// "flightNumber": "F93293"
// }

// let flightInfoCard = document.getElementById("flight-info")

// let doNotInclude = ["origin", "departure", "duration", "returnDate", "destination"]

// document.getElementById("airport").textContent += flightInfo.origin;

// document.getElementById("startDate").textContent = flightInfo.departure;
// document.getElementById("endDate").textContent = flightInfo.returnDate;
// document.getElementById("destination").textContent = flightInfo.destination;

// for (var flightDetail in flightInfo){
//     if(!doNotInclude.includes(flightDetail)){
//         console.log(flightDetail);
//         let detailP = document.createElement("p");
//         detailP.className = "card-text";
//         detailP.textContent = flightDetail + ": " + flightInfo[flightDetail];

//         flightInfoCard.appendChild(detailP);
//     }
// }

// //<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>


// let landMarks = {
//     0 : {
//         address: "Hodges Heights Park, 7063 Creek Crossing Dr, Harrisburg, PA 17111, USA",
//         lat: 40.276714,
//         lng: -76.763919,
//         name: "",
//         notes: "First Visit, beautiful park",
//     },
//     1: { 
//         address: "City Island (North Side Shelter), Harrisburg, PA 17101, USA",
//         lat: 40.254148,
//         lng: -76.887349,
//         name: "",
//         notes: "Example asfsafaslshfkfhsdfasdasdjdhfsfhskfh",
//     }, 
//     3: {
//         address: "411 Gravel Rd, Palmyra, PA 17078, USA",
//         lat: 40.319828,
//         lng: -76.620112,
//         name: "",
//         notes: "Visiting Pennsylvania street and getting some cheesesteaks",
//     }
// }

// let landmarkContainer = document.getElementById("itinerary");

// for (var key in landMarks){
//     let landmark = landMarks[key];
//     console.log(landmark);

//     let landmarkCard = document.createElement('div');
//     landmarkCard.className = "card";

//     let divBody = document.createElement('div');
//     divBody.className = "card-body";
//     landmarkCard.appendChild(divBody);

//     let cardTitle = document.createElement("h5");
//     cardTitle.className = "card-title";
//     cardTitle.textContent = landmark.address;
//     divBody.appendChild(cardTitle);

//     let cardSubtitle = document.createElement("h6");
//     cardSubtitle.className = "card-subtitle mb-2 text-muted";
//     cardSubtitle.textContent = "lat: " + landmark.lat + ", long: " + landmark.lng;
//     divBody.appendChild(cardSubtitle);

//     let cardText = document.createElement("p");
//     cardText.className = "card-text";
//     cardText.textContent = landmark.notes;
//     divBody.appendChild(cardText);

//     // Google Map Link TODO
//     let mapLink = document.createElement("a");
//     mapLink.textContent = "Google Maps Link";
//     mapLink.href = "https://www.google.com/maps";
//     divBody.appendChild(mapLink);

//     landmarkContainer.appendChild(landmarkCard);
// }