// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoginUI from "../Components/Login";
import Register from "../Components/Register";
import Navbar from "../Components/Navbar";
import Home from "./Home";
import { CashierPage } from "../Components/Cashier";
import SalesPage from "../Components/Cashier/SalesPage";
import ChangePassword from "../Components/Cashier/ChangePassword";
import StaffPage from "../Components/Cashier/StaffPage";
import AddSupplier from "../Components/Cashier/AddSupplier";
import AddItem from "../Components/Cashier/AddItem";
import AddStocks from "../Components/Cashier/AddStocks";
import StaffSales from "../Components/Cashier/StaffSales";
import StaffChangePassword from "../Components/Cashier/StaffChangePassword";

const App: React.FC = () => {
  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/cashier" || location.pathname === "/cashier/sales" || location.pathname === "/cashier/change-password" || location.pathname === "/staff" || location.pathname === "/staff/add-supplier" || location.pathname === "/staff/add-item" || location.pathname === "/staff/add-stocks" || location.pathname === "/staff/sales" || location.pathname === "/staff/change-password";

    return (
      <>
        {!hideNavbar && <Navbar />}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginUI />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/cashier/sales" element={<SalesPage />} />
            <Route path="/cashier/change-password" element={<ChangePassword />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/add-supplier" element={<AddSupplier />} />
            <Route path="/staff/add-item" element={<AddItem />} />
            <Route path="/staff/add-stocks" element={<AddStocks />} />
            <Route path="/staff/sales" element={<StaffSales />} />
            <Route path="/staff/change-password" element={<StaffChangePassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </>
    );
  };

  return (
    <Router>
      {/* Navbar rendered inside AnimatedRoutes for route-aware visibility */}
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
