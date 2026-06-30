import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import AnimatedSection from '../../components/public/AnimatedSection';
import { fetchServiceDetails } from '../../utils/public/api';
import {
  formatCurrency,
  formatServiceType,
  getDiscountLabel,
  hasStoredAuth,
} from '../../utils/public/format';
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
    <div className={`flex justify-between items-center py-3 text-sm ${highlight ? 'font-bold border-t border-slate-200 mt-2 pt-4' : 'border-b border-slate-50 last:border-0'}`}>
      <span className={`${muted ? 'text-slate-500' : 'text-slate-700'} ${highlight ? 'text-slate-900 text-base' : ''}`}>{label}</span>
      <span className={`${accent ? 'text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-slate-900 font-medium'} ${highlight ? 'text-indigo-600 text-lg' : ''}`}>
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
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-32">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl">
          <Receipt size={20} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pricing Details</h2>
          <p className="text-xs text-slate-500">Transparent fee breakdown</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total payable</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(service.fees)}</p>
          </div>
          {hasDiscount && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Before discount</p>
              <p className="text-sm text-slate-400 line-through">{formatCurrency(service.total_fees)}</p>
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md mt-2">
            <Tag size={12} aria-hidden />
            You save {formatCurrency(service.discount_value)}
          </span>
        )}
      </div>

      <div className="mb-6">
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

      <div className="flex gap-3 items-start bg-indigo-50/50 rounded-xl p-4 mb-8">
        <IndianRupee size={16} className="text-indigo-400 mt-0.5 shrink-0" aria-hidden />
        <p className="text-xs text-indigo-900/70 leading-relaxed">
          {hasDiscount
            ? 'Discount is applied automatically. The final amount shown above is what you pay.'
            : 'All taxes included. No hidden charges at checkout.'}
        </p>
      </div>

      <Link to={ctaHref} className="flex items-center justify-center w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 mb-4">
        {ctaLabel}
      </Link>

      {!isAuthenticated && (
        <p className="text-sm text-center text-slate-500">
          Already have an account?{' '}
          <Link to={clientRoute('/login')} className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
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
  const abortControllerRef = useRef(null);

  const loadService = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await fetchServiceDetails(serviceId, { signal: controller.signal });
      setService(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Service not found');
        setService(null);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [serviceId]);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadService();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [loadService]);

  if (loading) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
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
        <section className="bg-slate-50 py-16 text-center">
          <div className="max-w-7xl mx-auto px-6">
            <Link to="/services" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
              Back to Services
            </Link>
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

      <section className="bg-slate-50 py-12 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors group">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" aria-hidden />
              All Services
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-12 items-start">
            <div className="flex flex-col gap-8">
              {service.image && (
                <AnimatedSection as="div" className="relative h-[300px] sm:h-[400px] w-full bg-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                  {service.type && (
                    <span className="absolute top-6 right-6 px-4 py-1.5 bg-white/90 backdrop-blur text-sm font-bold text-slate-900 rounded-full shadow-sm">
                      {formatServiceType(service.type)}
                    </span>
                  )}
                </AnimatedSection>
              )}

              <AnimatedSection as="div" delay={0.05} className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">About this service</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">{service.description || 'A professional compliance service tailored for your business needs.'}</p>

                {highlights.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {highlights.map(({ icon: Icon, text }) => (
                      <span key={text} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl border border-indigo-100/50">
                        <Icon size={16} aria-hidden />
                        {text}
                      </span>
                    ))}
                  </div>
                )}
              </AnimatedSection>

              {requiredFields.length > 0 && (
                <AnimatedSection as="div" delay={0.1} className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <ClipboardList size={20} aria-hidden />
                    </div>
                    Information required
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requiredFields.map((field) => (
                      <li key={field} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" aria-hidden />
                        <span className="text-slate-700 font-medium">{field}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
              )}

              {documents.length > 0 && (
                <AnimatedSection as="div" delay={0.15} className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileText size={20} aria-hidden />
                    </div>
                    Required documents
                  </h2>
                  <ul className="flex flex-col gap-4">
                    {documents.map((doc) => (
                      <li key={doc.required_id || doc.name} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <strong className="text-lg font-bold text-slate-900">{doc.name}</strong>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${doc.is_required ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                            {doc.is_required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        {doc.description && <p className="text-slate-600 text-sm leading-relaxed mb-3">{doc.description}</p>}
                        {formatBytes(doc.max_size) && (
                          <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 text-xs font-medium text-slate-500 rounded-md">
                            Max file size: {formatBytes(doc.max_size)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
              )}

              {requiredFields.length === 0 && documents.length === 0 && (
                <ul className="flex flex-col gap-4 mt-4">
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">✓</span>
                    Expert-guided compliance support
                  </li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">✓</span>
                    Secure document handling
                  </li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">✓</span>
                    Transparent pricing with no hidden fees
                  </li>
                </ul>
              )}
            </div>

            <AnimatedSection as="aside" delay={0.12} className="relative">
              <PricingPanel service={service} serviceId={serviceId} />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServiceDetail;
