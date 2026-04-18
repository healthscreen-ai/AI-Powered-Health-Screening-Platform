const techStack = [
  'React',
  'FastAPI',
  'PostgreSQL',
  'PyTorch',
  'Scikit-learn',
  'Docker',
]

function About() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14">
      <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
          About The Project
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Bridging the healthcare gap for rural and underserved communities
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
          HealthScreen AI combines accessible web workflows with AI-assisted
          symptom and image screening to help people get earlier signals,
          clearer follow-up guidance, and a simpler first step toward care.
        </p>
      </section>

      <section className="rounded-[2rem] border border-sky-100 bg-white/95 p-8 shadow-[0_24px_70px_rgba(14,116,144,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
          Tech Stack
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-sky-100 bg-sky-50 px-5 py-4 text-base font-semibold text-slate-900"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-8 shadow-[0_24px_70px_rgba(245,158,11,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
          Disclaimer
        </p>
        <p className="mt-4 text-base leading-8 text-amber-900">
          This tool is for educational purposes only and is not a substitute for
          professional medical advice.
        </p>
      </section>
    </main>
  )
}

export default About
