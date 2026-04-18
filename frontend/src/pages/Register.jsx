import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import ErrorMessage from '../components/ErrorMessage'
import api from '../utils/api'


const initialForm = {
  full_name: '',
  email: '',
  password: '',
  age: '',
  gender: '',
  location: '',
}

function Register() {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}

    if (!formData.full_name.trim()) nextErrors.full_name = 'Full name is required.'
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!formData.password) nextErrors.password = 'Password is required.'
    if (formData.password && formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }
    if (!formData.age) nextErrors.age = 'Age is required.'
    if (formData.age && Number(formData.age) <= 0) {
      nextErrors.age = 'Enter a valid age.'
    }
    if (!formData.gender) nextErrors.gender = 'Gender is required.'
    if (!formData.location.trim()) nextErrors.location = 'Location is required.'

    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setServerError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/auth/register', {
        ...formData,
        age: Number(formData.age),
      })

      navigate('/login', {
        state: { message: 'Registration successful. Please log in.' },
      })
    } catch (error) {
      setServerError(
        error.response?.data?.detail || 'Unable to create your account right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center px-6 py-14">
      <div className="grid w-full gap-10 overflow-hidden rounded-[2rem] border border-sky-100 bg-white/90 shadow-[0_30px_90px_rgba(14,116,144,0.1)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[linear-gradient(180deg,#0284c7_0%,#0f766e_100%)] px-8 py-10 text-white md:px-10 md:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100">
            Join the platform
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Start your health screening journey
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-sky-50">
            Create an account to access AI-guided symptom checks, image-based
            screening support, and your personal assessment history.
          </p>
        </section>

        <section className="px-8 py-10 md:px-10 md:py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Register
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-sky-700">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                placeholder="Enter your full name"
              />
              {errors.full_name ? (
                <p className="mt-2 text-sm text-rose-600">{errors.full_name}</p>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  placeholder="you@example.com"
                />
                {errors.email ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  placeholder="Create a secure password"
                />
                {errors.password ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.password}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Age
                </label>
                <input
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  placeholder="Age"
                />
                {errors.age ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.age}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.gender}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  placeholder="City or region"
                />
                {errors.location ? (
                  <p className="mt-2 text-sm text-rose-600">{errors.location}</p>
                ) : null}
              </div>
            </div>

            <ErrorMessage message={serverError} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-sky-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Register
