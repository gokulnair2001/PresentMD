import { downloadText } from './fileAccess'
import { downloadBasename } from './format'
import type { AspectId, Deck, ThemeId } from '../types'
import slideCss from '../styles/slides.css?raw'

export function exportStandaloneHtml(
  deck: Deck,
  theme: ThemeId,
  aspect: AspectId,
  fileName: string,
  vars: Record<string, string>,
): void {
  const title = deck.meta.title || downloadBasename(fileName) || 'Presentation'
  const html = buildHtml(deck, theme, aspect, title, vars)
  downloadText(`${downloadBasename(fileName)}.html`, html, 'text/html')
}

function cssVars(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')
}

function buildHtml(deck: Deck, theme: ThemeId, aspect: AspectId, title: string, vars: Record<string, string>): string {
  const stageStyle = cssVars(vars)
  const slides = deck.slides
    .map((slide, index) => {
      const notes = escapeAttr(slide.notes)
      return `<section class="slide-wrap" data-index="${index}" data-notes="${notes}">
  <div class="slide-stage theme-${theme}" style="${escapeAttr(stageStyle)}">
    <div class="slide-scaler">
      <div class="slide layout-${slide.layout}">
        <div class="slide-inner">${slide.html}</div>
      </div>
    </div>
  </div>
</section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
${slideCss}

:root { color-scheme: dark; }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: #050608; font-family: Outfit, system-ui, sans-serif; }
.theater { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: #050608; }
.slide-wrap { position: absolute; inset: 0; display: none; padding: 3vh; }
.slide-wrap.active { display: block; }
body.overview .slide-wrap { display: block; position: relative; inset: auto; width: auto; height: auto; padding: 8px; cursor: pointer; }
body.overview .theater { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; padding: 24px; height: auto; min-height: 100vh; overflow: auto; }
body.overview .slide-wrap.active { outline: 2px solid #e7a23b; }
.blackout-veil { display: none; position: fixed; inset: 0; background: #000; z-index: 20; }
body.blackout .blackout-veil { display: block; }
.chrome { position: fixed; left: 16px; bottom: 14px; z-index: 12; color: rgba(255,255,255,.55); font-size: 13px; letter-spacing: .04em; pointer-events: none; }
.progress { position: fixed; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,.08); z-index: 12; }
.progress > span { display: block; height: 100%; background: #e7a23b; width: 0%; }
.help { display: none; position: fixed; inset: 0; z-index: 30; place-items: center; background: rgba(0,0,0,.55); }
body.help .help { display: grid; }
.help card, .help .card { background: #171a24; color: #eceef4; padding: 28px 32px; border-radius: 16px; width: min(420px, 90vw); }
.help h1 { margin: 0 0 12px; font-size: 18px; }
.help p { margin: 6px 0; color: #b4b9c8; font-size: 14px; }
.help kbd { font-family: ui-monospace, monospace; background: #2a3144; padding: 1px 6px; border-radius: 4px; color: #fff; }
@media print {
  body { background: #fff; }
  .chrome, .progress, .help, .blackout-veil { display: none !important; }
  .theater { display: block; height: auto; overflow: visible; background: #fff; }
  .slide-wrap { display: block !important; position: relative; page-break-after: always; height: 100vh; padding: 0; }
}
  </style>
</head>
<body data-aspect="${aspect}">
  <div class="theater">${slides}</div>
  <div class="blackout-veil"></div>
  <div class="chrome"><span id="counter"></span></div>
  <div class="progress"><span id="bar"></span></div>
  <div class="help" id="help">
    <div class="card">
      <h1>Shortcuts</h1>
      <p><kbd>→</kbd> <kbd>Space</kbd> next &nbsp; <kbd>←</kbd> previous</p>
      <p><kbd>O</kbd> overview &nbsp; <kbd>B</kbd> blackout &nbsp; <kbd>F</kbd> fullscreen</p>
      <p><kbd>?</kbd> this help &nbsp; <kbd>Esc</kbd> close / exit overview</p>
    </div>
  </div>
  <script>
    const aspect = document.body.dataset.aspect === '4:3' ? [1600, 1200] : [1920, 1080];
    const wraps = [...document.querySelectorAll('.slide-wrap')];
    let index = Math.max(0, parseInt(location.hash.replace('#', ''), 10) || 0);
    let overview = false;
    let blackout = false;
    let help = false;

    function fit() {
      const [w, h] = aspect;
      for (const wrap of wraps) {
        const stage = wrap.querySelector('.slide-stage');
        const scaler = wrap.querySelector('.slide-scaler');
        const slide = wrap.querySelector('.slide');
        if (!stage || !scaler || !slide) continue;
        const r = stage.getBoundingClientRect();
        const s = Math.min(r.width / w, r.height / h) || 0.1;
        scaler.style.width = w * s + 'px';
        scaler.style.height = h * s + 'px';
        slide.style.width = w + 'px';
        slide.style.height = h + 'px';
        slide.style.transform = 'scale(' + s + ')';
      }
    }

    function render() {
      wraps.forEach((el, i) => el.classList.toggle('active', i === index));
      document.body.classList.toggle('overview', overview);
      document.body.classList.toggle('blackout', blackout);
      document.body.classList.toggle('help', help);
      document.getElementById('counter').textContent = (index + 1) + ' / ' + wraps.length;
      document.getElementById('bar').style.width = ((index + 1) / wraps.length * 100) + '%';
      location.hash = String(index);
      fit();
    }

    function go(next) {
      index = Math.max(0, Math.min(wraps.length - 1, next));
      overview = false;
      blackout = false;
      render();
    }

    window.addEventListener('keydown', (e) => {
      if (help && e.key !== 'Escape' && e.key !== '?') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); go(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        e.preventDefault(); go(index - 1);
      } else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(wraps.length - 1);
      else if (e.key === 'o' || e.key === 'O') { overview = !overview; render(); }
      else if (e.key === 'b' || e.key === 'B' || e.key === '.') { blackout = !blackout; render(); }
      else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen();
      } else if (e.key === '?') { help = !help; render(); }
      else if (e.key === 'Escape') {
        if (help) help = false;
        else if (overview) overview = false;
        else if (blackout) blackout = false;
        render();
      }
    });

    document.querySelector('.theater').addEventListener('click', (e) => {
      if (overview) {
        const wrap = e.target.closest('.slide-wrap');
        if (wrap) go(Number(wrap.dataset.index));
        return;
      }
      if (e.target.closest('a')) return;
      go(index + 1);
    });

    window.addEventListener('resize', fit);
    render();
  </script>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replaceAll('\n', '&#10;')
}
