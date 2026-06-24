# Viaje a Asturias — Cangas de Onís (20–24 julio 2026)

Itinerario familiar (rutas con baño natural, playa y mapa). El **texto maestro**
está en Markdown y el **HTML se genera** a partir de él.

## Uso rápido

```bash
npm install
npm run serve     # genera y abre http://localhost:8080
# editar content/itinerario-cangas-de-onis.md  → npm run build
```

- **Editar el plan:** `content/itinerario-cangas-de-onis.md`
- **Editar mapa/fotos:** `data/lugares.yml` (+ imágenes en `assets/img/`)
- **Publicar:** `git push` a `main` (GitHub Pages vía Actions)

Más detalle del flujo y las reglas en [`AGENTS.md`](AGENTS.md).

## ¿Y el PDF?

El HTML está preparado para imprimir: ábrelo en el navegador y **Imprimir →
Guardar como PDF** (el mapa se oculta y queda un documento limpio).
