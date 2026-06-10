const PURPLE = "#440154";
const YELLOW = "#fde725";

function cmap(value, c1, c2, alpha) {
  let range = new Color(c1).range(new Color(c2), {
    space: "lch",
    hue: "longer",
  });
  let c = range(value);
  c.alpha = value;
  return c.toString({ format: "hex" });
}

let mySound;
let fft;

function preload() {
  mySound = loadSound("willow_flycatcher.mp3");
}

function setup() {
  createCanvas(1200, 800);
  background("black");
  fft = new p5.FFT();
}

function draw() {
  let spectrum = fft.analyze();
  let playhead = mySound.currentTime() / mySound.duration();
  for (let i = 0; i < spectrum.length; i++) {
    let e = spectrum[i];
    let x = map(mySound.currentTime(), 0, mySound.duration(), 50, width - 50);
    let y = map(i, 0, spectrum.length, height - 50, 50);
    let r = map(e, 0, 255, 0, PI);

    stroke(cmap(map(e, 0, 255, 0, 1), PURPLE, YELLOW, 0.2));

    if (e > 20) {
      push();

      translate(x, y);
      rotate(r);
      line(0, 0, e, 0);

      pop();
    }

    if (e > 100) {
      fill(YELLOW);
      noStroke();
      ellipse(x, y, 3, 3);
    }
  }
}

function mousePressed() {
  if (mySound.isPlaying()) {
    mySound.pause();
  } else {
    mySound.loop();
  }
}
