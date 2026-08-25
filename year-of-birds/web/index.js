let media, lists, countyData, mediaData, dateData;
let images = {};
let stateList;

let state;
let index = 0;

const STATES = {
  "US-WA": "Washington",
  "US-HI": "Hawaii",
  "US-CA": "California",
  "US-OR": "Oregon",
};

function preload() {
  lists = loadTable("/data/lists.csv", "csv", "header");
  countyData = loadTable("/data/county.csv", "csv", "header");
  mediaData = loadTable("/data/media.csv", "csv", "header");
  dateData = loadTable("/data/date.csv", "csv", "header");
}

function setup() {
  const parent = document.getElementById("timeline");
  let canvas = createCanvas(parent.clientWidth, parent.clientHeight);
  canvas.parent("timeline");
  noLoop();

  // Populate state select options
  let states = [...new Set(lists.getColumn("state"))];
  const select = document.getElementById("state-select");
  for (let state of states) {
    select.add(new Option(STATES[state], state));
  }
  onStateChanged();
}

function onStateChanged() {
  const select = document.getElementById("state-select");
  state = select.value;
  index = 0;
  stateList = lists.findRows(state, "state");
  onBirdChanged(0);
}

function onBirdChanged(direction) {
  index = index + direction;
  if (index < 0) {
    index = stateList.length - 1;
  } else if (index >= stateList.length) {
    index = 0;
  }
  document.getElementById("position").innerText = index + 1;

  document.getElementById("bird").innerText = stateList[index].get("name");
  drawTimeline();
  drawMap();
  drawPhotos();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    onBirdChanged(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    onBirdChanged(-1);
  }
});

function drawTimeline() {
  clear();
  noStroke();

  const width = document.getElementById("timeline").clientWidth;
  const height = document.getElementById("timeline").clientHeight;
  const monthWidth = (width - 10) / 12;
  const lineY = height / 2;

  // Draw main horizontal axis line
  stroke(100);
  strokeWeight(2);
  line(5, lineY, width - 5, lineY);

  // Draw ticks and labels
  for (let i = 0; i <= 12; i++) {
    let tickX = 5 + i * monthWidth;

    // Draw boundary tick mark (vertical line)
    stroke(100);
    strokeWeight(1.5);
    line(tickX, lineY - 10, tickX, lineY + 10);
  }

  // Draw month labels in the middle of each section
  noStroke();
  fill(50);
  textSize(12);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < 12; i++) {
    let labelX = 5 + i * monthWidth + monthWidth / 2;
    const date = new Date(`2026-${i + 1}-26`);
    const shortMonth = date.toLocaleString("default", { month: "short" });
    text(shortMonth, labelX, lineY + 20);
  }

  // Draw observation points
  const filteredDates = dateData
    .getRows()
    .filter(
      (row) =>
        row.getString("state") === state &&
        row.getString("name") === stateList[index].get("name"),
    );
  for (const row of filteredDates) {
    const date = new Date(row.getString("date") + "T00:00:00");

    stroke("#3182bd");
    strokeWeight(3);
    const tickX =
      5 + date.getMonth() * monthWidth + ((width - 10) * date.getDate()) / 365;
    line(tickX, lineY - 8, tickX, lineY + 8);
  }
}

let tooltip;

function drawMap() {
  const svg = d3.select("svg#map");
  if (!tooltip) {
    tooltip = d3
      .select("#map-container")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none") // Prevents tooltip from flickering under cursor
      .style("font-family", "sans-serif")
      .style("font-size", "12px");
  }
  const width = document.getElementById("map").clientWidth;
  const height = document.getElementById("map").clientHeight;

  const data = d3.map();
  countyData.getRows().filter((row) => {
    if (
      row.getString("state") === state &&
      row.getString("name") === stateList[index].get("name")
    ) {
      data.set(row.getString("county"), row.getNum("observations"));
    }
  });

  d3.queue().defer(d3.json, "data/US.geojson").await(ready);

  function ready(error, topo) {
    if (error) {
      return console.error(error);
    }

    svg.selectAll("g.map-layer").remove();

    topo.features = topo.features.filter(
      (row) => row.properties["state"] === state.substring(3),
    );

    const projection = d3
      .geoMercator()
      .translate([width / 2, height / 2])
      .clipAngle(180);

    projection.fitSize([width, height], topo);

    const path = d3.geoPath().projection(projection);

    const colorScale = d3
      .scaleThreshold()
      .domain(Array.from({ length: 5 }, (_, i) => i + 1))
      .range(d3.schemeBlues[6]);

    const mouseOver = function (event, d) {
      tooltip.style("visibility", "visible");

      d3.select(this).raise().style("stroke", "black").style("opacity", 1);
    };

    const mouseMove = function (d) {
      tooltip
        .html(
          `<strong>${d.properties.county} County</strong><br>Observations: ${d.total || "0"}`,
        )
        // Position tooltip slightly offset from the mouse pointer
        .style("top", d3.event.pageY + 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    };

    const mouseLeave = function (event, d) {
      tooltip.style("visibility", "hidden");
      d3.select(this).style("stroke", "white").style("opacity", 0.8);
    };

    svg
      .append("g")
      .attr("class", "map-layer")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const county = d.properties["county"];
        d.total = data.get(county) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "white")
      .attr("stroke-width", 1)
      .style("opacity", 0.8)
      .on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseleave", mouseLeave);
  }
}

let carouselInterval;

function drawPhotos() {
  const carousel = document.getElementById("carousel");
  carousel.replaceChildren();

  const bird = stateList[index].get("name");
  const mediaRows = mediaData
    .getRows()
    .filter(
      (row) =>
        !!row &&
        row.getString("state") === state &&
        row.getString("name") === bird,
    );

  const mediaIds = mediaRows[0]
    .getString("media")
    .split(" ")
    .filter((id) => id.length > 0);

  if (mediaIds.length > 0) {
    for (const id of mediaIds) {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = "images/" + id + ".jpg";
      li.appendChild(img);
      carousel.appendChild(li);
    }
  } else {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = "images/missing.png";
    li.classList.add("missing");
    li.appendChild(img);
    carousel.appendChild(li);
  }

  if (carouselInterval) {
    clearInterval(carouselInterval);
  }
  if (mediaIds.length > 0) {
    carouselInterval = setInterval(() => {
      const imageWidth = carousel.children[0].clientWidth;
      if (carousel.scrollLeft + imageWidth + 45 > carousel.scrollWidth) {
        carousel.scrollTo({
          left: 0,
          behavior: "auto",
        });
      } else {
        carousel.scrollBy({
          left: carousel.children[0].clientWidth,
          behavior: "smooth",
        });
      }
    }, 3000);
  }
}
