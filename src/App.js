// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PublicRoute from "./components/PublicRoute";
import MainLayout from "./components/layout/Main";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ServerUnreachable from "./pages/ServerUnreachable";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {/* Add ToastContainer for react-toastify */}
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Server Unreachable - Public Route */}
            <Route path="/server-error" element={<ServerUnreachable />} />

            {/* Protected Routes with MainLayout - CORRECTED */}
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Home />} />
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