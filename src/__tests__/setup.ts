/**
 * Node 26 ships its own `localStorage` global that throws unless the process
 * was started with `--localstorage-file`. It shadows the jsdom implementation,
 * leaving `window.localStorage` undefined under the jsdom environment. Install
 * a minimal in-memory Storage so tests exercise the real storage code paths.
 */
class MemoryStorage implements Storage {
  #items = new Map<string, string>()

  get length(): number {
    return this.#items.size
  }

  key(index: number): string | null {
    return [...this.#items.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    return this.#items.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.#items.set(key, String(value))
  }

  removeItem(key: string): void {
    this.#items.delete(key)
  }

  clear(): void {
    this.#items.clear()
  }
}

for (const target of [globalThis, globalThis.window]) {
  if (!target) continue
  Object.defineProperty(target, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}
