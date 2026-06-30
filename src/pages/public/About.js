import { motion } from 'framer-motion';
import { Eye, Award, Sparkles } from 'lucide-react';
import PageHeader from '../../components/public/WebsitePageHeader';
import AnimatedSection from '../../components/public/AnimatedSection';
import { staggerContainer, staggerItem, viewportOnce } from '../../utils/public/animations';
import SEO from '../../components/public/SEO';

const values = [
  {
    title: 'Transparency',
    desc: 'Clear pricing, honest timelines, and no hidden surprises in every engagement.',
    icon: Eye,
  },
  {
    title: 'Expertise',
    desc: 'Chartered accountants and compliance professionals who understand Indian regulations.',
    icon: Award,
  },
  {
    title: 'Simplicity',
    desc: 'Digital-first processes that remove paperwork headaches from your workflow.',
    icon: Sparkles,
  },
];

function About() {
  return (
    <>
      <SEO title="About Us | FinFiler" description="Learn about FinFiler, our values, and how we are simplifying financial compliance and taxation for Indian businesses and professionals." />
      <PageHeader
        label="About Us"
        title="About FinFiler"
        subtitle="FinFiler is a financial services platform built to simplify compliance for entrepreneurs, professionals, and small business owners across India."
      />

      <AnimatedSection className="section section-alt">
        <div className="container about-grid">
          <div className="about-content">
            <p>
              We understand that GST registration, company incorporation, and tax filing can feel overwhelming. That is
              why we offer end-to-end support with transparent processes and friendly experts who guide you at every
              step.
            </p>
            <p>
              Whether you are launching a startup, running a growing business, or filing your personal income tax return,
              FinFiler is here to help you stay compliant without the hassle.
            </p>
          </div>
          <motion.div
            className="about-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5 }}
          >
            <div className="about-visual-card">
              <span className="about-visual-number">8+</span>
              <span className="about-visual-text">Years of combined compliance expertise</span>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What Drives Us</h2>
          </div>
          <motion.div
            className="values-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} className="value-card" variants={staggerItem} whileHover={{ y: -4 }}>
                  <span className="value-card-icon">
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default About;
