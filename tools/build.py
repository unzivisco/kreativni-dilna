#!/usr/bin/env python3
"""Sestaví jednosouborovou stránku z src/ a data/.

  python3 tools/build.py            -> index.html (samostatná stránka s <!doctype>)
  python3 tools/build.py --fragment -> navíc dist/fragment.html (obsah bez <html>/<head>, např. pro Claude Artifact)
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
VIDEO_FILES = ['video-engine.js', 'video-templates.js', 'animos-i18n.js', '@MOTION', 'animos-templates.js', 'new-templates.js', 'video-app.js']


def read(*p):
    with open(os.path.join(ROOT, *p), encoding='utf-8') as f:
        return f.read()


def js_json(obj):
    # JSON vložený do <script> nesmí obsahovat "</"
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def build():
    catalog = json.loads(read('data', 'effects-catalog.json'))
    motion = json.loads(read('data', 'motion-catalog.json'))
    video = ''.join(
        ('const ANIMOS=' + js_json(motion) + ';\n') if f == '@MOTION' else read('src', f) + '\n'
        for f in VIDEO_FILES)
    page = read('src', 'page.html')
    for key, val in (('/*STYLE*/', read('src', 'style.css')), ('/*CATALOG*/null', js_json(catalog)),
                     ('/*FX*/', read('src', 'fx.js')), ('/*VIDEO*/', video)):
        if key not in page:
            sys.exit(f'Chybí zástupný text {key} v src/page.html')
        page = page.replace(key, val)
    return page


if __name__ == '__main__':
    body = build()
    head = ('<!doctype html>\n<html lang="cs"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n')
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(head + body + '\n</body></html>\n')
    if '--fragment' in sys.argv:
        os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
        with open(os.path.join(ROOT, 'dist', 'fragment.html'), 'w', encoding='utf-8') as f:
            f.write(body)
    print('Hotovo: index.html', f'({len(body) // 1024} kB)')
