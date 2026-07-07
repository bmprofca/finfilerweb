import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchServices } from '../../utils/public/api';
import ServiceCard from '../../components/public/ServiceCard';
import { ServiceCardSkeleton } from '../../components/public/ServiceSkeleton';
import SEO from '../../components/public/SEO';
import { Search, Filter } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetchServices({ pageNo: 1, limit: 50 })
      .then(data => setServices(data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = services.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.description?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <SEO title="Our Services | FinFiler" description="Explore our comprehensive range of financial compliance services." />

      <section className="pt-20 pb-8 bg-white relative border-b border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto relative flex items-center">
             <div className="absolute left-4 text-slate-400">
                <Search size={20} />
             </div>
             <input 
               type="text" 
               placeholder="Search for a service (e.g. GST Registration)" 
               className="w-full pl-12 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm text-lg"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <div className="absolute right-4 text-slate-400 p-2 bg-white rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50">
               <Filter size={14} />
             </div>
          </motion.div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{filteredServices.length} Services Found</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            ) : filteredServices.length > 0 ? (
              filteredServices.map((service, i) => (
                <motion.div key={service.service_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}>
                  <ServiceCard service={service} index={i} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
                <p className="text-slate-500">Try adjusting your search term.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
