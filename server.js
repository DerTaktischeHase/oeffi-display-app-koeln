import http from "node:http";
import { readFile } from "node:fs/promises";
import { STOPS, VEHICLES } from "./stops.js";

const PORT = Number(process.env.PORT || 3000);
const API = "https://api.transitous.org/api/v6/stoptimes";
const stopById = new Map(
  Object.entries(STOPS)
    .filter(([, stop]) => stop.id)
    .map(([key, stop]) => [stop.id, { key, ...stop }])
);
const vehicleModes = new Set(Object.values(VEHICLES));

async function getDepartures(stop, modes) {
  const url = `${API}?stopId=${encodeURIComponent(stop.id)}&n=100&direction=LATER&withAlerts=false`;
  const r = await fetch(url, { headers: { "User-Agent": "oeffi-matrix-hobby" } });
  if (!r.ok) throw new Error("Transitous HTTP " + r.status);
  const data = await r.json();

  return (data.stopTimes || [])
    .filter(s => modes.includes(s.mode))
    .map(s => {
      const direction = (s.headsign || "").trim();
      return {
        line: s.routeShortName,
        direction,
        label: direction,
        mode: s.mode,
        when: s.place.departure,
        planned: s.place.scheduledDeparture,
        delayMin: Math.round((Date.parse(s.place.departure) - Date.parse(s.place.scheduledDeparture)) / 60000),
        realTime: !!s.realTime,
        cancelled: !!s.cancelled,
        track: s.place.track,
      };
    })
    .filter(departure => departure.direction)
    .sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/stops.js") {
      const stopsModule = await readFile(new URL("./stops.js", import.meta.url));
      res.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(stopsModule);
    } else if (url.pathname === "/api/stops") {
      const stops = [...stopById.values()]
        .map(({ key, id, name, vehicles = [] }) => ({ key, id, name, vehicles }))
        .sort((a, b) => a.name.localeCompare(b.name, "de"));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ stops, vehicles: [...vehicleModes] }));
    } else if (url.pathname === "/api/departures") {
      const stopId = url.searchParams.get("stopId");
      const stop = stopById.get(stopId);
      if (!stop) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Unbekannte oder fehlende Haltestelle" }));
        return;
      }

      const modes = url.searchParams.getAll("mode");
      if (!modes.length || modes.some(mode => !vehicleModes.has(mode))) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Mindestens ein gültiges Verkehrsmittel muss angegeben werden" }));
        return;
      }

      const departures = await getDepartures(stop, modes);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(departures));
    } else {
      const html = await readFile(new URL("./index.html", import.meta.url));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    }
  } catch (e) {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: e.message }));
  }
}).listen(PORT, () => console.log("Läuft auf http://localhost:" + PORT));