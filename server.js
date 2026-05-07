const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app      = express();
const IOL_BASE = "https://api.invertironline.com";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth
app.post("/token", async (req, res) => {
  try {
    const r = await fetch(`${IOL_BASE}/token`, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams(req.body).toString(),
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cotización
app.get("/api/v2/:mercado/Titulos/:ticker/Cotizacion", async (req, res) => {
  try {
    const r = await fetch(
      `${IOL_BASE}/api/v2/${req.params.mercado}/Titulos/${req.params.ticker}/Cotizacion`,
      { headers: { Authorization: req.headers.authorization } }
    );
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Health check (para que Render no duerma)
app.get("/ping", (_, res) => res.send("ok"));

app.listen(process.env.PORT || 3000, () => console.log("IOL proxy OK"));
