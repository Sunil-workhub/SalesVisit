import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import menuConfig from "../config/menuConfig";
import Login from "../pages/auth/Login";
import AppLayout from "../components/layout/AppLayout";

// Simple spinner for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-4 border-[#2f61d5] border-t-transparent animate-spin" />
  </div>
);

// Guard: redirect to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Guard: redirect to /dashboard if already logged in
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected */}
        {menuConfig.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AppLayout>
                    <Component />
                  </AppLayout>
                </Suspense>
              </ProtectedRoute>
            }
          />
        ))}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
