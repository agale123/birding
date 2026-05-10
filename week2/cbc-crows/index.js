const W = 1200;
const H = 800;

let cbcData;
let firstYear, lastYear, currentYear;

let allCrows = [{ x: 300, y: 500 }];

function preload() {
  // Load and parse CBC data from CSV file
  loadCBCData("data/CBC_Seattle.csv", (_data) => {
    cbcData = _data;
    // Calculate and display the year range of the data
    // CBC years are stored as 2-digit numbers (e.g., 124 for 2024)
    firstYear = 1999;
    //  1900 + parseInt(cbcData.effort.get(cbcData.effort.getRowCount() - 1, 0));
    lastYear = 1900 + parseInt(cbcData.effort.get(0, 0));
    currentYear = firstYear;
  });
}

function setup() {
  createCanvas(W, H);
  frameRate(30);
  background("thistle");
  textFont("Helvetica");
  textSize(24);

  generateCrows();
}

function draw() {
  background("thistle");

  const count = cbcData.birdMap["American Crow"][currentYear]?.howMany || 0;
  text("Year: " + currentYear, 50, 50);
  text("Count: " + count, 50, 90);

  for (const crow of allCrows) {
    drawCrow(crow);
  }
}

function drawCrow(crow) {
  if (crow.y < H - 50) {
    crow.y += 4 * crow.size;
  }

  push();
  translate(crow.x, crow.y);
  scale(crow.size);
  fill("black");
  ellipse(0, 0, 10, 10);

  strokeWeight(2);
  const r = random(0, -PI / 3);
  {
    push();
    rotate(r);
    line(0, 0, 20, 0);
    pop();
  }

  {
    push();
    rotate(PI - r);
    line(0, 0, 20, 0);
    pop();
  }

  pop();
}

function generateCrows() {
  const count =
    (cbcData.birdMap["American Crow"][currentYear]?.howMany || 0) / 100;
  allCrows = [];
  for (let i = 0; i < count; i++) {
    allCrows.push({
      x: random(50, W - 50),
      y: random(-250, 0),
      size: random(0.7, 1.2),
    });
  }
}

function mousePressed() {
  currentYear += 1;
  if (currentYear > lastYear) {
    currentYear = firstYear;
  }

  generateCrows();
}
