// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import MainLayout from "./components/layout/Main";
import PublicWebsiteLayout from "./layouts/PublicWebsiteLayout";
import LegalPagesLayout from "./layouts/LegalPagesLayout";
import { clientRoute } from "./constants/routes";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Orders from "./pages/Orders";
import Documents from "./pages/Documents";
import FirmList from "./pages/FirmList";
import FirmDetails from "./pages/FirmDetails";
import OrderCreate from "./pages/OrderCreate";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";

import PublicHome from "./pages/public/Home";
import PublicServices from "./pages/public/Services";
import PublicServiceDetail from "./pages/public/ServiceDetail";
import PublicAbout from "./pages/public/About";
import PublicContact from "./pages/public/Contact";
import PublicPrivacyPolicy from "./pages/public/PrivacyPolicy";
import PublicTermsAndConditions from "./pages/public/TermsAndConditions";
import PublicRefundPolicy from "./pages/public/RefundCancellationPolicy";
import PublicDataDeletionPolicy from "./pages/public/DataDeletionPolicy";
import PublicDisclaimer from "./pages/public/Disclaimer";
import PublicGrievancePolicy from "./pages/public/GrievanceRedressalPolicy";
import PublicBlogs from "./pages/public/BlogList";
import PublicBlogDetail from "./pages/public/BlogDetail";

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
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
                <Route element={<LegalPagesLayout />}>
                  <Route path="/privacy-policy" element={<PublicPrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<PublicTermsAndConditions />} />
                  <Route path="/refund-and-cancellation-policy" element={<PublicRefundPolicy />} />
                  <Route path="/data-deletion-policy" element={<PublicDataDeletionPolicy />} />
                  <Route path="/disclaimer" element={<PublicDisclaimer />} />
                  <Route path="/grievance-redressal-policy" element={<PublicGrievancePolicy />} />
                </Route>
              </Route>

              {/* Client auth */}
              <Route path="/client/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/client/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Client portal */}
              <Route path="/client" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="dashboard" element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="services/:serviceId/order" element={<OrderCreate />} />
                <Route path="services/:serviceId" element={<ServiceDetails />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderId" element={<OrderDetails />} />
                <Route path="documents" element={<Documents />} />
                <Route path="firms" element={<FirmList />} />
                <Route path="firms/:firmId" element={<FirmDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Legacy redirects */}
              <Route path="/login" element={<Navigate to={clientRoute("/login")} replace />} />
              <Route path="/register" element={<Navigate to={clientRoute("/register")} replace />} />
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
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
