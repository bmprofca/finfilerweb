import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, ShieldCheck, Award } from 'lucide-react';
import SEO from '../../components/public/SEO';

const stats = [
  { label: 'Happy Clients', value: '10K+', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Years Experience', value: '15+', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Filings Completed', value: '50K+', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Secure Platforms', value: '100%', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-100' },
];

const team = [
  { name: 'Amit Sharma', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400' },
  { name: 'Priya Patel', role: 'Head of Compliance', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Rahul Verma', role: 'Chief Tax Advisor', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400' },
  { name: 'Neha Gupta', role: 'VP Operations', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' }
];

export default function About() {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 overflow-x-hidden">
      <SEO title="About Us | FinFiler" description="Learn about our mission to simplify financial compliance." />

      {/* HEADER SECTION */}
      <section className="pt-20 pb-8 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <svg className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/4" width="600" height="600" fill="none" viewBox="0 0 404 404" aria-hidden="true">
              <defs><pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" fill="currentColor" className="text-blue-100" /></pattern></defs>
              <rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
            </svg>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Simplifying <span className="text-blue-600">Compliance</span> for India</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We started FinFiler with a simple belief: growing your business shouldn't mean drowning in paperwork. 
              Our technology makes taxes and compliance invisible, so you can focus on what matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center p-6 text-center border border-slate-100 rounded-3xl shadow-sm hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" alt="Team meeting" className="rounded-3xl shadow-2xl" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-slate-600">
              <p>Founded in 2018, FinFiler was born out of frustration. Our founders realized that small businesses spend up to 20% of their time just managing compliance.</p>
              <p>We built a platform that integrates directly with your workflow. No more manual data entry, no more missed deadlines. Just clean, accurate filings done on time.</p>
              <p>Today, we're proud to serve thousands of businesses across the country, from solo freelancers to enterprise corporations.</p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
