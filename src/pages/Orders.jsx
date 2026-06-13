import { motion } from 'framer-motion'
import { ClipboardList, Clock, CheckCircle2, AlertCircle, ChevronRight, Filter } from 'lucide-react'
import { useState } from 'react'

const orders = [
  {
    id: 'ORD-2025-001',
    service: 'Personal Tax Filing',
    status: 'Completed',
    date: 'Apr 10, 2025',
    amount: '$149',
    cpa: 'Michael Torres',
    statusColor: 'bg-emerald-100 text-emerald-700',
    statusDot: 'bg-emerald-500',
  },
  {
    id: 'ORD-2025-002',
    service: 'Tax Consultation',
    status: 'In Progress',
    date: 'Jun 05, 2025',
    amount: '$89',
    cpa: 'Sarah Patel',
    statusColor: 'bg-blue-100 text-blue-700',
    statusDot: 'bg-blue-500',
  },
  {
    id: 'ORD-2025-003',
    service: 'IRS Audit Defense',
    status: 'Pending Review',
    date: 'Jun 12, 2025',
    amount: '$499',
    cpa: 'Unassigned',
    statusColor: 'bg-amber-100 text-amber-700',
    statusDot: 'bg-amber-500',
  },
  {
    id: 'ORD-2024-004',
    service: 'Personal Tax Filing',
    status: 'Completed',
    date: 'Mar 28, 2024',
    amount: '$149',
    cpa: 'Michael Torres',
    statusColor: 'bg-emerald-100 text-emerald-700',
    statusDot: 'bg-emerald-500',
  },
  {
    id: 'ORD-2024-005',
    service: 'Business Tax Filing',
    status: 'Cancelled',
    date: 'Jan 15, 2024',
    amount: '$349',
    cpa: 'N/A',
    statusColor: 'bg-red-100 text-red-700',
    statusDot: 'bg-red-400',
  },
]

const filterTabs = ['All', 'In Progress', 'Completed', 'Pending Review']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All' ? orders : orders.filter(o => o.status === activeFilter)

  return (
    <motion.div
      className="mx-auto max-w-5xl py-6 sm:py-8 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">My Orders</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-slate-500">Track all your service orders and their status.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 w-full sm:w-auto justify-center"
        >
          <Filter size={16} /> Filter
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8 grid grid-cols-3 gap-3 sm:gap-5">
        {[
          { label: 'Total Orders', value: '5', icon: ClipboardList, color: 'indigo' },
          { label: 'In Progress', value: '1', icon: Clock, color: 'blue' },
          { label: 'Completed', value: '2', icon: CheckCircle2, color: 'emerald' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-2xl border border-${color}-100 bg-gradient-to-br from-${color}-50 to-white p-3 sm:p-5 shadow-soft text-center`}
          >
            <div className={`mx-auto mb-2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-${color}-100 text-${color}-600`}>
              <Icon size={18} />
            </div>
            <p className={`text-xl sm:text-3xl font-bold text-${color}-700`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Order List */}
      <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-soft">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-slate-500 font-medium">No orders found for this filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((order, index) => (
              <motion.li
                key={order.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ backgroundColor: 'rgba(248,250,252,1)' }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="mt-0.5 sm:mt-0">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${order.statusDot} mt-1.5`}></span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">{order.service}</p>
                    <p className="text-xs text-slate-400">{order.id} · {order.date} · CPA: {order.cpa}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-5 sm:pl-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.statusColor}`}>{order.status}</span>
                  <span className="text-base font-bold text-slate-900 min-w-[56px] text-right">{order.amount}</span>
                  <ChevronRight size={18} className="text-slate-300 flex-shrink-0" />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}
