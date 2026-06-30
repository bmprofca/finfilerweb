import { Link } from 'react-router-dom';
import { clientRoute } from '../../constants/routes';
import { useState, useEffect, useRef } from 'react';
import { Users, Layers, Star, Headphones, Zap, MessageCircle, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import ServiceCard from '../../components/public/ServiceCard';
import AnimatedSection from '../../components/public/AnimatedSection';
import { ServiceCardSkeleton } from '../../components/public/ServiceSkeleton';
import { fetchServices } from '../../utils/public/api';
import SEO from '../../components/public/SEO';

const stats = [
  { value: '10K+', label: 'Clients Served', icon: Users },
  { value: '50+', label: 'Compliance Services', icon: Layers },
  { value: '98%', label: 'Satisfaction Rate', icon: Star },
  { value: '24/7', label: 'Support Available', icon: Headphones },
];

const whyItems = [
  { title: 'Fast Turnaround', desc: 'Clear timelines and quick processing for every filing.', icon: Zap },
  { title: 'Dedicated Support', desc: 'Expert guidance at every step of your compliance journey.', icon: MessageCircle },
  { title: '100% Online', desc: 'No office visits — upload documents and track progress digitally.', icon: Globe },
  { title: 'Trusted Nationwide', desc: 'Serving startups, professionals, and small businesses across India.', icon: ShieldCheck },
];

function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const controller = new AbortController();

    fetchServices({ pageNo: 1, limit: 3 }, { signal: controller.signal })
      .then((data) => {
        setFeaturedServices(data.services || []);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setFeaturedServices([]);
        }
      })
      .finally(() => {
        setServicesLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <SEO 
        title="FinFiler | Expert Financial Compliance Services" 
        description="Simplify GST registration, company incorporation, and tax filing. Join thousands of businesses in India relying on FinFiler for fast, expert compliance."
      />

      <section className="relative overflow-hidden bg-slate-900 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 right-0 w-[600px] h-[600px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <AnimatedSection as="div" className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-6 border border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Trusted Financial Services
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Your Partner in
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200"> Compliance</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                GST registration, company setup, ITR filing, and more. We make financial compliance simple so you can focus on growing your business.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/services" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
                  View Services
                </Link>
                <Link to={clientRoute('/register')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-200 bg-slate-800 rounded-xl hover:bg-slate-700 border border-slate-700 transition-colors">
                  Get Started
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection as="div" delay={0.2} className="relative mx-auto w-full max-w-md lg:max-w-full">
              <div className="flex flex-col gap-4">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20 transform hover:-translate-y-1 transition-transform">
                  <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Trusted by</p>
                  <p className="text-4xl font-bold mb-1">10,000+</p>
                  <p className="text-indigo-100">Businesses and professionals across India</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 transform hover:-translate-y-1 transition-transform">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Services</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">50+</p>
                    <p className="text-slate-600 text-sm">Compliance solutions</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 transform hover:-translate-y-1 transition-transform">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Support</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">24/7</p>
                    <p className="text-slate-600 text-sm">Expert assistance</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection as="div" className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <span className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</span>
                  <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                </div>
              );
            })}
          </AnimatedSection>
        </div>
      </section>

      <AnimatedSection as="section" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3 block">What We Offer</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-lg text-slate-600">Everything you need to stay compliant, in one place.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {servicesLoading
              ? Array.from({ length: 3 }).map((_, i) => <ServiceCardSkeleton key={i} />)
              : featuredServices.slice(0, 3).map((service, i) => (
                  <ServiceCard key={service.service_id} service={service} index={i} />
                ))}
          </div>
          
          <div className="text-center">
            <Link to="/services" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              See all services <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      <section className="py-20 lg:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <AnimatedSection as="div" className="lg:col-span-5 text-center lg:text-left">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3 block">Why Choose Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Why FinFiler?</h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                We combine expert knowledge with a simple process so filing never feels complicated. Over 10,000 businesses trust us to keep them compliant.
              </p>
            </AnimatedSection>

            <AnimatedSection as="div" delay={0.2} className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {whyItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm mb-4">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                );
              })}
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection as="div" className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-10 lg:p-16 text-center max-w-4xl mx-auto shadow-2xl shadow-indigo-900/50">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Ready to simplify your compliance?</h2>
            <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
              Talk to our experts and get started with the right service for your business today. No hidden fees, no paperwork headaches.
            </p>
            <Link to={clientRoute('/register')} className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
              Register Now
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

export default Home;
