// src/App.js
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HelmetProvider } from "react-helmet-async";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import MainLayout from "./components/layout/Main";
import PublicWebsiteLayout from "./layouts/PublicWebsiteLayout";

import { clientRoute } from "./constants/routes";
import LegacyClientRedirect from "./components/LegacyClientRedirect";

// ── Lazy-loaded pages (each becomes its own JS chunk) ──────────────
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetails = lazy(() => import("./pages/ServiceDetails"));
const Orders = lazy(() => import("./pages/Orders"));
const Ledger = lazy(() => import("./pages/Ledger"));
const Documents = lazy(() => import("./pages/Documents"));
const FirmList = lazy(() => import("./pages/FirmList"));
const FirmDetails = lazy(() => import("./pages/FirmDetails"));
const WithdrawRequests = lazy(() => import("./pages/WithdrawRequests"));
const OrderCreate = lazy(() => import("./pages/OrderCreate"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Support = lazy(() => import("./pages/Support"));

// Public website pages
const PublicHome = lazy(() => import("./pages/public/Home"));
const PublicServices = lazy(() => import("./pages/public/Services"));
const PublicServiceDetail = lazy(() => import("./pages/public/ServiceDetail"));
const PublicAbout = lazy(() => import("./pages/public/About"));
const PublicContact = lazy(() => import("./pages/public/Contact"));
const PublicPrivacyPolicy = lazy(() => import("./pages/public/PrivacyPolicy"));
const PublicTermsAndConds = lazy(() => import("./pages/public/TermsAndConditions"));
const PublicRefundPolicy = lazy(() => import("./pages/public/RefundCancellationPolicy"));
const PublicDataDeletion = lazy(() => import("./pages/public/DataDeletionPolicy"));
const PublicDisclaimer = lazy(() => import("./pages/public/Disclaimer"));
const PublicGrievancePolicy = lazy(() => import("./pages/public/GrievanceRedressalPolicy"));
const PublicBlogs = lazy(() => import("./pages/public/BlogList"));
const PublicBlogDetail = lazy(() => import("./pages/public/BlogDetail"));

// Minimal spinner shown during chunk download
function PageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid #e2e8f0",
        borderTopColor: "#3b82f6",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite"
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public website */}
                  <Route element={<PublicWebsiteLayout />}>
                    <Route path="/" element={<PublicHome />} />
                    <Route path="/services" element={<PublicServices />} />
                    <Route path="/blogs" element={<PublicBlogs />} />
                    <Route path="/blogs/:blogId" element={<PublicBlogDetail />} />
                    <Route path="/services/:serviceId" element={<PublicServiceDetail />} />
                    <Route path="/about" element={<PublicAbout />} />
                    <Route path="/contact" element={<PublicContact />} />
                    {/* Legal Pages */}
                    <Route path="/privacy-policy" element={<PublicPrivacyPolicy />} />
                    <Route path="/terms-and-conditions" element={<PublicTermsAndConds />} />
                    <Route path="/refund-and-cancellation-policy" element={<PublicRefundPolicy />} />
                    <Route path="/data-deletion-policy" element={<PublicDataDeletion />} />
                    <Route path="/disclaimer" element={<PublicDisclaimer />} />
                    <Route path="/grievance-redressal-policy" element={<PublicGrievancePolicy />} />
                  </Route>

                  {/* Client auth */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                  {/* Client portal */}
                  <Route path="/panel" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<Home />} />
                    <Route path="dashboard" element={<Home />} />
                    <Route path="services" element={<Services />} />
                    <Route path="ledger" element={<Ledger />} />
                    <Route path="services/:serviceId/order" element={<OrderCreate />} />
                    <Route path="services/:serviceId" element={<ServiceDetails />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="withdraw-requests" element={<WithdrawRequests />} />
                    <Route path="orders/:orderId" element={<OrderDetails />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="firms" element={<FirmList />} />
                    <Route path="firms/:firmId" element={<FirmDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="support" element={<Support />} />
                  </Route>

                  {/* Legacy redirects */}
                  <Route path="/client/login" element={<Navigate to="/login" replace />} />
                  <Route path="/client/register" element={<Navigate to="/register" replace />} />
                  <Route path="/client" element={<Navigate to="/panel/home" replace />} />
                  <Route path="/client/*" element={<LegacyClientRedirect />} />
                  <Route path="/home" element={<Navigate to={clientRoute("/home")} replace />} />
                  <Route path="/dashboard" element={<Navigate to={clientRoute("/dashboard")} replace />} />
                  <Route path="/orders" element={<Navigate to={clientRoute("/orders")} replace />} />
                  <Route path="/documents" element={<Navigate to={clientRoute("/documents")} replace />} />
                  <Route path="/firms" element={<Navigate to={clientRoute("/firms")} replace />} />
                  <Route path="/profile" element={<Navigate to={clientRoute("/profile")} replace />} />
                  <Route path="/support" element={<Navigate to={clientRoute("/support")} replace />} />

                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
