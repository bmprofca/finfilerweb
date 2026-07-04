import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import SEO from '../../components/public/SEO';

const OFFICE_ADDRESS = 'Wahab Nagar, Sunarupatty, Kharupetia, Darrang, Assam – 784115';
const MAP_QUERY = encodeURIComponent(`${OFFICE_ADDRESS}, India`);
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${MAP_QUERY}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

const contactCards = [
  {
    icon: Mail,
    iconBg: 'bg-blue-50 text-blue-600',
    title: 'Email Us',
    desc: 'Our friendly team is here to help.',
    value: 'support@finfiler.com',
    href: 'mailto:support@finfiler.com',
  },
  {
    icon: MapPin,
    iconBg: 'bg-emerald-50 text-emerald-600',
    title: 'Office',
    desc: 'Come say hello at our headquarters.',
    value: OFFICE_ADDRESS,
    href: MAP_DIRECTIONS_URL,
    external: true,
  },
  {
    icon: Phone,
    iconBg: 'bg-purple-50 text-purple-600',
    title: 'Phone',
    desc: 'Mon-Fri from 9am to 6pm.',
    value: '+91 6026089502',
    href: 'tel:+916026089502',
  },
];

export default function Contact() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <SEO title="Contact Us | FinFiler" description="Get in touch with FinFiler for your financial compliance needs." />

      <section className="pt-20 mb-6 pb-20 relative overflow-hidden">
        {/* Colorful Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-5"
            >
              Get in touch
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Let's talk <span className="text-blue-600">business</span>.</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-slate-600">
              Whether you have a question about our services, pricing, or just want to say hi, our team is ready to answer all your questions.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              {contactCards.map(({ icon: Icon, iconBg, title, desc, value, href, external }) => (
                <a
                  key={title}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group flex items-start gap-4 bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-0.5 hover:border-blue-100 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900">{title}</h3>
                      <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
                    </div>
                    <p className="text-slate-600 text-sm">{desc}</p>
                    <p className="text-blue-600 font-semibold mt-2 group-hover:underline">{value}</p>
                  </div>
                </a>
              ))}

              <div className="flex items-start gap-4 bg-gradient-to-br from-slate-900 to-slate-800 p-7 rounded-3xl shadow-lg shadow-slate-900/10 text-white">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Business Hours</h3>
                  <p className="text-slate-300 text-sm">Monday – Friday</p>
                  <p className="text-white font-semibold mt-1">9:00 AM – 6:00 PM</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-3xl p-3 shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden"
            >
              <div className="relative w-full h-[420px] lg:h-full min-h-[420px] rounded-2xl overflow-hidden">
                <iframe
                  title="FinFiler Office Location"
                  src={MAP_EMBED_SRC}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-5 left-5 right-5 sm:right-auto flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-900/10 px-5 py-4 hover:bg-white transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">FinFiler Headquarters</p>
                    <p className="text-xs text-slate-500 truncate">{OFFICE_ADDRESS}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-400 ml-1 shrink-0" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
