// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import MainLayout from "./components/layout/Main";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Orders from "./pages/Orders";
import Documents from "./pages/Documents";
import FundsBusiness from "./pages/FundsBusiness";
import FirmList from "./pages/FirmList";
import FirmDetails from "./pages/FirmDetails";
import OrderCreate from "./pages/OrderCreate";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ServerUnreachable from "./pages/ServerUnreachable";


function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Landing />} />

              {/* Auth Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Server Unreachable */}
              <Route path="/server-error" element={<ServerUnreachable />} />

              {/* Protected Routes inside MainLayout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="home" element={<Home />} />
                <Route path="dashboard" element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="services/:serviceId/order" element={<OrderCreate />} />
                <Route path="services/:serviceId" element={<ServiceDetails />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderId" element={<OrderDetails />} />
                <Route path="documents" element={<Documents />} />
                <Route path="funds-business" element={<FundsBusiness />} />
                <Route path="firms" element={<FirmList />} />
                <Route path="firms/:firmId" element={<FirmDetails />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;