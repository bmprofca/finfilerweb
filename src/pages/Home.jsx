import { Plus, CheckCircle2, Circle, FileText, Calendar, UploadCloud, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

const tasks = [
  { id: 1, title: 'Upload 2024 W-2 form', done: true },
  { id: 2, title: 'Complete personal details questionnaire', done: true },
  { id: 3, title: 'Upload 1099-INT from Chase Bank', done: false },
  { id: 4, title: 'Review preliminary tax strategy draft', done: false },
  { id: 5, title: 'Schedule 15-min call with CPA', done: false },
]

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  return (
    <motion.div 
      className="mx-auto max-w-5xl py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8 sm:mb-10 flex flex-col gap-1 sm:gap-2">
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">Welcome back, Asha</h1>
        <p className="text-sm sm:text-lg text-slate-500">Your tax return is currently being processed by our experts.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVariants} className="mb-8 sm:mb-10 grid gap-4 sm:gap-6 sm:grid-cols-3">
        <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-soft">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-100/50 blur-2xl"></div>
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-semibold">Est. Federal Refund</span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-slate-900">$3,240</p>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 shadow-soft">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-100/50 blur-2xl"></div>
          <div className="flex items-center gap-3 text-purple-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <UploadCloud size={20} />
            </div>
            <span className="text-sm font-semibold">Documents Uploaded</span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-slate-900">6 of 8</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-soft">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-100/50 blur-2xl"></div>
          <div className="flex items-center gap-3 text-blue-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-semibold">Days to Deadline</span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-slate-900">32 Days</p>
        </motion.div>
      </motion.div>

      {/* Tasks */}
      <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-soft">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Required Actions</h2>
              <p className="text-xs sm:text-sm text-slate-500">Please complete these to finalize your return</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 sm:px-5 sm:py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-700 w-full sm:w-auto"
          >
            <Plus size={18} />
            Upload Document
          </motion.button>
        </div>

        <ul className="divide-y divide-slate-100">
          {tasks.map((task, index) => (
            <motion.li 
              key={task.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5, backgroundColor: "rgba(248, 250, 252, 1)" }}
              className="flex cursor-pointer items-start sm:items-center gap-3 sm:gap-4 rounded-xl px-2 sm:px-4 py-3 sm:py-4 transition-colors"
            >
              <div className="mt-0.5 sm:mt-0">
                {task.done ? (
                  <CheckCircle2 size={20} className="sm:w-6 sm:h-6 flex-shrink-0 text-indigo-500" />
                ) : (
                  <Circle size={20} className="sm:w-6 sm:h-6 flex-shrink-0 text-slate-300" />
                )}
              </div>
              <span className={`text-sm sm:text-base font-medium leading-tight sm:leading-normal ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {task.title}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
