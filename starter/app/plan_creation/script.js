app.get("/data", (req, res) => {
    let zip = req.query.zip;
    let url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apiKey}`;
    axios(url).then(response => {
        res.json(response.data);
    }).catch(error => {
        console.log(error);
        res.status(500).json({ message: "Something went wrong " });
    });
});

// New geocoding endpoint
app.get("/geocode", (req, res) => {
    let city = req.query.city;
    let country = req.query.country;

    // Build the query string - city,country format
    let query = `${city},${country}`;
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${apiKey}`;

    axios(url).then(response => {
        res.json(response.data);
    }).catch(error => {
        console.log(error);
        res.status(500).json({ message: "Geocoding failed" });
    });
});

// Client-side JavaScript
let button = document.getElementById("submit");
let input = document.getElementById("zip");

// Original zip code functionality
button.addEventListener("click", () => {
    let zip = input.value;
    let url = `/data?zip=${zip}`;
    fetch(url).then(response => {
        return response.json();
    }).then(body => {
        console.log(body);
    }).catch(error => {
        console.log(error);
    });
});

// Server-side route to handle form submission and display weather
app.get("/plan", (req, res) => {
    let city = req.query.city;
    let country = req.query.country;
    let airport = req.query.airport;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (!city || !country) {
        return res.status(400).json({ message: "City and country are required" });
    }

    // First geocode the location
    let query = `${city},${country}`;
    let geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${apiKey}`;

    axios(geocodeUrl).then(geoResponse => {
        if (geoResponse.data.length === 0) {
            return res.status(404).json({ message: "Location not found" });
        }

        let lat = geoResponse.data[0].lat;
        let lon = geoResponse.data[0].lon;

        // Get weather data using coordinates
        let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        return axios(weatherUrl);
    }).then(weatherResponse => {
        // Here you would render your HTML page with the weather data
        // For now, just return the data as JSON
        res.json({
            location: { city, country },
            coordinates: { lat: weatherResponse.config.params?.lat, lon: weatherResponse.config.params?.lon },
            weather: weatherResponse.data,
            travelDates: { startDate, endDate },
            airport: airport
        });
    }).catch(error => {
        console.log(error);
        res.status(500).json({ message: "Failed to get weather data" });
    });
});

// New geocoding functionality for city/country form
let searchForm = document.getElementById("searchForm");
let cityInput = document.getElementById("city");
let countryInput = document.getElementById("country");

searchForm.addEventListener("submit", (e) => {
    let city = cityInput.value;
    let country = countryInput.value;

    let url = `/geocode?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                let lat = data[0].lat;
                let lon = data[0].lon;
                let locationName = data[0].name;
                console.log(`Location: ${locationName}`);
                console.log(`Coordinates: ${lat}, ${lon}`);
                // You can now use these coordinates for weather, maps, etc.
            } else {
                console.log("Location not found");
            }
        })
        .catch(error => {
            console.log(error);
        });
});
