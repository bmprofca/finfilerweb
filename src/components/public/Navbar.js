import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { clientRoute, LOGIN_PATH, REGISTER_PATH } from '../../constants/routes';
import { hasStoredAuth } from '../../utils/public/format';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/blogs', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.token) || hasStoredAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const authActions = isAuthenticated ? (
    <Link to={clientRoute('/home')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-md hover:from-indigo-700 hover:to-indigo-600 hover:-translate-y-0.5 transition-all">
      Dashboard
      <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  ) : (
    <div className="flex items-center gap-3">
      <Link to={LOGIN_PATH} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-colors">
        Sign in
      </Link>
      <Link to={REGISTER_PATH} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-md hover:from-indigo-700 hover:to-indigo-600 hover:-translate-y-0.5 transition-all group">
        Get started
        <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 h-[68px] bg-white border-b border-transparent transition-all duration-300 ${scrolled ? 'bg-white/85 border-slate-200/50 shadow-lg shadow-indigo-900/5 backdrop-blur-md' : ''}`}>
        <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-6 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
            <div className="flex items-center justify-center w-9 h-9 p-1 rounded-xl bg-white shadow-lg overflow-hidden">
              <img src="/logo512.png" alt="FinFiler" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Fin<span className="font-normal bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-indigo-400">Filer</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center shrink-0">
            {authActions}
          </div>

          {/* Mobile Burger */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-5 h-[1.5px] bg-slate-800 rounded-full transition-transform ${menuOpen ? 'translate-y-[7.5px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-slate-800 rounded-full transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-slate-800 rounded-full transition-transform ${menuOpen ? '-translate-y-[7.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (CSS-only toggle) */}
      <div 
        className={`fixed inset-x-0 top-[68px] bottom-0 z-40 bg-white border-t border-slate-200 p-5 overflow-y-auto transition-transform duration-300 ease-in-out md:hidden ${menuOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ visibility: menuOpen ? 'visible' : 'hidden' }}
      >
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-4 py-3 text-[15px] font-medium rounded-xl transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="h-px bg-slate-100 my-4" />

          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                to={clientRoute('/home')}
                className="flex items-center justify-center gap-2 w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-md"
                onClick={() => setMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to={LOGIN_PATH}
                  className="flex items-center justify-center w-full py-3 text-[15px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to={REGISTER_PATH}
                  className="flex items-center justify-center gap-2 w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;