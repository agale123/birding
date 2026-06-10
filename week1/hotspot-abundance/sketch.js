// This function is run once on setup.
function setup() {
  createCanvas(900, 600);
  background("beige");

  loadTable("union_bay.tsv", "tsv", onData);
}

// This function is run once per frame.
function draw() {}

function onData(data) {
  // Wood duck row bar chart
  translate(50, 50);
  birdBarChart(data.getRow(20));

  // Bald Eagle bar chart
  translate(0, 150);
  birdBarChart(data.getRow(188));

  // Bald Eagle radial chart
  translate(0, 150);
  birdRadialChart(data.getRow(182));
}

function birdBarChart(row) {
  fill("black");
  text(row.get(0), 0, 0);
  for (let i = 1; i < 49; i++) {
    let abundance = row.get(i);
    fill(0, abundance * 255, 255);
    rect(i * 10, 110, 10, -abundance * 100);
  }
}

function birdRadialChart(row) {
  fill("black");
  text(row.get(0), 0, 0);
  translate(100, 100)
  for (let i = 1; i < 49; i++) {
    let abundance = row.get(i);
    fill(0, abundance * 255, 255);
    rotate(TAU / 48);
    rect(0, -30, 10, -abundance * 100);
  }
}