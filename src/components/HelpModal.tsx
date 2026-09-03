type Props = {
  onClose: () => void
}

export function HelpModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="help-title">Write slides in markdown</h2>
        <ul className="guide">
          <li>
            Split slides with a line that is only <code>---</code>
          </li>
          <li>
            Optional frontmatter: <code>title</code>, <code>theme</code>, <code>aspect</code>
          </li>
          <li>
            Customize colors and fonts from <strong>Customize</strong> — they are stored in the markdown
          </li>
          <li>
            Speaker notes: a <code>???</code> line, or <code>Note:</code>
          </li>
          <li>
            Layouts: <code>&lt;!-- layout: title | section | quote | split --&gt;</code>
          </li>
          <li>
            In a split slide, divide columns with a line that is only <code>--</code>
          </li>
          <li>
            <kbd>⌘/Ctrl</kbd>+<kbd>Enter</kbd> present · <kbd>⌘/Ctrl</kbd>+<kbd>S</kbd> save
          </li>
        </ul>
        <p style={{ margin: '16px 0 0' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </p>
      </div>
    </div>
  )
}
