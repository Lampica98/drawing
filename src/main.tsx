import React from 'react'
import ReactDOM from 'react-dom/client'
import { FilePlus2, Save, Upload } from 'lucide-react'
import { Tldraw, createTLStore, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import './styles.css'

const TLDRAW_LICENSE_KEY = import.meta.env.VITE_TLDRAW_LICENSE_KEY
const store = createTLStore()

function resetBoard() {
  window.location.reload()
}

async function saveBoard() {
  const payload = JSON.stringify(getSnapshot(store), null, 2)
  const filename = `drawing-${new Date().toISOString().slice(0, 10)}.json`

  if ('showSaveFilePicker' in window) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: filename,
      startIn: 'downloads',
      types: [
        {
          description: 'JSON file',
          accept: { 'application/json': ['.json'] },
        },
      ],
    })
    const writable = await fileHandle.createWritable()

    await writable.write(payload)
    await writable.close()
    return
  }

  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function importBoard(file: File) {
    try {
      const snapshot = JSON.parse(await file.text())
      loadSnapshot(store, snapshot)
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
        <Tldraw store={store} licenseKey={TLDRAW_LICENSE_KEY} />

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
          <button
            type="button"
            onClick={() => void saveBoard()}
            title="Save JSON"
          >
            <Save size={18} aria-hidden="true" />
            <span>Save</span>
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
