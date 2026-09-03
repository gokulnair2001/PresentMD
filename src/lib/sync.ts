import type { AspectId, ThemeId } from '../types'

export const DRAFT_KEY = 'presentmd.draft'
export const SYNC_KEY = 'presentmd.sync'
export const CHANNEL_NAME = 'presentmd-live'

export type DraftState = {
  raw: string
  fileName: string
  index: number
}

export type SyncPayload = {
  raw: string
  index: number
  theme: ThemeId
  aspect: AspectId
  blackout: boolean
  startedAt: number
}

export type SyncMessage =
  | { type: 'hello' }
  | { type: 'state'; payload: SyncPayload }
  | { type: 'index'; index: number }
  | { type: 'blackout'; value: boolean }
  | { type: 'exit' }

export function readDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DraftState
    if (typeof parsed.raw !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function writeDraft(draft: DraftState): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function readSync(): SyncPayload | null {
  try {
    const raw = localStorage.getItem(SYNC_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SyncPayload
  } catch {
    return null
  }
}

export function writeSync(payload: SyncPayload): void {
  localStorage.setItem(SYNC_KEY, JSON.stringify(payload))
}

export function openSyncChannel(onMessage: (message: SyncMessage) => void): {
  post: (message: SyncMessage) => void
  close: () => void
} {
  const channel = new BroadcastChannel(CHANNEL_NAME)
  const handler = (event: MessageEvent<SyncMessage>) => {
    if (event.data && typeof event.data === 'object' && 'type' in event.data) {
      onMessage(event.data)
    }
  }
  channel.addEventListener('message', handler)
  return {
    post: (message) => channel.postMessage(message),
    close: () => {
      channel.removeEventListener('message', handler)
      channel.close()
    },
  }
}
