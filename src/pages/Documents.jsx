import { motion } from 'framer-motion'
import { UploadCloud, File, FileText, Image, Trash2, Download, Plus, Search, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const documents = [
  { id: 1, name: 'W-2 Form 2024 - Employer A.pdf', type: 'pdf', size: '245 KB', uploaded: 'Jun 01, 2025', category: 'Income', status: 'Verified' },
  { id: 2, name: '1099-INT Chase Bank.pdf', type: 'pdf', size: '88 KB', uploaded: 'Jun 05, 2025', category: 'Income', status: 'Pending' },
  { id: 3, name: 'Mortgage Interest Statement.pdf', type: 'pdf', size: '320 KB', uploaded: 'Jun 08, 2025', category: 'Deductions', status: 'Verified' },
  { id: 4, name: 'Charitable Donations 2024.jpg', type: 'image', size: '1.2 MB', uploaded: 'Jun 10, 2025', category: 'Deductions', status: 'Pending' },
  { id: 5, name: 'Business Expenses Q4.xlsx', type: 'doc', size: '540 KB', uploaded: 'Jun 12, 2025', category: 'Business', status: 'Verified' },
  { id: 6, name: 'Prior Year Return 2023.pdf', type: 'pdf', size: '780 KB', uploaded: 'May 28, 2025', category: 'Prior Returns', status: 'Verified' },
]

const categories = ['All', 'Income', 'Deductions', 'Business', 'Prior Returns']

const fileIconMap = {
  pdf: { icon: FileText, color: 'text-red-500 bg-red-50' },
  image: { icon: Image, color: 'text-blue-500 bg-blue-50' },
  doc: { icon: File, color: 'text-emerald-500 bg-emerald-50' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function Documents() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = documents.filter(doc => {
    const matchCat = activeCategory === 'All' || doc.category === activeCategory
    const matchQuery = doc.name.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQuery
  })

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
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">My Documents</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-slate-500">Manage and upload your tax documents securely.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Upload Document
        </motion.button>
      </motion.div>

      {/* Upload Drop Zone */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-8 sm:p-12 text-center cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          <UploadCloud size={28} />
        </div>
        <p className="text-base sm:text-lg font-semibold text-slate-800">Drag & drop your files here</p>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Supports PDF, JPG, PNG, XLSX up to 20MB</p>
        <span className="mt-4 inline-block rounded-xl bg-white border border-indigo-200 px-5 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:shadow-md transition">
          Browse Files
        </span>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Documents List */}
      <motion.div variants={itemVariants} className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-soft">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-slate-500 font-medium">No documents found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((doc, index) => {
              const { icon: FileIcon, color } = fileIconMap[doc.type] || fileIconMap['doc']
              return (
                <motion.li
                  key={doc.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ backgroundColor: 'rgba(248,250,252,1)' }}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 cursor-pointer transition-colors group"
                >
                  <div className={`flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <FileIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.size} · {doc.uploaded} · <span className="text-indigo-500">{doc.category}</span></p>
                  </div>
                  <span className={`hidden sm:inline-flex text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{doc.status}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition">
                      <Download size={15} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        )}
      </motion.div>
    </motion.div>
  )
}
