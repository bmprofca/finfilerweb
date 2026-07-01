import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function LegalLayout({ title, description, children, lastUpdated }) {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 pb-8">
      <SEO title={`${title} | FinFiler`} description={description} />

      {/* Header */}
      <section className="pt-12 pb-8 relative overflow-hidden">
        {/* Colorful Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 font-semibold transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              {title.split(' ').map((word, index, array) => (
                <span key={index} className={index === array.length - 1 ? "text-blue-600" : ""}>
                  {word}{index < array.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>
            <p className="text-lg text-slate-500">Last updated: {lastUpdated}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-sm p-8 md:p-12 shadow-xl shadow-blue-900/5 border border-slate-100 prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-a:text-blue-600 relative">
            {children}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
