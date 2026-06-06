/// <reference types="vite/client" />

interface SaveFilePickerOptions {
  suggestedName?: string
  startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>
}

interface Window {
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>
}
