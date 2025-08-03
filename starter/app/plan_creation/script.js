window.addEventListener('DOMContentLoaded', function () {
    searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.reset();
    }
});

let searchForm = document.getElementById("searchForm");

if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let city = document.getElementById("city").value;
        let country = document.getElementById("country").value;
        let airport = document.getElementById("airport").value;
        let startDate = document.getElementById("startDate").value;
        let endDate = document.getElementById("endDate").value;

        showLoading();

        let url = `/plan?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&airport=${airport}&startDate=${startDate}&endDate=${endDate}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Received data:", data);

                if (data.forecast) {
                    display7DayForecast(data.forecast);
                }

                // Add more api stuff here maybe
            })
            .catch(error => {
                console.log("Error:", error);
                showError("Failed to get travel information. Please try again.");
            });
    });
}

function display7DayForecast(forecastData) {
    weatherContent = document.getElementById("weatherContent");
    if (!weatherContent) return;

    dailyForecasts = processForecastData(forecastData.list);

    let forecastHTML = `
    <div class="forecast-section">
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

function processForecastData(forecastList) {
    dailyData = {};
    today = new Date();

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: date,
                temps: [],
                descriptions: []
            };
        }

        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].descriptions.push(item.weather[0].description);
    });

    dailyForecasts = Object.keys(dailyData).slice(0, 7).map(dateKey => {
        dayData = dailyData[dateKey];

        return {
            dayName: dayData.date.toLocaleDateString('en-US', { weekday: 'long' }),
            date: dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxTemp: Math.max(...dayData.temps),
            minTemp: Math.min(...dayData.temps),
            description: getMostCommonDescription(dayData.descriptions)
        };
    });

    return dailyForecasts;
}

function getMostCommonDescription(descriptions) {
    counts = {};
    descriptions.forEach(desc => {
        counts[desc] = (counts[desc] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function showLoading() {
    weatherContent = document.getElementById("weatherContent");
    flightsContent = document.getElementById("flightsContent");

    if (weatherContent) {
        weatherContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Loading weather forecast...
      </div>
    `;
    }

    if (flightsContent) {
        flightsContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Searching for flights...
      </div>
    `;
    }
}

function showError(message) {
    weatherContent = document.getElementById("weatherContent");
    if (weatherContent) {
        weatherContent.innerHTML = `
      <div class="error">
        <p>${message}</p>
      </div>
    `;
    }
}