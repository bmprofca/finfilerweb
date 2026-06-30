import { Link } from 'react-router-dom';
import { clientRoute } from '../../constants/routes';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Headphones,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import PageHeader from '../../components/public/WebsitePageHeader';
import AnimatedSection from '../../components/public/AnimatedSection';
import { staggerContainer, staggerItem, viewportOnce } from '../../utils/public/animations';
import SEO from '../../components/public/SEO';

const contactMethods = [
  {
    label: 'Email',
    value: 'support@finfiler.com',
    hint: 'Best for detailed queries and document sharing',
    href: 'mailto:support@finfiler.com',
    action: 'Send email',
    icon: Mail,
    accent: 'blue',
  },
  {
    label: 'Phone',
    value: '+91 7002695990',
    hint: 'Speak directly with our support team',
    href: 'tel:+917002695990',
    action: 'Call now',
    icon: Phone,
    accent: 'green',
  },
  {
    label: 'Office Hours',
    value: 'Mon – Sat, 10:00 AM – 6:00 PM',
    hint: 'Indian Standard Time (IST)',
    icon: Clock,
    accent: 'amber',
  },
  {
    label: 'Office Address',
    value: 'Wahab Nagar, Sunarupatty, Kharupetia, Darrang, Assam – 784115',
    hint: 'Registered office location',
    href: 'https://maps.google.com/?q=Kharupetia+Darrang+Assam+784115',
    action: 'View on map',
    icon: MapPin,
    accent: 'violet',
  },
];

const helpTopics = [
  {
    title: 'Account & login',
    desc: 'OTP issues, profile updates, or access to your client portal.',
    icon: ShieldCheck,
  },
  {
    title: 'Orders & filings',
    desc: 'Status updates, document requests, or questions about an active service.',
    icon: MessageCircle,
  },
  {
    title: 'Quick response',
    desc: 'Most support requests are answered within one business day.',
    icon: Zap,
  },
];

function Contact() {
  return (
    <>
      <PageHeader
        label="Support"
        title="Contact Us"
        subtitle="Reach out for help with your account, orders, or any support-related questions. Our team is here to assist you."
        centered
      />

      <section className="section page-top contact-section">
        <div className="container">
          <div className="contact-page-grid">
            <motion.aside
              className="contact-hero-panel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="contact-hero-icon">
                <Headphones size={26} strokeWidth={2} aria-hidden />
              </span>
              <h2>We&apos;re here to help</h2>
              <p>
                Whether you need help with an order, have a billing question, or run into a technical issue — our
                support team is ready to assist you.
              </p>

              <div className="contact-hero-note">
                <p>
                  Looking to register or start a new service?{' '}
                  <Link to={clientRoute('/register')}>Create an account</Link> or{' '}
                  <Link to="/services">browse services</Link> instead.
                </p>
              </div>

              <div className="contact-hero-stats">
                <div className="contact-hero-stat">
                  <span className="contact-hero-stat-value">{'< 24 hrs'}</span>
                  <span className="contact-hero-stat-label">Typical response</span>
                </div>
                <div className="contact-hero-stat">
                  <span className="contact-hero-stat-value">Mon–Sat</span>
                  <span className="contact-hero-stat-label">Support days</span>
                </div>
              </div>

              <Link to={clientRoute('/login')} className="contact-hero-link">
                Already a client? Sign in
                <ArrowRight size={16} aria-hidden />
              </Link>
            </motion.aside>

            <motion.div
              className="contact-cards-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {contactMethods.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.label}
                    className={`contact-card contact-card--${item.accent}`}
                    variants={staggerItem}
                    whileHover={{ y: -4 }}
                  >
                    <span className="contact-card-icon">
                      <Icon size={22} strokeWidth={2} aria-hidden />
                    </span>
                    <div className="contact-card-body">
                      <span className="contact-card-label">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="contact-card-value" target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>
                          {item.value}
                        </a>
                      ) : (
                        <p className="contact-card-value">{item.value}</p>
                      )}
                      <p className="contact-card-hint">{item.hint}</p>
                      {item.href && item.action && (
                        <a href={item.href} className="contact-card-action" target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>
                          {item.action}
                          <ArrowRight size={14} aria-hidden />
                        </a>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection className="section section-alt">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="section-label">How we can help</span>
            <h2 className="section-title">Support topics</h2>
            <p className="section-subtitle">
              Use the contact details above for any of these — we&apos;ll route your request to the right team.
            </p>
          </div>
          <motion.div
            className="contact-help-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {helpTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <motion.div key={topic.title} className="contact-help-card" variants={staggerItem} whileHover={{ y: -3 }}>
                  <span className="contact-help-icon">
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </span>
                  <h3>{topic.title}</h3>
                  <p>{topic.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  );
}

export default Contact;
