---
title: PresentMD
author: You
theme: editorial
aspect: 16:9
---

<!-- layout: title -->

# PresentMD

Markdown in. Presentation out.

A local deck builder that lives in your browser.

Note: Welcome people, then say this is just a markdown file.

---

## How it works

1. Write slides in the editor
2. Separate them with `---`
3. Watch the preview update
4. Press **Present** when you are ready

No install. No account. The file on disk is the source of truth.

???
Walk through the layout: editor on the left, live slide on the right, filmstrip below.

---

<!-- layout: split -->

## Author in markdown

- Headings become titles
- Lists, tables, and code just work
- `???` starts speaker notes
- `<!-- layout: title -->` sets a layout

--

## Present like a tool

- Fullscreen audience view
- Speaker window with timer
- Keyboard and clicker keys
- Export a single HTML file

---

## Layouts you can use

| Hint | Result |
| --- | --- |
| `title` | Big opening slide |
| `section` | Chapter break |
| `quote` | Full-bleed quotation |
| `split` | Two columns, divided by `--` |

Put the hint in a comment at the top of the slide.

---

## Code belongs on slides

```ts
function parseDeck(raw: string): Deck {
  const { meta, body } = extractFrontmatter(raw)
  return splitOnRules(body)
}
```

Fences are highlighted. A `---` inside a fence will not start a new slide.

Note: Mention that themes are CSS, not a second document.

---

> Decks should be files you can diff, email, and keep in git.

---

<!-- layout: section -->

# Switch themes anytime

Open **Customize** to start from a preset, then tune colors and type.

---

## Shortcuts

- `⌘/Ctrl + Enter` present from here
- `⌘/Ctrl + S` save the markdown file
- `→` `Space` next slide &nbsp;&nbsp;`←` previous
- `O` overview &nbsp;&nbsp;`B` blackout &nbsp;&nbsp;`P` speaker view
- `Esc` exit presentation

Drop a `.md` file onto the window to open it.

---

<!-- layout: title -->

# Go give the talk

Edit this file. Or open your own.
