export type MdFileHandle = {
  name: string
  getFile: () => Promise<File>
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>
    close: () => Promise<void>
  }>
}

export type SaveResult = { saved: false } | { saved: true; handle: MdFileHandle | null }

type FilePickerWindow = Window & {
  showOpenFilePicker?: (options: {
    multiple?: boolean
    types?: { description: string; accept: Record<string, string[]> }[]
  }) => Promise<MdFileHandle[]>
  showSaveFilePicker?: (options: {
    suggestedName?: string
    types?: { description: string; accept: Record<string, string[]> }[]
  }) => Promise<MdFileHandle>
}

const ACCEPT = {
  description: 'Markdown',
  accept: { 'text/markdown': ['.md', '.markdown', '.txt'] },
}

export async function openMarkdownFile(): Promise<{
  handle: MdFileHandle | null
  name: string
  text: string
} | null> {
  const w = window as FilePickerWindow
  if (w.showOpenFilePicker) {
    try {
      const [handle] = await w.showOpenFilePicker({ types: [ACCEPT] })
      const file = await handle.getFile()
      return { handle, name: file.name, text: await file.text() }
    } catch (error) {
      if (isAbort(error)) return null
      throw error
    }
  }
  return openWithInput()
}

export async function saveMarkdownFile(
  handle: MdFileHandle | null,
  name: string,
  text: string,
): Promise<SaveResult> {
  const w = window as FilePickerWindow
  if (handle) {
    const writable = await handle.createWritable()
    await writable.write(text)
    await writable.close()
    return { saved: true, handle }
  }
  if (w.showSaveFilePicker) {
    try {
      const next = await w.showSaveFilePicker({
        suggestedName: name.endsWith('.md') ? name : `${name || 'deck'}.md`,
        types: [ACCEPT],
      })
      const writable = await next.createWritable()
      await writable.write(text)
      await writable.close()
      return { saved: true, handle: next }
    } catch (error) {
      if (isAbort(error)) return { saved: false }
      throw error
    }
  }
  downloadText(name.endsWith('.md') ? name : `${name || 'deck'}.md`, text)
  return { saved: true, handle: null }
}

export function downloadText(filename: string, text: string, mime = 'text/markdown'): void {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function isMarkdownFile(file: File): boolean {
  return (
    /\.(md|markdown|txt)$/i.test(file.name) ||
    file.type === 'text/markdown' ||
    file.type === 'text/plain'
  )
}

function openWithInput(): Promise<{ handle: null; name: string; text: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt,text/markdown'
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      resolve({ handle: null, name: file.name, text: await file.text() })
    })
    input.click()
  })
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
