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

const H = 800;
const W = 1200;
const PADDING = 50;
const R = 40;
const INTERVAL = 30;

const IMAGES = {};
const SOUNDS = {};
const AMPLITUDES = {};
const POSITIONS = {};
const SELECTED = {};
const INTERVALS = {};

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
    SOUNDS[bird] = loadSound("/audio/" + format(bird) + ".mp3");
    SELECTED[bird] = false;
    AMPLITUDES[bird] = new p5.Amplitude();
    AMPLITUDES[bird].setInput(SOUNDS[bird]);
  }
}

function setup() {
  createCanvas(W, H);
  background("#fafafa");

  for (let i = 0; i < BIRDS.length; i++) {
    const x = PADDING + R + ((i % 8) * (W - 2 * PADDING - 2 * R)) / 7;
    const y = PADDING + R + (Math.floor(i / 8) * (H - 2 * PADDING - 2 * R)) / 3;
    POSITIONS[BIRDS[i]] = [x, y];
  }
}

function draw() {
  background("#fafafa");

  for (let i = 0; i < BIRDS.length; i++) {
    drawBird(i);
  }
}

function drawBird(i) {
  push();

  const [x, y] = POSITIONS[BIRDS[i]];
  translate(x, y);

  // Bird name
  {
    push();
    translate(0, R + 10);
    textAlign(CENTER, TOP);
    text(BIRDS[i], 0, 0);
    pop();
  }

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
      strokeWeight(map(AMPLITUDES[BIRDS[i]].getLevel(), 0, 1, 1, 20));
      stroke("darkolivegreen");
      fill(0, 0, 0, 0);
      circle(0, 0, R * 2 + 10);
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
        SOUNDS[bird].play();
        INTERVALS[bird] = setInterval(() => {
          SOUNDS[bird].play();
        }, INTERVAL * 1000);
      } else {
        SOUNDS[bird].stop();
        clearInterval(INTERVALS[bird]);
        INTERVALS[bird] = undefined;
      }
      return;
    }
  }
}
