# Scriptlab360 front end

Plain HTML, CSS and JavaScript. No npm, no build step, no packages.

## Run it

```
cd frontend
python3 -m http.server 8080
```

Open http://localhost:8080. (Any static server works; opening the files by double-click works too.)
The only network request is Google Fonts, for the Latin and Indian-language typefaces.

## Pages

| File | What it is |
|---|---|
| `index.html` | Landing page: typing hero, sample report, structure check, features |
| `scripts.html` | Script list. Add `?empty` to the URL to see the empty state |
| `editor.html` | Editor: scene list, screenplay page, and the Drafts / Analyze / Structure / Story / Speak panels. Add `?analyze=1` to open Analyze |
| `report.html` | Full printable report (dark "screening room") |

## Files

```
static/css/app.css     compiled styles (generated, don't hand-edit)
static/css/custom.css  YOUR styles; loaded last, so they win
static/js/app.js       all behaviour, plain JS, one block per page
src/input.css          source of app.css: design tokens + custom classes
```

All data on the pages is mock data written straight into the HTML. Replace it with template variables.

## Using it with Django

1. Put the `.html` files in a templates folder and `static/` in your static files folder.
2. Add `{% load static %}` and change `static/css/app.css` to `{% static 'css/app.css' %}` (same for `custom.css` and `app.js`).
3. Change page links (`scripts.html`, `editor.html`, ...) to `{% url %}` tags.
4. Move the shared `<head>` into a `base.html` and use `{% block content %}`.

The editor in `app.js` is a stand-in: Enter adds a block, Tab changes its element, Backspace removes an empty one. Nothing is saved.

## Design tokens

Colours, fonts and the notebook / screening-room styles live in `src/input.css` as CSS variables (`--ink`, `--accent`, `--sr-*`...). `DESIGN.md` in the project root explains the design rules.

## Adding new Tailwind classes (optional)

The markup uses Tailwind class names, but `app.css` already contains every class the pages use, so you can ignore Tailwind entirely and write your own CSS in `custom.css`.

If you want to add new Tailwind classes to the HTML, `app.css` must be rebuilt. The standalone Tailwind CLI is a single download and needs no npm:

```
./tailwindcss -i src/input.css -o static/css/app.css --minify
```

(Get the binary for your system from the Tailwind CSS GitHub releases page.)
