import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, TrendingUp, UserCheck, Wallet, Globe2, Gem,
  ArrowRight, Star, ShieldCheck, FileCheck2, UserCog, Check, 
  BadgeCheck, IndianRupee, TrendingDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { REGISTER_PATH } from '../../constants/routes';
import SEO from '../../components/public/SEO';

// ============================================================
// DUMMY DATA (Production ready with realistic values)
// ============================================================

const personas = [
  { title: 'Salaried Professionals', desc: 'Simple, accurate filing for every salaried taxpayer.', icon: Briefcase, bg: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-600' },
  { title: 'Investors and Traders', desc: '1-click capital gains import from 40+ brokers.', icon: TrendingUp, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100 text-emerald-600' },
  { title: 'Freelancers & Professionals', desc: 'Consulting income, TDS credits, advance tax and more.', icon: UserCheck, bg: 'bg-teal-50', iconBg: 'bg-teal-100 text-teal-600' },
  { title: 'Advanced Traders', desc: 'F&O, intraday and complex capital gains, filed by an expert.', icon: Wallet, bg: 'bg-amber-50', iconBg: 'bg-amber-100 text-amber-600' },
  { title: 'NRIs & RSU / ESOP Holders', desc: 'Foreign income, RSU vesting and DTAA handled correctly.', icon: Globe2, bg: 'bg-indigo-50', iconBg: 'bg-indigo-100 text-indigo-600' },
  { title: 'Affluent Investors', desc: 'Year-round support across salary, capital gains and global income.', icon: Gem, bg: 'bg-sky-50', iconBg: 'bg-sky-100 text-sky-600' },
];

const whyCards = [
  { 
    id: 0,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600&h=400', 
    caption: 'Real tax practitioners review every return before it goes out.' 
  },
  { 
    id: 1,
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600&h=400', 
    caption: 'Our error-detection technology reviews your data twice, so nothing slips through.' 
  },
  { 
    id: 2,
    photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600&h=400', 
    caption: 'File once, get it right — no revision loops or repeat document requests.' 
  },
];

// Accuracy data with real values (not "Scanning…")
const accuracyCards = [
  {
    title: 'Exemptions & setoffs are applied automatically',
    rows: [
      { label: 'Standard deduction', value: '₹75,000', status: 'Applied' },
      { label: 'Section 80C', value: '₹1,50,000', status: 'Applied' },
      { label: 'LTCG Exemption', value: '₹1,00,000', status: 'Applied' },
    ],
  },
  {
    title: 'Auto-selecting the regime that saves you the most',
    regimes: [
      { label: 'New regime', amount: '₹3,68,807', good: true, savings: 'Saves ₹2,09,760' },
      { label: 'Old regime', amount: '₹5,78,567', good: false, savings: '' },
    ],
  },
  {
    title: 'Your loss adjustment, handled',
    rows: [
      { label: 'Capital Gains', value: '₹3,24,673', status: 'Adjusted' },
      { label: 'Brought Forward Loss', value: '₹1,20,000', status: 'Adjusted' },
      { label: 'Net Gains', value: '₹2,04,673', status: 'Optimized' },
    ],
  },
];

const experts = [
  { name: 'Rohan Iyer', role: 'Senior Tax Expert', years: '8+ Yrs', rating: '4.8', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300' },
  { name: 'Meera Kulkarni', role: 'Senior Tax Expert', years: '6+ Yrs', rating: '4.7', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' },
  { name: 'Devansh Rao', role: 'Senior Tax Expert', years: '9+ Yrs', rating: '4.9', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
];

const pricingTiers = [
  { name: 'Basic', price: '₹499', desc: 'Salaried, single Form 16', color: 'text-slate-700', popular: false },
  { name: 'Premium', price: '₹1,499', desc: 'Salaried + capital gains', color: 'text-emerald-600', popular: true },
  { name: 'Elite', price: '₹2,999', desc: 'Business & professional income', color: 'text-blue-600', popular: false },
  { name: 'Luxe', price: '₹5,999', desc: 'NRI, RSU/ESOP & global income', color: 'text-amber-600', popular: false },
];

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const heroFade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } 
  }),
};

const cardGridStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================
// ACCURACY RING COMPONENT
// ============================================================

function AccuracyRing({ colorA = '#DBEAFE', colorB = '#2563EB', label = '100% ACCURACY' }) {
  const pathId = `ring-path-${label.replace(/\s/g, '')}`;
  return (
    <svg viewBox="0 0 240 240" className="absolute inset-0 w-full h-full animate-spin-slow">
      <defs>
        <path id={pathId} d="M 120,120 m -100,0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0" />
      </defs>
      <circle cx="120" cy="120" r="100" fill="none" stroke={colorA} strokeWidth="18" />
      <text fontSize="12.5" fontWeight="700" fill={colorB} letterSpacing="3">
        <textPath href={`#${pathId}`} startOffset="0%">
          {label} • {label} • {label} • 
        </textPath>
      </text>
    </svg>
  );
}

// ============================================================
// TAX BREAKDOWN CARD (Floating)
// ============================================================

const taxRows = [
  { label: "Salary income", value: "₹18,40,000" },
  { label: "F&O profit", value: "₹5,13,588" },
  { label: "Capital gains", value: "₹3,24,673" },
  { label: "Standard deduction", value: "− ₹75,000", muted: true },
  { label: "Section 80C", value: "− ₹1,50,000", muted: true },
];

const taxRegimes = [
  { name: "Old regime", tax: "₹5,78,567", active: false },
  { name: "New regime", tax: "₹3,68,807", active: true },
];

function TaxBreakdownCard({ className = "" }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (taxRows.length + 1));
    }, 550);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className={`${className} z-10 bg-white rounded-xl shadow-xl border border-slate-100 p-3 w-48 sm:w-52 lg:w-56`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
          Tax breakdown
        </p>
        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5">
          <IndianRupee className="w-2.5 h-2.5" />
          Auto
        </span>
      </div>

      <div className="space-y-1">
        {taxRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between text-[10px] leading-tight transition-opacity duration-300 ${
              i < step ? "opacity-100" : "opacity-30"
            }`}
          >
            <span className={`truncate pr-1 ${row.muted ? "text-slate-400" : "text-slate-600"}`}>
              {row.label}
            </span>
            <span
              className={`font-medium tabular-nums whitespace-nowrap ${
                row.muted ? "text-rose-500" : "text-slate-800"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
        {taxRegimes.map((r) => (
          <div
            key={r.name}
            className={`flex items-center justify-between rounded-md px-1.5 py-1 ${
              r.active ? "bg-emerald-50" : "bg-slate-50"
            }`}
          >
            <span className="text-[10px] text-slate-600">{r.name}</span>
            <span
              className={`text-[10px] font-semibold tabular-nums ${
                r.active ? "text-emerald-600" : "text-slate-500"
              }`}
            >
              {r.tax}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1 text-[9px] font-medium text-emerald-600 leading-tight">
        <TrendingDown className="w-3 h-3 shrink-0" />
        Saves ₹2,09,760 more
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN HOME COMPONENT
// ============================================================

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % whyCards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setActiveSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const prevSlide = () => {
    goToSlide((activeSlide - 1 + whyCards.length) % whyCards.length);
  };

  const nextSlide = () => {
    goToSlide((activeSlide + 1) % whyCards.length);
  };

  return (
    <>
      <div className="bg-white min-h-screen text-slate-800 font-sans pb-12 overflow-x-hidden">
        <SEO
          title="FinFiler | India's Tax Filing Platform"
          description="File your ITR in minutes with FinFiler — accurate, fast, and backed by real tax experts."
        />

        {/* ============================== HERO ============================== */}
        <section className="relative pt-8 pb-14 lg:pt-10 lg:pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              custom={0} 
              variants={heroFade} 
              className="flex flex-wrap items-center gap-3 mb-5 text-sm"
            >
              <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 font-semibold text-slate-700 text-xs sm:text-sm">
                6M+ <span className="font-normal text-slate-500">Users</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-700 text-xs sm:text-sm">
                <Star size={15} className="fill-amber-400 text-amber-400" /> 4.6
              </span>
              <span className="text-slate-400">|</span>
              <Link to="/reviews" className="text-blue-600 font-semibold underline underline-offset-2 text-xs sm:text-sm">
                See reviews
              </Link>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* LEFT COLUMN */}
              <div>
                <motion.h1 
                  initial="hidden" 
                  animate="visible" 
                  custom={1} 
                  variants={heroFade} 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] text-slate-900 mb-4"
                >
                  File ITR in minutes<br />with <span className="text-blue-600">100% Accuracy</span>
                </motion.h1>
                
                <motion.div 
                  initial="hidden" 
                  animate="visible" 
                  custom={2} 
                  variants={heroFade} 
                  className="inline-block bg-emerald-50 text-emerald-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg mb-4"
                >
                  Maximum Tax Refund, Guaranteed
                </motion.div>
                
                <motion.div 
                  initial="hidden" 
                  animate="visible" 
                  custom={3} 
                  variants={heroFade} 
                  className="flex items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm mb-6 max-w-md"
                >
                  <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs sm:text-sm text-slate-600">
                    <span className="font-bold text-slate-900">FinFiler Filing Shield</span> — got a notice? We handle it free. Computation error? Full refund.
                  </p>
                </motion.div>
                
                <motion.div 
                  initial="hidden" 
                  animate="visible" 
                  custom={4} 
                  variants={heroFade} 
                  className="grid sm:grid-cols-2 gap-4 max-w-lg"
                >
                  <div className="bg-gradient-to-br from-amber-50 to-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <FileCheck2 size={26} className="text-amber-500 mb-3" />
                    <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">File your taxes</p>
                    <p className="text-xs sm:text-sm text-slate-500 mb-3">In 3 simple steps</p>
                    <Link 
                      to={REGISTER_PATH} 
                      className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
                    >
                      Start Filing Now
                    </Link>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <UserCog size={26} className="text-rose-500 mb-3" />
                    <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">Expert files for you</p>
                    <p className="text-xs sm:text-sm text-slate-500 mb-3">ITR filed in 24 hrs</p>
                    <Link 
                      to="/experts" 
                      className="inline-block w-full text-center bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-semibold px-4 py-2.5 rounded-lg"
                    >
                      Hire an Expert
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN - Hero Image with Floating Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.94 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.7, delay: 0.2 }} 
                className="relative flex justify-center lg:justify-end mt-8 lg:mt-0"
              >
                <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:mt-16">
                  <AccuracyRing />
                  <div className="absolute inset-[18px] rounded-full overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=700" 
                      alt="Person checking tax filing on phone" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                {/* Floating card - positioned absolutely */}
                <TaxBreakdownCard className="absolute top-0 left-0 sm:top-4 sm:left-4 md:top-20 md:left-4 lg:top-20" />
              </motion.div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6 mt-10">
              <div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">₹ 3,120 Cr+</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Lifetime ITR refund delivered</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">6 M+</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Users trust us</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Figures shown are illustrative placeholder data.</p>
          </div>
        </section>

        {/* ============================== PERSONAS ============================== */}
        <section className="py-14 lg:py-20 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold text-center text-slate-900 mb-10 leading-tight">
              India's most trusted <span className="text-blue-600">tax filing platform</span> for
            </h2>
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.1 }} 
              variants={cardGridStagger} 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            >
              {personas.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.div 
                    key={p.title} 
                    variants={cardItem} 
                    className={`${p.bg} rounded-2xl p-5 md:p-6 border border-slate-100 card-hover`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">{p.title}</h3>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${p.iconBg}`}>
                        <Icon size={20} className="md:w-[22px] md:h-[22px]" />
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm mb-5">{p.desc}</p>
                    <Link 
                      to={`/services?for=${encodeURIComponent(p.title)}`} 
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      Learn more <ArrowRight size={15} />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ============================== WHY CHOOSE US - CAROUSEL ============================== */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold text-center text-slate-900 mb-10">
              Why choose <span className="text-blue-600">FinFiler</span> to file your taxes
            </h2>
            
            {/* CAROUSEL */}
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {whyCards.map((card) => (
                  <div key={card.id} className="w-full flex-shrink-0 relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px]">
                    <img 
                      src={card.photo} 
                      alt={card.caption} 
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                    <p className="absolute bottom-6 left-6 right-6 text-white font-semibold text-sm sm:text-base leading-snug max-w-2xl">
                      {card.caption}
                    </p>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {whyCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === i ? 'w-6 bg-blue-600' : 'w-2 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================== ACCURACY FEATURES ============================== */}
        <section className="py-14 lg:py-20 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold text-center text-slate-900 mb-10 leading-tight">
              Tax filing, as easy as it gets.<br />
              And as <span className="text-blue-600">accurate as it needs to be.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {accuracyCards.map((card, i) => (
                <motion.div 
                  key={card.title} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6"
                >
                  <p className="font-bold text-slate-900 text-center mb-5 leading-snug text-sm md:text-base">
                    {card.title}
                  </p>
                  {card.rows && (
                    <div className="space-y-3">
                      {card.rows.map((r) => (
                        <div key={r.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 md:px-4 py-2 md:py-3">
                          <span className="text-xs md:text-sm text-slate-700">{r.label}</span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {r.value} ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {card.regimes && (
                    <div className="space-y-4">
                      {card.regimes.map((r) => (
                        <div key={r.label} className="bg-slate-50 rounded-lg px-3 md:px-4 py-2 md:py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                            <span className="text-xs md:text-sm font-semibold text-slate-800">{r.label}</span>
                            <span className={`text-xs md:text-sm font-semibold ${r.good ? 'text-emerald-600' : 'text-rose-500'}`}>
                              Tax payable {r.amount}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                r.good ? 'w-1/3 bg-emerald-500' : 'w-4/5 bg-rose-400'
                              }`} 
                            />
                          </div>
                          {r.good && r.savings && (
                            <p className="text-[10px] text-emerald-600 mt-1 font-medium">{r.savings}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== REFUND BANNER ============================== */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-sky-100 p-6 md:p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
                  File ITR in Minutes<br />with <span className="text-blue-600">100% Accuracy</span>
                </h3>
                <p className="text-slate-600 mb-5 text-sm sm:text-base">Maximum Tax Refund, Guaranteed</p>
                <Link 
                  to={REGISTER_PATH} 
                  className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base mb-5"
                >
                  Start Filing Now
                </Link>
                <div className="flex items-start sm:items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm max-w-sm">
                  <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-slate-900">FinFiler Filing Shield</span> — notice handled free, computation errors fully refunded.
                  </p>
                </div>
              </div>
              <div className="relative flex justify-center">
                <div className="relative w-full max-w-xs">
                  <img 
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500" 
                    alt="Person holding phone showing refund amount" 
                    className="w-full rounded-2xl shadow-xl"
                    loading="lazy"
                  />
                  <div className="absolute top-4 sm:top-8 -left-4 sm:-left-6 bg-amber-300 rounded-xl shadow-lg px-4 sm:px-5 py-3 sm:py-4 rotate-[-4deg]">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-800">ITR Refund</p>
                    <p className="text-lg sm:text-2xl font-extrabold text-slate-900">₹ 71,240</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== INSTANT EXPERT MATCH ============================== */}
        <section className="py-14 lg:py-20 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-7">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Instant Expert Match</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-6">A senior tax expert is assigned within the hour. No queues.</p>
                <div className="relative h-44 sm:h-52">
                  {experts.map((e, i) => (
                    <div
                      key={e.name}
                      className="absolute w-28 sm:w-36 rounded-xl overflow-hidden shadow-lg border border-white"
                      style={{ 
                        left: `${i * 55}px`, 
                        top: i === 1 ? 0 : 18, 
                        zIndex: i === 1 ? 10 : 5, 
                        transform: i === 1 ? 'scale(1.08)' : 'scale(1)' 
                      }}
                    >
                      <img src={e.photo} alt={e.name} className="w-full h-24 sm:h-32 object-cover" loading="lazy" />
                      <div className="bg-slate-900 text-white p-1.5 sm:p-2">
                        <p className="text-[10px] sm:text-xs font-bold flex items-center gap-1">
                          {e.name} {i === 1 && <BadgeCheck size={12} className="text-blue-400" />}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-white/60">{e.role}</p>
                        <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                          <span className="text-[8px] sm:text-[10px] text-white/50">{e.years}</span>
                          <span className="text-[8px] sm:text-[10px] flex items-center gap-0.5">
                            <Star size={9} className="fill-amber-400 text-amber-400" />{e.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-rows-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 rounded-lg px-3 md:px-4 py-2 md:py-3 mb-3 gap-1">
                    <span className="text-xs sm:text-sm text-slate-700">Tax saving deductions</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Check size={13} /> Auto filled
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-center text-sm sm:text-base">Zero Manual Entry. Zero Delays.</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 text-center mt-1">
                    Form 16, AIS, 26AS — pulled and pre-filled in minutes.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-7">
                  <div className="bg-slate-50 rounded-lg px-3 md:px-4 py-2 md:py-3 mb-3 text-[10px] sm:text-xs text-slate-600">
                    Tax summary — Gross Income ₹28,40,000
                  </div>
                  <p className="font-bold text-slate-900 text-center text-sm sm:text-base">No back and forth, no revision loops.</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 text-center mt-1">
                    Everything captured upfront, so filing happens in one shot.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-7 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <div className="flex items-end gap-3 h-20 sm:h-24">
                <div className="w-6 sm:w-8 bg-emerald-400 rounded-t-md h-full" />
                <div className="w-6 sm:w-8 bg-blue-200 rounded-t-md h-2/3" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 text-center sm:text-left">
                Average filing time: <span className="text-blue-600">12 hours.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ============================== FILE WITH CONFIDENCE ============================== */}
        <section className="py-14 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="rounded-3xl overflow-hidden bg-slate-50 grid lg:grid-cols-2 gap-8 items-center p-6 md:p-8 lg:p-0">
              <div className="lg:pl-12 order-2 lg:order-1">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-600 mb-3 leading-tight">
                  File with confidence
                </h3>
                <p className="text-slate-600 mb-5 max-w-sm text-sm sm:text-base">
                  with every detail handled right from start to submission.
                </p>
                <Link 
                  to="/experts" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base"
                >
                  Hire a Tax Expert
                </Link>
              </div>
              <div className="relative h-56 sm:h-72 lg:h-96 order-1 lg:order-2">
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800" 
                  alt="Tax expert reviewing return with client" 
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                  <AccuracyRing colorA="rgba(255,255,255,0.35)" colorB="#ffffff" />
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <span className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full mb-4">
                FinFiler Verified Experts
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                Need help? India's top tax experts are one hire away.
              </h3>
            </div>
          </div>
        </section>

        {/* ============================== PRICING ============================== */}
        <section className="py-14 lg:py-20 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold text-center text-slate-900 mb-10">
              Plans for every kind of filer
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {pricingTiers.map((t) => (
                <div 
                  key={t.name} 
                  className={`bg-white rounded-2xl border p-5 md:p-6 text-center card-hover relative ${
                    t.popular ? 'border-blue-400 shadow-md' : 'border-slate-100'
                  }`}
                >
                  {t.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] sm:text-[10px] font-bold px-3 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  <p className={`font-extrabold text-base sm:text-lg mb-1 ${t.color}`}>{t.name}</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">{t.price}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-5">{t.desc}</p>
                  <Link 
                    to={REGISTER_PATH} 
                    className="inline-block w-full text-center border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg"
                  >
                    Choose plan
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-6">Sample pricing shown for illustration only.</p>
          </div>
        </section>
      </div>
    </>
  );
}