import { motion } from 'framer-motion'
import { DollarSign, Briefcase, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Plus, ChevronRight } from 'lucide-react'

const accounts = [
  { label: 'Primary Checking', bank: 'Chase Bank', balance: '$24,560.00', change: '+2.3%', positive: true },
  { label: 'Business Account', bank: 'Bank of America', balance: '$87,200.00', change: '+5.8%', positive: true },
  { label: 'Investment Portfolio', bank: 'Fidelity', balance: '$142,850.00', change: '-1.2%', positive: false },
]

const transactions = [
  { desc: 'IRS Tax Refund Deposited', date: 'Jun 10, 2025', amount: '+$3,240', positive: true, category: 'Refund' },
  { desc: 'finfiler — Tax Filing Fee', date: 'Jun 08, 2025', amount: '-$149', positive: false, category: 'Service' },
  { desc: 'W-2 Employer Income', date: 'Jun 01, 2025', amount: '+$6,800', positive: true, category: 'Income' },
  { desc: 'Quarterly Estimated Tax', date: 'May 15, 2025', amount: '-$1,200', positive: false, category: 'Tax Payment' },
  { desc: 'Business Revenue', date: 'May 01, 2025', amount: '+$12,500', positive: true, category: 'Income' },
]

const businessSummary = [
  { label: 'Gross Revenue (2025)', value: '$124,800', icon: TrendingUp, color: 'indigo' },
  { label: 'Total Deductions', value: '$38,400', icon: PieChart, color: 'purple' },
  { label: 'Net Taxable Income', value: '$86,400', icon: DollarSign, color: 'emerald' },
  { label: 'Est. Tax Liability', value: '$19,720', icon: Briefcase, color: 'amber' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
}

const itemVariants = {
  hidden: { y: 22, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function FundsBusiness() {
  return (
    <motion.div
      className="mx-auto max-w-8xl py-6 sm:py-8 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">Funds & Business</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-slate-500">Financial overview, accounts, and business income summary.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Link Account
        </motion.button>
      </motion.div>

      {/* Business Summary Cards */}
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {businessSummary.map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-2xl border border-${color}-100 bg-gradient-to-br from-${color}-50 to-white p-4 sm:p-5 shadow-soft`}
          >
            <div className={`mb-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-${color}-100 text-${color}-600`}>
              <Icon size={18} />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Linked Accounts */}
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Linked Accounts</h2>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
          {accounts.map((acc) => (
            <motion.div
              key={acc.label}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-soft cursor-pointer group transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <DollarSign size={18} className="text-slate-600" />
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition" />
              </div>
              <p className="text-xs text-slate-500 mb-0.5">{acc.bank}</p>
              <p className="font-semibold text-slate-800 text-sm mb-2">{acc.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{acc.balance}</p>
              <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${acc.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {acc.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {acc.change} this month
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-soft">
          <ul className="divide-y divide-slate-100">
            {transactions.map((tx, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ backgroundColor: 'rgba(248,250,252,1)' }}
                className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center ${tx.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {tx.positive ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{tx.desc}</p>
                    <p className="text-xs text-slate-400">{tx.date} · <span className="text-indigo-500">{tx.category}</span></p>
                  </div>
                </div>
                <p className={`text-sm sm:text-base font-bold flex-shrink-0 ml-4 ${tx.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.amount}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
}
