/**
 * eBird Feather Visualization
 *
 * A p5.js application that visualizes historical bird observation data from eBird
 * as feather representations. Each bird species is drawn as a feather with
 * size corresponding to observation count, and multiple days are displayed side by side
 * to show temporal patterns in bird activity.
 *
 * Data Source: eBird API (requires API key in .env file)
 * Get API key at: https://ebird.org/api/keygen
 *
 * Configuration:
 * - Location: Brooklyn Bridge Park (L1902982) - can be changed
 * - Time range: 3 days of historical data (1 year ago)
 * - Display: Up to 10 species per day
 *
 * Jer Thorp, Fall 2025
 * Dependencies: p5.js library, eBird API server endpoint
 */

/*
IMPORTANT: You need to put your own API key into the .env file

Use this URL to get a key: https://ebird.org/api/keygen

Then, click the teal colored tab with the sketch title at the top left on this page and enter the key under Advanced -> Environment Variables:

eBirdKey="YOUR KEY"

*/

// Union Bay
let loc = "L162766";
let featherScale = 3;
let dayScope = 3;
let currentDay = 0;
let dayResults = [];
let dates = [];
let colorDict = {};
let isLoading = true;

const colorMap = {};

/**
 * p5.js setup function - runs once at program start
 * Initializes the canvas and begins loading bird data
 */
function setup() {
  createCanvas(displayWidth, displayHeight - 200);
  background(255);
  getPreviousDay(currentDay);

  loadTable(
    "colors.csv",
    "csv",
    "header",
    (colors) => {
      for (let i = 0; i < colors.getRowCount(); i++) {
        const r = colors.getRow(i);
        colorMap[r.get(0)] = [
          r.get(1).replace("#FFFFFF", "#F8F8F8"),
          r.get(2).replace("#FFFFFF", "#F8F8F8"),
          r.get(3).replace("#FFFFFF", "#F8F8F8"),
        ];
      }
      console.log(colorMap);
    },
  );
}

/**
 * p5.js draw function - runs continuously to render the visualization
 * Displays all loaded days of bird data side by side
 */
function draw() {
  randomSeed(1);
  background("white");

  for (let i = 0; i < dayResults.length; i++) {
    push();
    translate(50 + i * 350, 50);
    fill(0);
    textSize(24);
    text(dates[i], 0, 0);
    translate(0, 50);
    drawBirds(dayResults[i], 10);
    pop();
  }

  if (isLoading) {
    fill(0);
    noStroke();
    textSize(16);
    text("Loading bird data...", 50, 50);
  }
}

/**
 * Renders a list of birds as feathers with labels
 * @param {Array} _list - Array of bird objects with commonName and count properties
 * @param {number} _num - Maximum number of birds to display
 */
function drawBirds(_list, _num) {
  if (_list.length == 0) {
    console.log("NO BIRDS!!!");
    fill(255);
    text("Oh no! I did not find any birds here.", 50, 100);
  }

  let stackHeight = 0;

  for (let i = 0; i < _num; i++) {
    let bird = _list[i];
    let size = sqrt(bird.count) * 10;
    stroke(255, map(bird.count, 0, 100, 120, 255), 0, 185);

    push();
    translate(0, stackHeight);
    rotate(-PI / 2 + random(-0.3, 0.3));
    drawFeather(size * featherScale, colorMap[bird.commonName]);
    pop();

    stackHeight += max(14, size + 3);

    fill(0);
    noStroke();
    textSize(14);
    textFont("Merriweather");
    text(
      bird.commonName + " (" + bird.count + ")",
      size * featherScale + 5,
      stackHeight - size + 6,
    );

    if (stackHeight > height - 150) {
      stackHeight = 0;
      translate(375, 0);
    }
  }
}

/**
 * Calculates and loads bird data for a specific day in the past
 * @param {number} _shift - Number of days to go back from current date
 */
function getPreviousDay(_shift) {
  let theDay = new Date();
  theDay.setDate(theDay.getDate() - _shift);
  let y = theDay.getFullYear();
  let m = theDay.getMonth() + 1;
  let d = theDay.getDate();
  let date = y + "/" + m + "/" + d;
  dates.push(date);
  loadBirds(loc, date);
}

/**
 * Initiates loading of bird observation data from the server
 * @param {string} _location - eBird location identifier
 * @param {string} _date - Date string in YYYY/M/D format
 */
function loadBirds(_location, _date) {
  console.log("Loading bird data for " + _date);
  let url = "/history?loc=" + _location + "&date=" + _date;
  console.log(url);
  loadJSON(url, onBirds);
}

/**
 * Callback function that processes bird observation data when received
 * Parses eBird API response and creates bird objects for visualization
 * @param {Array} _data - Array of bird observation objects from eBird API
 */
function onBirds(_data) {
  console.log("GOT BIRD DATA!");
  console.log(_data);

  let _dayList = [];

  _data.forEach((_observation) => {
    console.log(_observation);
    let commonName = _observation.comName;

    let bird = {
      commonName: commonName,
      count: _observation.howMany,
    };

    if (!bird.count) bird.count = 0;

    if (!colorDict[commonName]) {
      colorDict[commonName] = [
        color(random(255), random(255), random(255)),
        color(random(255), random(255), random(255)),
        color(random(255), random(255), random(255)),
      ];
    }

    _dayList.push(bird);
  });

  _dayList = _dayList.sort(function (a, b) {
    return b.count - a.count;
  });

  dayResults.push(_dayList);

  currentDay++;
  if (currentDay < dayScope) {
    getPreviousDay(currentDay);
  } else {
    isLoading = false;
  }
}

/**
 * Utility function to extract color palette from an image (currently unused)
 * @param {p5.Image} _img - Source image for color extraction
 * @param {number} _num - Number of colors to extract
 * @param {Array} _start - Starting coordinate [x, y]
 * @param {Array} _end - Ending coordinate [x, y]
 * @returns {Array} Array of p5.Color objects
 */
function createPalette(_img, _num, _start, _end) {
  let _pal = [];
  for (let i = 0; i < _num; i++) {
    let x = map(i, 0, _num, _start[0], _end[0]);
    let y = map(i, 0, _num, _start[1], _end[1]);
    _pal.push(_img.get(floor(x), floor(y)));
  }
  return _pal;
}

/**
 * Draws a complete feather by rendering both sides symmetrically
 * @param {number} _length - Length of the feather
 * @param {Array} _colors - Array of colors for the feather gradient
 */
function drawFeather(_length, _colors) {
  push();
  scale(1, 1.65);
  drawFeatherSide(_length, _colors);
  scale(-1, 1);
  drawFeatherSide(_length, _colors);
  pop();
}

/**
 * Draws one side of a feather using individual barb strands
 * Creates natural feather appearance with organic variation and clumping effects
 * @param {number} _length - Length of the feather
 * @param {Array} _colors - Array of colors for the feather gradient
 */
function drawFeatherSide(_length, _colors) {
  let hf = 0.5;
  let w = _length * 0.15;
  let h = _length * hf;
  let step = 2.5;
  let end = createVector(0, h);

  let stack = 0;
  let stuck = false;

  for (let i = 0; i < _length; i += step) {
    if (_colors) {
      stroke(_colors[floor(map(i, 0, _length, 0, _colors.length))]);
    }

    if (!stuck && random(100) < 10) {
      stuck = true;
    }
    if (stuck && (random(100) < 20 || i > length - 3)) {
      stuck = !stuck;
    }

    let aw = sin(map(i, 0, _length, 0, PI)) * w;
    if (i < _length * 0.2) aw *= random(0.1, 0.3);

    if (!stuck) stack += step * hf + pow(i, 0.03) * 0.25;

    let p0 = createVector(0, stack * 0.75);
    let p1 = createVector(aw, stack);

    noFill();
    beginShape();
    vertex(p0.x, p0.y);
    vertex(p1.x, p1.y);
    endShape();

    stroke(255, 150);
    point(p1.x, p1.y);
  }
}
