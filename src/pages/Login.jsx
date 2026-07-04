import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientRoute, REGISTER_PATH } from "../constants/routes";
import {
  ArrowRight,
  Loader2,
  Phone,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PublicNavbar from "../components/public/Navbar";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import {
  normalizeMobileInput,
  isValidMobile,
  inputWrapperClass,
  fieldLabelClass,
  otpInputClass,
} from "../utils/authForm";

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: (dir) => ({
    x: dir > 0 ? -24 : 24,
    opacity: 0,
    transition: { duration: 0.18 },
  }),
};

/* ─── OTP Input (6 boxes) ─── */
function OtpInput({ value, onChange, hasError = false }) {
  const digits = value.split("");
  const refs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        const next = [...digits];
        next[i - 1] = "";
        onChange(next.join(""));
      }
    }
  };

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full min-w-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={otpInputClass(hasError)}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [direction, setDirection] = useState(1);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Resend OTP countdown
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const showToast = (message, type = "error") => {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const startResendTimer = (seconds = 30) => {
    setResendTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /* Step 1 — Send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!mobile.trim()) {
      setFieldErrors({ mobile: true });
      return showToast("Mobile number is required.");
    }
    if (!isValidMobile(mobile)) {
      setFieldErrors({ mobile: true });
      return showToast("Mobile number must be exactly 10 digits.");
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await apiCall("/auth/login-send-otp", "POST", {
        mobile: mobile.trim(),
      });

      if (res.status === 200) {
        setDirection(1);
        setStep(2);
        startResendTimer(30);
        showToast("OTP sent to your mobile number.", "success");
      } else if (res.status === 401) {
        showToast("Invalid credentials. Please check your mobile number.");
      } else {
        let msg = "Something went wrong. Please try again.";
        try {
          const d = await res.json();
          if (d?.detail || d?.message) msg = d.detail || d.message;
        } catch (_) {}
        showToast(msg);
      }
    } catch {
      showToast("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — Verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length < 6) {
      setFieldErrors({ otp: true });
      return showToast("Please enter the complete 6-digit OTP.");
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await apiCall("/auth/login-verify-otp", "POST", {
        mobile: mobile.trim(),
        otp: otp.trim(),
      });

      if (res.status === 200) {
        try {
          const body = await res.json();
          if (body.success && body.data) {
            login(body.data);
          }
        } catch (_) {}

        showToast("Login successful! Redirecting…", "success");
        setTimeout(() => navigate(clientRoute("/home")), 1500);
      } else if (res.status === 401) {
        showToast("Invalid credentials or OTP. Please try again.");
      } else {
        let msg = "Verification failed. Please try again.";
        try {
          const d = await res.json();
          if (d?.detail || d?.message) msg = d.detail || d.message;
        } catch (_) {}
        showToast(msg);
      }
    } catch {
      showToast("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /* Resend OTP */
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await apiCall("/auth/login-send-otp", "POST", {
        mobile: mobile.trim(),
      });
      if (res.status === 200) {
        setOtp("");
        startResendTimer(30);
        showToast("OTP resent to your mobile number.", "success");
      } else {
        showToast("Failed to resend OTP. Please try again.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep(1);
    setOtp("");
    setFieldErrors({});
    clearInterval(timerRef.current);
  };

  return (
    <div className="flex h-[calc(100dvh-68px)] max-h-[calc(100dvh-68px)] w-full min-h-0 mt-[68px] overflow-hidden bg-primary">
      <PublicNavbar />
      <AuthBrandPanel variant="login" />

      {/* ── Right: Form Panel ── */}
      <div className="flex w-full min-w-0 min-h-0 lg:w-1/2 flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain bg-secondary px-4 sm:px-10 lg:px-12 xl:px-16 py-6 sm:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm mx-auto min-w-0 my-auto"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-6 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-4 sm:mb-6 max-w-full"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200 overflow-hidden">
                <img src="/logo192.png" alt="FinFiler" className="h-6 w-6 sm:h-7 sm:w-7 object-contain" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground truncate">
                Fin<span className="text-indigo-600 font-light dark:text-indigo-400">Filer</span>
              </span>
            </Link>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-indigo-600" : "bg-border"}`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-indigo-600" : "bg-border"}`}
              />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.div
                  key="step1-heading"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm text-secondary-foreground">
                    Enter your mobile number to receive an OTP.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="step2-heading"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">
                    Verify OTP
                  </h1>
                  <p className="mt-1 text-sm text-secondary-foreground">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-primary-foreground">
                      {mobile}
                    </span>
                    .
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Step 1: Credentials ── */}
          <div className="overflow-hidden">
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
                    <label className={fieldLabelClass(fieldErrors.mobile)}>
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className={inputWrapperClass(fieldErrors.mobile)}>
                      <Phone
                        size={16}
                        className={`flex-shrink-0 ${fieldErrors.mobile ? "text-red-500" : "text-secondary-foreground"}`}
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => {
                          setMobile(normalizeMobileInput(e.target.value));
                          setFieldErrors((prev) => ({ ...prev, mobile: false }));
                        }}
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending
                        OTP…
                      </>
                    ) : (
                      <>
                        Send OTP <ArrowRight size={16} />
                      </>
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
                    <label className={fieldLabelClass(fieldErrors.otp)}>
                      Enter 6-digit OTP
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setFieldErrors((prev) => ({ ...prev, otp: false }));
                      }}
                      hasError={fieldErrors.otp}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify &amp; Sign In <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>

                  {/* Resend & Back */}
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-1 text-xs text-secondary-foreground hover:text-primary-foreground transition-colors"
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
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-xs text-secondary-foreground"
          >
            Don't have an account?{" "}
            <Link
              to={REGISTER_PATH}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Create account
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
