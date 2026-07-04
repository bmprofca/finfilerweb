import { motion } from "framer-motion";
import {
  Receipt,
  FileText,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  Percent,
  UserCheck,
  Calculator,
} from "lucide-react";

const SERVICES = [
  {
    label: "MCA Service",
    icon: Building2,
    bg: "bg-purple-500/20",
    border: "border-purple-300/40",
    text: "text-purple-100",
  },
  {
    label: "Income Tax",
    icon: FileText,
    bg: "bg-emerald-500/20",
    border: "border-emerald-300/40",
    text: "text-emerald-100",
  },
  {
    label: "Audit",
    icon: ClipboardCheck,
    bg: "bg-amber-500/20",
    border: "border-amber-300/40",
    text: "text-amber-100",
  },

  {
    label: "GST",
    icon: Receipt,
    bg: "bg-blue-500/20",
    border: "border-blue-300/40",
    text: "text-blue-100",
  },
  {
    label: "DSC",
    icon: ShieldCheck,
    bg: "bg-rose-500/20",
    border: "border-rose-300/40",
    text: "text-rose-100",
  },
  {
    label: "TDS",
    icon: Percent,
    bg: "bg-cyan-500/20",
    border: "border-cyan-300/40",
    text: "text-cyan-100",
  },
  {
    label: "Accounting",
    icon: Calculator,
    bg: "bg-teal-500/20",
    border: "border-teal-300/40",
    text: "text-teal-100",
  },
];

const ORBIT_SIZE = 340;
const ORBIT_RADIUS = ORBIT_SIZE / 2 - 30;

function OrbitBadge() {
  return (
    <div className="relative" style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}>
      {/* Soft glow behind everything */}
      <div className="absolute inset-10 rounded-full bg-blue-400/20 blur-3xl" />

      {/* Ring guides — distinct accent colors */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-400/35" />
      <div className="absolute inset-6 rounded-full border border-dashed border-emerald-300/30" />

      {/* Center logo medallion */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-white/20 to-white/5 shadow-2xl shadow-blue-950/50 backdrop-blur-md">
          <div className="absolute inset-2 rounded-full bg-white/95 shadow-inner" />
          <img
            src="/logo192.png"
            alt="FinFiler"
            className="relative z-10 h-32 w-32 object-contain"
          />
        </div>
      </div>

      {/* Service labels — fixed around the ring, no rotation/orbit motion */}
      {SERVICES.map(({ label, icon: Icon, bg, border, text }, i) => {
        const angle = (360 / SERVICES.length) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * ORBIT_RADIUS;
        const y = Math.sin(rad) * ORBIT_RADIUS;

        return (
          <div
            key={label}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
            }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: [1, 1.05, 1] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.1 * i },
                scale: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.15 * i,
                },
              }}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border ${border} ${bg} px-3 py-1.5 text-[11px] font-semibold ${text} shadow-md backdrop-blur-sm`}
            >
              <Icon size={13} strokeWidth={2.25} />
              {label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}

function AuthBrandPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 h-full min-h-0 flex-shrink-0 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0b1220 0%, #1e3a8a 55%, #1d4ed8 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, #60a5fa, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, #34d399, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex h-full min-h-0 w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <OrbitBadge />
        </motion.div>
      </div>
    </div>
  );
}

export default AuthBrandPanel;
