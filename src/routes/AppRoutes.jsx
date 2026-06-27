import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import menuConfig from "../config/menuConfig";
import Layout from "../pages/layout/Layout";

import RedirectHandler from "./RedirectHandler";
import LoginPage from "../pages/auth/LoginPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 Public Route (no auth) */}

        {/* <Route
          path="/RFQ-vendor"
          element={
            <Suspense
              fallback={
                <div>
                  <RedirectHandler />
                </div>
              }
            >
              <RFQVendorResponsePage />
            </Suspense>
          }
        /> */}
        <Route
          path="/helpdesk-login"
          element={
            <Suspense
              fallback={
                <div>
                  <RedirectHandler />
                </div>
              }
            >
              <LoginPage />
            </Suspense>
          }
        />

        {/* 🔒 Protected Routes (auth required) */}
        <Route
          element={
            <>
              <Layout />
            </>
          }
        >
          {menuConfig.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense
                  fallback={
                    <div>
                      <RedirectHandler />
                    </div>
                  }
                >
                  <Component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
