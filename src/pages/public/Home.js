import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket, Briefcase, Building2, UserCheck, Check, ArrowRight,
  ShieldCheck, Zap, MessageCircle, Globe, Star
} from 'lucide-react';
import { clientRoute } from '../../constants/routes';
import SEO from '../../components/public/SEO';

const personas = [
  { title: 'Startups', desc: 'Company incorporation & GST.', icon: Rocket, href: '/services?for=startups', color: 'from-pink-500 to-rose-400' },
  { title: 'Professionals', desc: 'ITR & advance tax planning.', icon: Briefcase, href: '/services?for=professionals', color: 'from-blue-500 to-cyan-400' },
  { title: 'Businesses', desc: 'GST returns & annual compliance.', icon: Building2, href: '/services?for=business', color: 'from-amber-400 to-orange-400' },
  { title: 'Individuals', desc: 'Simple guided income tax filing.', icon: UserCheck, href: '/services?for=individuals', color: 'from-emerald-400 to-teal-400' },
];

const whyItems = [
  { title: 'Lightning Fast', desc: 'Clear timelines, fast processing.', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { title: 'Expert Support', desc: 'Guidance at every step.', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  { title: 'Fully Digital', desc: '100% online tracking.', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-100' },
  { title: 'Secure & Trusted', desc: 'Your data is safe with us.', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100' },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  return (
    <main className="bg-white min-h-screen font-sans text-slate-800 overflow-x-hidden">
      <SEO title="FinFiler | Modern Financial Compliance" description="Fast, colorful, and highly animated financial compliance platform." />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Colorful Abstract Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-gradient-to-br from-pink-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-40 left-0 -ml-20 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-yellow-200 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 mb-6 text-sm font-bold text-indigo-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              Next-Gen Compliance Platform
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Compliance Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Beautiful.</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg lg:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Experience the fastest, most vibrant way to handle your taxes, company registration, and ongoing compliance. No more boring paperwork.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to={clientRoute('/register')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link to="/services" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-all text-center">
                Explore Services
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 border-8 border-white bg-white">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" alt="Dashboard Preview" className="w-full h-auto object-cover" />
              
              {/* Floating Element */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">GST Filed</p>
                  <p className="text-xs text-slate-500">Just now</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PERSONAS GRID */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Everyone</span></h2>
            <p className="text-lg text-slate-600">Tailored financial journeys based on who you are.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={p.href} className="block h-full bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-2 transition-all duration-300 group overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${p.color} opacity-10 rounded-bl-[100px] group-hover:scale-150 transition-transform duration-500`} />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{p.title}</h3>
                    <p className="text-slate-600 text-sm mb-6 relative z-10">{p.desc}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors relative z-10">
                      Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Why thousands trust <span className="text-indigo-600">FinFiler</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10">
                We blend top-tier financial expertise with beautiful, easy-to-use software. Managing your compliance shouldn't feel like a chore.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {whyItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 relative">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" alt="Happy Team" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(star => <Star key={star} size={18} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="font-bold text-lg">"Saved me 10 hours a month on GST filings!"</p>
                    <p className="text-white/80 text-sm">Ravi K, Freelancer</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6">Ready for effortless compliance?</h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">Join thousands of modern businesses who have simplified their paperwork.</p>
            <Link to={clientRoute('/register')} className="inline-block px-10 py-5 bg-white text-indigo-700 font-extrabold rounded-full shadow-xl hover:scale-105 transition-transform duration-300">
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}