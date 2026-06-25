# Viaje verano 2026 — Asturias + Canadá

Sitio con una **portada** y dos **partes** (Asturias y Canadá), cada una con itinerario,
mapa y caminatas. El **texto maestro** está en Markdown y el **HTML se genera**.

## Uso rápido

```bash
npm install
npm run serve     # genera y abre http://localhost:8080
# editar content/*.md o data/*.yml  → npm run build
```

- **Portada:** `content/landing.md`
- **Asturias:** `content/asturias.md` + `data/lugares-asturias.yml`
- **Canadá:** `content/canada.md` + `data/lugares-canada.yml`
- **Imágenes:** `assets/img/` (licencia libre) · **Estilos:** `assets/css/estilo.css`
- **Publicar:** `git push` a `main` (GitHub Pages vía Actions)

Estructura, partes y **páginas por día** (futuro): ver [`AGENTS.md`](AGENTS.md).

## ¿Y el PDF?

Cada página está preparada para imprimir: ábrela en el navegador y **Imprimir → Guardar
como PDF** (el mapa se oculta y queda un documento limpio).
