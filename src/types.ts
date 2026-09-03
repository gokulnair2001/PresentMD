export const THEMES = ['editorial', 'light', 'dark', 'technical', 'swiss', 'noir', 'ocean', 'ember'] as const
export type ThemeId = (typeof THEMES)[number]

export const ASPECTS = ['16:9', '4:3'] as const
export type AspectId = (typeof ASPECTS)[number]

export const LAYOUTS = ['default', 'title', 'section', 'quote', 'split'] as const
export type LayoutId = (typeof LAYOUTS)[number]

export const FONTS = ['outfit', 'fraunces', 'source-serif', 'jetbrains', 'georgia', 'system'] as const
export type FontId = (typeof FONTS)[number]

export type DeckMeta = {
  title?: string
  author?: string
  theme?: ThemeId
  aspect?: AspectId
  background?: string
  text?: string
  muted?: string
  headingColor?: string
  accent?: string
  codeBg?: string
  headingFont?: FontId
  bodyFont?: FontId
}

export type Slide = {
  index: number
  markdown: string
  html: string
  notes: string
  layout: LayoutId
  start: number
  end: number
  title: string
}

export type Deck = {
  meta: DeckMeta
  slides: Slide[]
  raw: string
}

export const THEME_OPTIONS: { id: ThemeId; label: string; hint: string }[] = [
  { id: 'editorial', label: 'Editorial', hint: 'Paper, ink, magazine' },
  { id: 'light', label: 'Light', hint: 'Cool and precise' },
  { id: 'dark', label: 'Dark', hint: 'Violet night' },
  { id: 'technical', label: 'Technical', hint: 'HUD and grid' },
  { id: 'swiss', label: 'Swiss', hint: 'Poster, red, type' },
  { id: 'noir', label: 'Noir', hint: 'Cinema and gold' },
  { id: 'ocean', label: 'Ocean', hint: 'Deep water' },
  { id: 'ember', label: 'Ember', hint: 'Firelight' },
]

export function slideSize(aspect: AspectId): { w: number; h: number } {
  return aspect === '4:3' ? { w: 1600, h: 1200 } : { w: 1920, h: 1080 }
}

export function isThemeId(value: string): value is ThemeId {
  return (THEMES as readonly string[]).includes(value)
}

export function isAspectId(value: string): value is AspectId {
  return (ASPECTS as readonly string[]).includes(value)
}

export function isFontId(value: string): value is FontId {
  return (FONTS as readonly string[]).includes(value)
}

export function isLayoutId(value: string): value is LayoutId {
  return (LAYOUTS as readonly string[]).includes(value)
}
