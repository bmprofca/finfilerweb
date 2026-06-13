import { motion } from 'framer-motion'
import { ShieldCheck, FileText, TrendingUp, Users, ArrowRight, CheckCircle2, Star } from 'lucide-react'

const services = [
  {
    icon: FileText,
    title: 'Personal Tax Filing',
    description: 'Accurate and hassle-free federal & state income tax return preparation by certified CPAs.',
    price: '$149',
    period: '/ return',
    badge: 'Most Popular',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    accentFrom: 'from-indigo-50',
    accentBorder: 'border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-600',
    features: ['Federal + State Returns', 'Deduction Optimizer', 'E-File Included', 'Audit Support'],
  },
  {
    icon: TrendingUp,
    title: 'Business Tax Filing',
    description: 'Comprehensive tax solutions for LLCs, S-Corps, and sole proprietors to maximize deductions.',
    price: '$349',
    period: '/ return',
    badge: 'Business',
    badgeColor: 'bg-purple-100 text-purple-700',
    accentFrom: 'from-purple-50',
    accentBorder: 'border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
    features: ['Business Entity Filing', 'Payroll Tax Review', 'Quarterly Planning', 'CPA Consultation'],
  },
  {
    icon: ShieldCheck,
    title: 'IRS Audit Defense',
    description: 'Expert representation and document preparation if you receive an IRS notice or audit.',
    price: '$499',
    period: '/ case',
    badge: 'Protection',
    badgeColor: 'bg-amber-100 text-amber-700',
    accentFrom: 'from-amber-50',
    accentBorder: 'border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    features: ['IRS Correspondence', 'Document Preparation', 'Expert CPA Advocate', 'Resolution Strategy'],
  },
  {
    icon: Users,
    title: 'Tax Consultation',
    description: '1-on-1 strategy sessions with a senior CPA to plan your taxes and minimize your liability.',
    price: '$89',
    period: '/ hour',
    badge: 'Advisory',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    accentFrom: 'from-emerald-50',
    accentBorder: 'border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
    features: ['Personal CPA Advisor', 'Tax Strategy Session', 'Year-round Access', 'Priority Support'],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function Services() {
  return (
    <motion.div
      className="mx-auto max-w-6xl py-6 sm:py-8 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            <Star size={12} /> Our Services
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Expert Tax Solutions
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-slate-500 max-w-2xl">
          Professional tax services tailored to your needs. Certified CPAs ready to maximize your refund and minimize your liability.
        </p>
      </motion.div>

      {/* Service Cards */}
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <motion.div
              key={service.title}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400 } }}
              className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border ${service.accentBorder} bg-gradient-to-br ${service.accentFrom} to-white p-5 sm:p-7 shadow-soft`}
            >
              {/* Badge */}
              <span className={`absolute top-4 right-4 sm:top-5 sm:right-5 text-xs font-bold px-2.5 py-1 rounded-full ${service.badgeColor}`}>
                {service.badge}
              </span>

              <div className={`mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${service.iconBg}`}>
                <Icon size={22} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{service.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{service.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={15} className="text-indigo-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">{service.price}</span>
                  <span className="text-slate-400 text-sm ml-1">{service.period}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Get Started <ArrowRight size={15} />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* CTA Banner */}
      <motion.div
        variants={itemVariants}
        className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
      >
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Not sure what you need?</h3>
          <p className="text-indigo-100 text-sm sm:text-base">Book a free 15-minute consultation with one of our CPAs.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex-shrink-0 flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:shadow-xl w-full sm:w-auto justify-center"
        >
          Book Free Call <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
