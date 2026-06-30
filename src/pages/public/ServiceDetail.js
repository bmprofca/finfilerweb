import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Clock,
  Tag,
  Receipt,
  IndianRupee,
  CheckCircle2,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { clientRoute } from '../../constants/routes';
import PageHeader from '../../components/public/WebsitePageHeader';
import { ServiceDetailSkeleton } from '../../components/public/ServiceSkeleton';
import { fetchServiceDetails } from '../../utils/public/api';
import {
  formatCurrency,
  formatServiceType,
  getDiscountLabel,
  hasStoredAuth,
} from '../../utils/public/format';
import { staggerContainer, staggerItem } from '../../utils/public/animations';
import SEO from '../../components/public/SEO';

const formatBytes = (bytes) => {
  const value = Number(bytes);
  if (!value) return null;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(value) / Math.log(k));
  return `${parseFloat((value / k ** i).toFixed(2))} ${sizes[i]}`;
};

const formatFieldLabel = (key) =>
  key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

function PriceRow({ label, value, muted, accent, highlight }) {
  return (
    <div className={`pricing-row${muted ? ' pricing-row--muted' : ''}${highlight ? ' pricing-row--highlight' : ''}`}>
      <span>{label}</span>
      <span className={accent ? 'pricing-row-value pricing-row-value--accent' : 'pricing-row-value'}>
        {value}
      </span>
    </div>
  );
}

function PricingPanel({ service, serviceId }) {
  const hasDiscount = Number(service.discount_value) > 0;
  const discountLabel = getDiscountLabel(service);
  const isAuthenticated = hasStoredAuth();
  const ctaHref = isAuthenticated
    ? clientRoute(`/services/${serviceId}`)
    : clientRoute('/register');
  const ctaLabel = isAuthenticated ? 'Continue to Order' : 'Register & Get Started';

  return (
    <div className="pricing-panel">
      <div className="pricing-panel-head">
        <span className="pricing-panel-icon">
          <Receipt size={18} aria-hidden />
        </span>
        <div>
          <h2>Pricing Details</h2>
          <p>Transparent fee breakdown with GST included</p>
        </div>
      </div>

      <div className="pricing-total-card">
        <div className="pricing-total-top">
          <div>
            <p className="pricing-total-label">Total payable</p>
            <p className="pricing-total-amount">{formatCurrency(service.fees)}</p>
          </div>
          {hasDiscount && (
            <div className="pricing-total-before">
              <p>Before discount</p>
              <p>{formatCurrency(service.total_fees)}</p>
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="pricing-save-badge">
            <Tag size={12} aria-hidden />
            You save {formatCurrency(service.discount_value)}
          </span>
        )}
      </div>

      <div className="pricing-breakdown">
        <PriceRow label="Base price" value={formatCurrency(service.base_price)} muted />
        <PriceRow
          label={`GST (${service.tax_rate ?? 0}%)`}
          value={`+${formatCurrency(service.tax_value)}`}
          muted
        />
        <PriceRow label="Subtotal" value={formatCurrency(service.total_fees)} />
        {hasDiscount && (
          <PriceRow
            label={`Discount (${discountLabel})`}
            value={`-${formatCurrency(service.discount_value)}`}
            accent
          />
        )}
        <PriceRow label="Final amount" value={formatCurrency(service.fees)} highlight />
      </div>

      <div className="pricing-note">
        <IndianRupee size={16} aria-hidden />
        <p>
          {hasDiscount
            ? 'Discount is applied automatically. The final amount shown above is what you pay.'
            : 'All taxes included. No hidden charges at checkout.'}
        </p>
      </div>

      <Link to={ctaHref} className="btn btn-primary btn-block pricing-cta">
        {ctaLabel}
      </Link>

      {!isAuthenticated && (
        <p className="pricing-login-hint">
          Already have an account?{' '}
          <Link to={clientRoute('/login')}>Sign in</Link>
        </p>
      )}
    </div>
  );
}

function ServiceDetail() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadService = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServiceDetails(serviceId);
      setService(data);
    } catch (err) {
      setError(err.message || 'Service not found');
      setService(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  if (loading) {
    return (
      <section className="section page-top">
        <div className="container detail-page">
          <ServiceDetailSkeleton />
        </div>
      </section>
    );
  }

  if (error || !service) {
    return (
      <>
        <PageHeader
          title="Service Not Found"
          subtitle={error || 'The service you are looking for does not exist.'}
        />
        <section className="section page-top">
          <div className="container">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Link to="/services" className="btn btn-primary">
                Back to Services
              </Link>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  const documents = service.documents || [];
  const requiredFields =
    service.fields && typeof service.fields === 'object' && !Array.isArray(service.fields)
      ? Object.entries(service.fields)
          .filter(([, required]) => Boolean(required))
          .map(([key]) => formatFieldLabel(key))
      : [];

  const highlights = [
    service.type && { icon: Sparkles, text: formatServiceType(service.type) },
    service.delivery_time && { icon: Clock, text: `Delivery in ${service.delivery_time}` },
  ].filter(Boolean);

  return (
    <>
      <SEO 
        title={`${service.name} | FinFiler Services`} 
        description={service.description ? service.description.substring(0, 150) + '...' : `Get expert help with ${service.name}. FinFiler provides quick and reliable processing.`} 
      />
      <PageHeader
        label="Service Details"
        title={service.name}
        subtitle={service.description || 'Professional compliance service from FinFiler.'}
      />

      <section className="section page-top">
        <div className="container detail-page">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/services" className="back-link">
              <ArrowLeft size={16} aria-hidden />
              All Services
            </Link>
          </motion.div>

          <div className="detail-page-grid">
            <div className="detail-page-main">
              {service.image && (
                <motion.div
                  className="detail-hero-image detail-hero-image--wide"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <img src={service.image} alt={service.name} />
                  {service.type && (
                    <span className="detail-hero-badge">{formatServiceType(service.type)}</span>
                  )}
                </motion.div>
              )}

              <motion.div
                className="detail-overview-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <h2>About this service</h2>
                <p>{service.description || 'A professional compliance service tailored for your business needs.'}</p>

                {highlights.length > 0 && (
                  <div className="detail-meta-chips">
                    {highlights.map(({ icon: Icon, text }) => (
                      <span key={text} className="detail-meta-chip">
                        <Icon size={14} aria-hidden />
                        {text}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {requiredFields.length > 0 && (
                <motion.div
                  className="detail-section-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2>
                    <ClipboardList size={18} aria-hidden />
                    Information required
                  </h2>
                  <ul className="detail-check-list">
                    {requiredFields.map((field) => (
                      <li key={field}>
                        <CheckCircle2 size={16} aria-hidden />
                        {field}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {documents.length > 0 && (
                <motion.div
                  className="detail-section-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2>
                    <FileText size={18} aria-hidden />
                    Required documents
                  </h2>
                  <ul className="detail-doc-list">
                    {documents.map((doc) => (
                      <li key={doc.required_id || doc.name}>
                        <div className="detail-doc-list-head">
                          <strong>{doc.name}</strong>
                          <span className={doc.is_required ? 'detail-doc-tag detail-doc-tag--required' : 'detail-doc-tag'}>
                            {doc.is_required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        {doc.description && <p>{doc.description}</p>}
                        {formatBytes(doc.max_size) && (
                          <span className="detail-doc-meta">Max file size: {formatBytes(doc.max_size)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {requiredFields.length === 0 && documents.length === 0 && (
                <motion.ul
                  className="feature-list"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.li variants={staggerItem}>
                    <span className="feature-check">✓</span>
                    Expert-guided compliance support
                  </motion.li>
                  <motion.li variants={staggerItem}>
                    <span className="feature-check">✓</span>
                    Secure document handling
                  </motion.li>
                  <motion.li variants={staggerItem}>
                    <span className="feature-check">✓</span>
                    Transparent pricing with no hidden fees
                  </motion.li>
                </motion.ul>
              )}
            </div>

            <motion.aside
              className="detail-page-sidebar"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <PricingPanel service={service} serviceId={serviceId} />
            </motion.aside>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServiceDetail;
