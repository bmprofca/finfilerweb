import { Plus, CheckCircle2, Circle, TrendingUp, Clock } from 'lucide-react'

const tasks = [
  { id: 1, title: 'Draft Q3 roadmap outline', done: true },
  { id: 2, title: 'Review design feedback from team', done: true },
  { id: 3, title: 'Prepare slides for Monday sync', done: false },
  { id: 4, title: 'Reply to onboarding emails', done: false },
  { id: 5, title: '30 min walk + journal', done: false },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold">Good morning, Asha</h1>
        <p className="text-ink/60">Here's what's on your plate for Friday, June 13.</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-ink/50">
            <Clock size={16} />
            <span className="text-sm">Focus time</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">3h 24m</p>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-ink/50">
            <CheckCircle2 size={16} />
            <span className="text-sm">Completed</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">2 of 5</p>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-ink/50">
            <TrendingUp size={16} />
            <span className="text-sm">Streak</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">8 days</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-2xl border border-sage-100 bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's tasks</h2>
          <button className="flex items-center gap-1.5 rounded-full bg-sage-100 px-4 py-2 text-sm font-medium text-sage-700 transition hover:bg-sage-200">
            <Plus size={15} />
            Add task
          </button>
        </div>

        <ul className="divide-y divide-sage-100">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 py-3">
              {task.done ? (
                <CheckCircle2 size={20} className="flex-shrink-0 text-sage-500" />
              ) : (
                <Circle size={20} className="flex-shrink-0 text-ink/30" />
              )}
              <span className={`text-sm ${task.done ? 'text-ink/40 line-through' : 'text-ink/80'}`}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
