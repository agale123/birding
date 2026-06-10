/*

Xeno-canto API Demo
NOTE: You must put your xeno-canto API key in the .env file.
 on binstobins: click the teal tab with the project name, click advanced,  put your key in the environment variables: XENOCANTOKEY=YOUR_KEY 

*/

import { execSync } from "node:child_process";
import request from "request";
import express from "express";
import nunjucks from "nunjucks";

const { PORT } = process.env;

// 1: create our express server:
const app = express();
app.use(express.static("public"));

// 2: make sure it uses nunjucks for any file that
//    can be found in the "public" dir:
nunjucks.configure("public", {
  autoescape: true,
  noCache: true,
  express: app,
});

// 3: set up a single "route", in this case the root
//    location, and make that send people our index.html
//    content when they ask for it, with the {{node}}
//    and {{python}} placeholders replaced "on the fly":
app.get(`/`, (req, res) => {
  res.render(`index.html`, {
    node: execSync(`node --version`).toString(),
    python: execSync(`python3 --version`).toString(),
  });
});

// 4: Set up our custom endpoints:

// Get a list of birds near a lat/lon
app.get("/recent", (req, res) => {
  var dist = req.query.dist;
  var lat = req.query.lat;
  var lon = req.query.lon;

  var options = {
    method: "GET",
    url:
      "https://api.ebird.org/v2/data/obs/geo/recent?lat=" +
      lat +
      "&lng=" +
      lon +
      "&sort=species&dist=" + dist,
    headers: {
      "X-eBirdApiToken": process.env.EBIRDKEY
    }
  };
  request(options).pipe(res);
});

// Get details from a checklist
app.get("/checklist", (req, res) => {
  var id = req.query.id;
  var options = {
    method: "GET",
    url:
      "https://api.ebird.org/v2/product/checklist/view/" +
      id,
    headers: {
      "X-eBirdApiToken": process.env.EBIRDKEY
    }
  };
  request(options).pipe(res);
});

// Get a xeno-canto sound list based on species name (v3 API)
app.get("/chirp", (req, res) => {
  var species = req.query.species;
  var query = `en:"${species}" q:A`;
  var params = new URLSearchParams({
    query: query,
    key: process.env.XENOCANTOKEY
  });
  var options = {
    method: "GET",
    url: "https://xeno-canto.org/api/3/recordings?" + params.toString()
  };
  request(options).pipe(res);
});

// 5: Then activate our server, so that it's listening
//    for outside requests on the port number that the
//    system gave us:
app.listen(8000, () => {
  console.log(`listening...`);
});