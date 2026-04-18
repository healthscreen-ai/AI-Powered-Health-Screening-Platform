function ResultCard({ result }) {
  const confidencePercentage = Math.round((result.confidence_score || 0) * 100)

  const progressColor =
    confidencePercentage < 50
      ? 'bg-emerald-500'
      : confidencePercentage <= 75
        ? 'bg-amber-400'
        : 'bg-rose-500'

  const urgencyStyles = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-rose-100 text-rose-700',
  }

  const urgencyKey = (result.urgency_level || '').toLowerCase()

  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.1)]">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
        Analysis Result
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {result.predicted_condition}
      </h2>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-600">
          <span>Confidence Score</span>
          <span>{confidencePercentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-500">Urgency Level</span>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
            urgencyStyles[urgencyKey] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {result.urgency_level}
        </span>
      </div>

      <div className="mt-8 rounded-3xl bg-sky-50 px-5 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
          Recommended Specialist
        </p>
        <p className="mt-3 text-lg font-medium text-slate-900">
          {result.recommended_specialist}
        </p>
      </div>

      <p className="mt-8 text-sm leading-6 text-slate-400">
        This is not a medical diagnosis. Please consult a qualified doctor.
      </p>
    </section>
  )
}

export default ResultCard
