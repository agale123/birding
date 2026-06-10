import { execSync } from "node:child_process";
import request from "request";
import * as path from "path";

// Use Express, https://expressjs.com, which is
// a long-establish Node based web server.
import express from "express";

// All projects get an environment variable called
// PORT, which is the single port number that a
// server can be accessed through from the outside.
const { PORT } = process.env;

// 1: create our express server:
const app = express();
app.use(express.static("public"));

// 2: set up a single "route", in this case the root
//    location, and make that send people our index.html
//    content when they ask for it, with the {{node}}
//    and {{python}} placeholders replaced "on the fly":
app.get(`/`, (req, res) => {
  res.render(`index.html`, {
    node: execSync(`node --version`).toString(),
    python: execSync(`python3 --version`).toString(),
  });
});

// 3: Endpoint to get history data from the eBird API
//    Example URL: /history?loc=L1902982&date=2024/01/01
app.get("/history", (req, res) => {
  var d = req.query.date;
  var loc = req.query.loc;

  var options = {
    method: "GET",
    url: "https://api.ebird.org/v2/data/obs/" + loc + "/historic/" + d,
    headers: {
      "x-ebirdapitoken": process.env.eBirdKey,
    },
  };
  console.log(options.url);
  request(options).pipe(res);
});

app.get("/colors.csv", (req, res) => {
  const file = path.join(__dirname, "colors.csv");
  console.log(file);
  res.sendFile(file);
});

// 4: Then activate our server, so that it's listening
//    for outside requests on the port number that the
//    system gave us:
app.listen(PORT, () => {
  console.log(`listening...`);
});
