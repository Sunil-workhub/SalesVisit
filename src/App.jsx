import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import menuConfig from "./config/menuConfig";
import AppLayout from "./components/layout/AppLayout";

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fb]">
      <div className="text-center">
        <div className="h-10 w-10 rounded-full border-4 border-[#d9e2e8] border-t-[#5789A0] animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {menuConfig.map((item) => {
        const Component = item.component;
        return (
          <Route
            key={item.path}
            path={item.path}
            element={
              // <ProtectedRoute>
              <AppLayout>
                <Component />
              </AppLayout>
              // </ProtectedRoute>
            }
          />
        );
      })}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
