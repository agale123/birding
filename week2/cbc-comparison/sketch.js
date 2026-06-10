/*

Christmas Bird Count Viz Example

Data processing code lives in cbc.js and comes from this template:

https://glitch.com/~btb-cbc-template
*/

let compareYears = [];

function setup() {
  createCanvas(0, 0);
  // Loads and processes data, calls a callback
  loadCBCData("data/CBC_Seattle.csv", onCBC);
}

function draw() {}

function onCBC(_data) {
  compareYears = [2014, 2019, 2024];

  // Go through every bird and get two count numbers for each
  let birdDiv = select("#birds");
  let birdsToAdd = [];
  _data.birdList.forEach((bird) => {
    let counts = [0, 1, 2].map(
      (i) => _data.birdMap[bird][compareYears[i]].howMany,
    );
    // Make a block for each
    if (counts.every((c) => !!c && c != "cw")) {
      let b = addBirdBlock(bird, counts, 110);
      b.attribute("data-ratio", parseFloat(counts[0]) / parseFloat(counts[2]));
      birdsToAdd.push(b);
    }
  });

  birdsToAdd = birdsToAdd.sort(function (_a, _b) {
    return _a.attribute("data-ratio") - _b.attribute("data-ratio");
  });

  birdsToAdd.forEach((bird) => {
    bird.parent(birdDiv);
  });
}

let positions = [
  [0.5, 0.25 + 0.5 * (0.5 - Math.sqrt(3) / 4)],
  [0.25, 0.25 + Math.sqrt(3) / 4],
  [0.75, 0.25 + Math.sqrt(3) / 4],
];

function addBirdBlock(_birdName, _counts, _size) {
  // Create the parent div
  let parent = createElement("div");
  parent.class("grid-element bird");
  parent.size(_size, _size + 50);

  // Create the label div
  let l = createElement("div");
  l.class("birdLabel");
  l.html("<span>" + _birdName + "</span>");
  l.parent(parent);

  for (let i = 0; i < _counts.length; i++) {
    const count = _counts[i];
    let block = createElement("div");
    block.class("block" + i + " birdBlock");
    parent.child(block);
    let num = createDiv();
    num.html(count);
    num.class("num");
    block.child(num);

    let r = Math.pow(count, 0.4) + 8;
    block.position(positions[i][0] * _size - r, positions[i][1] * _size - r);
    block.size(2 * r, 2 * r);
  }
  return parent;
}
