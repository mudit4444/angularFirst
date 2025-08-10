import React from 'react'
import FileUpload from './components/FileUpload.jsx'

export default function App() {
  const [result, setResult] = React.useState(null)

  return (
    <div className="container">
      <h1>React File Upload</h1>
      <p>Select files or drag-and-drop. Click Upload to send to a demo endpoint.</p>

      <FileUpload
        multiple
        accept="image/*,application/pdf"
        uploadUrl="https://httpbin.org/post"
        onUploadSuccess={(json) => setResult(json)}
        onUploadError={(error) => setResult({ error: String(error) })}
      />

      <h2>Response</h2>
      <pre className="response-output">{result ? JSON.stringify(result, null, 2) : 'No upload yet.'}</pre>
    </div>
  )
}