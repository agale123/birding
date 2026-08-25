// This key is restricted to use for this project.
// You'll need to get your own: https://developers.google.com/maps/documentation/maps-static/get-api-key
// You'll want to restrict it to the url of the project - ie.
// 1. binstobins.com
// 2. https://YOURPROJECTNAME.binstobins.online/

let apiKey = "AIzaSyCYr97ie7T67sadKXOhrndJkFTujOaJrQ4";
let baseURL = "https://maps.googleapis.com/maps/api/staticmap?";

// Note that this can cost $$ if you get A LOT of traffic.

// All of the Hawk path data
let hawkData;
// A path from the data
let hawkPath;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("white");
  loadTable("hawks.csv", "csv", "header", onData);
}

function draw() {}

function drawPath(hawkPath) {
  background("AliceBlue");

  // Find lat/lon bounds.
  let lats = [];
  let lons = [];
  for (let i = 0; i < hawkPath.length; i++) {
    let lat = hawkPath[i].obj["location-lat"];
    lats.push(lat);
    let lon = hawkPath[i].obj["location-long"];
    lons.push(lon);
  }

  const latBounds = [min(lats), max(lats)];
  const lonBounds = [min(lons), max(lons)];

  for (let i = 0; i < hawkPath.length; i++) {
    let lat = hawkPath[i].obj["location-lat"];
    let lon = hawkPath[i].obj["location-long"];

    let x = map(lon, lonBounds[0], lonBounds[1], 50, windowWidth-50);
    let y = map(lat, latBounds[0], latBounds[1], windowHeight-50, 50);

    // Get the URL for the satelite image. Needs ints for the sizes.
    let url = getGoogleURL(lat, lon, 40, 40);
    let color = getDominantColor(url, (color) => {
      fill(color);
      noStroke();
      ellipse(x, y, 10, 10);
    });
  }
}

function getGoogleURL(_lat, _lon, _w, _h) {
  //Explain zoom level here
  return (
    baseURL +
    "key=" +
    apiKey +
    "&maptype=satellite&center=" +
    _lat +
    "," +
    _lon +
    "&zoom=18&size=" +
    _w +
    "x" +
    _h +
    "&jnk=.jpg"
  );
}

function getDominantColor(src, callback) {
  var context = document.createElement("canvas").getContext("2d");
  context.imageSmoothingEnabled = true;
  let img = new Image();
  img.setAttribute("crossOrigin", "");
  img.src = src;
  img.onload = function () {
    context.drawImage(img, 0, 0, 1, 1);
    const data = context.getImageData(0, 0, 1, 1).data;
    callback(
      "#" +
        ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2])
          .toString(16)
          .slice(1),
    );
  };
}

function onData(_data) {
  hawkData = _data;
  // Get a path for a specific individual
  // You can try another ID from the CSV
  hawkPath = getPath("71526", 400);
  drawPath(hawkPath);
}

function getPath(_id, _maxRows) {
  let rows = hawkData.findRows(_id, "tag-local-identifier");
  let filteredRows = [];
  // If there are more rows than our max, sample down
  if (rows.length > _maxRows) {
    let skip = floor(rows.length / _maxRows);
    for (let i = 0; i < rows.length; i += skip) {
      if (filteredRows.length < _maxRows) {
        filteredRows.push(rows[i]);
      }
    }
  } else {
    filteredRows = rows;
  }

  return filteredRows;
}
