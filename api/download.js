const cheerio = require("cheerio");
const BASE = "https://www.myinstants.com";

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "slug required" });

  const html = await fetch(`${BASE}/en/instant/${slug}/`).then(r => r.text());
  const match = html.match(/play\('([^']+)'\)/);
  if (!match) return res.status(404).json({ error: "mp3 not found" });

  const mp3 = await fetch(`${BASE}${match[1]}`);
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", `inline; filename="${slug}.mp3"`);
  mp3.body.pipe(res);
}
