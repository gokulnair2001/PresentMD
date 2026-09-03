import {
  isAspectId,
  isFontId,
  isLayoutId,
  isThemeId,
  type AspectId,
  type Deck,
  type DeckMeta,
  type LayoutId,
  type Slide,
  type ThemeId,
} from '../types'
import { renderMarkdown } from './renderMarkdown'
import { isHexColor, type FrontmatterPatch } from './theme'

const FRONTMATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/
const LAYOUT_RE = /^<!--\s*layout:\s*([a-z0-9-]+)\s*-->\s*/i

export function parseDeck(raw: string): Deck {
  const { meta, body, bodyOffset } = extractFrontmatter(raw)
  const chunks = splitSlides(body)
  const slides = chunks.map((chunk, index) =>
    buildSlide(chunk.markdown, index, bodyOffset + chunk.start, bodyOffset + chunk.end),
  )

  return {
    meta,
    slides: slides.length > 0 ? slides : [buildSlide('', 0, bodyOffset, raw.length)],
    raw,
  }
}

export function upsertFrontmatter(raw: string, patch: FrontmatterPatch): string {
  const match = raw.match(FRONTMATTER_RE)
  const nextYaml = mergeYaml(match ? match[1] : '', patch)
  const body = match ? raw.slice(match[0].length) : raw
  if (!nextYaml.trim()) return body.replace(/^\r?\n/, '')
  const prefix = `---\n${nextYaml}\n---\n`
  if (match) return prefix + (body.startsWith('\n') || body.length === 0 ? body : `\n${body}`)
  return `${prefix}\n${body}`
}

export function slideIndexAtOffset(deck: Deck, offset: number): number {
  for (let i = deck.slides.length - 1; i >= 0; i -= 1) {
    if (offset >= deck.slides[i].start) return i
  }
  return 0
}

function extractFrontmatter(raw: string): { meta: DeckMeta; body: string; bodyOffset: number } {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) return { meta: {}, body: raw, bodyOffset: 0 }
  return {
    meta: parseMeta(match[1]),
    body: raw.slice(match[0].length),
    bodyOffset: match[0].length,
  }
}

function parseMeta(yaml: string): DeckMeta {
  const meta: DeckMeta = {}
  for (const line of yaml.split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/)
    if (!pair) continue
    const key = pair[1].toLowerCase()
    const value = unquote(pair[2])
    if (key === 'title') meta.title = value
    else if (key === 'author') meta.author = value
    else if (key === 'theme' && isThemeId(value)) meta.theme = value
    else if (key === 'aspect' && isAspectId(value)) meta.aspect = value
    else if (key === 'background' && isHexColor(value)) meta.background = value
    else if (key === 'text' && isHexColor(value)) meta.text = value
    else if (key === 'muted' && isHexColor(value)) meta.muted = value
    else if (key === 'headingcolor' && isHexColor(value)) meta.headingColor = value
    else if (key === 'accent' && isHexColor(value)) meta.accent = value
    else if (key === 'codebg' && isHexColor(value)) meta.codeBg = value
    else if (key === 'headingfont' && isFontId(value)) meta.headingFont = value
    else if (key === 'bodyfont' && isFontId(value)) meta.bodyFont = value
  }
  return meta
}

function mergeYaml(yaml: string, patch: FrontmatterPatch): string {
  const order: string[] = []
  const map = new Map<string, string>()
  for (const line of yaml.split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/)
    if (!pair) continue
    order.push(pair[1])
    map.set(pair[1].toLowerCase(), pair[2])
  }

  const apply = (key: string, value: string | undefined) => {
    if (value == null) return
    const existing = [...map.keys()].find((item) => item.toLowerCase() === key.toLowerCase())
    if (value === '') {
      if (existing) map.delete(existing)
      return
    }
    if (existing) {
      map.set(existing, value)
    } else {
      order.push(key)
      map.set(key.toLowerCase(), value)
    }
  }

  apply('title', patch.title)
  apply('author', patch.author)
  apply('theme', patch.theme)
  apply('aspect', patch.aspect)
  apply('background', patch.background)
  apply('text', patch.text)
  apply('muted', patch.muted)
  apply('headingColor', patch.headingColor)
  apply('accent', patch.accent)
  apply('codeBg', patch.codeBg)
  apply('headingFont', patch.headingFont)
  apply('bodyFont', patch.bodyFont)

  return order
    .map((key) => {
      const value = map.get(key.toLowerCase())
      return value == null ? null : `${key}: ${value}`
    })
    .filter((line): line is string => Boolean(line))
    .join('\n')
}

function splitSlides(body: string): { markdown: string; start: number; end: number }[] {
  const slides: { markdown: string; start: number; end: number }[] = []
  let slideStart = 0
  let inFence = false
  let fenceMarker = ''
  let cursor = 0

  while (cursor <= body.length) {
    const newlineAt = body.indexOf('\n', cursor)
    const lineEnd = newlineAt === -1 ? body.length : newlineAt
    const line = body.slice(cursor, lineEnd).replace(/\r$/, '')
    const fence = line.match(/^\s*(```+|~~~+)/)

    if (fence) {
      const marker = fence[1][0] === '`' ? '`' : '~'
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false
        fenceMarker = ''
      }
    } else if (!inFence && /^---+$/.test(line.trim())) {
      slides.push({ markdown: body.slice(slideStart, cursor), start: slideStart, end: cursor })
      slideStart = lineEnd + (newlineAt === -1 ? 0 : 1)
    }

    if (newlineAt === -1) break
    cursor = newlineAt + 1
  }

  slides.push({ markdown: body.slice(slideStart), start: slideStart, end: body.length })
  return slides
}

function buildSlide(markdown: string, index: number, start: number, end: number): Slide {
  const { explicit, rest } = takeLayout(markdown)
  const { content, notes } = extractNotes(rest)
  const layout = explicit ?? detectLayout(content)
  const html =
    layout === 'split'
      ? renderSplit(content)
      : renderMarkdown(content)

  return {
    index,
    markdown: content,
    html,
    notes,
    layout,
    start,
    end,
    title: slideTitle(content, index),
  }
}

function takeLayout(markdown: string): { explicit: LayoutId | undefined; rest: string } {
  const match = markdown.trimStart().match(LAYOUT_RE)
  if (!match) return { explicit: undefined, rest: markdown }
  const id = match[1].toLowerCase()
  const trimmed = markdown.trimStart()
  return {
    explicit: isLayoutId(id) ? id : undefined,
    rest: trimmed.slice(match[0].length),
  }
}

function extractNotes(markdown: string): { content: string; notes: string } {
  const lines = markdown.split('\n')
  const blockAt = lines.findIndex((line) => /^\s*(?:\?{3}|Note:)\s*$/.test(line))
  if (blockAt >= 0) {
    return {
      content: lines.slice(0, blockAt).join('\n').trim(),
      notes: lines.slice(blockAt + 1).join('\n').trim(),
    }
  }

  const notes: string[] = []
  const body: string[] = []
  for (const line of lines) {
    const inline = line.match(/^\s*Note:\s+(.+)\s*$/)
    if (inline) notes.push(inline[1])
    else body.push(line)
  }
  return { content: body.join('\n').trim(), notes: notes.join('\n') }
}

function detectLayout(content: string): LayoutId {
  const trimmed = content.trim()
  if (!trimmed) return 'default'
  const lines = trimmed.split('\n')
  const isQuote = lines.every((line) => !line.trim() || line.trim().startsWith('>'))
  if (isQuote) return 'quote'

  const hasList = /^\s*(?:[-*+]|\d+\.)\s/m.test(trimmed)
  const hasCode = /```/.test(trimmed)
  const hasTable = /^\s*\|/m.test(trimmed)
  const hasH1 = /^#\s+/m.test(trimmed)
  const hasH2 = /^##\s+/m.test(trimmed)

  if (hasH1 && !hasH2 && !hasList && !hasCode && !hasTable && trimmed.length < 320) {
    return 'title'
  }
  if (hasH1 && !hasList && !hasCode && !hasTable && trimmed.length < 220) {
    return 'section'
  }
  return 'default'
}

function renderSplit(content: string): string {
  const cols = content
    .split(/^\s*--\s*$/m)
    .map((col) => col.trim())
    .filter(Boolean)
  if (cols.length < 2) return renderMarkdown(content)
  return `<div class="split">${cols.map((col) => `<div class="col">${renderMarkdown(col)}</div>`).join('')}</div>`
}

function slideTitle(content: string, index: number): string {
  const heading = content.match(/^#{1,6}\s+(.+)$/m)
  if (heading) return heading[1].replace(/[*_`]/g, '').trim()
  const line = content.split('\n').find((item) => item.trim())
  if (line) return line.replace(/^>\s*/, '').trim().slice(0, 48)
  return `Slide ${index + 1}`
}

export function resolveTheme(meta: DeckMeta, override: ThemeId | null): ThemeId {
  return override ?? meta.theme ?? 'editorial'
}

export function resolveAspect(meta: DeckMeta, override: AspectId | null): AspectId {
  return override ?? meta.aspect ?? '16:9'
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}
