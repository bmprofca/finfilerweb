import { useState, useEffect, useCallback } from 'react';
import ServiceCard from '../../components/public/ServiceCard';
import PageHeader from '../../components/public/WebsitePageHeader';
import { ServiceCardSkeleton } from '../../components/public/ServiceSkeleton';
import { fetchServices } from '../../utils/public/api';
import SEO from '../../components/public/SEO';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServices({ pageNo: 1, limit: 100 });
      setServices(data.services || []);
    } catch (err) {
      setError(err.message || 'Failed to load services.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return (
    <>
      <SEO title="Our Services | FinFiler" description="Explore our comprehensive range of financial and compliance services, from GST registration to ITR filing and company incorporation." />
      <PageHeader
        label="Services"
        title="Our Services"
        subtitle="Choose from a range of financial and compliance services tailored for Indian businesses and taxpayers."
      />

      <section className="section page-top">
        <div className="container">
          {loading ? (
            <div className="service-grid service-grid--padded">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="services-state services-state--error">
              <p>{error}</p>
              <button type="button" className="btn btn-primary" onClick={loadServices}>
                Try Again
              </button>
            </div>
          ) : services.length === 0 ? (
            <div className="services-state">
              <p>No services are available at the moment.</p>
            </div>
          ) : (
            <div className="service-grid service-grid--padded">
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
