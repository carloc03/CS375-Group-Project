const express = require("express");
const app = express();

const pg = require("pg");
let cookieParser = require("cookie-parser");
let crypto = require("crypto");
app.use(cookieParser());

const port = 3000;
const hostname = "localhost";

const Pool = pg.Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const axios = require("axios");

//let flightKey = env["flight_key"];
//let flightUrl = env["flight_url"];
//let weatherKey = env["weather_key"];
let amadeusKey = process.env.AMADEUS_KEY;
let amadeusSecret = process.env.AMADEUS_SECRET;

pool.connect().then(function () {
  console.log(`Connected to: ${process.env.DATABASE_URL}`);
});

// Global Token Storage to Keep Track of Sessions
let tokenStorage = {};

/* middleware; check if login token in token storage, if not, 403 response */
let authorize = (req, res, next) => {
  let token = req.cookies.token;
  console.log(token, tokenStorage);
  if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
    res.redirect("/login");
    return res.sendStatus(403); // TODO
  }
  next();
};

/* middleware; check if login token in token storage, if yes, redirect to logged in home page*/
let checkSession = (req, res, next) => {
  let token = req.cookies.token;
  if (token && tokenStorage.hasOwnProperty(token)) {
    return res.redirect("/home");
  }
  next();
}

// bootstrap for css
app.use("/", express.static("../node_modules/bootstrap/dist/"));

app.use(express.json());

app.use('/images', express.static("images"));

app.use("/", checkSession, express.static("public"));

// homepage for logged in users
app.use("/home", authorize, express.static("home"));

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
  ).then((result) => {
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

/* returns a random 32 byte string */
function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}
let cookieOptions = {
  httpOnly: true, // client-side JS can't access this cookie; important to mitigate cross-site scripting attack damage
  secure: true, // cookie will only be sent over HTTPS connections (and localhost); important so that traffic sniffers can't see it even if our user tried to use an HTTP version of our site, if we supported that
  sameSite: "strict", // browser will only include this cookie on requests to this domain, not other domains; important to prevent cross-site request forgery attacks
};
function validateLogin(body) {
  // TODO
  return true;
}

app.post("/login", async (req, res) => {
  let body = req.body;
  console.log(body);

  // TODO validate body is correct shape and type
  if (!validateLogin(body)) {
    return res.sendStatus(400); // TODO
  }

  let email = body.email;
  let passwordAttempt = body.passwordAttempt

  let result;
  try {
    result = await pool.query(
      `SELECT * FROM accounts WHERE email=$1 and password_hash=crypt($2, password_hash);`,
      [email, passwordAttempt],
    );
  } catch (error) {
    console.log("SELECT FAILED", error);

    // 500: Internal Server Error - Something wrong with DB
    return res.sendStatus(500);
  }

  //should only ever return 1 row since emails are unique
  if(result.rows.length === 1){
    let account = result.rows[0];
    console.log(account);
    console.log(account.first_name)

    let token = makeToken();
    console.log("Generated token", token);
    tokenStorage[token] = email;
    return res.cookie("token", token, cookieOptions).send();
  }else{
    // Credentials Bad
    return res.sendStatus(400);
  }
})

app.post("/logout", (req, res) => {
  let { token } = req.cookies;

  if (token === undefined) {
    console.log("Already logged out");
    return res.sendStatus(400); // TODO
  }

  if (!tokenStorage.hasOwnProperty(token)) {
    console.log("Token doesn't exist");
    return res.sendStatus(400); // TODO
  }

  console.log("Before", tokenStorage);
  delete tokenStorage[token];
  console.log("Deleted", tokenStorage);

  return res.clearCookie("token", cookieOptions).send();
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});