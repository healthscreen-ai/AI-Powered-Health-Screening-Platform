import { useMemo, useRef, useState } from 'react'

import ErrorMessage from '../components/ErrorMessage'
import ResultCard from '../components/ResultCard'
import api from '../utils/api'


function ImageDiagnosis() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return ''
    }

    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  const handleFileSelection = (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file.')
      return
    }

    setSelectedFile(file)
    setResult(null)
    setErrorMessage('')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFileSelection(event.dataTransfer.files?.[0])
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage('Select an image before starting analysis.')
      return
    }

    setErrorMessage('')
    setResult(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await api.post('/image/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult({
        ...response.data,
        recommended_specialist: response.data.advice,
      })
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail ||
          'We could not analyze the image right now. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.1)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
            Image Diagnosis
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Upload a skin image for screening
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Drop an image into the upload area or browse from your device to
            receive an AI-assisted preliminary screening result.
          </p>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDragging(false)
            }}
            onDrop={handleDrop}
            className={`mt-8 rounded-[1.75rem] border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? 'border-sky-500 bg-sky-50'
                : 'border-sky-200 bg-slate-50 hover:border-sky-300 hover:bg-white'
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-2xl font-bold text-sky-700">
              IMG
            </div>
            <p className="mt-5 text-lg font-semibold text-slate-900">
              Drag and drop an image here
            </p>
            <p className="mt-2 text-sm text-slate-500">
              or click to browse files from your device
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
              className="hidden"
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Currently supports skin condition screening only
          </p>

          {selectedFile ? (
            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
              <img
                src={previewUrl}
                alt="Preview of uploaded skin image"
                className="h-72 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setResult(null)
                    setErrorMessage('')
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <ErrorMessage message={errorMessage} />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing Image...
              </span>
            ) : (
              'Analyze Image'
            )}
          </button>
        </div>

        <div className="flex flex-col justify-center">
          {result ? (
            <ResultCard result={result} />
          ) : (
            <div className="rounded-[2rem] border border-dashed border-sky-200 bg-white/70 p-8 text-center shadow-[0_18px_55px_rgba(14,116,144,0.06)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-700">
                DX
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                Your image result will appear here
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-500">
                Upload a supported skin image to see the predicted condition,
                urgency level, and follow-up guidance.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ImageDiagnosis
