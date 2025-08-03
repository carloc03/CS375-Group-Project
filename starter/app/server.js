const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
const axios = require("axios");

let flightKey = env["flight_key"];
let flightUrl = env["flight_url"];
let weatherKey = env["weather_key"];

pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

// bootstrap for css
app.use("/", express.static("../node_modules/bootstrap/dist/"));
app.use(express.json());

app.use('/images', express.static("images"));

app.use("/home", express.static("public"));
app.use("/create-account", express.static("registration"));
app.use("/login", express.static("login"));
app.use("/plan-creation", express.static("plan_creation"));
app.use("/search-flights", express.static("flights"));
app.use('/map', express.static("map"));

app.get("/flights", (req, res) => {
  let from = req.query.from;
  let to = req.query.to;
  let date = req.query.date;

  let url = `${flightUrl}?engine=google_flights&departure_id=${from}&arrival_id=${to}&outbound_date=${date}&type=2&api_key=${flightKey}`;

  axios.get(url)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: "Failed to get data." });
    });
});

app.use(express.json());
app.post("/create-account", (req, res) => {
  let body = req.body;
  console.log(body);

  //passwords are encrypted with a salt
  //to check and compare passwords for authentication, use:
  //SELECT * FROM accounts WHERE 
  //password_hash=crypt('password_atempt', password_hash);
  pool.query(
    `INSERT INTO accounts(first_name, last_name, email, password_hash) 
    VALUES($1, $2, $3, crypt($4, gen_salt('bf')))
    RETURNING *`,
    [body.firstName, body.lastName, body.email, body.password],
  )
    .then((result) => {
      console.log("Inserted:");
      console.log(result.rows);
      res.statusCode = 200;
      res.send();
    })
})

app.get("/plan", (req, res) => {
  let city = req.query.city;
  let country = req.query.country;
  let airport = req.query.airport;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  if (!city || !country) {
    return res.status(400).json({ message: "City and country are required" });
  }

  let query = `${city},${country}`;
  let geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${weatherKey}`;

  axios(geocodeUrl)
    .then(geoResponse => {
      if (geoResponse.data.length === 0) {
        return res.status(404).json({ message: "Location not found" });
      }

      let lat = geoResponse.data[0].lat;
      let lon = geoResponse.data[0].lon;

      let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`;
      return axios(forecastUrl);
    })
    .then(forecastResponse => {
      res.json({
        location: { city, country },
        coordinates: {
          lat: forecastResponse.data.city.coord.lat,
          lon: forecastResponse.data.city.coord.lon
        },
        forecast: forecastResponse.data,
        travelDates: { startDate, endDate },
        airport: airport
      });
    })
    .catch(error => {
      console.log("Server error:", error);
      res.status(500).json({ message: "Failed to get weather data" });
    });
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});