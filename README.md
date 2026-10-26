# Kreativní dílna

Osobní rozcestník kreativních nástrojů. Celá aplikace je jeden soubor `index.html`, který běží přímo v prohlížeči. Obrázky ani videa se nikam nenahrávají.

## Moduly

**Obrazové efekty:** 92 efektů v 10 kategoriích (ASCII, pixel art, tisk, geometrie, sklo, světlo, materiály, glitch, rozmazání, deformace). Každý efekt má vlastní nastavení, předúpravu fotky, porovnání s originálem a export do PNG nebo JPG až do 3000 px.

**Video do portfolia:** z nahraných prací (obrázky i videa) vytvoří animované MP4 video. Obsahuje:
- 80 animací v 9 kategoriích (3D, karusely, orbity, mřížky, více scén, hromádky, reflektor, odhalení a stírání, izometrie),
- pozadí (barva, přechod, obrázek, animovaný mesh),
- filtry přes celé video (vroubkované sklo, dithering, halftone, papír, objektiv, VHS, glitch),
- dvojitou expozici, rámy zařízení (telefon, prohlížeč) a logo včetně efektu tekutého kovu,
- export do MP4 (H.264) ve formátech 16:9, 1:1, 4:5 a 9:16, v rozlišení 720p až 1440p, při 30 nebo 60 fps.

## Spuštění

Otevřete `index.html` v prohlížeči (Chrome, Edge nebo Safari). Export MP4 vyžaduje WebCodecs; prohlížeč bez něj video nahraje v reálném čase jako WebM.

Kvůli načítání fontů a knihovny `mp4-muxer` z CDN je potřeba připojení k internetu.

## Úpravy a sestavení

Zdrojové soubory jsou v `src/`, katalogy efektů a animací v `data/`. Po úpravě je spojte do `index.html`:

```bash
python3 tools/build.py
```

| Soubor | Obsah |
|---|---|
| `src/page.html` | kostra stránky, rozcestník, ovládání modulu efektů |
| `src/style.css` | vzhled (tmavé a světlé téma) |
| `src/fx.js` | obrazové efekty (Canvas 2D) |
| `src/video-engine.js` | WebGL2 renderer videa, shadery pozadí a filtrů |
| `src/video-templates.js`, `src/animos-templates.js`, `src/new-templates.js` | animační šablony |
| `src/animos-i18n.js` | české popisky nastavení |
| `src/video-app.js` | rozhraní video modulu a export MP4 |
| `data/effects-catalog.json`, `data/motion-catalog.json` | názvy, popisy a parametry efektů a animací |

Efekty a animace jsou vlastní implementace podle popisů z veřejných katalogů. Nejde o kód těchto služeb.
