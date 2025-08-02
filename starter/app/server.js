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

pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

// bootstrap for css
app.use("/",express.static("../node_modules/bootstrap/dist/"));
app.use(express.json());

app.use('/images', express.static("images"));

app.use("/home", express.static("public"));
app.use("/create-account", express.static("registration"));
app.use("/login", express.static("login"));
app.use("/plan-creation", express.static("plan_creation"));
app.use("/search-flights", express.static("flights"));

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

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});