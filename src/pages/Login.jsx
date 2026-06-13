import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, ShieldCheck, FileText, CheckCircle2,
  Loader2, Phone, RotateCcw, ChevronLeft, TrendingUp, Users, Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiCall } from '../utils/apiCall'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.18 } })
}

/* ─── OTP Input (6 boxes) ─── */
function OtpInput({ value, onChange }) {
  const digits = value.split('')
  const refs = useRef([])

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]
        next[i] = ''
        onChange(next.join(''))
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
        const next = [...digits]
        next[i - 1] = ''
        onChange(next.join(''))
      }
    }
  }

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = val
    onChange(next.join(''))
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    refs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
      ))}
    </div>
  )
}

/* ─── Main Component ─── */
export default function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  const [step, setStep] = useState(1)        // 1 = send OTP, 2 = verify OTP
  const [direction, setDirection] = useState(1)

  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')

  const [loading, setLoading] = useState(false)

  // Resend OTP countdown
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)

  const float1 = { animate: { y: [0, -12, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } } }
  const float2 = { animate: { y: [0, 12, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } } }

  const showToast = (message, type = 'error') => {
    if (type === 'error') {
      toast.error(message)
    } else {
      toast.success(message)
    }
  }

  const startResendTimer = (seconds = 30) => {
    setResendTimer(seconds)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  /* Step 1 — Send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!mobile.trim()) return showToast('Mobile number is required.')

    setLoading(true)
    try {
      const res = await apiCall('/auth/login-send-otp', 'POST', {
        mobile: mobile.trim(),
      })

      if (res.status === 200) {
        setDirection(1)
        setStep(2)
        startResendTimer(30)
        showToast('OTP sent to your mobile number.', 'success')
      } else if (res.status === 401) {
        showToast('Invalid credentials. Please check your mobile number.')
      } else {
        let msg = 'Something went wrong. Please try again.'
        try { const d = await res.json(); if (d?.detail || d?.message) msg = d.detail || d.message } catch (_) {}
        showToast(msg)
      }
    } catch {
      showToast('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  /* Step 2 — Verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.replace(/\D/g, '').length < 6) return showToast('Please enter the complete 6-digit OTP.')

    setLoading(true)
    try {
      const res = await apiCall('/auth/login-verify-otp', 'POST', {
        mobile: mobile.trim(),
        otp: otp.trim(),
      })

      if (res.status === 200) {
        try {
          const body = await res.json()
          if (body.success && body.data) {
            login(body.data)
          }
        } catch (_) {}

        showToast('Login successful! Redirecting…', 'success')
        setTimeout(() => navigate('/home'), 1500)
      } else if (res.status === 401) {
        showToast('Invalid credentials or OTP. Please try again.')
      } else {
        let msg = 'Verification failed. Please try again.'
        try { const d = await res.json(); if (d?.detail || d?.message) msg = d.detail || d.message } catch (_) {}
        showToast(msg)
      }
    } catch {
      showToast('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  /* Resend OTP */
  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      const res = await apiCall('/auth/login-send-otp', 'POST', { mobile: mobile.trim() })
      if (res.status === 200) {
        setOtp('')
        startResendTimer(30)
        showToast('OTP resent to your mobile number.', 'success')
      } else {
        showToast('Failed to resend OTP. Please try again.')
      }
    } catch {
      showToast('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setDirection(-1)
    setStep(1)
    setOtp('')
    clearInterval(timerRef.current)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ── Left: Brand Panel ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(145deg, #0a0f1e 0%, #0d1635 40%, #111827 100%)' }}>

        {/* Dot grid texture */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        {/* Glowing orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />

        {/* Content */}
        <div className="relative z-10 w-full px-10 flex flex-col gap-8">

          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Fin<span className="text-indigo-400 font-light">Filer</span></span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Your taxes,<br />
              <span className="text-indigo-400">handled right.</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Sign in to access your dashboard, track refunds, and connect with expert tax consultants.
            </p>
          </motion.div>

          {/* Floating cards */}
          <div className="space-y-3">
            {/* Card 1 — Refund status */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl p-4 border border-white/8 backdrop-blur-xl"
              style={{ background: 'rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <CheckCircle2 size={17} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-emerald-400 tracking-wide uppercase">IRS Status</p>
                  <p className="text-white font-bold text-sm">Return Accepted</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">✓ Filed</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: '100%' }} />
              </div>
              <p className="text-[11px] text-slate-500 text-right mt-1.5">Processing complete</p>
            </motion.div>

            {/* Card 2 — Refund amount */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="rounded-2xl p-4 border border-white/8 backdrop-blur-xl"
              style={{ background: 'rgba(255,255,255,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <TrendingUp size={17} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-indigo-400 tracking-wide uppercase">Est. Refund</p>
                  <p className="text-3xl font-bold text-white tracking-tight">$4,250</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 border-t border-white/8 pt-2.5 mt-3">
                Based on W-2 uploads · 3 deductions applied
              </p>
            </motion.div>
          </div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-3 gap-3 border-t border-white/8 pt-6"
          >
            {[{ icon: <Users size={14} />, val: '50K+', label: 'Clients' },
              { icon: <FileText size={14} />, val: '99%', label: 'Accuracy' },
              { icon: <Star size={14} />, val: '4.9★', label: 'Rating' }].map(({ icon, val, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <span className="text-indigo-400">{icon}</span>
                </div>
                <p className="text-sm font-bold text-white">{val}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center overflow-y-auto px-5 sm:px-10 lg:px-12 xl:px-16 bg-white flex-shrink-0">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-sm mx-auto">

          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-6">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <ShieldCheck size={20} />
              </div>
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                Fin<span className="text-indigo-600 font-light">Filer</span>
              </span>
            </Link>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.div key="step1-heading" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                  <p className="mt-1 text-sm text-slate-500">Enter your mobile number to receive an OTP.</p>
                </motion.div>
              ) : (
                <motion.div key="step2-heading" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Verify OTP</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-slate-700">{mobile}</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Step 1: Credentials ── */}
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.form
                key="step1-form"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3"
                onSubmit={handleSendOtp}
                noValidate
              >
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                    <Phone size={16} className="text-slate-400 flex-shrink-0" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending OTP…</>
                  ) : (
                    <>Send OTP <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* ── Step 2: OTP Verification ── */}
            {step === 2 && (
              <motion.form
                key="step2-form"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
                onSubmit={handleVerifyOtp}
                noValidate
              >
                <div>
                  <label className="mb-3 block text-xs font-semibold text-slate-700">Enter 6-digit OTP</label>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                  ) : (
                    <>Verify &amp; Sign In <ArrowRight size={16} /></>
                  )}
                </motion.button>

                {/* Resend & Back */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft size={14} /> Change number
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw size={12} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:underline">Create account</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
