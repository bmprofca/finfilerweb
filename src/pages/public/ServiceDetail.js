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
    <div className="bg-white min-h-screen font-sans text-slate-800 relative">
      <SEO title={`${service.name} | FinFiler`} description={service.description} />

      {/* Progress Bar (Optional, can be removed if not needed for services) */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-blue-500 origin-left z-50" />

      <article className="pt-20 pb-16">
        {/* HEADER */}
        <header className="max-w-7xl mx-auto px-6 text-center mb-6">
          <Link to="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 font-semibold transition-colors">
            <ArrowLeft size={18} /> Back to services
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
              {service.type || 'Compliance Service'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              {service.name}
            </h1>
          </motion.div>
        </header>

        {/* DESKTOP SPLIT / MOBILE STACK */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDE: COVER IMAGE */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 relative">
            <div className="sticky top-24 w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100">
              {service.image ? (
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-8 text-center">
                  <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full mb-4 flex items-center justify-center">
                    <FileText size={24} className="text-slate-400" />
                  </div>
                  <p className="font-medium text-sm">No Image Available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT SIDE: CONTENT */}
          <div className="lg:col-span-7 relative">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              
              {/* Description */}
              <div className="prose prose-lg prose-slate max-w-none mb-10">
                <div className="text-lg text-slate-600 whitespace-pre-line leading-relaxed">
                  {service.description}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {/* Timeline */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" /> Delivery Time
                  </h3>
                  <p className="text-slate-600 font-medium">{service.delivery_time || 'Standard Timeline'}</p>
                </div>

                {/* Pricing Box */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                   <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Total Fees</p>
                   <div className="flex items-center text-4xl font-extrabold text-slate-900">
                     <IndianRupee size={28} strokeWidth={3} className="text-slate-400 mr-1" />
                     {service.fees || service.total_fees || service.base_price}
                   </div>
                   {service.discount_value > 0 && (
                     <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-1">
                       <CheckCircle2 size={16} /> Includes discount of ₹{service.discount_value}
                     </p>
                   )}
                </div>
              </div>

              {/* Requirements Section */}
              <div className="mb-12 space-y-8">
                 {/* Required Documents */}
                 {service.documents && service.documents.length > 0 && (
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText size={22} className="text-blue-500" /> Documents Needed
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {service.documents.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <CheckCircle2 size={14} strokeWidth={3} />
                            </div>
                            <span className="text-slate-700 font-medium">
                              {doc.name} 
                              <span className="block text-slate-400 font-normal text-sm mt-0.5">
                                {doc.is_required ? 'Required' : 'Optional'}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                   </div>
                 )}

                 {/* Required Fields */}
                 {service.fields && Object.keys(service.fields).filter(k => service.fields[k]).length > 0 && (
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={22} className="text-emerald-500" /> Required Information
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.keys(service.fields).filter(k => service.fields[k]).map((field, idx) => (
                          <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium capitalize border border-emerald-100 shadow-sm">
                            {field.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Action Button */}
              <div className="pt-8 border-t border-slate-100">
                <Link to={REGISTER_PATH} className="group flex items-center justify-center w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl py-4 sm:px-12 transition-all shadow-[0_8px_30px_rgb(37,99,235,0.24)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.36)] text-lg relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Proceed to Registration <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </Link>
                <p className="text-slate-500 mt-4 font-semibold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500" /> 100% Secure Checkout & Encrypted Data
                </p>
              </div>

            </motion.div>
          </div>

        </div>
      </article>
    </div>
  );
}
