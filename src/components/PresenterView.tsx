import { useEffect, useState } from 'react'
import { formatElapsed } from '../lib/format'
import type { AspectId, Deck, ThemeId } from '../types'
import { ScaledSlide } from './ScaledSlide'

type Props = {
  deck: Deck
  index: number
  theme: ThemeId
  aspect: AspectId
  vars?: Record<string, string>
  startedAt: number
  onIndex: (index: number) => void
  onBlackout: () => void
}

export function PresenterView({ deck, index, theme, aspect, vars, startedAt, onIndex, onBlackout }: Props) {
  const [now, setNow] = useState(() => Date.now())
  const slide = deck.slides[index]
  const next = deck.slides[index + 1]
  const total = deck.slides.length

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        onIndex(Math.min(total - 1, index + 1))
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp' || event.key === 'Backspace') {
        event.preventDefault()
        onIndex(Math.max(0, index - 1))
      } else if (event.key === 'Home') onIndex(0)
      else if (event.key === 'End') onIndex(total - 1)
      else if (event.key === 'b' || event.key === 'B' || event.key === '.') onBlackout()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, onIndex, onBlackout])

  if (!slide) return null

  return (
    <div className="speaker">
      <header className="toolbar">
        <div className="brand">
          <span className="brand-name">Speaker view</span>
        </div>
        <div className="file-meta">
          <strong>
            {index + 1} / {total}
          </strong>
        </div>
        <div className="toolbar-spacer" />
        <div className="clock">{formatElapsed(startedAt ? now - startedAt : 0)}</div>
        <button type="button" className="btn" onClick={() => onIndex(Math.max(0, index - 1))}>
          Previous
        </button>
        <button type="button" className="btn" onClick={() => onIndex(Math.min(total - 1, index + 1))}>
          Next
        </button>
        <button type="button" className="btn" onClick={onBlackout}>
          Blackout
        </button>
      </header>
      <div className="speaker-main">
        <div className="speaker-card">
          <label>Current</label>
          <ScaledSlide html={slide.html} layout={slide.layout} theme={theme} aspect={aspect} vars={vars} />
        </div>
        <div className="speaker-card">
          <label>Next</label>
          {next ? (
            <ScaledSlide html={next.html} layout={next.layout} theme={theme} aspect={aspect} vars={vars} />
          ) : (
            <p className="notes-body empty">Last slide</p>
          )}
        </div>
      </div>
      <div className="speaker-notes">
        <label className="notes-label">Notes</label>
        <p className={slide.notes ? undefined : 'empty'}>{slide.notes || 'No notes on this slide.'}</p>
      </div>
    </div>
  )
}
