// event-id,visible,timestamp,location-long,location-lat,gps:activity-count,bar:barometric-pressure,cpu-temperature,external-temperature,gps:satellite-count,ground-speed,heading,height-above-ellipsoid,import-marked-outlier,location-error-numerical,tag-voltage,underwater-time,sensor-type,individual-taxon-canonical-name,tag-local-identifier,individual-local-identifier,study-name

let ostrichTable;

let latBounds;
let lonBounds;

let startTime;
let endTime;
let currentTime;
let timeScale = 1000000;

function preload() {
  ostrichTable = loadTable("ostrich.csv", "csv", "header");
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background("white");

  calculateBounds(ostrichTable, 602);
}

function calculateBounds(table, id) {
  let lats = [];
  let lons = [];
  for (let i = 0; i < table.getRowCount(); i++) {
    if (table.get(i, "individual-local-identifier") == id) {
      lats.push(table.get(i, "location-lat"));
      lons.push(table.get(i, "location-long"));

      let timestamp = new Date(table.get(i, "timestamp"));
      
      if (!startTime) {
        startTime = timestamp;
        endTime = timestamp;
      } else if (timestamp < startTime) {
        startTime = timestamp;
      } else if (timestamp > endTime) {
        endTime = timestamp;
      }
    }
  }
  
  latBounds = [min(lats), max(lats)];
  lonBounds = [min(lons), max(lons)];

  currentTime = startTime;
}

function draw() {
  background("white");
  currentTime = new Date(currentTime.getTime() + timeScale);
  fill("black");
  text(currentTime, 50, 50);

  noFill();
  drawPaths(ostrichTable, 602);
}

function drawPaths(table, id) {
  beginShape();
  
  for (let i = 0; i < table.getRowCount(); i++) {
    if (table.get(i, "individual-local-identifier") == id) {
      let lat = table.get(i, "location-lat");
      let lon = table.get(i, "location-long");
  
      let x = map(lon, lonBounds[0], lonBounds[1], 0, windowWidth);
      let y = map(lat, latBounds[0], latBounds[1], windowHeight, 0);

      let date = new Date(table.get(i, "timestamp"));

      if (date < currentTime) {
        vertex(x, y);
      }
    }
  }

  endShape();
}
