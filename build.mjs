// Dijalankan otomatis oleh Netlify setiap kali ada perubahan (lihat netlify.toml).
// Membuat satu halaman untuk setiap tulisan di content/posts.json, plus sitemap.xml dan robots.txt.
import fs from "node:fs";
import path from "node:path";

const SITE = (process.env.URL || "https://pmiiradenintan.netlify.app").replace(/\/$/, "");
const NAME = "PMII Komisariat Raden Intan";
const WA = "6289507946542";
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : ""; };
const okImg = (s) => (typeof s === "string" && /^\/?uploads\/[\w\-. %]+$/i.test(s) ? (s.startsWith("/") ? s : "/" + s) : "");
const slugify = (t) => String(t || "tulisan").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "") || "tulisan";

let data = { posts: [] };
try { data = JSON.parse(fs.readFileSync("content/posts.json", "utf8")); } catch { console.log("content/posts.json kosong atau belum ada"); }
const posts = Array.isArray(data.posts) ? data.posts : [];
posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

const used = new Set();
for (const p of posts) {
  const base = `${(p.date || "").slice(0, 10)}-${slugify(p.title)}`.replace(/^-/, "");
  let s = base, i = 2;
  while (used.has(s)) s = `${base}-${i++}`;
  used.add(s);
  p.slug = s;
}
fs.writeFileSync("content/posts.json", JSON.stringify({ posts }, null, 2));

const CSS = `*{box-sizing:border-box}body{margin:0;font-family:Manrope,system-ui,sans-serif;color:#0B1020;background:#fff;-webkit-font-smoothing:antialiased}
a{color:inherit}header{background:#2347C5;color:#fff}.w{max-width:760px;margin:0 auto;padding:0 20px}
.bar{display:flex;align-items:center;gap:12px;height:68px;max-width:1100px;margin:0 auto;padding:0 20px}
.bar a{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;line-height:1.15;font-size:15px}.bar img{width:42px;height:42px}
.back{display:inline-block;margin:28px 0 8px;font-weight:700;font-size:14px;color:#2347C5;text-decoration:none}.back:hover{text-decoration:underline}
.pill{display:inline-block;border:1px solid rgba(11,16,32,.25);border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600;color:rgba(11,16,32,.8)}
h1{font-size:clamp(28px,5vw,44px);line-height:1.12;letter-spacing:-.02em;color:#0E1F5C;margin:16px 0 8px;font-weight:800}
.date{font-size:13px;font-weight:600;color:rgba(11,16,32,.55);margin:0 0 20px}.cover{width:100%;border-radius:14px;margin:0 0 24px;display:block}
.body p{font-size:17px;line-height:1.75;color:rgba(11,16,32,.85);margin:0 0 18px}
.share{display:flex;flex-wrap:wrap;gap:10px;margin:32px 0;padding:20px 0;border-top:1px solid rgba(11,16,32,.1);border-bottom:1px solid rgba(11,16,32,.1)}
.share span{width:100%;font-weight:700;font-size:14px}.btn{border:0;cursor:pointer;font:inherit;font-weight:700;font-size:14px;padding:11px 18px;border-radius:4px;background:#0B1020;color:#fff;text-decoration:none;transition:background .2s}
.btn:hover{background:#2347C5}footer{background:#0E1F5C;color:rgba(255,255,255,.75);margin-top:56px;padding:28px 20px;text-align:center;font-size:13px}footer a{color:#fff;font-weight:700}`;

function page(p) {
  const url = `${SITE}/tulisan/${p.slug}/`;
  const title = `${p.title || "Tulisan"} | ${NAME}`;
  const desc = String(p.summary || p.body || "").replace(/\s+/g, " ").slice(0, 200);
  const img = okImg(p.image);
  const ogImg = SITE + (img || "/logo.png");
  const paras = String(p.body || p.summary || "").split(/\n\s*\n/).map((x) => `<p>${esc(x.trim()).replace(/\n/g, "<br>")}</p>`).join("\n");
  const ld = JSON.stringify({ "@context": "https://schema.org", "@type": "NewsArticle", headline: p.title, datePublished: p.date, image: [ogImg], description: desc, mainEntityOfPage: url, author: { "@type": "Organization", name: NAME }, publisher: { "@type": "Organization", name: NAME, logo: { "@type": "ImageObject", url: SITE + "/logo.png" } } }).replace(/</g, "\\u003c");
  const waText = encodeURIComponent(`${p.title}\n${url}`);
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}"><link rel="icon" href="/logo.png">
<meta property="og:type" content="article"><meta property="og:site_name" content="${esc(NAME)}"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(ogImg)}"><meta property="og:locale" content="id_ID">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(ogImg)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style><script type="application/ld+json">${ld}</script></head>
<body><header><div class="bar"><a href="/"><img src="/logo.png" alt="Logo PMII"><span>PMII Komisariat<br>Raden Intan</span></a></div></header>
<main class="w"><a class="back" href="/#opini">&larr; Kembali ke Beranda</a>
<article><span class="pill">${esc(p.category || "Kabar")}</span><h1>${esc(p.title)}</h1><p class="date">${esc(fmtDate(p.date))}</p>
${img ? `<img class="cover" src="${esc(img)}" alt="">` : ""}<div class="body">${paras}</div></article>
<div class="share"><span>Bagikan tulisan ini</span><a class="btn" href="https://wa.me/?text=${waText}" target="_blank" rel="noopener">WhatsApp</a><button class="btn" id="cp" type="button">Salin link</button></div>
<a class="back" href="/#opini">&larr; Tulisan lainnya</a></main>
<footer>&copy; ${new Date().getFullYear()} ${esc(NAME)} &middot; <a href="https://wa.me/${WA}">0895-0794-6542</a></footer>
<script>document.getElementById('cp').addEventListener('click',function(){var b=this,u=location.href;function ok(){b.textContent='Link tersalin';setTimeout(function(){b.textContent='Salin link'},2000)}
if(navigator.clipboard){navigator.clipboard.writeText(u).then(ok,function(){prompt('Salin link ini:',u)})}else{prompt('Salin link ini:',u)}});</script></body></html>`;
}

fs.rmSync("tulisan", { recursive: true, force: true });
for (const p of posts) {
  const dir = path.join("tulisan", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(p));
}

const urls = [`${SITE}/`, ...posts.map((p) => `${SITE}/tulisan/${p.slug}/`)];
const lastmod = (p) => (/^\d{4}-\d{2}-\d{2}/.test(p?.date || "") ? `<lastmod>${p.date.slice(0, 10)}</lastmod>` : "");
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u, i) => `<url><loc>${u}</loc>${i ? lastmod(posts[i - 1]) : ""}</url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync("robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Selesai: ${posts.length} halaman tulisan dibuat.`);
