import React, { Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import menuConfig from "./config/menuConfig";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/auth/Login";

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
  const location = useLocation();

  if (loading) return <Loader />;

  const sessionUser = sessionStorage.getItem("user");
  if (!user && !sessionUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  const sessionUser = sessionStorage.getItem("user");
  return user || sessionUser ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {menuConfig.map((item) => {
          const Component = item.component;
          return (
            <Route
              key={item.path}
              path={item.path}
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Component />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          );
        })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
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
