import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/public/Navbar';
import PublicFooter from '../components/public/Footer';
import PageTransition from '../components/public/PageTransition';
import ScrollPromoBar from '../components/public/ScrollPromoBar';

function PublicWebsiteLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <PublicNavbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <PublicFooter />
      {/* Sibling of <main>, not inside PageTransition's transformed wrapper —
          so position: fixed works normally, and it shows on every public
          route instead of only wherever it happens to be mounted. */}
      <ScrollPromoBar />
    </div>
  );
}

export default PublicWebsiteLayout;