// https://ebird.org/checklist/S347722254
const BIRDS = [
  "Canada Goose",
  "Wood Duck",
  "Blue-winged Teal",
  "Gadwall",
  "Mallard",
  "Anna's Hummingbird",
  "Virginia Rail",
  "Great Blue Heron",
  "Osprey",
  "Bald Eagle",
  "Downy Woodpecker",
  "Northern Flicker",
  "Willow Flycatcher",
  "American Crow",
  "Black-capped Chickadee",
  "Tree Swallow",
  "Purple Martin",
  "Barn Swallow",
  "Bushtit",
  "Marsh Wren",
  "Bewick's Wren",
  "European Starling",
  "American Robin",
  "Cedar Waxwing",
  "House Finch",
  "American Goldfinch",
  "Dark-eyed Junco",
  "Song Sparrow",
  "Spotted Towhee",
  "Red-winged Blackbird",
  "Brown-headed Cowbird",
  "Orange-crowned Warbler",
];

const H = 1200;
const W = 800;
const PADDING = 50;
const R = 25;

const IMAGES = {};
const SOUNDS = {};
const POSITIONS = {};
const SELECTED = {};

function format(bird) {
  return bird
    ?.replaceAll(" ", "")
    ?.replaceAll("-", "")
    ?.replaceAll("'", "")
    ?.toLocaleLowerCase();
}

function preload() {
  for (const bird of BIRDS) {
    IMAGES[bird] = loadImage("/photos/" + format(bird) + ".png");
    SOUNDS[bird] = loadSound("/audio/" + "willowflycatcher" + ".mp3");
    SELECTED[bird] = false;
  }
}

function setup() {
  createCanvas(W, H);
  background("#fafafa");
}

function draw() {
  background("#fafafa");

  for (let i = 0; i < BIRDS.length; i++) {
    drawBirdLine(i);
  }
}

function drawBirdLine(i) {
  push();
  const x = PADDING + (sin((PI * 2 * i * 8) / BIRDS.length) + 1) * 50;
  const y = PADDING + ((H - 2 * PADDING) * i) / (BIRDS.length - 1);
  POSITIONS[BIRDS[i]] = [x, y];
  translate(x, y);

  // Bird name
  {
    push();
    translate(30, -2);
    text(BIRDS[i], 0, 0);
    pop();
  }

  // Baseline
  line(0, 0, W - x - PADDING, 0);

  // Image
  {
    push();
    beginClip();
    circle(0, 0, R * 2);
    endClip();
    image(IMAGES[BIRDS[i]], -R, -R, R * 2, R * 2);
    pop();
  }

  // Border
  {
    push();

    if (SELECTED[BIRDS[i]]) {
      stroke("black");
      fill(0, 0, 0, 0);
      circle(0, 0, R*2 + 5);
    }
    pop();
  }

  pop();
}

function mousePressed() {
  for (const [bird, value] of Object.entries(POSITIONS)) {
    const birdX = value[0];
    const birdY = value[1];
    if (collidePointCircle(mouseX, mouseY, birdX, birdY, R * 2)) {
      SELECTED[bird] = !SELECTED[bird];
      if (SELECTED[bird]) {
        SOUNDS[bird].loop();
      } else {
        SOUNDS[bird].pause();
      }
      return;
    }
  }
}
