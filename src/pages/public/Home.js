import { Link } from 'react-router-dom';
import { clientRoute } from '../../constants/routes';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Layers, Star, Headphones, Zap, MessageCircle, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import ServiceCard from '../../components/public/ServiceCard';
import AnimatedSection from '../../components/public/AnimatedSection';
import { ServiceCardSkeleton } from '../../components/public/ServiceSkeleton';
import { fetchServices } from '../../utils/public/api';
import { staggerContainer, staggerItem, slideFromLeft, slideFromRight, viewportOnce } from '../../utils/public/animations';
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

  useEffect(() => {
    let cancelled = false;

    fetchServices({ pageNo: 1, limit: 3 })
      .then((data) => {
        if (!cancelled) {
          setFeaturedServices(data.services || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeaturedServices([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setServicesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEO 
        title="FinFiler | Expert Financial Compliance Services" 
        description="Simplify GST registration, company incorporation, and tax filing. Join thousands of businesses in India relying on FinFiler for fast, expert compliance."
      />
      <section className="hero">
        <div className="hero-bg">
          <motion.div
            className="hero-blob hero-blob--1"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="hero-blob hero-blob--2"
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container hero-grid">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p className="hero-tag" variants={staggerItem}>
              <span className="hero-tag-dot" />
              Trusted Financial Services
            </motion.p>
            <motion.h1 variants={staggerItem}>
              Your Partner in
              <span className="hero-highlight"> Compliance</span>
            </motion.h1>
            <motion.p className="hero-desc" variants={staggerItem}>
              GST registration, company setup, ITR filing, and more. We make financial compliance simple so you can
              focus on growing your business.
            </motion.p>
            <motion.div className="hero-actions" variants={staggerItem}>
              <Link to="/services" className="btn btn-primary">
                View Services
              </Link>
              <Link to={clientRoute('/register')} className="btn btn-secondary">
                Get Started
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="hero-visual-card hero-visual-card--accent">
              <p className="hero-visual-label">Trusted by</p>
              <p className="hero-visual-value">10,000+</p>
              <p className="hero-visual-text">Businesses and professionals across India</p>
            </div>
            <div className="hero-visual-row">
              <div className="hero-visual-card">
                <p className="hero-visual-label">Services</p>
                <p className="hero-visual-value">50+</p>
                <p className="hero-visual-text">Compliance solutions</p>
              </div>
              <div className="hero-visual-card">
                <p className="hero-visual-label">Support</p>
                <p className="hero-visual-value">24/7</p>
                <p className="hero-visual-text">Expert assistance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <motion.div
            className="stats-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} className="stat-item" variants={staggerItem}>
                  <span className="stat-icon">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <AnimatedSection className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="section-label">What We Offer</span>
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Everything you need to stay compliant, in one place.</p>
          </div>
          <div className="service-grid">
            {servicesLoading
              ? Array.from({ length: 3 }).map((_, i) => <ServiceCardSkeleton key={i} />)
              : featuredServices.slice(0, 3).map((service, i) => (
                  <ServiceCard key={service.service_id} service={service} index={i} />
                ))}
          </div>
          <motion.div className="center-link"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={viewportOnce}
            transition={{ delay: 0.3 }}
          >
            <Link to="/services" className="link-arrow">
              See all services <ArrowRight size={16} aria-hidden />
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      <section className="section section-alt">
        <div className="container why-grid">
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">Why FinFiler?</h2>
            <p className="section-subtitle section-subtitle--left">
              We combine expert knowledge with a simple process so filing never feels complicated.
            </p>
          </motion.div>

          <motion.div
            className="why-cards"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {whyItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} className="why-card" variants={staggerItem} whileHover={{ scale: 1.02 }}>
                  <span className="why-card-icon">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div>
              <h2>Ready to simplify your compliance?</h2>
              <p>Talk to our experts and get started with the right service for your business.</p>
            </div>
            <Link to={clientRoute('/register')} className="btn btn-light">
              Register Now
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Home;
