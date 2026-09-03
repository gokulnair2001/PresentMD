import { ASPECTS, THEME_OPTIONS, type AspectId, type ThemeId } from '../types'

type Props = {
  fileName: string
  dirty: boolean
  theme: ThemeId
  aspect: AspectId
  status: string
  onOpen: () => void
  onSave: () => void
  onSample: () => void
  onTheme: (theme: ThemeId) => void
  onAspect: (aspect: AspectId) => void
  themeOpen: boolean
  themeDirty: boolean
  onToggleTheme: () => void
  onPresent: () => void
  onSpeaker: () => void
  onExport: () => void
  onHelp: () => void
}

export function Toolbar({
  fileName,
  dirty,
  theme,
  aspect,
  status,
  onOpen,
  onSave,
  onSample,
  onTheme,
  onAspect,
  themeOpen,
  themeDirty,
  onToggleTheme,
  onPresent,
  onSpeaker,
  onExport,
  onHelp,
}: Props) {
  return (
    <header className="toolbar">
      <div className="brand">
        <BrandMark />
        <span className="brand-name">PresentMD</span>
      </div>
      <div className="file-meta">
        {dirty ? <span className="dirty-dot" title="Unsaved changes" /> : null}
        <strong title={fileName}>{fileName}</strong>
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-group">
        <button type="button" className="btn" onClick={onOpen}>
          Open
        </button>
        <button type="button" className="btn" onClick={onSave}>
          Save
        </button>
        <button type="button" className="btn btn-ghost" onClick={onSample}>
          Sample
        </button>
      </div>
      <div className="toolbar-group">
        <button
          type="button"
          className={`btn${themeOpen ? ' btn-primary' : ''}`}
          onClick={onToggleTheme}
        >
          {themeDirty ? <span className="dirty-dot" /> : null}
          Customize
        </button>
        <select
          className="select"
          value={theme}
          aria-label="Theme"
          onChange={(event) => onTheme(event.target.value as ThemeId)}
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={aspect}
          aria-label="Aspect ratio"
          onChange={(event) => onAspect(event.target.value as AspectId)}
        >
          {ASPECTS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="toolbar-group">
        <button type="button" className="btn" onClick={onExport}>
          Export
        </button>
        <button type="button" className="btn" onClick={onSpeaker}>
          Speaker
        </button>
        <button type="button" className="btn btn-primary" onClick={onPresent}>
          Present
        </button>
        <button type="button" className="btn btn-ghost" onClick={onHelp} aria-label="Help">
          ?
        </button>
      </div>
      {status ? <div className="status">{status}</div> : null}
    </header>
  )
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#1e2230" />
      <rect x="7" y="10" width="18" height="12" rx="2" fill="#e7a23b" />
      <rect x="9" y="8" width="14" height="12" rx="2" fill="#f3ead8" />
      <rect x="11" y="12" width="7" height="2" rx="1" fill="#1f1a12" />
      <rect x="11" y="16" width="10" height="1.6" rx="0.8" fill="#9a8f7a" />
    </svg>
  )
}
