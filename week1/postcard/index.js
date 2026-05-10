// Map from bird name to a list with the filename and color.
let BIRDS = {
  "Dark-eyed Junco": ["junco.png", "#916B53"],
  "Common Merganser": ["merganser.png", "#365d37"],
  "Anna's Hummingbird": ["hummingbird.png", "#C91478"],
  "Cedar Waxwing": ["waxwing.png", "#D4A780"],
  Osprey: ["osprey.png", "#1B1211"],
  "skipped 1": [],
  "skipped 2": [],
  "Spotted Towhee": ["towhee.png", "#bf5329"],
  "Northern Flicker": ["flicker.png", "#c91f13"],
  "Golden-crowned Kinglet": ["kinglet.png", "#f1dd58"],
  Bufflehead: ["bufflehead.png", "#1C395B"],
  "Glaucous-winged Gull": ["gull.png", "#b2bac5"],
};

const IMAGES = {};

const W = 1200;
const H = 800;
const PADDING = 0;
const R1 = 60;
const R2 = R1 * 2;
const TITLE_HEIGHT = 30;

let font;

function preload() {
  const transparent = color(0, 0, 0);
  for (const bird of Object.keys(BIRDS)) {
    if (BIRDS[bird].length == 0) {
      continue;
    }
    IMAGES[bird] = loadImage("/photos/" + BIRDS[bird][0]);
  }

  font = loadFont("/font/ShadowsIntoLight-Regular.ttf");
}

function setup() {
  pixelDensity(2);
  createCanvas(W, H);
  background("#f5f1e6");

  translate(W / 2, H / 2 - TITLE_HEIGHT);
  textAlign(CENTER, CENTER);
  textSize(80);
  textFont(font);
  text("Birds of Seattle", 0, 0);

  loadTable("data/king_barchart.csv", "csv", "header", onData);
}

function draw() {}

function onData(data) {
  // Calculate dimensions of one bird box.
  const w = (W - 2 * PADDING) / 4;
  const h = (H - 2 * PADDING) / 3;

  for (let i = 0; i < Object.keys(BIRDS).length; i++) {
    // Get the row to visualize.
    const row = data.findRow(Object.keys(BIRDS)[i], "");
    if (!row) {
      continue;
    }

    // Shift to the top left corner of the bird box.
    resetMatrix();
    translate(
      PADDING + ((i % 4) * (W - 2 * PADDING)) / 4,
      PADDING + (Math.floor(i / 4) * (H - 2 * PADDING)) / 3,
    );

    // Render title.
    fill("black");
    translate(w / 2, 0);
    textAlign(CENTER, TOP);
    textSize(30);
    textFont(font);
    text(row.get(0), 0, 0);

    // Shift to center of radial chart.
    translate(0, TITLE_HEIGHT + (h - TITLE_HEIGHT) / 2);

    // Render radial bar chart.
    noStroke();
    for (let i = 1; i < 49; i++) {
      fill(BIRDS[row.get(0)][1]);
      rotate(-TAU / 48);
      rect(0, -R1, 7, -(R2 - R1) * row.get(i), 0, 0, 3, 3);
    }

    // Render image.
    push();
    beginClip();
    circle(0, 0, R1 * 2);
    endClip();
    image(IMAGES[row.get(0)], -R1, -R1, R1 * 2, R1 * 2);
    pop();
  }

  save("postcard-p5.png");
}

function mask() {}
