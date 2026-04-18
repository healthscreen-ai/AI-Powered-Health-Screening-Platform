import { useState } from 'react'

import ResultCard from '../components/ResultCard'
import api from '../utils/api'


function SymptomChecker() {
  const [symptomInput, setSymptomInput] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addSymptom = (value) => {
    const trimmed = value.trim().toLowerCase()

    if (!trimmed || symptoms.includes(trimmed)) {
      return
    }

    setSymptoms((current) => [...current, trimmed])
  }

  const handleSymptomKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSymptom(symptomInput)
      setSymptomInput('')
    }
  }

  const removeSymptom = (symptomToRemove) => {
    setSymptoms((current) =>
      current.filter((symptom) => symptom !== symptomToRemove),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setResult(null)

    if (!symptoms.length) {
      setErrorMessage('Add at least one symptom before analysis.')
      return
    }

    if (!age || Number(age) <= 0) {
      setErrorMessage('Enter a valid age.')
      return
    }

    if (!gender) {
      setErrorMessage('Select a gender before analysis.')
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post('/symptom/analyze', {
        symptoms,
        age: Number(age),
        gender,
      })

      setResult(response.data)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail ||
          'We could not analyze the symptoms right now. Please try again.',
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
            Symptom Checker
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Describe what you’re feeling
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Add symptoms one by one, provide a little context, and receive a
            fast AI-assisted preliminary screening result.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Symptoms
              </label>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 transition focus-within:border-sky-400 focus-within:bg-white">
                <div className="mb-3 flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => removeSymptom(symptom)}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-200"
                    >
                      <span className="capitalize">{symptom}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
                <input
                  value={symptomInput}
                  onChange={(event) => setSymptomInput(event.target.value)}
                  onKeyDown={handleSymptomKeyDown}
                  className="w-full border-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Type a symptom and press Enter"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  placeholder="Enter age"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing Symptoms...
                </span>
              ) : (
                'Analyze Symptoms'
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-col justify-center">
          {result ? (
            <ResultCard result={result} />
          ) : (
            <div className="rounded-[2rem] border border-dashed border-sky-200 bg-white/70 p-8 text-center shadow-[0_18px_55px_rgba(14,116,144,0.06)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-700">
                AI
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                Your result will appear here
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-500">
                Submit your symptoms to see the predicted condition, urgency
                level, confidence score, and specialist recommendation.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default SymptomChecker
