require("dotenv").config(); // Loads variables from .env

const express = require("express");
const app = express();
const axios = require("axios");

const port = process.env.PORT || 3000;

const pg = require("pg");
let cookieParser = require("cookie-parser");
let crypto = require("crypto");
app.use(cookieParser());

const hostname = "localhost";

const useSSL =
  process.env.DATABASE_SSL === "true" ||
  process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL || "").includes("render.com");


const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});


const flightKey = process.env.FLIGHT_KEY;
const flightUrl = process.env.FLIGHT_URL;
const weatherKey = process.env.WEATHER_KEY;
const amadeusKey = process.env.AMADEUS_KEY;
const amadeusSecret = process.env.AMADEUS_SECRET;
const mapsKey = process.env.MAPS_KEY;

pool
  .connect()
  .then(() => console.log(`Connected to database (${useSSL ? "SSL on" : "SSL off"})`))
  .catch(err => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });

// Global Token Storage to Keep Track of Sessions
let tokenStorage = {};

async function loadTokenStorageFromDatabase() {
  let result;
  try {
    result = await pool.query(
      `SELECT * FROM session_storage;`,
    );
  } catch (error) {
    console.log("SELECT FAILED", error);

    // 500: Internal Server Error - Something wrong with DB
    return res.sendStatus(500);
  }
  for (let tokenRow of result.rows) {
    tokenStorage[tokenRow['session_token']] = tokenRow.email
  }

  console.log("Loaded Session Tokens from DB:", tokenStorage);
}
loadTokenStorageFromDatabase();

/* middleware; check if login token in token storage, if not, 403 response */
let authorize = (req, res, next) => {
  let token = req.cookies.token;
  if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
    return res.redirect("/login");
  }
  next();
};

/* middleware; check if login token in token storage, if yes, redirect to logged in home page*/
let redirectHomeIfLoggedIn = (req, res, next) => {
  if (req.path !== "/") {
    return next();
  }
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

app.use("/", redirectHomeIfLoggedIn, express.static("public"));

// homepage for logged in users
app.use("/home", authorize, express.static("home"));

app.use("/plan", authorize, express.static("itinerary"));

app.use("/create-account", express.static("registration"));
app.use("/login", express.static("login"));

app.use("/plan-creation", express.static("plan_creation"));
app.use("/planCreation", express.static("planCreation"));
app.use("/search-flights", express.static("flights"));
app.use('/map', express.static("map"));
app.use('/mapV2', express.static("mapV2"));
app.use("/planner", express.static("planner"));
app.use('/hotels', express.static("hotels"));
app.use('/explore', express.static("explore"));

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
app.post("/flights", (req, res) => {
  const token = req.cookies.token;
  const email = tokenStorage[token];

  if (!email) {
    return res.status(401).json({ message: "Failed because of email" });
  }

  const { flightData } = req.body;

  pool.query(
    `
    INSERT INTO travel_planners (email, flights)
    VALUES ($1, $2)
    RETURNING id
    `,
    [email, flightData]
  ).then(() => {
    res.status(200).json({ message: "Flight saved successfully" });
  })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    });

  /*
  const {flightNumber, origin, destination, departure, returnDate, adults, children, infants, travelClass, cost, duration,} = flightData;
  pool.query(
    `INSERT INTO flight(flightNumber, origin, destination, departure, returnDate, adults, children, infants, travelClass, cost, duration) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [flightNumber, origin, destination, departure, returnDate, adults, children, infants, travelClass, cost, duration,]
  ).then(result => {
    console.log('Flight saved successfully');
    res.status(200).json({ message: "Flight saved successfully" });
  })
  .catch(error => {
    console.log(error);
    res.sendStatus(500);
  })
    */
});
app.get("/amadeus/token", async (req, res) => {
  try {
    const tokenRes = await axios.post("https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: amadeusKey,
        client_secret: amadeusSecret
      })
    );
    res.json({ access_token: tokenRes.data.access_token });
  } catch (error) {
    res.status(500);
  }
});

app.post("/create-account", (req, res) => {
  let body = req.body;

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

app.get("/plans", async (req, res) => {
  const token = req.cookies.token;
  const email = tokenStorage[token];

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  pool.query(
    `
    SELECT id, flights, hotels, landmarks, created_at, updated_at
    FROM travel_planners
    WHERE email = $1
    ORDER BY created_at DESC
    `,
    [email]
  ).then(result => {
    res.json(result.rows);
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
});

app.get("/api/plans", (req, res) => {
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
  return body.email && body.passwordAttempt;
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
  if (result.rows.length === 1) {
    let account = result.rows[0];
    console.log(account);
    console.log(account.first_name)

    let token = makeToken();
    console.log("Generated token", token);
    tokenStorage[token] = email;

    //save token to db
    try {
      result = await pool.query(
        `INSERT INTO session_storage(session_token, email) 
        VALUES($1, $2)
        RETURNING *`,
        [token, email],
      );
    } catch (error) {
      console.log("SELECT FAILED", error);

      // 500: Internal Server Error - Something wrong with DB
      return res.sendStatus(500);
    }

    return res.cookie("token", token, cookieOptions).send();
  } else {
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

  //delete token from db
  console.log("Deleted:")
  try {
    result = pool.query(
      `DELETE FROM session_storage WHERE session_token=$1 AND email=$2`,
      [token, tokenStorage[token]],
    );
  } catch (error) {
    console.log("SELECT FAILED", error);

    // 500: Internal Server Error - Something wrong with DB
    return res.sendStatus(500);
  }

  console.log("Before", tokenStorage);
  delete tokenStorage[token];
  console.log("Deleted", tokenStorage);

  return res.clearCookie("token", cookieOptions).send();
});

app.get("/mapV2/config/maps-api-url", (req, res) => {
  if (!mapsKey) return res.status(500).json({ error: "Maps key not configured" });
  const url = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&v=weekly`;
  res.json({ url });
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
