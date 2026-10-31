const cheerio = require("cheerio");

const BASE = "https://www.myinstants.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const page = parseInt(req.query.page || "0");

  const html = await fetch(`${BASE}/en/index/us/?page=${page}`).then(r => r.text());
  const $ = cheerio.load(html);

  const sounds = [];
  $("a.instant_link").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).text().trim();
    if (href) sounds.push({
      title,
      slug: href.split("/").filter(Boolean).pop(),
      url: `${BASE}${href}`
    });
  });

  res.json({ page, count: sounds.length, sounds });
}
