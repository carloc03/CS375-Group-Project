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
app.use("/", express.static("../node_modules/bootstrap/dist/"));

app.use("/create-account", express.static("login"));

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