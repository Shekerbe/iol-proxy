const express = require("express");
const cors    = require("cors");
const https   = require("https");

const app      = express();
const IOL_HOST = "api.invertironline.com";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function iolReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error("IOL non-JSON: " + data.slice(0, 200))); }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

app.post("/token", async (req, res) => {
  try {
    const body = new URLSearchParams(req.body).toString();
    const data = await iolReq({
      hostname: IOL_HOST, path: "/token", method: "POST",
      headers: {
        "Content-Type":   "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      }
    }, body);
    res.json(data);
  } catch(e) { console.error(e.message); res.status(500).json({ error: e.message }); }
});

app.get("/api/v2/:mercado/Titulos/:ticker/Cotizacion", async (req, res) => {
  try {
    const data = await iolReq({
      hostname: IOL_HOST,
      path:     `/api/v2/${req.params.mercado}/Titulos/${req.params.ticker}/Cotizacion`,
      method:   "GET",
      headers:  { Authorization: req.headers.authorization },
    });
    res.json(data);
  } catch(e) { console.error(e.message); res.status(500).json({ error: e.message }); }
});

app.get("/ping", (_, res) => res.send("ok"));

app.listen(process.env.PORT || 3000, () => console.log("IOL proxy OK"));
