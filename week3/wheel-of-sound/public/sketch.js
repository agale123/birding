/*

BtB example - Sound and Images for bird species from eBird codes

*/

// Checklist ID — the part after /checklist/ in an eBird URL
// e.g. https://ebird.org/checklist/S237610680
let id = "S237610680";

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

let birds = [];
let birdCodes = [];
let focusBird;
let sound;

function preload() {
  initAudio();
}

function setup() {
  loadJSON("/checklist?id=" + id, onChecklist);
}

function draw() {
  birds.forEach(bird => {
    bird.pos.x += (bird.pos.tx - bird.pos.x) * 0.1;
    bird.pos.y += (bird.pos.ty - bird.pos.y) * 0.1;
  });

  let center = { x: windowWidth / 2, y: windowHeight / 2 };
  let radius = windowHeight * 0.45;

  for (let i = 0; i < birds.length; i++) {
    let b = birds[i];
    if (b != focusBird) {
      let theta = map(i, 0, birds.length, 0, TAU);
      let thetaAdjust = theta + frameCount / 1000;
      b.pos.tx = center.x + cos(thetaAdjust) * radius;
      b.pos.ty = center.y + sin(thetaAdjust) * radius;
      b.style("z-index", floor(map(thetaAdjust % TAU, 0, TAU, 0, 500)));
    } else {
      b.pos.tx = center.x;
      b.pos.ty = center.y;
    }
    b.position(b.pos.x, b.pos.y);
  }
}

function mousePressed() {
  changeFocusBird();
}

function changeFocusBird() {
  if (sound) sound.pause();
  let bird = birds[floor(random(birds.length))];
  focusBird = bird;
  loadJSON("/chirp?species=" + bird.name, onXenoLoaded);
}

function onChecklist(_data) {
  _data.obs.forEach((obs) => {
    birdCodes.push(obs.speciesCode);
  });
  getBirdInfo(birdCodes);
}

function getBirdInfo(_codes) {
  getWikiBirds(_codes, "en").then((wikiBirds) => {
    wikiBirds.forEach((wb) => {
      if (!wb.url) return; // skip birds with no image

      let fig = createElement("figure");
      let img = createImg(wb.url, wb.name);
      let caption = createElement("figcaption");
      caption.html(wb.name);
      fig.child(img);
      fig.child(caption);

      fig.name = wb.name;
      fig.pos = { x: 0, y: 0, tx: 0, ty: 0 };

      birds.push(fig);
    });
  });
}

// ----------------- Audio

function initAudio() {
  audioCtx = new AudioContext();
}

function playSound(_url) {
  sound = new Audio(_url);
  sound.loop = true;
  sound.play();
}

function onXenoLoaded(_data) {
  if (!_data.recordings || _data.recordings.length === 0) {
    console.warn("No recordings found");
    return;
  }
  let first = _data.recordings[0];
  // xeno-canto v3 returns full HTTPS URLs — play directly, no proxy needed
  playSound(first.file);
}

// ----------------- WikiData

const endpointUrl = "https://query.wikidata.org/sparql";
const sparqlQuery = `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-reader#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX v: <http://www.wikidata.org/prop/statement/>

SELECT ?item ?itemLabel ?image ?ebird WHERE {
  VALUES ?BIRDS { {{birdlist}} }
  ?item wdt:P3444 ?BIRDS.
  OPTIONAL {?item wdt:P18 ?image.}
  OPTIONAL {?item wdt:P3444 ?ebird.}
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language {{lang}} .
  }
}`;

async function getWikiBirds(_birds, _lang) {
  let birdList = _birds.map(b => '"' + b + '"').join(" ");

  const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
  const wikis = await queryDispatcher.query(
    sparqlQuery
      .replace("{{birdlist}}", birdList)
      .replace("{{lang}}", '"' + _lang + '"')
  );

  return wikis.results.bindings.map(b => ({
    name: b.itemLabel.value,
    url: b.image?.value ?? null,
  }));
}

class SPARQLQueryDispatcher {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  query(sparqlQuery) {
    const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
    return fetch(fullUrl, { headers: { Accept: "application/sparql-results+json" } })
      .then(r => r.json());
  }
}
