const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

// bootstrap for css
app.use("/",express.static("../node_modules/bootstrap/dist/"));

app.use("/create-account", express.static("login"));

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
  });