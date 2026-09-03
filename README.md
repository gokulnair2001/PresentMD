# PresentMD

Local markdown-to-slides in the browser. Open a `.md` file, edit it, and present.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Write a deck

- Split slides with a line that is only `---`
- Optional frontmatter: `title`, `author`, `theme`, `aspect`
- Speaker notes: a `???` line, or `Note:`
- Layouts: `<!-- layout: title | section | quote | split -->`
- In a split slide, divide columns with a line that is only `--`

Themes: `editorial`, `light`, `dark`, `technical`. Aspect: `16:9` or `4:3`.

## Present

- **Present** opens speaker view and goes fullscreen
- `⌘/Ctrl + Enter` presents from the current slide
- Export downloads a single HTML file you can present without this app
