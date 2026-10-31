const BASE = "https://www.myinstants.com";

function stripTags(s) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "slug required" });

  const r = await fetch(`${BASE}/en/instant/${encodeURIComponent(slug)}/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  if (!r.ok) return res.status(404).json({ error: "not found" });

  const html = await r.text();

  let title = "";

  // 1. og:title
  const og = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i
  );
  if (og) title = decodeEntities(og[1]).trim();

  // 2. <h1>
  if (!title) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1) title = decodeEntities(stripTags(h1[1]));
  }

  // 3. <h2>
  if (!title) {
    const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2) title = decodeEntities(stripTags(h2[1]));
  }

  // 4. <title> tag, buang suffix site
  if (!title) {
    const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (t) title = decodeEntities(stripTags(t[1])).replace(/\s*-\s*Myinstants.*$/i, "").trim();
  }

  // mp3 path
  let mp3Path = null;
  const audioSrc =
    html.match(/<audio[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["']/i) ||
    html.match(/<audio[^>]+src=["']([^"']+)["']/i) ||
    html.match(/data-url=["']([^"']+\.mp3)["']/i) ||
    html.match(/play\(['"]([^'"]+)['"]\)/);
  if (audioSrc) mp3Path = audioSrc[1];

  if (!mp3Path) return res.status(404).json({ error: "mp3 not found" });

  const mp3 = mp3Path.startsWith("http")
    ? mp3Path
    : `${BASE}${mp3Path.startsWith("/") ? "" : "/"}${mp3Path}`;

  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json({ title, slug, mp3 });
}
