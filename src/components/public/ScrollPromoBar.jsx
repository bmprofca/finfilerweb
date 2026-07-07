// src/components/public/ScrollPromoBar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { REGISTER_PATH } from '../../constants/routes';

// How far the visitor needs to scroll (in px) before the bar appears.
// Works the same on every route since it isn't tied to any page's own
// content/sentinel — just the scroll position of the window itself.
const SHOW_AFTER_PX = 480;

/**
 * Site-wide floating promo bar. Render this ONCE, at the top level of
 * PublicWebsiteLayout (a sibling of <main>, not inside it/PageTransition),
 * so it shows on every public page and its `position: fixed` is relative
 * to the real viewport rather than any transformed route-transition wrapper.
 */
export default function ScrollPromoBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    handleScroll(); // in case the page loads already scrolled (e.g. back/forward nav)
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const overlayStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    zIndex: 9999,
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={overlayStyle}
          className="bg-[#0F1E3D] max-w-7xl mx-auto text-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-bold text-base sm:text-lg">File ITR in minutes with 100% accuracy</p>
              <p className="text-sm text-white/60">Trusted by 6M+ users to get their maximum tax refund</p>
            </div>
            <Link to={REGISTER_PATH} className="shrink-0 bg-blue-600 hover:bg-blue-500 transition-colors font-semibold px-6 py-2.5 rounded-lg">
              Start Filing
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
