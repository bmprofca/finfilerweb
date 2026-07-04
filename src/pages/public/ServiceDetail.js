import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchServiceDetails } from '../../utils/public/api';
import SEO from '../../components/public/SEO';
import { REGISTER_PATH } from '../../constants/routes';
import { ArrowLeft, CheckCircle2, FileText, Clock, IndianRupee } from 'lucide-react';

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchServiceDetails(serviceId)
      .then(data => {
        if (!data) throw new Error('Service not found');
        setService(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Service not found</h2>
        <Link to="/services" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 pb-8">
      <SEO title={`${service.name} | FinFiler`} description={service.description} />

      {/* HERO SECTION */}
      <section className="bg-white pt-32 pb-16 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Link to="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-semibold transition-colors">
            <ArrowLeft size={18} /> Back to all services
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
                {service.category?.name || 'Compliance Service'}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                {service.name}
              </h1>
              <p className="text-xl text-slate-600">
                {service.description}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full md:w-80 bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 shrink-0">
              <div className="text-center mb-6">
                <p className="text-sm font-semibold text-slate-500 uppercase mb-1">Starting At</p>
                <div className="flex items-center justify-center text-4xl font-extrabold text-slate-900">
                  <IndianRupee size={32} strokeWidth={3} className="text-slate-400" />
                  {service.price}
                </div>
              </div>
              <Link to={REGISTER_PATH} className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4 transition-colors shadow-lg shadow-blue-600/20">
                Buy Now
              </Link>
              <p className="text-center text-xs text-slate-500 mt-4 font-medium">100% Secure Checkout</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">

          <div className="md:col-span-2 space-y-12">
            {/* Dynamic content if any, else placeholders */}
            {service.content && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-lg prose-slate prose-blue max-w-none bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div dangerouslySetInnerHTML={{ __html: service.content }} />
              </motion.div>
            )}

            {!service.content && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Overview</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Our {service.name} service is designed to be completely hassle-free. We handle the heavy lifting, paperwork, and compliance so you don't have to.
                  From start to finish, you will be assigned a dedicated expert who will guide you through the process.
                </p>
                <ul className="space-y-4">
                  {[
                    'Dedicated expert assigned to your case',
                    '100% online process with digital signatures',
                    'Fastest turnaround time in the industry',
                    'Free post-service support for 30 days'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" /> Timeline
              </h3>
              <p className="text-slate-600 font-medium">Typically completed within 3-5 business days upon receipt of all required documents.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" /> Documents Needed
              </h3>
              <ul className="space-y-2 text-slate-600 font-medium text-sm">
                <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">PAN Card Copy</li>
                <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">Aadhar Card</li>
                <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">Bank Statement</li>
                <li className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">Address Proof</li>
              </ul>
            </motion.div>
          </div>

        </div>
      </section>
    </div>
  );
}
