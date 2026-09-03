import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EditorPane } from './components/EditorPane'
import { Filmstrip } from './components/Filmstrip'
import { HelpModal } from './components/HelpModal'
import { PresentMode } from './components/PresentMode'
import { PresenterView } from './components/PresenterView'
import { ScaledSlide } from './components/ScaledSlide'
import { Toolbar } from './components/Toolbar'
import { ThemeEditor } from './components/ThemeEditor'
import { exportStandaloneHtml } from './lib/exportHtml'
import { isMarkdownFile, openMarkdownFile, saveMarkdownFile, type MdFileHandle } from './lib/fileAccess'
import { parseDeck, resolveAspect, resolveTheme, slideIndexAtOffset, upsertFrontmatter } from './lib/parseDeck'
import { openSyncChannel, readDraft, readSync, writeDraft, writeSync, type SyncPayload } from './lib/sync'
import {
  clearStylePatch,
  hasStyleOverrides,
  resolveSlideStyle,
  slideStyleVars,
  type FrontmatterPatch,
} from './lib/theme'
import sample from './samples/welcome.md?raw'
import type { AspectId, ThemeId } from './types'

type AppMode = 'edit' | 'present' | 'presenter'

function modeFromHash(hash: string): AppMode {
  if (hash === '#present') return 'present'
  if (hash === '#presenter') return 'presenter'
  return 'edit'
}

const initialDraft = readDraft()
const initialSync = readSync()
const bootPresenter = typeof window !== 'undefined' && modeFromHash(window.location.hash) === 'presenter'
const bootState = bootPresenter ? initialSync : null

export default function App() {
  const [raw, setRaw] = useState(bootState?.raw ?? initialDraft?.raw ?? sample)
  const [fileName, setFileName] = useState(initialDraft?.fileName ?? 'welcome.md')
  const [savedRaw, setSavedRaw] = useState(initialDraft ? initialDraft.raw : sample)
  const [index, setIndex] = useState(bootState?.index ?? initialDraft?.index ?? 0)
  const [handle, setHandle] = useState<MdFileHandle | null>(null)
  const [mode, setMode] = useState<AppMode>(() => modeFromHash(window.location.hash))
  const [blackout, setBlackout] = useState(bootState?.blackout ?? false)
  const [help, setHelp] = useState(false)
  const [dropping, setDropping] = useState(false)
  const [status, setStatus] = useState('')
  const [startedAt, setStartedAt] = useState(bootState?.startedAt ?? initialSync?.startedAt ?? 0)
  const [cursorJump, setCursorJump] = useState<{ token: number; offset: number } | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)

  const dropDepth = useRef(0)
  const channelRef = useRef<ReturnType<typeof openSyncChannel> | null>(null)
  const indexRef = useRef(index)
  const rawRef = useRef(raw)
  const modeRef = useRef(mode)
  const blackoutRef = useRef(blackout)
  const startedAtRef = useRef(startedAt)

  const deck = useMemo(() => parseDeck(raw), [raw])
  const theme = resolveTheme(deck.meta, null)
  const aspect = resolveAspect(deck.meta, null)
  const slideStyle = useMemo(() => resolveSlideStyle(deck.meta, theme), [deck.meta, theme])
  const slideVars = useMemo(() => slideStyleVars(slideStyle), [slideStyle])
  const themeDirty = hasStyleOverrides(deck.meta)
  const dirty = raw !== savedRaw
  const safeIndex = Math.min(index, Math.max(0, deck.slides.length - 1))
  const slide = deck.slides[safeIndex] ?? deck.slides[0]
  const isLeader = mode !== 'presenter'

  useLayoutEffect(() => {
    indexRef.current = index
    rawRef.current = raw
    modeRef.current = mode
    blackoutRef.current = blackout
    startedAtRef.current = startedAt
  })

  const flash = useCallback((message: string) => {
    setStatus(message)
    window.setTimeout(() => setStatus(''), 2200)
  }, [])

  const currentPayload = useCallback(
    (overrides?: Partial<SyncPayload>): SyncPayload => ({
      raw: rawRef.current,
      index: indexRef.current,
      theme,
      aspect,
      blackout: blackoutRef.current,
      startedAt: startedAtRef.current,
      ...overrides,
    }),
    [theme, aspect],
  )

  const goTo = useCallback(
    (next: number, broadcast = true) => {
      const clamped = Math.max(0, Math.min(deck.slides.length - 1, next))
      setIndex(clamped)
      if (broadcast) {
        const payload = currentPayload({ index: clamped })
        writeSync(payload)
        channelRef.current?.post({ type: 'index', index: clamped })
      }
    },
    [deck.slides.length, currentPayload],
  )

  const toggleBlackout = useCallback(
    (value?: boolean, broadcast = true) => {
      setBlackout((current) => {
        const next = value ?? !current
        if (broadcast) channelRef.current?.post({ type: 'blackout', value: next })
        return next
      })
    },
    [],
  )

  const exitPresent = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    if (window.location.hash) window.location.hash = ''
    setMode('edit')
    channelRef.current?.post({ type: 'exit' })
  }, [])

  const enterPresent = useCallback(() => {
    const started = Date.now()
    setStartedAt(started)
    setBlackout(false)
    writeSync(currentPayload({ startedAt: started, blackout: false }))
    window.location.hash = 'present'
    setMode('present')
    void document.documentElement.requestFullscreen().catch(() => undefined)
  }, [currentPayload])

  const openSpeaker = useCallback(() => {
    writeSync(currentPayload())
    channelRef.current?.post({ type: 'state', payload: currentPayload() })
    window.open(
      `${window.location.pathname}${window.location.search}#presenter`,
      'presentmd-speaker',
      'popup,width=1440,height=900',
    )
  }, [currentPayload])

  const presentWithNotes = useCallback(() => {
    openSpeaker()
    enterPresent()
  }, [openSpeaker, enterPresent])

  const applyOpenedFile = useCallback((name: string, text: string, fileHandle: MdFileHandle | null) => {
    setRaw(text)
    setSavedRaw(text)
    setFileName(name)
    setHandle(fileHandle)
    setIndex(0)
    flash(`Opened ${name}`)
  }, [flash])

  const openFile = useCallback(async () => {
    if (dirty && !window.confirm('Discard unsaved changes and open another file?')) return
    const result = await openMarkdownFile()
    if (!result) return
    applyOpenedFile(result.name, result.text, result.handle)
  }, [applyOpenedFile, dirty])

  const saveFile = useCallback(async () => {
    const result = await saveMarkdownFile(handle, fileName, raw)
    if (!result.saved) return
    setHandle(result.handle)
    if (result.handle?.name) setFileName(result.handle.name)
    setSavedRaw(raw)
    flash(result.handle ? 'Saved' : 'Downloaded')
  }, [fileName, flash, handle, raw])

  const loadSample = useCallback(() => {
    if (dirty && !window.confirm('Replace the current deck with the sample?')) return
    setRaw(sample)
    setSavedRaw(sample)
    setFileName('welcome.md')
    setHandle(null)
    setIndex(0)
    flash('Loaded sample')
  }, [dirty, flash])

  const setTheme = useCallback((next: ThemeId) => {
    setRaw((current) => upsertFrontmatter(current, { theme: next, ...clearStylePatch() }))
  }, [])

  const setAspect = useCallback((next: AspectId) => {
    setRaw((current) => upsertFrontmatter(current, { aspect: next }))
  }, [])

  const patchStyle = useCallback((patch: FrontmatterPatch) => {
    setRaw((current) => upsertFrontmatter(current, patch))
  }, [])

  const resetStyle = useCallback(() => {
    setRaw((current) => upsertFrontmatter(current, clearStylePatch()))
  }, [])

  const exportHtml = useCallback(() => {
    exportStandaloneHtml(deck, theme, aspect, fileName, slideVars)
    flash('Exported HTML')
  }, [aspect, deck, fileName, flash, theme, slideVars])

  const selectSlide = useCallback(
    (next: number) => {
      goTo(next)
      const target = deck.slides[next]
      if (!target) return
      const leading = target.markdown.length === 0 ? 0 : raw.slice(target.start).match(/^\s*/)?.[0].length ?? 0
      setCursorJump({ token: Date.now(), offset: target.start + leading })
    },
    [deck.slides, goTo, raw],
  )

  const onCursorOffset = useCallback(
    (offset: number) => {
      const next = slideIndexAtOffset(deck, offset)
      if (next !== indexRef.current) setIndex(next)
    },
    [deck],
  )

  useEffect(() => {
    const onHash = () => setMode(modeFromHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => writeDraft({ raw, fileName, index: safeIndex }), 400)
    return () => window.clearTimeout(id)
  }, [raw, fileName, safeIndex])

  useEffect(() => {
    if (!isLeader) return
    const id = window.setTimeout(() => {
      const payload = currentPayload()
      writeSync(payload)
      channelRef.current?.post({ type: 'state', payload })
    }, 200)
    return () => window.clearTimeout(id)
  }, [raw, index, theme, aspect, blackout, startedAt, isLeader, currentPayload])

  useEffect(() => {
    const channel = openSyncChannel((message) => {
      if (message.type === 'hello' && modeRef.current !== 'presenter') {
        const payload = currentPayload()
        writeSync(payload)
        channel.post({ type: 'state', payload })
        return
      }
      if (message.type === 'state' && modeRef.current === 'presenter') {
        setRaw(message.payload.raw)
        setIndex(message.payload.index)
        setBlackout(message.payload.blackout)
        setStartedAt(message.payload.startedAt)
        return
      }
      if (message.type === 'index') {
        setIndex(message.index)
        return
      }
      if (message.type === 'blackout') {
        setBlackout(message.value)
        return
      }
      if (message.type === 'exit' && modeRef.current === 'present') {
        exitPresent()
      }
    })
    channelRef.current = channel
    if (modeFromHash(window.location.hash) === 'presenter') {
      channel.post({ type: 'hello' })
    }
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [currentPayload, exitPresent])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || mode === 'presenter') return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty, mode])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (modeRef.current !== 'edit') return
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void saveFile()
      } else if (mod && event.key.toLowerCase() === 'o') {
        event.preventDefault()
        void openFile()
      } else if (mod && event.key === 'Enter') {
        event.preventDefault()
        presentWithNotes()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openFile, presentWithNotes, saveFile])

  useEffect(() => {
    const hasFiles = (event: DragEvent) => Boolean(event.dataTransfer?.types.includes('Files'))
    const onEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      dropDepth.current += 1
      setDropping(true)
    }
    const onOver = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
    }
    const onLeave = (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      dropDepth.current = Math.max(0, dropDepth.current - 1)
      if (dropDepth.current === 0) setDropping(false)
    }
    const onDrop = async (event: DragEvent) => {
      event.preventDefault()
      dropDepth.current = 0
      setDropping(false)
      const file = event.dataTransfer?.files[0]
      if (!file || !isMarkdownFile(file)) {
        flash('Drop a .md file')
        return
      }
      if (dirty && !window.confirm('Discard unsaved changes and open the dropped file?')) return
      applyOpenedFile(file.name, await file.text(), null)
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragover', onOver)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [applyOpenedFile, dirty, flash])

  if (mode === 'present') {
    return (
      <PresentMode
        deck={deck}
        index={safeIndex}
        theme={theme}
        aspect={aspect}
        vars={slideVars}
        blackout={blackout}
        onIndex={(next) => goTo(next)}
        onBlackout={(value) => toggleBlackout(value)}
        onExit={exitPresent}
        onSpeaker={openSpeaker}
      />
    )
  }

  if (mode === 'presenter') {
    return (
      <PresenterView
        deck={deck}
        index={safeIndex}
        theme={theme}
        aspect={aspect}
        vars={slideVars}
        startedAt={startedAt}
        onIndex={(next) => goTo(next)}
        onBlackout={() => toggleBlackout()}
      />
    )
  }

  return (
    <div className="shell">
      <Toolbar
        fileName={fileName}
        dirty={dirty}
        theme={theme}
        aspect={aspect}
        status={status}
        onOpen={() => void openFile()}
        onSave={() => void saveFile()}
        onSample={loadSample}
        onTheme={setTheme}
        onAspect={setAspect}
        themeOpen={themeOpen}
        themeDirty={themeDirty}
        onToggleTheme={() => setThemeOpen((open) => !open)}
        onPresent={presentWithNotes}
        onSpeaker={openSpeaker}
        onExport={exportHtml}
        onHelp={() => setHelp(true)}
      />
      <div className={`workspace${themeOpen ? ' theme-open' : ''}`}>
        <EditorPane
          value={raw}
          onChange={setRaw}
          onCursorOffset={onCursorOffset}
          cursorJump={cursorJump}
        />
        <div className="preview-pane">
          <div className="preview-well">
            {slide ? (
              <ScaledSlide
                html={slide.html}
                layout={slide.layout}
                theme={theme}
                aspect={aspect}
                vars={slideVars}
              />
            ) : null}
          </div>
          <div className="notes-pane">
            <div className="notes-label">Speaker notes</div>
            <div className={`notes-body${slide?.notes ? '' : ' empty'}`}>
              {slide?.notes || 'No notes on this slide. Add a ??? section in the markdown.'}
            </div>
          </div>
        </div>
        {themeOpen ? (
          <ThemeEditor
            theme={theme}
            style={slideStyle}
            metaHasOverrides={themeDirty}
            onPreset={setTheme}
            onPatch={patchStyle}
            onReset={resetStyle}
          />
        ) : null}
        <Filmstrip
          slides={deck.slides}
          activeIndex={slide?.index ?? 0}
          theme={theme}
          aspect={aspect}
          vars={slideVars}
          onSelect={selectSlide}
        />
      </div>
      {dropping ? <div className="drop-overlay">Drop markdown to open</div> : null}
      {help ? <HelpModal onClose={() => setHelp(false)} /> : null}
    </div>
  )
}
