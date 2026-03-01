import { useState } from 'react'
import { uploadCsv } from '../services/api'

export default function DataUploader({ onUploaded }) {
  const [status, setStatus] = useState('Use sample data by default, or upload your own CSV.')

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const response = await uploadCsv(file)
      setStatus(`Uploaded ${response.rows} rows successfully.`)
      onUploaded?.()
    } catch (error) {
      setStatus(error.message)
    }
  }

  return (
    <div className="card uploader-card">
      <h3>Data Input</h3>
      <p>{status}</p>
      <input type="file" accept=".csv" onChange={handleUpload} />
    </div>
  )
}
