import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, ArrowRight, ShieldCheck, Clock, CheckCircle2, Phone, Loader2, ChevronLeft, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiCall } from '../utils/apiCall'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

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
          className="h-12 w-12 rounded-xl border border-border bg-primary text-center text-lg font-bold text-primary-foreground outline-none transition-all focus:border-indigo-500 focus:bg-secondary focus:ring-4 focus:ring-indigo-500/10"
        />
      ))}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  const [step, setStep] = useState(1) // 1 = Registration form, 2 = OTP verification
  const [direction, setDirection] = useState(1)

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    mobile: '',
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  // Resend OTP countdown
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)

  const float1 = { animate: { y: [0, -12, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } } }
  const float2 = { animate: { y: [0, 12, 0], transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } } }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

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

  const handleSendOtp = async (e) => {
    e.preventDefault()

    if (!form.first_name.trim() || !form.last_name.trim()) return showToast('First name and last name are required.')
    if (!form.email.trim()) return showToast('Email address is required.')
    if (!form.mobile.trim()) return showToast('Mobile number is required.')

    setLoading(true)

    try {
      const payload = { mobile: form.mobile.trim() }
      const response = await apiCall('/auth/register-send-otp', 'POST', payload)

      if (response.status === 200) {
        setDirection(1)
        setStep(2)
        startResendTimer(30)
        showToast('OTP sent to your mobile number.', 'success')
      } else if (response.status === 409) {
        showToast('Mobile number already registered. Please log in instead.')
      } else {
        let errMsg = 'Failed to send OTP. Please try again.'
        try {
          const data = await response.json()
          if (data?.detail || data?.message) errMsg = data.detail || data.message
        } catch (_) {}
        showToast(errMsg)
      }
    } catch (err) {
      showToast('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.replace(/\D/g, '').length < 6) return showToast('Please enter the complete 6-digit OTP.')

    setLoading(true)
    try {
      const payload = {
        mobile: form.mobile.trim(),
        otp: otp.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        ...(form.middle_name.trim() && { middle_name: form.middle_name.trim() }),
      }

      const response = await apiCall('/auth/register-verify-otp', 'POST', payload)

      if (response.status === 201) {
        try {
          const body = await response.json()
          if (body.success && body.data) {
            login(body.data)
          }
        } catch (_) {}

        showToast('Account created successfully! Redirecting…', 'success')
        setTimeout(() => navigate('/home'), 1500)
      } else {
        let msg = 'Registration failed. Please check OTP and try again.'
        try { const d = await response.json(); if (d?.detail || d?.message) msg = d.detail || d.message } catch (_) {}
        showToast(msg)
      }
    } catch {
      showToast('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      const res = await apiCall('/auth/register-send-otp', 'POST', { mobile: form.mobile.trim() })
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
    <div className="flex h-screen overflow-hidden bg-secondary">

      {/* ── Left: Visual Panel ── */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" />

        <div className="relative z-10 w-full max-w-sm px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Fast &amp; Secure Filing</h2>
            <p className="text-indigo-200 text-sm">Join thousands organizing their tax life effortlessly.</p>
          </motion.div>

          <div className="space-y-4">
            <motion.div variants={float1} animate="animate"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Bank-level Security</p>
                  <p className="text-xs text-indigo-200">256-bit AES encryption</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={float2} animate="animate"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Clock size={18} className="text-indigo-300" />
                <p className="text-sm text-indigo-100">Average filing time</p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-white">15</p>
                <p className="text-indigo-200 mb-1 text-sm">mins</p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium">100% Accuracy Guarantee</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center overflow-y-auto px-5 sm:px-10 lg:px-12 xl:px-16 bg-secondary flex-shrink-0">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-sm mx-auto py-8">

          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-5">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary-foreground">
                fin<span className="text-indigo-600 font-light">filer</span>
              </span>
            </Link>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-600' : 'bg-border'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-border'}`} />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.div key="step1-heading" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">Get Started</h1>
                  <p className="mt-1 text-sm text-secondary-foreground">Create an account to connect with top tax consultants.</p>
                </motion.div>
              ) : (
                <motion.div key="step2-heading" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">Verify OTP</h1>
                  <p className="mt-1 text-sm text-secondary-foreground">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-primary-foreground">{form.mobile}</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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

                {/* First Name + Last Name */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-primary-foreground">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-primary px-3.5 py-3 transition-all focus-within:border-indigo-500 focus-within:bg-secondary focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                      <User size={14} className="text-secondary-foreground flex-shrink-0" />
                      <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Jane"
                        className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-secondary-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-primary-foreground">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-primary px-3.5 py-3 transition-all focus-within:border-indigo-500 focus-within:bg-secondary focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                      <User size={14} className="text-secondary-foreground flex-shrink-0" />
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-secondary-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Name (optional) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary-foreground">
                    Middle Name <span className="text-secondary-foreground font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-primary px-3.5 py-3 transition-all focus-within:border-indigo-500 focus-within:bg-secondary focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                    <User size={16} className="text-secondary-foreground flex-shrink-0" />
                    <input
                      type="text"
                      name="middle_name"
                      value={form.middle_name}
                      onChange={handleChange}
                      placeholder="M"
                      className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-secondary-foreground"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary-foreground">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-primary px-3.5 py-3 transition-all focus-within:border-indigo-500 focus-within:bg-secondary focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                    <Mail size={16} className="text-secondary-foreground flex-shrink-0" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-secondary-foreground"
                    />
                  </div>
                </div>

                {/* Mobile (required now) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-primary-foreground">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-primary px-3.5 py-3 transition-all focus-within:border-indigo-500 focus-within:bg-secondary focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                    <Phone size={16} className="text-secondary-foreground flex-shrink-0" />
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-secondary-foreground"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 mt-2 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-secondary-foreground mt-2">
                  By registering, you agree to our{' '}
                  <span className="text-indigo-600 cursor-pointer hover:underline">Terms</span> and{' '}
                  <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>.
                </p>
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
                  <label className="mb-3 block text-xs font-semibold text-primary-foreground">Enter 6-digit OTP</label>
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
                    <><Loader2 size={16} className="animate-spin" /> Verifying & Registering…</>
                  ) : (
                    <>Verify &amp; Register <ArrowRight size={16} /></>
                  )}
                </motion.button>

                {/* Resend & Back */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-xs text-secondary-foreground hover:text-primary-foreground transition-colors"
                  >
                    <ChevronLeft size={14} /> Back to form
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

          <motion.p variants={itemVariants} className="mt-5 text-center text-xs text-secondary-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">Log in here</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
