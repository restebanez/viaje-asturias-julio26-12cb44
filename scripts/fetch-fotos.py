#!/usr/bin/env python3
"""Descarga fotos de Wikimedia Commons (licencia libre) a assets/img/ y emite
los créditos en JSON para pegar en data/lugares.yml.

Uso:  python3 scripts/fetch-fotos.py
Solo imágenes de Commons (repositorio de medios libres). Siempre con atribución.
"""
import json, os, re, sys, urllib.parse, urllib.request

UA = "viaje-asturias-itinerario/1.0 (rodhom@gmail.com)"
API = "https://commons.wikimedia.org/w/api.php"
OUT = "assets/img"
WIDTH = 1280

# id -> lista de búsquedas (se prueba en orden hasta encontrar imagen)
QUERIES = {
    "cangas":     ["Puente romano Cangas de Onis", "Cangas de Onis puente"],
    "covadonga":  ["Basilica de Covadonga", "Santuario de Covadonga"],
    "olla":       ["Olla de San Vicente", "Rio Dobra Amieva", "Rio Dobra Asturias"],
    "casano":     ["Rio Casano Cabrales", "Rio Casano", "Cabrales Picos de Europa paisaje"],
    "cuevas":     ["Playa de Cuevas del Mar", "Cuevas del Mar Llanes"],
    "sanantolin": ["Playa de San Antolin Llanes", "Playa San Antolin Naves"],
    "vega":       ["Playa de Vega Ribadesella", "Playa de Vega Asturias"],
    "arenas":     ["Arenas de Cabrales", "Cabrales Asturias pueblo"],
    "alba":       ["Ruta del Alba Redes", "Parque Natural de Redes", "Rio Alba Sobrescobio"],
    "lastres":    ["Lastres Asturias", "Lastres Colunga puerto"],
    "griega":     ["Playa de La Griega Colunga", "Playa La Griega Asturias"],
}


def api(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def strip(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()


def find_image(query):
    data = api({
        "action": "query", "generator": "search", "gsrnamespace": 6,
        "gsrsearch": query, "gsrlimit": 8,
        "prop": "imageinfo", "iiprop": "url|extmetadata|mime", "iiurlwidth": WIDTH,
    })
    pages = (data.get("query") or {}).get("pages") or {}
    for p in sorted(pages.values(), key=lambda x: x.get("index", 999)):
        ii = (p.get("imageinfo") or [None])[0]
        if not ii or not ii.get("mime", "").startswith("image/"):
            continue
        if ii["mime"] == "image/svg+xml":
            continue
        title = (p.get("title") or "").lower()
        if any(w in title for w in ("escudo", "coat of arms", "map", "mapa", "flag", "bandera", "location", "locator")):
            continue
        em = ii.get("extmetadata") or {}
        return {
            "title": p.get("title"),
            "thumburl": ii.get("thumburl") or ii.get("url"),
            "descurl": ii.get("descriptionurl"),
            "artist": strip((em.get("Artist") or {}).get("value", ""))[:70] or "Wikimedia Commons",
            "license": strip((em.get("LicenseShortName") or {}).get("value", "")) or "ver Commons",
        }
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    result = {}
    for pid, queries in QUERIES.items():
        chosen = None
        for q in queries:
            chosen = find_image(q)
            if chosen:
                break
        if not chosen:
            print(f"[skip] {pid}: sin imagen", file=sys.stderr)
            continue
        ext = ".png" if chosen["thumburl"].lower().split("?")[0].endswith(".png") else ".jpg"
        path = os.path.join(OUT, pid + ext)
        req = urllib.request.Request(chosen["thumburl"], headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
        chosen["file"] = pid + ext
        result[pid] = chosen
        print(f"[ok] {pid:11s} {chosen['file']:15s} {chosen['license']:18s} {chosen['artist'][:34]:34s} {chosen['title']}")

    print("JSON_START")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("JSON_END")


if __name__ == "__main__":
    main()
