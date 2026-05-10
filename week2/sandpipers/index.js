let W = 1200;
let H = 800;
const BIRD = "Western Sandpiper";
const WING_STEPS = 30;
const PATH_STEPS = 100;
const BLACK = "#211f1d";
const BACK = "#87785f";
const BELLY = "#f5f1eb";

let cbcData;
let firstYear, lastYear, currentYear;
let birdModels = [];
let birds = [];
let step = 0;
let font;
let writingFont;
let logo;
let images = [];

function preload() {
  // Load and parse CBC data from CSV file
  loadCBCData("data/CBC_GraysHarbor.csv", (_data) => {
    cbcData = _data;
    // CBC years are stored as 2-digit numbers (e.g., 124 for 2024)
    firstYear =
      1900 + parseInt(cbcData.effort.get(cbcData.effort.getRowCount() - 1, 0));
    lastYear = 1900 + parseInt(cbcData.effort.get(0, 0));
    currentYear = firstYear;
  });

  font = loadFont("/font/univers67condensedbold.otf");
  writingFont = loadFont("/font/ShadowsIntoLight-Regular.ttf");
  logo = loadImage("/images/nwr.png");
  for (let i = 1; i <= 4; i++) {
    images.push(loadImage(`/images/sandpiper${i}.jpg`));
  }

  W = window.innerWidth;
  H = window.innerHeight;
}

function setup() {
  createCanvas(W, H, WEBGL);

  // Each bird model represents a step in the wing flap cycle.
  for (let i = 0; i < WING_STEPS; i++) {
    birdModels.push(buildBirdModel(sin((i / WING_STEPS) * 2 * PI)));
  }

  updateBirdList();
}

function draw() {
  background("aliceblue");
  textFont(font);
  noStroke();

  {
    push();
    translate(-W / 2, -H / 2);

    {
      push();
      translate(0, 0, -50);
      // Title and annual count text.
      fill("#70271F");
      textSize(50);
      text("Grays Harbor National Wildlife Refuge:", 0, 50);
      textSize(40);
      text("Western Sandpiper", 0, 100);
      fill("#2571A6");
      textSize(32);
      text("Year: " + currentYear, 0, 170);
      text("Count: " + birds.length, 0, 220);
      pop();
    }

    // National Wildlife Refuge logo.
    {
      push();
      texture(logo);
      translate(W - 40, 80, -100);
      plane(200);
      pop();
    }

    // Photos of western sandpipers
    {
      push();

      translate(W / 8, H - 150, -100);
      polaroid(images[0], "5/1/2026", PI / 16);

      translate(W / 4, 0, -0);
      polaroid(images[1], "5/1/2026", -PI / 16);

      translate(W / 4, 0, -0);
      polaroid(images[2], "5/2/2026", PI / 16);

      translate(W / 4, 0, -0);
      polaroid(images[3], "5/2/2026", -PI / 16);

      pop();
    }

    for (const bird of birds) {
      push();

      // Give each bird some random movement.
      bird.x += random(-2, 2);
      bird.y += random(-2, 2);
      bird.z += random(-2, 2);

      // Shift to bird's origin.
      translate(bird.x, bird.y, bird.z);

      // Use trig to create a figure eight shape.
      if (step % (PATH_STEPS * 2) < PATH_STEPS) {
        let x = -sin((step / PATH_STEPS) * 2 * PI - PI / 2) * 100;
        let y = sin((step / PATH_STEPS) * PI) * 50;
        let z = -cos((step / PATH_STEPS) * 2 * PI - PI / 2) * 100;
        translate(x, y, z);
        rotateY((2 * PI * ((step + 75) % PATH_STEPS)) / PATH_STEPS);
      } else {
        let x = (2 + sin((step / PATH_STEPS) * 2 * PI - PI / 2)) * 100;
        let y = sin((step / PATH_STEPS) * PI) * 50;
        let z = -cos((step / PATH_STEPS) * 2 * PI - PI / 2) * 100;
        translate(x, y, z);
        rotateY(-(2 * PI * ((step + 25) % PATH_STEPS)) / PATH_STEPS);
      }

      // Render the birds.
      scale(0.05);
      model(birdModels[step % WING_STEPS]);

      pop();
    }

    pop();
  }

  step += 1;
  if (step % (PATH_STEPS * 2) == 0) {
    currentYear += 1;
    if (currentYear > lastYear) {
      currentYear = firstYear;
    }
    updateBirdList();
  }
}

function updateBirdList() {
  birds = [];
  const count = cbcData.birdMap[BIRD][currentYear]?.howMany || 0;
  for (let i = 0; i < count; i++) {
    birds.push(
      getRandomPointInSphere(
        { x: W * 0.5, y: H * 0.4, z: 0 },
        30 * Math.cbrt(count),
      ),
    );
  }
}

function getRandomPointInSphere(origin, radius) {
  // Pick a random number for volume distribution
  let u = random(0, 1);

  // Cube root of u ensures uniformity across the sphere's volume
  let r = radius * Math.pow(u, 1 / 3);

  // Generate random angles for spherical coordinates
  let theta = random(0, TWO_PI);
  let phi = acos(random(-1, 1));

  // Convert spherical coordinates to Cartesian (x, y, z)
  let x = 1.5 * r * sin(phi) * cos(theta);
  let y = r * sin(phi) * sin(theta);
  let z = r * cos(phi);

  return { x: x + origin.x, y: y + origin.y, z: z + origin.z };
}

function polaroid(photo, label, angle) {
  push();
  rotateZ(angle);

  fill("white");
  plane(250, 300);
  translate(0, -25, 0);
  textureWrap(REPEAT);
  texture(photo);
  plane(230, 230);

  textFont(writingFont);
  fill("black");
  textSize(24);
  text(label, -35, 150);
  pop();
}

function buildBirdModel(param) {
  return buildGeometry(() => {
    // Head
    {
      push();
      translate(-50, 0, 0);
      scale(1.5, 1, 1);

      for (const [y, color] of [
        [0, BACK],
        [10, BELLY],
      ]) {
        translate(0, y, 0);
        fill(color);
        sphere(60);
      }

      // Bill
      {
        push();
        translate(-100, 0, 0);
        rotateZ(-PI / 2);
        fill(BLACK);
        cone(10, -80);
        pop();
      }

      // Draw symmetrical parts of the head that come in pairs.
      for (let side of [-1, 1]) {
        // Eye
        {
          push();
          translate(-40, -20, side * 40);
          fill(BLACK);
          sphere(10);
          pop();
        }
      }
      pop();
    }

    // Body
    {
      push();
      translate(50, 0, 0);
      scale(1.5, 0.8, 0.9);

      for (const [y, color] of [
        [0, BACK],
        [10, BELLY],
      ]) {
        translate(0, y, 0);
        fill(color);
        sphere(100);
      }

      // Draw symmetrical parts of the body that come in pairs.
      for (let side of [-1, 1]) {
        // Feet
        {
          push();
          translate(60, 80, side * 30);
          rotateX(PI * 0.1 * side);
          rotateZ((2 * PI) / 3);
          fill(BLACK);
          cylinder(5, 100);
          pop();
        }

        // Wings
        {
          push();
          rotateX((side * param * PI) / 4);
          translate(0, 0, side * 260);
          rotateX((side * PI) / 2);
          scale(3, 6, 1);

          for (const [y, color] of [
            [0, BELLY],
            [5, BACK],
          ]) {
            translate(0, 0, side * y);
            fill(color);
            cone(30, 100, 5);
          }

          pop();
        }
      }

      pop();
    }

    // Tail
    {
      push();
      translate(215, 0, 0);
      rotateX(PI / 2);
      rotateZ(-PI / 2);

      for (const [y, color] of [
        [-10, BELLY],
        [10, BACK],
      ]) {
        translate(0, 0, y);
        fill(color);
        cone(50, 90);
      }

      pop();
    }
  });
}
