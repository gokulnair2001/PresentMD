import { THEME_OPTIONS, type FontId, type ThemeId } from '../types'
import {
  FONT_OPTIONS,
  THEME_PRESETS,
  isHexColor,
  toColorInput,
  type SlideStyle,
} from '../lib/theme'
import type { FrontmatterPatch } from '../lib/theme'

type Props = {
  theme: ThemeId
  style: SlideStyle
  metaHasOverrides: boolean
  onPreset: (theme: ThemeId) => void
  onPatch: (patch: FrontmatterPatch) => void
  onReset: () => void
}

export function ThemeEditor({ theme, style, metaHasOverrides, onPreset, onPatch, onReset }: Props) {
  return (
    <aside className="theme-editor" aria-label="Theme editor">
      <div className="theme-editor-head">
        <h2>Theme</h2>
        {metaHasOverrides ? (
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>
      <p className="theme-editor-hint">Start from a preset, then tune the slide. Changes live in the markdown.</p>
      <div className="preset-grid">
        {THEME_OPTIONS.map((option) => {
          const preset = THEME_PRESETS[option.id]
          return (
            <button
              key={option.id}
              type="button"
              className={`preset-chip${theme === option.id ? ' active' : ''}`}
              style={{ background: preset.background, color: preset.heading }}
              title={option.hint}
              onClick={() => onPreset(option.id)}
            >
              <span className="preset-chip-bar" style={{ background: preset.accent }} />
              {option.label}
            </button>
          )
        })}
      </div>
      <div className="theme-section">Colors</div>
      <ColorField label="Background" value={style.background} onChange={(value) => onPatch({ background: value })} />
      <ColorField label="Heading" value={style.heading} onChange={(value) => onPatch({ headingColor: value })} />
      <ColorField label="Body" value={style.muted} onChange={(value) => onPatch({ muted: value })} />
      <ColorField label="Text" value={style.text} onChange={(value) => onPatch({ text: value })} />
      <ColorField label="Accent" value={style.accent} onChange={(value) => onPatch({ accent: value })} />
      <ColorField label="Code" value={style.codeBg} onChange={(value) => onPatch({ codeBg: value })} />
      <div className="theme-section">Type</div>
      <label className="theme-font">
        <span>Heading</span>
        <select
          className="select"
          value={style.headingFont}
          onChange={(event) => onPatch({ headingFont: event.target.value as FontId })}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <label className="theme-font">
        <span>Body</span>
        <select
          className="select"
          value={style.bodyFont}
          onChange={(event) => onPatch({ bodyFont: event.target.value as FontId })}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="theme-color">
      <span>{label}</span>
      <span className="theme-color-controls">
        <input
          type="color"
          value={toColorInput(value)}
          aria-label={`${label} color`}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          type="text"
          spellCheck={false}
          defaultValue={value}
          key={value}
          onBlur={(event) => {
            const next = event.target.value.trim()
            if (isHexColor(next)) onChange(next)
          }}
        />
      </span>
    </label>
  )
}
