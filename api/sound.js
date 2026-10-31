const cheerio = require("cheerio");
const BASE = "https://www.myinstants.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "slug required" });

  const html = await fetch(`${BASE}/en/instant/${slug}/`).then(r => {
    if (r.status === 404) return null;
    return r.text();
  });
  if (!html) return res.status(404).json({ error: "not found" });

  const $ = cheerio.load(html);
  const title = $("h2").first().text().trim();

  const match = html.match(/play\('([^']+)'\)/);
  if (!match) return res.status(404).json({ error: "mp3 not found" });

  res.json({ title, slug, mp3: `${BASE}${match[1]}` });
}
