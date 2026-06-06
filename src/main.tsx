import React from 'react'
import ReactDOM from 'react-dom/client'
import { Download, FilePlus2, Upload } from 'lucide-react'
import { Tldraw, createTLStore, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import './styles.css'

const STORAGE_KEY = 'drawing-tldraw-document'
const store = createTLStore()

const savedSnapshot = localStorage.getItem(STORAGE_KEY)
if (savedSnapshot) {
  try {
    loadSnapshot(store, JSON.parse(savedSnapshot))
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function saveSnapshot() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSnapshot(store)))
}

store.listen(saveSnapshot, { scope: 'document' })

function resetBoard() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

function downloadBoard() {
  const payload = JSON.stringify(getSnapshot(store), null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `drawing-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function importBoard(file: File) {
    try {
      const snapshot = JSON.parse(await file.text())
      loadSnapshot(store, snapshot)
      saveSnapshot()
    } catch {
      window.alert('Ne mogu da ucitam ovaj fajl. Izaberi JSON export iz ove aplikacije.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <main className="app">
      <section className="canvas-shell" aria-label="Drawing canvas">
        <Tldraw store={store} />

        <nav className="actions" aria-label="Drawing actions">
          <input
            ref={fileInputRef}
            className="file-input"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]

              if (file) {
                void importBoard(file)
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
          >
            <Upload size={18} aria-hidden="true" />
            <span>Import</span>
          </button>
          <button type="button" onClick={downloadBoard} title="Download JSON">
            <Download size={18} aria-hidden="true" />
            <span>Download</span>
          </button>
          <button type="button" onClick={resetBoard} title="New board">
            <FilePlus2 size={18} aria-hidden="true" />
            <span>New</span>
          </button>
        </nav>
      </section>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
