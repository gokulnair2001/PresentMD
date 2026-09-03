import { useEffect, useState } from 'react'
import type { AspectId, Deck, ThemeId } from '../types'
import { ScaledSlide } from './ScaledSlide'

type Props = {
  deck: Deck
  index: number
  theme: ThemeId
  aspect: AspectId
  vars?: Record<string, string>
  blackout: boolean
  onIndex: (index: number) => void
  onBlackout: (value: boolean) => void
  onExit: () => void
  onSpeaker: () => void
}

export function PresentMode({
  deck,
  index,
  theme,
  aspect,
  vars,
  blackout,
  onIndex,
  onBlackout,
  onExit,
  onSpeaker,
}: Props) {
  const [overview, setOverview] = useState(false)
  const [help, setHelp] = useState(false)
  const [hint, setHint] = useState(true)
  const slide = deck.slides[index] ?? deck.slides[0]
  const total = deck.slides.length

  useEffect(() => {
    const timer = window.setTimeout(() => setHint(false), 2800)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (help && event.key !== 'Escape' && event.key !== '?') return
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        onIndex(Math.min(total - 1, index + 1))
        setOverview(false)
        onBlackout(false)
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp' || event.key === 'Backspace') {
        event.preventDefault()
        onIndex(Math.max(0, index - 1))
        setOverview(false)
        onBlackout(false)
      } else if (event.key === 'Home') onIndex(0)
      else if (event.key === 'End') onIndex(total - 1)
      else if (event.key === 'o' || event.key === 'O') setOverview((value) => !value)
      else if (event.key === 'b' || event.key === 'B' || event.key === '.') onBlackout(!blackout)
      else if (event.key === 'p' || event.key === 'P') onSpeaker()
      else if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      else if (event.key === '?') setHelp((value) => !value)
      else if (event.key === 'Escape') {
        if (help) setHelp(false)
        else if (overview) setOverview(false)
        else if (blackout) onBlackout(false)
        else onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, overview, help, blackout, onIndex, onBlackout, onExit, onSpeaker])

  if (!slide) return null

  return (
    <div
      className="theater"
      onClick={(event) => {
        if (overview) return
        if ((event.target as HTMLElement).closest('a')) return
        onIndex(Math.min(total - 1, index + 1))
      }}
    >
      <div className="theater-stage">
        <ScaledSlide html={slide.html} layout={slide.layout} theme={theme} aspect={aspect} vars={vars} />
      </div>
      <div className="theater-chrome">
        {index + 1} / {total}
      </div>
      <div className="theater-progress">
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      {hint ? <div className="hint">Press ? for shortcuts · Esc to exit</div> : null}
      {blackout ? (
        <div
          className="blackout-veil"
          onClick={(event) => {
            event.stopPropagation()
            onBlackout(false)
          }}
        />
      ) : null}
      {overview ? (
        <div className="overview-grid">
          {deck.slides.map((item) => (
            <button
              key={item.index}
              type="button"
              className={`overview-tile${item.index === index ? ' active' : ''}`}
              onClick={(event) => {
                event.stopPropagation()
                onIndex(item.index)
                setOverview(false)
              }}
            >
              <ScaledSlide
                html={item.html}
                layout={item.layout}
                theme={theme}
                aspect={aspect}
                vars={vars}
                fitWidth={280}
                fitHeight={148}
              />
            </button>
          ))}
        </div>
      ) : null}
      {help ? <HelpCard onClose={() => setHelp(false)} /> : null}
    </div>
  )
}

function HelpCard({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        event.stopPropagation()
        onClose()
      }}
    >
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Presentation shortcuts</h2>
        <ul className="guide">
          <li>
            <kbd>→</kbd> <kbd>Space</kbd> next slide
          </li>
          <li>
            <kbd>←</kbd> previous slide
          </li>
          <li>
            <kbd>O</kbd> overview grid
          </li>
          <li>
            <kbd>B</kbd> blackout
          </li>
          <li>
            <kbd>P</kbd> speaker view
          </li>
          <li>
            <kbd>F</kbd> fullscreen
          </li>
          <li>
            <kbd>Esc</kbd> back / exit
          </li>
        </ul>
      </div>
    </div>
  )
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    void document.documentElement.requestFullscreen().catch(() => undefined)
    return
  }
  void document.exitFullscreen()
}
