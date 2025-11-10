// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoginUI from "../Components/Login";
import Register from "../Components/Register";
import Navbar from "../Components/Navbar";
import PageTransition from "../Components/PageTransition";
import AnimatedBackground from "../Components/AnimatedBackground";
import Home from "./Home";
import { CashierPage } from "../Components/Cashier";
import SalesPage from "../Components/Cashier/SalesPage";
import ChangePassword from "../Components/Cashier/ChangePassword";
import StaffPage from "../Components/Cashier/StaffPage";
import AddSupplier from "../Components/Cashier/AddSupplier";
import AddItem from "../Components/Cashier/AddItem";
import StaffSales from "../Components/Cashier/StaffSales";

const App: React.FC = () => {
  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/cashier" || location.pathname === "/cashier/sales" || location.pathname === "/cashier/change-password" || location.pathname === "/staff" || location.pathname === "/staff/add-supplier" || location.pathname === "/staff/add-item" || location.pathname === "/staff/sales";

    return (
      <>
        {!hideNavbar && <Navbar />}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginUI /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/cashier" element={<PageTransition><CashierPage /></PageTransition>} />
            <Route path="/cashier/sales" element={<PageTransition><SalesPage /></PageTransition>} />
            <Route path="/cashier/change-password" element={<PageTransition><ChangePassword /></PageTransition>} />
            <Route path="/staff" element={<PageTransition><StaffPage /></PageTransition>} />
            <Route path="/staff/add-supplier" element={<PageTransition><AddSupplier /></PageTransition>} />
            <Route path="/staff/add-item" element={<PageTransition><AddItem /></PageTransition>} />
            <Route path="/staff/sales" element={<PageTransition><StaffSales /></PageTransition>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </>
    );
  };

  return (
    <Router>
      {/* Global animated background behind everything */}
      <AnimatedBackground />
      {/* Navbar rendered inside AnimatedRoutes for route-aware visibility */}
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
