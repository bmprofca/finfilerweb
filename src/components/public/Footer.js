import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const quickLinks = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-and-conditions', label: 'Terms & Conditions' },
  { to: '/refund-and-cancellation-policy', label: 'Refund Policy' },
  { to: '/data-deletion-policy', label: 'Data Deletion Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/grievance-redressal-policy', label: 'Grievance Policy' },
];

function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection as="div" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white font-bold text-sm shadow-md">
                FF
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">FinFiler</span>
            </div>
            <p className="text-slate-600 max-w-sm leading-relaxed">
              Simple, reliable financial filing services for businesses and individuals across India.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-600 hover:text-indigo-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">Contact</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="mailto:support@finfiler.com" className="flex items-start gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                  <Mail size={18} className="mt-0.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>support@finfiler.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+916026089502" className="flex items-start gap-3 text-slate-600 hover:text-indigo-600 transition-colors group">
                  <Phone size={18} className="mt-0.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>+91 6026089502</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <span className="leading-relaxed">
                  Wahab Nagar, Sunarupatty,<br />
                  Kharupetia, Darrang, Assam – 784115
                </span>
              </li>
            </ul>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2} as="div" className="pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} FinFiler Private Limited. All rights reserved.
          </p>
        </AnimatedSection>
      </div>
    </footer>
  );
}

export default Footer;
