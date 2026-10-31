# myinstants-api

API scraping myinstants.com untuk bot WA / Telegram / web.

## Endpoint

- `GET /api/sounds?page=0` → list sound (pagination)
- `GET /api/sound?slug=rickroll` → detail sound + link mp3
- `GET /api/download?slug=rickroll` → stream mp3 langsung (proxy, bebas CORS)

## Deploy ke Vercel

1. Push folder ini ke GitHub
2. Vercel → Import Project → pilih repo
3. Deploy. Selesai, tanpa config tambahan.

## Catatan

- Ini scraping, bukan API resmi. Kalau myinstants ganti struktur HTML, selector/regex mungkin perlu update.
- High traffic? Tambah cache (misal Upstash Redis) biar tidak spam server mereka.
