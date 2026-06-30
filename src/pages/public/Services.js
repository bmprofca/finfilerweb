import { useState, useEffect, useCallback, useRef } from 'react';
import ServiceCard from '../../components/public/ServiceCard';
import PageHeader from '../../components/public/WebsitePageHeader';
import { ServiceCardSkeleton } from '../../components/public/ServiceSkeleton';
import { fetchServices } from '../../utils/public/api';
import SEO from '../../components/public/SEO';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await fetchServices({ pageNo: 1, limit: 100 }, { signal: controller.signal });
      setServices(data.services || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load services.');
        setServices([]);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadServices();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadServices]);

  return (
    <>
      <SEO title="Our Services | FinFiler" description="Explore our comprehensive range of financial and compliance services, from GST registration to ITR filing and company incorporation." />
      
      <PageHeader
        label="Services"
        title="Our Services"
        subtitle="Choose from a range of financial and compliance services tailored for Indian businesses and taxpayers."
        centered
      />

      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <span className="text-red-500 text-2xl font-bold">!</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button 
                type="button" 
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                onClick={loadServices}
              >
                Try Again
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <span className="text-slate-400">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
              <p className="text-slate-500">We couldn't find any services at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <ServiceCard key={service.service_id} service={service} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Services;
