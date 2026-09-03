import { useEffect, useRef } from 'react'
import type { AspectId, Slide, ThemeId } from '../types'
import { ScaledSlide } from './ScaledSlide'

type Props = {
  slides: Slide[]
  activeIndex: number
  theme: ThemeId
  aspect: AspectId
  vars?: Record<string, string>
  onSelect: (index: number) => void
}

export function Filmstrip({ slides, activeIndex, theme, aspect, vars, onSelect }: Props) {
  const listRef = useRef<HTMLElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const list = listRef.current
    const thumb = activeRef.current
    if (!list || !thumb) return
    const listRect = list.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    if (thumbRect.top < listRect.top) {
      list.scrollTop -= listRect.top - thumbRect.top
    } else if (thumbRect.bottom > listRect.bottom) {
      list.scrollTop += thumbRect.bottom - listRect.bottom
    }
  }, [activeIndex])

  return (
    <nav ref={listRef} className="filmstrip" aria-label="Slides">
      {slides.map((slide) => (
        <button
          key={slide.index}
          type="button"
          ref={slide.index === activeIndex ? activeRef : undefined}
          className={`thumb${slide.index === activeIndex ? ' active' : ''}`}
          onClick={() => onSelect(slide.index)}
        >
          <div className="thumb-frame">
            <ScaledSlide
              html={slide.html}
              layout={slide.layout}
              theme={theme}
              aspect={aspect}
              vars={vars}
              fitWidth={172}
              fitHeight={96}
            />
          </div>
          <div className="thumb-caption">
            <b>{slide.index + 1}</b>
            <span>{slide.title}</span>
          </div>
        </button>
      ))}
    </nav>
  )
}
