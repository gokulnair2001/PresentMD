import {
  isFontId,
  type DeckMeta,
  type FontId,
  type ThemeId,
} from '../types'

export type SlideStyle = {
  background: string
  bgImage: string
  text: string
  muted: string
  heading: string
  accent: string
  codeBg: string
  headingFont: FontId
  bodyFont: FontId
}

export const FONT_OPTIONS: { id: FontId; label: string }[] = [
  { id: 'outfit', label: 'Outfit' },
  { id: 'fraunces', label: 'Fraunces' },
  { id: 'source-serif', label: 'Source Serif' },
  { id: 'jetbrains', label: 'JetBrains Mono' },
  { id: 'georgia', label: 'Georgia' },
  { id: 'system', label: 'System' },
]

export const FONT_STACKS: Record<FontId, string> = {
  outfit: 'Outfit, system-ui, sans-serif',
  fraunces: 'Fraunces, Georgia, serif',
  'source-serif': "'Source Serif 4', Georgia, serif",
  jetbrains: "'JetBrains Mono', ui-monospace, monospace",
  georgia: "Georgia, 'Iowan Old Style', serif",
  system: "system-ui, 'Segoe UI', sans-serif",
}

export const THEME_PRESETS: Record<ThemeId, SlideStyle> = {
  editorial: {
    background: '#f6efe2',
    bgImage: 'none',
    text: '#1c1610',
    muted: '#5c5348',
    heading: '#16110c',
    accent: '#8f1d32',
    codeBg: '#ebe1d0',
    headingFont: 'fraunces',
    bodyFont: 'source-serif',
  },
  light: {
    background: '#f7f8fc',
    bgImage: 'none',
    text: '#111827',
    muted: '#4b5563',
    heading: '#0b1220',
    accent: '#4f46e5',
    codeBg: '#eef0f6',
    headingFont: 'outfit',
    bodyFont: 'outfit',
  },
  dark: {
    background: '#0b0c14',
    bgImage: 'radial-gradient(900px 520px at 80% -10%, rgba(139, 92, 246, 0.18), transparent 55%)',
    text: '#eef0f8',
    muted: '#a8b0c7',
    heading: '#f5f3ff',
    accent: '#a78bfa',
    codeBg: '#151726',
    headingFont: 'outfit',
    bodyFont: 'outfit',
  },
  technical: {
    background: '#071018',
    bgImage:
      'linear-gradient(rgba(62, 233, 176, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(62, 233, 176, 0.05) 1px, transparent 1px), radial-gradient(900px 480px at 100% 0%, rgba(62, 233, 176, 0.12), transparent 52%), linear-gradient(180deg, #08131c 0%, #05090f 100%)',
    text: '#d7e8ff',
    muted: '#8eabc8',
    heading: '#e8f6ff',
    accent: '#3ee9b0',
    codeBg: '#07141c',
    headingFont: 'outfit',
    bodyFont: 'outfit',
  },
  swiss: {
    background: '#ffffff',
    bgImage: 'none',
    text: '#0a0a0a',
    muted: '#3f3f46',
    heading: '#0a0a0a',
    accent: '#e30613',
    codeBg: '#f2f2f2',
    headingFont: 'outfit',
    bodyFont: 'outfit',
  },
  noir: {
    background: '#050505',
    bgImage: 'radial-gradient(ellipse at center, #161616 0%, #070707 62%, #000 100%)',
    text: '#f3e6cc',
    muted: '#c4b08a',
    heading: '#f7e7c4',
    accent: '#d4af37',
    codeBg: '#121212',
    headingFont: 'fraunces',
    bodyFont: 'outfit',
  },
  ocean: {
    background: '#021822',
    bgImage:
      'radial-gradient(1100px 640px at 85% 120%, rgba(45, 212, 191, 0.2), transparent 50%), radial-gradient(800px 480px at 0% -10%, rgba(8, 47, 73, 0.9), transparent 55%), linear-gradient(180deg, #032433 0%, #021018 100%)',
    text: '#e6f7f4',
    muted: '#9ec9c4',
    heading: '#f4fffd',
    accent: '#2dd4bf',
    codeBg: '#052029',
    headingFont: 'fraunces',
    bodyFont: 'outfit',
  },
  ember: {
    background: '#140c09',
    bgImage:
      'radial-gradient(900px 520px at 100% 110%, rgba(249, 115, 22, 0.28), transparent 52%), radial-gradient(600px 380px at 0% 0%, rgba(127, 29, 29, 0.32), transparent 48%), linear-gradient(180deg, #1a100c 0%, #0c0706 100%)',
    text: '#f8e8d8',
    muted: '#d9b49a',
    heading: '#fff3e8',
    accent: '#f97316',
    codeBg: '#22140e',
    headingFont: 'fraunces',
    bodyFont: 'outfit',
  },
}

export const STYLE_FRONTMATTER_KEYS = [
  'background',
  'text',
  'muted',
  'headingColor',
  'accent',
  'codeBg',
  'headingFont',
  'bodyFont',
] as const

export type FrontmatterPatch = {
  [K in keyof DeckMeta]?: DeckMeta[K] | ''
}

export function clearStylePatch(): FrontmatterPatch {
  return {
    background: '',
    text: '',
    muted: '',
    headingColor: '',
    accent: '',
    codeBg: '',
    headingFont: '',
    bodyFont: '',
  }
}

export function hasStyleOverrides(meta: DeckMeta): boolean {
  return STYLE_FRONTMATTER_KEYS.some((key) => Boolean(meta[key]))
}

export function resolveSlideStyle(meta: DeckMeta, theme: ThemeId): SlideStyle {
  const base = THEME_PRESETS[theme]
  const background = meta.background || base.background
  return {
    background,
    bgImage: meta.background ? 'none' : base.bgImage,
    text: meta.text || base.text,
    muted: meta.muted || base.muted,
    heading: meta.headingColor || base.heading,
    accent: meta.accent || base.accent,
    codeBg: meta.codeBg || base.codeBg,
    headingFont: meta.headingFont || base.headingFont,
    bodyFont: meta.bodyFont || base.bodyFont,
  }
}

export function slideStyleVars(style: SlideStyle): Record<string, string> {
  return {
    '--slide-bg': style.background,
    '--slide-bg-image': style.bgImage,
    '--slide-text': style.text,
    '--slide-muted': style.muted,
    '--slide-heading': style.heading,
    '--slide-accent': style.accent,
    '--slide-code-bg': style.codeBg,
    '--slide-heading-font': FONT_STACKS[style.headingFont],
    '--slide-body-font': FONT_STACKS[style.bodyFont],
  }
}

export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim())
}

export function toColorInput(value: string): string {
  const hex = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    const [, r, g, b] = hex
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return '#888888'
}

export function parseFont(value: string): FontId | undefined {
  return isFontId(value) ? value : undefined
}
