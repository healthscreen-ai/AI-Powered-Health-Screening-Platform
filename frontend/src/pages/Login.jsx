import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import ErrorMessage from '../components/ErrorMessage'
import api from '../utils/api'


function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const successMessage = location.state?.message || ''

  const validate = () => {
    const errors = {}

    if (!email.trim()) errors.email = 'Email is required.'
    if (!password) errors.password = 'Password is required.'

    return errors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setFieldErrors(nextErrors)
    setErrorMessage('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.access_token)
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || 'Invalid credentials. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center px-6 py-14">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-sky-100 bg-white/90 shadow-[0_30px_90px_rgba(14,116,144,0.1)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-[linear-gradient(180deg,#e0f2fe_0%,#f0f9ff_100%)] px-8 py-10 md:px-10 md:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">
            Welcome back
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
            Log in to continue your care journey
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-slate-600">
            Access your screening dashboard, review past assessments, and launch
            new symptom or image-based checks whenever you need them.
          </p>
        </section>

        <section className="px-8 py-10 md:px-10 md:py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Login
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Need an account?{' '}
              <Link to="/register" className="font-semibold text-sky-700">
                Register here
              </Link>
            </p>
          </div>

          {successMessage ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFieldErrors((current) => ({ ...current, email: '' }))
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                placeholder="you@example.com"
              />
              {fieldErrors.email ? (
                <p className="mt-2 text-sm text-rose-600">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFieldErrors((current) => ({ ...current, password: '' }))
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                placeholder="Enter your password"
              />
              {fieldErrors.password ? (
                <p className="mt-2 text-sm text-rose-600">{fieldErrors.password}</p>
              ) : null}
            </div>

            <ErrorMessage message={errorMessage} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-sky-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Login
