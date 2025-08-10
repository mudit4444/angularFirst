import React from 'react'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function FileUpload({
  uploadUrl,
  fieldName = 'files',
  multiple = false,
  accept,
  maxSizeBytes = 5 * 1024 * 1024,
  onFilesSelected,
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
}) {
  const [selectedFiles, setSelectedFiles] = React.useState([])
  const [previews, setPreviews] = React.useState([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const fileInputRef = React.useRef(null)

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  function openFileDialog() {
    fileInputRef.current?.click()
  }

  function validateAndSetFiles(fileList) {
    const filesArray = Array.from(fileList)
    const tooLarge = filesArray.find((f) => f.size > maxSizeBytes)
    if (tooLarge) {
      alert(`File \'${tooLarge.name}\' exceeds the maximum size of ${formatBytes(maxSizeBytes)}.`)
      return
    }

    const newPreviews = filesArray.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null))

    setSelectedFiles(filesArray)
    setPreviews(newPreviews)
    onFilesSelected?.(filesArray)
  }

  function onInputChange(event) {
    const files = event.target.files
    if (files && files.length > 0) {
      validateAndSetFiles(files)
    }
  }

  function onDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  function onDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  function onDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      validateAndSetFiles(files)
      event.dataTransfer.clearData()
    }
  }

  function reset() {
    setSelectedFiles([])
    setPreviews([])
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function upload() {
    if (!uploadUrl) {
      alert('No uploadUrl provided.')
      return
    }
    if (selectedFiles.length === 0) {
      alert('Please select at least one file.')
      return
    }

    setIsUploading(true)
    setProgress(0)
    onUploadStart?.()

    const formData = new FormData()
    selectedFiles.forEach((file) => formData.append(multiple ? `${fieldName}[]` : fieldName, file))

    try {
      // Use XMLHttpRequest to report upload progress
      const json = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', uploadUrl)
        xhr.responseType = 'json'

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
            onUploadProgress?.(percent)
          }
        }

        xhr.onload = () => {
          // Some servers return JSON as text; normalize
          const response = typeof xhr.response === 'object' && xhr.response !== null ? xhr.response : safeJsonParse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response)
          } else {
            const err = new Error(`Upload failed with status ${xhr.status}`)
            err.response = response
            reject(err)
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
      })

      onUploadSuccess?.(json)
      setProgress(100)
    } catch (error) {
      onUploadError?.(error)
    } finally {
      setIsUploading(false)
    }
  }

  function safeJsonParse(text) {
    try {
      return JSON.parse(text)
    } catch {
      return { raw: text }
    }
  }

  return (
    <div className="upload-widget">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        multiple={multiple}
        accept={accept}
        onChange={onInputChange}
      />

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openFileDialog}
        role="button"
        tabIndex={0}
      >
        <div>
          <strong>Click to choose</strong> or drag and drop
        </div>
        <div className="hint">
          {multiple ? 'Multiple files allowed' : 'Single file'}
          {maxSizeBytes ? ` • Max ${formatBytes(maxSizeBytes)}` : null}
          {accept ? ` • Accepted: ${accept}` : null}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-list">
          {selectedFiles.map((file, idx) => (
            <div className="file-item" key={file.name + idx}>
              {previews[idx] ? (
                <img className="thumb" src={previews[idx]} alt={file.name} />
              ) : (
                <div className="thumb placeholder">{file.type || 'file'}</div>
              )}
              <div className="meta">
                <div className="name" title={file.name}>{file.name}</div>
                <div className="size">{formatBytes(file.size)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <button type="button" onClick={openFileDialog} disabled={isUploading}>Choose files</button>
        <button type="button" onClick={upload} disabled={isUploading || selectedFiles.length === 0}>Upload</button>
        <button type="button" onClick={reset} disabled={isUploading || selectedFiles.length === 0}>Clear</button>
      </div>

      {isUploading && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-label">{progress}%</span>
        </div>
      )}
    </div>
  )
}