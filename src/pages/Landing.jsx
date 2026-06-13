import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Gauge } from 'lucide-react'

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-coral-300/40 blur-3xl animate-blob" />
        <div className="absolute -top-10 left-1/3 h-72 w-72 rounded-full bg-sage-200/60 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-sage-700">
            <Sparkles size={14} />
            Now in open beta
          </span>
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            Find your flow,
            <br />
            <span className="text-sage-500">one quiet day</span> at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink/60">
            Flux brings your tasks, notes, and habits into a single calm
            workspace — designed to feel less like software and more like
            a clear desk.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-sage-700"
            >
              Create your space
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-sage-200 bg-white/60 px-7 py-3.5 text-sm font-semibold text-ink transition hover:border-sage-400"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Preview card */}
        <div className="relative z-10 mx-auto mt-20 max-w-4xl rounded-2xl border border-sage-100 bg-white p-2 shadow-soft">
          <div className="rounded-xl bg-card p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Focus time today', value: '3h 24m' },
                { label: 'Tasks completed', value: '12 of 15' },
                { label: 'Streak', value: '8 days' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-5 shadow-soft">
                  <p className="text-sm text-ink/50">{stat.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Everything stays in its place
          </h2>
          <p className="mt-3 text-ink/60">
            Three principles guide how Flux is built.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              title: 'Effortless pace',
              desc: 'A single view of your day, free from clutter and competing notifications.',
            },
            {
              icon: ShieldCheck,
              title: 'Private by default',
              desc: 'Your notes and habits stay yours. Nothing is shared without your say.',
            },
            {
              icon: Sparkles,
              title: 'Built for momentum',
              desc: 'Gentle streaks and reminders that nudge you forward, never pressure you.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-sage-100 bg-white p-8 transition hover:shadow-soft">
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
                <Icon size={20} />
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl bg-sage-500 px-10 py-16 text-center text-cream">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Ready for a calmer to-do list?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sage-50/90">
            Set up your workspace in under two minutes. No credit card required.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-sage-700 transition hover:bg-white"
          >
            Get started for free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
