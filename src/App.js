// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";


import PublicRoute from "./components/PublicRoute";
import MainLayout from "./components/layout/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Orders from "./pages/Orders";
import Documents from "./pages/Documents";
import FundsBusiness from "./pages/FundsBusiness";
import NotFound from "./pages/NotFound";
import ServerUnreachable from "./pages/ServerUnreachable";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>

          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute> <Login /></PublicRoute>}/>
            <Route path="/register" element={<PublicRoute> <Register /></PublicRoute>}/>

            {/* Server Unreachable - Public Route */}
            <Route path="/server-error" element={<ServerUnreachable />} />

            {/* Protected Routes with MainLayout - CORRECTED */}
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="orders" element={<Orders />} />
              <Route path="documents" element={<Documents />} />
              <Route path="funds-business" element={<FundsBusiness />} />
            </Route>

            {/* 404 Not Found Route */}
            <Route path="/404" element={<NotFound />} />
            
            {/* Catch all route - redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;