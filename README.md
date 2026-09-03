# PresentMD

Markdown in. Presentation out.

PresentMD is a local web app for building and giving slide decks from a single `.md` file. There is no account, no server, and no extra config. Write markdown, and present.

The file on disk is the source of truth. You can diff it, email it, and keep it in git.

## Use it

**On the web:** [gokulnair2001.github.io/PresentMD](https://gokulnair2001.github.io/PresentMD/)

Works in the browser. Open or drop a `.md` file, or start from the sample. Nothing is uploaded; files stay on your machine.

**On your machine:** Needs Node 20+.

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

```bash
npm run build    # production build
npm run preview  # serve the build
```

## What you can do

- Edit markdown with a live slide preview
- Open and save `.md` files (File System Access API, with a fallback)
- Drop a markdown file onto the window to open it
- Switch among eight presets, then customize colors and fonts
- Present fullscreen with keyboard and clicker keys
- Open a speaker window (current slide, next slide, notes, timer)
- Export a single HTML file you can present without this app

Drafts autosave in the browser. Unsaved work is restored on reload.

## Write a deck

Split slides with a line that is only `---`. A `---` inside a fenced code block does not start a new slide.

```markdown
---
title: Q3 Review
author: You
theme: editorial
aspect: 16:9
---

<!-- layout: title -->

# The talk title

A subtitle is just the next paragraph.

Note: say this out loud, not on the slide.

---

## A content slide

- Point one
- Point two

???
Longer notes can go after a `???` line.
```

### Frontmatter

| Key | Values |
| --- | --- |
| `title` | Deck title |
| `author` | Optional |
| `theme` | `editorial`, `light`, `dark`, `technical`, `swiss`, `noir`, `ocean`, `ember` |
| `aspect` | `16:9` (default) or `4:3` |

Theme overrides also live here, so a customized deck stays portable:

```yaml
theme: noir
accent: "#d4af37"
headingFont: fraunces
bodyFont: outfit
background: "#050505"
text: "#f3e6cc"
muted: "#c4b08a"
headingColor: "#f7e7c4"
codeBg: "#121212"
```

Fonts: `outfit`, `fraunces`, `source-serif`, `jetbrains`, `georgia`, `system`.

**Customize** in the toolbar opens the theme editor. **Reset** drops overrides and returns to the preset.

### Layouts

Put a hint at the top of a slide:

```markdown
<!-- layout: title | section | quote | split -->
```

| Layout | Use |
| --- | --- |
| `title` | Opening slide. Also inferred when the slide is mostly an `h1`. |
| `section` | Chapter break |
| `quote` | Full-bleed quotation. A slide that is only a blockquote is inferred. |
| `split` | Two columns, divided by a line that is only `--` |
| *(none)* | Default content slide |

Split example:

```markdown
<!-- layout: split -->

## Left

Architecture

--

## Right

- API
- workers
- UI
```

### Speaker notes

Either:

- a line that is only `???`, then the notes
- `Note:` on its own line, then the notes
- `Note: a single inline note`

Notes show under the preview and in speaker view. They are not visible to the audience.

## Present

**Present** opens speaker view and takes the main window fullscreen.

| Key | Action |
| --- | --- |
| `⌘/Ctrl` + `Enter` | Present from the current slide |
| `⌘/Ctrl` + `S` | Save |
| `⌘/Ctrl` + `O` | Open |
| `→` `Space` `Enter` `PageDown` | Next |
| `←` `Backspace` `PageUp` | Previous |
| `Home` / `End` | First / last |
| `O` | Overview grid |
| `B` or `.` | Blackout |
| `P` | Speaker view |
| `F` | Toggle fullscreen |
| `?` | Shortcuts |
| `Esc` | Back / exit |

Clicker keys (`PageDown` / `PageUp`) work in both audience and speaker windows.

**Export** downloads a standalone HTML file with the same theme, keyboard nav, overview, blackout, and print-to-PDF.

## Presets

| Preset | Feel |
| --- | --- |
| Editorial | Paper, ink, magazine |
| Light | Cool white, indigo, product |
| Dark | Violet night |
| Technical | HUD, grid, mint |
| Swiss | White, poster red, heavy type |
| Noir | Cinema, gold, vignette |
| Ocean | Deep water, serif titles |
| Ember | Firelight |

## Project

Vite + React + TypeScript. Markdown is parsed with `marked`, highlighted with highlight.js, and edited with CodeMirror. There is no backend.

Pushes to `main` deploy to GitHub Pages via `.github/workflows/pages.yml`. In the repo: **Settings → Pages → Source: GitHub Actions**.
