const W = 1600;
const H = 850;
const PADDING = 150;
const SCALE = 23;
const D = 40;

let nests;
let birds;
let font;
let scale;

function preload() {
  nests = loadTable("data/nests.csv", "csv", "header");
  birds = loadTable("data/birds.csv", "csv", "header");
  font = loadFont("Macondo-Regular.ttf");
}

function setup() {
  createCanvas(W, H);
textFont(font);

  // Sky
  background("aliceblue");

  // Title
  {
    push();

      textSize(56);
    text("Ballard Locks Rookery", 50, 85);
    textSize(40);
    text("5/13/2026", 50, 135);

    textSize(18);
    textAlign(CENTER);
    for (let i = 0; i < birds.getRowCount(); i++) {
      text(
        birds.getString(i, "bird") + ": " + birds.getNum(i, "count"),
        1400, 50 + 25 *i,
      );
    }

    pop();
  }

  scale =
    (W - 2 * PADDING) / (max(nests.getColumn("x")) - min(nests.getColumn("x")));
  translate(0, H);

  // Trees
  const trees = [
    [5, 0.28],
    [7, 0.36],
    [9, 0.32],
    [14, 0.35],
    [16, 0.25],
    [23, 0.36],
    [26, 0.30],
    [43, 0.31],
    [45, 0.37],
    [47, 0.29],
    [50, 0.25],
    [54, 0.32],
    [60, 0.29],
    [64, 0.34],
  ];
  for (const tree of trees) {
    drawTree(tree);
  }

  // Ground
  noStroke();
  fill("dimgray");
  rect(0, 0, W, -H * 0.05);

  // Sort by height so layering works properly.
  const sortedRows = nests
    .getRows()
    .sort((a, b) => b.getNum("y") - a.getNum("y"));
  nests.clearRows();
  for (const row of sortedRows) {
    nests.addRow(row);
  }

  // Draw each heron nest.
  for (let i = 0; i < nests.getRowCount(); i++) {
    push();
    const x = PADDING + nests.getNum(i, "x") * scale;
    const y = nests.getNum(i, "y") * scale;
    translate(x, -y);
    drawNest(nests.getNum(i, "adults"), nests.getNum(i, "young"));
    pop();
  }
}

function draw() {}

function drawTree(tree) {
  push();

  const [x, h] = tree;

  translate(x * SCALE, 0);
  const height = h * W * 0.375;
  // Draw a line 120 pixels
  stroke("gray");
  strokeWeight(height / 20);
  line(0, 0, 0, -height);

  // Move to the end of that line
  translate(0, -height);

  // Start the recursive branching
  branch(height, 0);

  pop();
}

function branch(h, level) {
  // Each branch will be 2/3 the size of the previous one
  h *= 0.66;
  angle = PI / 8;

  // Draw if our branch length > 2.
  if (h > SCALE / 2) {
    // Draw the right branch
    // Save the current coordinate system
    push();

    // Rotate by angle
    rotate(angle);

    const weight = h / 20;

    // Draw the branch
    strokeWeight(weight);
    line(0, 0, 0, -h);

    // Move to the end of the branch
    translate(0, -h);

    // Call branch() recursively
    branch(h, level + 1);

    // Restore the saved coordinate system
    pop();

    // Draw the left branch
    push();
    rotate(-angle);
    strokeWeight(weight);
    line(0, 0, 0, -h);
    translate(0, -h);
    branch(h, level + 1);
    pop();
  }

  // Add greenery.
  if (level > 1) {
    let green = color("green"); // Create color object from string
    green.setAlpha(random(50, 80)); // Set transparency (0-255)
    fill(green);
    noStroke();

    circle(0, 0, 30 / sqrt(level));
  }
}

function drawNest(adults, young) {
  push();

  // Herons
  {
    push();
    const birds = Array(parseInt(adults))
      .fill(true)
      .concat(Array(parseInt(young)).fill(false));
    shuffle(birds, true);

    translate(-D / 2, 0);
    for (let i = 0; i < birds.length; i++) {
      push();
      translate((1 / (2 * birds.length) + i / birds.length) * D, 0);
      rotate(random(-PI / 8, PI / 8));
      const scale = birds[i] ? 2 : 1;

      // Neck
      stroke("#9daec4");
      strokeWeight(3 * scale);
      line(0, 0, 0, -10 * scale);

      // Head
      const direction = random([-1, 1]);
      translate(0, -11 * scale);
      stroke("white");
      strokeWeight(2 * scale);
      line(0, 0, direction * 2 * scale, 1 * scale);

      // Eyebrow
      stroke("black");
      strokeWeight(1 * scale);
      line(0, 0, -direction * 2 * scale, 0 * scale);

      // Beak
      translate(direction * 3 * scale, 1 * scale);
      fill("orange");
      noStroke();
      triangle(
        0,
        -0.5 * scale,
        0,
        0.5 * scale,
        direction * 3 * scale,
        1 * scale,
      );

      pop();
    }
    pop();
  }

  // Nest background
  fill("#82685c");
  noStroke();
  arc(0, 0, D, D, 0, PI);

  // Nest sticks
  const radius = D * 0.5 * 1.2;
  for (let i = 0; i < 40; i++) {
    const p1 = getPointInSemicircle();
    const p2 = getPointInSemicircle();
    stroke("#544640");
    line(p1.x * radius, p1.y * radius, p2.x * radius, p2.y * radius);
  }

  pop();
}

function getPointInSemicircle() {
  let x, y;
  while (!x || !y || x ** 2 + y ** 2 > 1) {
    x = random(-1, 1);
    y = random(0, 1);
  }
  return { x, y };
}
