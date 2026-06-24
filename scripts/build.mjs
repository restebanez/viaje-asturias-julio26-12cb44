// Genera dist/index.html a partir de:
//   - content/itinerario-cangas-de-onis.md  (texto maestro)
//   - data/lugares.yml                       (mapa + fotos)
// NO edites dist/ a mano: se regenera con `npm run build`.

import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import MarkdownIt from 'markdown-it';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

const SITE = {
  titulo: 'Viaje a Asturias — Cangas de Onís',
  fechas: '20–24 julio 2026',
};

const COLORES = { '🟢': '#2e7d32', '🟡': '#f9a825', '🔴': '#c62828' };
const colorDe = (s) => COLORES[(s || '').trim()] || '#1565c0';
const mapsUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

// --- contenido maestro ---
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
let mdSrc = readFileSync(join(root, 'content', 'itinerario-cangas-de-onis.md'), 'utf8');

// Quita el primer H1 del MD (lo usamos como cabecera del sitio para no duplicarlo).
let tituloDoc = SITE.titulo;
mdSrc = mdSrc.replace(/^﻿?#\s+(.+)\n/, (_, t) => { tituloDoc = t.trim(); return ''; });
const bodyHtml = md.render(mdSrc);

// --- datos de lugares ---
const lugares = (existsSync(join(root, 'data', 'lugares.yml'))
  ? yaml.load(readFileSync(join(root, 'data', 'lugares.yml'), 'utf8'))
  : []) || [];

const puntos = lugares
  .filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number')
  .map((l) => ({
    nombre: l.nombre,
    dia: l.dia || '',
    color: colorDe(l.semaforo),
    lat: l.lat,
    lng: l.lng,
    maps: mapsUrl(l.maps_query || l.nombre),
    wikiloc: l.wikiloc || null,
  }));

const fotos = lugares.filter((l) => l.foto);
const hero = fotos.find((l) => l.hero) || fotos[0] || null;

const creditoFoto = (l) =>
  l.credito
    ? `<span class="credito">Foto: ${
        l.credito_url ? `<a href="${esc(l.credito_url)}" target="_blank" rel="noopener">${esc(l.credito)}</a>` : esc(l.credito)
      }${l.licencia ? ` · ${esc(l.licencia)}` : ''}</span>`
    : '';

const galeria = fotos.length
  ? `<section class="galeria" aria-label="Galería de fotos">
  <h2>Galería</h2>
  <div class="grid">
    ${fotos
      .map(
        (l) => `<figure>
      <img src="./assets/img/${esc(l.foto)}" alt="${esc(l.nombre)}" loading="lazy">
      <figcaption><strong>${esc(l.nombre)}</strong>${l.dia ? ` · ${esc(l.dia)}` : ''}${creditoFoto(l) ? `<br>${creditoFoto(l)}` : ''}</figcaption>
    </figure>`
      )
      .join('\n    ')}
  </div>
</section>`
  : '';

const heroHtml = hero
  ? `<div class="hero-img" style="background-image:url('./assets/img/${esc(hero.foto)}')"></div>`
  : '';

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(tituloDoc)}</title>
<link rel="preconnect" href="https://unpkg.com">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<link rel="stylesheet" href="./assets/css/estilo.css">
</head>
<body>
<header class="cabecera">
  ${heroHtml}
  <div class="cabecera-txt">
    <h1>${esc(tituloDoc)}</h1>
    <p class="fechas">${esc(SITE.fechas)}</p>
  </div>
</header>

<main>
  <section class="mapa-wrap" aria-label="Mapa de los lugares">
    <h2>Mapa</h2>
    <div id="mapa"></div>
    <p class="leyenda">
      <span class="dot" style="background:#2e7d32"></span> tranquilo
      <span class="dot" style="background:#f9a825"></span> hay gente, llevadero
      <span class="dot" style="background:#c62828"></span> masificado
      <span class="dot" style="background:#1565c0"></span> base / logística
    </p>
  </section>

  ${galeria}

  <article class="contenido">
    ${bodyHtml}
  </article>
</main>

<footer class="pie">
  <p>Documento maestro en Markdown · HTML generado automáticamente. No editar a mano.</p>
</footer>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
const LUGARES = ${safeJson(puntos)};
(function () {
  if (!LUGARES.length || !window.L) return;
  const map = L.map('mapa', { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const grupo = [];
  for (const p of LUGARES) {
    const m = L.circleMarker([p.lat, p.lng], {
      radius: 9, color: '#fff', weight: 2, fillColor: p.color, fillOpacity: 0.95
    }).addTo(map);
    const wl = p.wikiloc ? '<br><a href="' + p.wikiloc + '" target="_blank" rel="noopener">Track Wikiloc</a>' : '';
    m.bindPopup('<b>' + p.nombre + '</b>' + (p.dia ? '<br>' + p.dia : '') +
      '<br><a href="' + p.maps + '" target="_blank" rel="noopener">Abrir en Google Maps</a>' + wl);
    m.bindTooltip(p.nombre);
    grupo.push([p.lat, p.lng]);
  }
  map.fitBounds(grupo, { padding: [40, 40] });
})();
</script>
</body>
</html>
`;

// --- escribir dist/ ---
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'index.html'), html);
writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(dist, '.nojekyll'), '');
cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });

console.log(`OK · ${puntos.length} puntos en el mapa · ${fotos.length} fotos · dist/index.html`);
