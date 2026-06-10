const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Get a list of birds near a lat/lon via eBird
app.get("/recent", async (req, res) => {
  const { dist, lat, lon } = req.query;
  const url =
    `https://api.ebird.org/v2/data/obs/geo/recent` +
    `?lat=${lat}&lng=${lon}&sort=species&dist=${dist}`;
  try {
    const response = await fetch(url, {
      headers: { "X-eBirdApiToken": process.env.EBIRDKEY },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get details from an eBird checklist
app.get("/checklist", async (req, res) => {
  const { id } = req.query;
  const url = `https://api.ebird.org/v2/product/checklist/view/${id}`;
  try {
    const response = await fetch(url, {
      headers: { "X-eBirdApiToken": process.env.EBIRDKEY },
    });
    res.status(response.status).json(await response.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get xeno-canto recordings by species name (v3 API)
app.get("/chirp", async (req, res) => {
  const { species } = req.query;
  var params = new URLSearchParams({
    query: `en:"${species}" q:A`,
    key: process.env.XENOCANTOKEY
  });
  const url = "https://xeno-canto.org/api/3/recordings?"+ params.toString();
  console.log(url);
  try {
    const response = await fetch(url);
    res.status(response.status).json(await response.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
