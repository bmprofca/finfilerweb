import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText, Mail, Phone } from 'lucide-react';
import {
  LEGAL_POLICIES,
  LEGAL_LAST_UPDATED,
  getLegalPolicyByPath,
} from '../constants/legalPolicies';

function LegalPagesLayout() {
  const { pathname } = useLocation();
  const currentPolicy = getLegalPolicyByPath(pathname);
  const title = currentPolicy?.title ?? 'Legal Document';

  return (
    <section className="section legal-page page-top">
      <div className="container">
        <div className="legal-layout">
          <aside className="legal-sidebar-col" aria-label="Legal navigation">
            <div className="legal-sidebar">
              <nav className="legal-nav" aria-label="Legal documents">
                <p className="legal-nav-title">
                  <FileText size={16} aria-hidden />
                  Legal documents
                </p>
                <ul>
                  {LEGAL_POLICIES.map((policy) => (
                    <li key={policy.path}>
                      <NavLink
                        to={policy.path}
                        className={({ isActive }) =>
                          `legal-nav-link${isActive ? ' legal-nav-link--active' : ''}`
                        }
                        end
                      >
                        {policy.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="legal-sidebar-card">
                <p className="legal-sidebar-card-title">Need help?</p>
                <p className="legal-sidebar-card-text">
                  For questions about these policies or your account, contact our support team.
                </p>
                <a href="mailto:support@finfiler.com" className="legal-sidebar-contact">
                  <Mail size={15} aria-hidden />
                  support@finfiler.com
                </a>
                <a href="tel:+916026089502" className="legal-sidebar-contact">
                  <Phone size={15} aria-hidden />
                  +91 6026089502
                </a>
                <Link to="/contact" className="legal-sidebar-link">
                  Contact support →
                </Link>
              </div>
            </div>
          </aside>

          <article className="legal-document">
            <header className="legal-document-header">
              <span className="section-label">Legal</span>
              <h1 className="legal-document-title">{title}</h1>
              <div className="legal-document-meta">
                <span className="legal-document-meta-item">
                  <Calendar size={15} aria-hidden />
                  Last updated {LEGAL_LAST_UPDATED}
                </span>
                <span className="legal-document-meta-item">FinFiler Private Limited</span>
              </div>
            </header>
            <motion.div
              key={pathname}
              className="legal-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default LegalPagesLayout;
