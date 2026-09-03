import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { slideSize, type AspectId, type LayoutId, type ThemeId } from '../types'

type Props = {
  html: string
  layout: LayoutId
  theme: ThemeId
  aspect: AspectId
  className?: string
  fitWidth?: number
  fitHeight?: number
  vars?: Record<string, string>
}

export function ScaledSlide({ html, layout, theme, aspect, className, fitWidth, fitHeight, vars }: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const { w, h } = slideSize(aspect)
  const fittedScale =
    fitWidth != null ? Math.min(fitWidth / w, (fitHeight ?? fitWidth) / h) : null
  const [observedScale, setObservedScale] = useState(0.2)
  const scale = fittedScale ?? observedScale

  useLayoutEffect(() => {
    if (fittedScale != null) return
    const el = outerRef.current
    if (!el) return
    const fit = () => {
      const rect = el.getBoundingClientRect()
      const next = Math.min(rect.width / w, rect.height / h)
      setObservedScale(Number.isFinite(next) && next > 0 ? next : 0.1)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [w, h, fittedScale])

  return (
    <div
      ref={outerRef}
      className={`slide-stage theme-${theme}${className ? ` ${className}` : ''}`}
      style={vars as CSSProperties | undefined}
    >
      <div className="slide-scaler" style={{ width: w * scale, height: h * scale }}>
        <div className={`slide layout-${layout}`} style={{ width: w, height: h, transform: `scale(${scale})` }}>
          <div className="slide-inner" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  )
}
