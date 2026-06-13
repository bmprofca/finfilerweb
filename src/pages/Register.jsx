import { Link } from 'react-router-dom'
import { Leaf, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Register() {
  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-500 text-cream">
            <Leaf size={20} />
          </span>
          <h1 className="font-display text-3xl font-semibold">Create your space</h1>
          <p className="mt-2 text-sm text-ink/60">
            Set up your workspace in under two minutes.
          </p>
        </div>

        <form className="space-y-5 rounded-2xl border border-sage-100 bg-white p-8 shadow-soft">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Full name</label>
            <div className="flex items-center gap-2 rounded-xl border border-sage-100 bg-card px-4 py-2.5 focus-within:border-sage-400">
              <User size={16} className="text-ink/40" />
              <input
                type="text"
                placeholder="Jordan Lee"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-sage-100 bg-card px-4 py-2.5 focus-within:border-sage-400">
              <Mail size={16} className="text-ink/40" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-sage-100 bg-card px-4 py-2.5 focus-within:border-sage-400">
              <Lock size={16} className="text-ink/40" />
              <input
                type="password"
                placeholder="At least 8 characters"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-sage-700"
          >
            Create account
            <ArrowRight size={16} />
          </button>

          <p className="text-center text-xs text-ink/40">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sage-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
