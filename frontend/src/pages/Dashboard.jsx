import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

import api from '../utils/api'


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [profileResponse, assessmentsResponse] = await Promise.all([
          api.get('/auth/me'),
          api.get('/assessments/history'),
        ])

        setProfile(profileResponse.data)
        setAssessments(assessmentsResponse.data)
      } catch (error) {
        setErrorMessage(
          error.response?.data?.detail ||
            'Unable to load your dashboard right now. Please try again.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const chartData = useMemo(() => {
    const counts = assessments.reduce((accumulator, assessment) => {
      const key = assessment.predicted_condition
      accumulator[key] = (accumulator[key] || 0) + 1
      return accumulator
    }, {})

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Assessments',
          data: Object.values(counts),
          backgroundColor: '#0ea5e9',
          borderRadius: 12,
          maxBarThickness: 48,
        },
      ],
    }
  }, [assessments])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#475569',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#475569',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.16)',
          },
        },
      },
    }),
    [],
  )

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="flex items-center gap-3 rounded-full bg-white px-6 py-4 shadow-lg shadow-sky-100">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
          <span className="text-sm font-semibold text-slate-700">
            Loading dashboard...
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14">
      <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
              Personal Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Welcome back, {profile?.full_name || 'there'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Review your screening history, track common conditions, and launch
              a new assessment anytime.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/symptom-checker"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
            >
              Check Symptoms
            </Link>
            <Link
              to="/image-diagnosis"
              className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
            >
              Analyze Image
            </Link>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {!assessments.length ? (
        <section className="rounded-[2rem] border border-dashed border-sky-200 bg-white/80 p-10 text-center shadow-[0_18px_55px_rgba(14,116,144,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-xl font-bold text-sky-700">
            0
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            No assessments yet
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-500">
            Start with a symptom check or image analysis to build your screening
            history here.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
                  Assessment History
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Your recent screenings
                </h2>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date', 'Type', 'Predicted Condition', 'Confidence Score', 'Urgency'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-left text-sm font-semibold text-slate-600"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr
                        key={assessment.id}
                        className="border-t border-slate-100 bg-white"
                      >
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {assessment.assessment_type === 'image'
                            ? 'Image'
                            : 'Symptom'}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {assessment.predicted_condition}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {Math.round((assessment.confidence_score || 0) * 100)}%
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span
                            className={`rounded-full px-3 py-1.5 font-semibold capitalize ${
                              assessment.urgency_level === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : assessment.urgency_level === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {assessment.urgency_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
              Condition Insights
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Assessments by predicted condition
            </h2>
            <div className="mt-8 h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default Dashboard
