// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoginUI from "../Components/Login";
import Register from "../Components/Register";
import Navbar from "../Components/Navbar";
import Home from "./Home";
import { CashierPage, BuyItem } from "../Components/Cashier";
import SalesPage from "../Components/Cashier/SalesPage";
import ChangePassword from "../Components/Cashier/ChangePassword";
import HoldItems from "../Components/Cashier/HoldItems";
import Purchases from "../Components/Cashier/Purchases";
import StaffPage from "../Components/Staff/StaffPage";
import AddSupplier from "../Components/Shared/AddSupplier";
import AddItem from "../Components/Shared/AddItem";
import AddStocks from "../Components/Shared/AddStocks";
import StocksList from "../Components/Shared/StocksList";
import SupplierList from "../Components/Shared/SupplierList";
import ItemList from "../Components/Shared/ItemList";
import StaffSales from "../Components/Staff/StaffSales";
import StaffChangePassword from "../Components/Staff/StaffChangePassword";
import { AdminPage } from "../Components/Admin";
import BranchPage from "../Components/Admin/BranchPage";

const App: React.FC = () => {
  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/cashier" || location.pathname === "/cashier/buy-item" || location.pathname === "/cashier/sales" || location.pathname === "/cashier/change-password" || location.pathname === "/cashier/hold-items" || location.pathname === "/cashier/purchases" || location.pathname === "/staff" || location.pathname === "/staff/add-supplier" || location.pathname === "/staff/suppliers" || location.pathname === "/staff/add-item" || location.pathname === "/staff/items" || location.pathname === "/staff/add-stocks" || location.pathname === "/staff/stocks" || location.pathname === "/staff/sales" || location.pathname === "/staff/change-password" || location.pathname === "/admin" || location.pathname === "/admin/accounts" || location.pathname === "/admin/tax-discounts" || location.pathname === "/admin/inventory" || location.pathname === "/admin/branch" || location.pathname === "/admin/sales";

    return (
      <>
        {!hideNavbar && <Navbar />}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginUI />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/cashier/buy-item" element={<BuyItem />} />
            <Route path="/cashier/sales" element={<SalesPage />} />
            <Route path="/cashier/change-password" element={<ChangePassword />} />
            <Route path="/cashier/hold-items" element={<HoldItems />} />
            <Route path="/cashier/purchases" element={<Purchases />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/add-supplier" element={<AddSupplier />} />
            <Route path="/staff/suppliers" element={<SupplierList />} />
            <Route path="/staff/add-item" element={<AddItem />} />
            <Route path="/staff/items" element={<ItemList />} />
            <Route path="/staff/add-stocks" element={<AddStocks />} />
            <Route path="/staff/stocks" element={<StocksList />} />
            <Route path="/staff/sales" element={<StaffSales />} />
            <Route path="/staff/change-password" element={<StaffChangePassword />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/accounts" element={<AdminPage />} />
            <Route path="/admin/tax-discounts" element={<AdminPage />} />
            <Route path="/admin/inventory" element={<AdminPage />} />
            <Route path="/admin/branch" element={<BranchPage />} />
            <Route path="/admin/sales" element={<AdminPage />} />
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
