// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LoginUI from "../Components/Login";
import Register from "../Components/Register";
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
import StaffPurchases from "../Components/Staff/StaffPurchases";
import VoidRequestsPage from "../Components/Staff/VoidRequestsPage";
import StaffChangePassword from "../Components/Staff/StaffChangePassword";
import StaffAuditTrailPage from "../Components/Staff/StaffAuditTrailPage";
import { AdminPage } from "../Components/Admin";
import BranchPage from "../Components/Admin/BranchPage";
import AccountsPage from "../Components/Admin/AccountsPage";
import InventoryPage from "../Components/Admin/InventoryPage";
import AdminSalesPage from "../Components/Admin/SalesPage";
import AuditTrailPage from "../Components/Admin/AuditTrailPage";
import { FloatingVoiceButton } from "../Components/Shared";

const App: React.FC = () => {
  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
      <>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LoginUI />} />
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
            <Route path="/staff/purchases" element={<StaffPurchases />} />
            <Route path="/staff/void-requests" element={<VoidRequestsPage />} />
            <Route path="/staff/change-password" element={<StaffChangePassword />} />
            <Route path="/staff/audit-trail" element={<StaffAuditTrailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/accounts" element={<AccountsPage />} />
            <Route path="/admin/tax-discounts" element={<AdminPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/branch" element={<BranchPage />} />
            <Route path="/admin/sales" element={<AdminSalesPage />} />
            <Route path="/admin/audit-trail" element={<AuditTrailPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </>
    );
  };

  return (
    <Router>
      <AnimatedRoutes />
      {/* Floating Voice Navigation Button - Available on all pages */}
      <FloatingVoiceButton />
    </Router>
  );
};


export default App;
