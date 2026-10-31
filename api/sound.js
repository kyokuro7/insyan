const cheerio = require("cheerio");
const BASE = "https://www.myinstants.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "slug required" });

  const html = await fetch(`${BASE}/en/instant/${slug}/`).then(r => {
    if (!r.ok) return null;
    return r.text();
  });
  if (!html) return res.status(404).json({ error: "not found" });

  const $ = cheerio.load(html);

  // title: coba <h1>, kalau kosong fallback ke <h2> atau meta og:title
  let title = $("h1").first().text().trim();
  if (!title) title = $("h2").first().text().trim();
  if (!title) title = $('meta[property="og:title"]').attr("content")?.trim() || "";

  // mp3 URL: cari di <audio>, <source>, atau data-url
  let mp3Path =
    $("audio source").attr("src") ||
    $("audio").attr("src") ||
    $("[data-url]").attr("data-url");

  // fallback ke pola play('...')
  if (!mp3Path) {
    const match = html.match(/play\('([^']+)'\)/);
    mp3Path = match ? match[1] : null;
  }

  if (!mp3Path) return res.status(404).json({ error: "mp3 not found" });

  const mp3 = `${BASE}${mp3Path.startsWith("/") ? "" : "/"}${mp3Path}`;

  res.json({ title, slug, mp3 });
}
