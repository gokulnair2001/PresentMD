import CodeMirror, { EditorView, type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { useEffect, useMemo, useRef } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  onCursorOffset: (offset: number) => void
  cursorJump: { token: number; offset: number } | null
}

const cmTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      color: '#d8dce8',
      height: '100%',
      fontSize: '14.5px',
    },
    '.cm-scroller': {
      fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      lineHeight: '1.65',
      overscrollBehavior: 'contain',
    },
    '.cm-content': { padding: '18px 18px 40vh 8px' },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4a5168',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.035)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent' },
    '.cm-cursor': { borderLeftColor: '#e7a23b' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(231, 162, 59, 0.22)',
    },
  },
  { dark: true },
)

const cmHighlight = HighlightStyle.define([
  { tag: tags.heading, color: '#f0d3a0', fontWeight: '700' },
  { tag: tags.heading1, color: '#fff6e8' },
  { tag: tags.strong, color: '#f3e6c8', fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.keyword, color: '#e7a23b' },
  { tag: tags.url, color: '#7cb8ff' },
  { tag: tags.link, color: '#7cb8ff' },
  { tag: tags.comment, color: '#6b7390', fontStyle: 'italic' },
  { tag: tags.processingInstruction, color: '#8b90a0' },
  { tag: tags.monospace, color: '#b6f0d0' },
  { tag: tags.string, color: '#b6f0d0' },
  { tag: tags.meta, color: '#9096a8' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
])

export function EditorPane({ value, onChange, onCursorOffset, cursorJump }: Props) {
  const ref = useRef<ReactCodeMirrorRef>(null)
  const extensions = useMemo(
    () => [markdown(), cmTheme, syntaxHighlighting(cmHighlight), EditorView.lineWrapping],
    [],
  )

  useEffect(() => {
    const view = ref.current?.view
    if (!cursorJump || !view) return
    const offset = Math.max(0, Math.min(cursorJump.offset, view.state.doc.length))
    view.dispatch({
      selection: { anchor: offset },
      effects: EditorView.scrollIntoView(offset, { y: 'start' }),
    })
    view.contentDOM.focus({ preventScroll: true })
  }, [cursorJump])

  return (
    <div className="editor-pane">
      <CodeMirror
        ref={ref}
        value={value}
        height="100%"
        theme="none"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: false,
          searchKeymap: true,
        }}
        extensions={extensions}
        onChange={onChange}
        onUpdate={(update) => {
          if (update.selectionSet) onCursorOffset(update.state.selection.main.head)
        }}
      />
    </div>
  )
}
