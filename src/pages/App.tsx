// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
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
import ProtectedRoute from "../Components/Shared/ProtectedRoute";
import Unauthorized from "../Components/Shared/Unauthorized";

interface DecodedToken {
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  exp?: number;
}

// Component to redirect logged-in users away from login/register
const AuthRedirect: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return children;
      }

      // Redirect to appropriate page based on role
      const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase();
      
      if (userRole === 'admin') return <Navigate to="/admin" replace />;
      if (userRole === 'staff') return <Navigate to="/staff" replace />;
      if (userRole === 'cashier') return <Navigate to="/cashier" replace />;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
  
  return children;
};

const App: React.FC = () => {
  const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
      <>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Public routes - redirect if already logged in */}
            <Route path="/" element={<AuthRedirect><LoginUI /></AuthRedirect>} />
            <Route path="/login" element={<AuthRedirect><LoginUI /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
            
            {/* Unauthorized route */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Cashier routes */}
            <Route path="/cashier" element={<ProtectedRoute allowedRoles={['cashier']}><CashierPage /></ProtectedRoute>} />
            <Route path="/cashier/buy-item" element={<ProtectedRoute allowedRoles={['cashier']}><BuyItem /></ProtectedRoute>} />
            <Route path="/cashier/sales" element={<ProtectedRoute allowedRoles={['cashier']}><SalesPage /></ProtectedRoute>} />
            <Route path="/cashier/change-password" element={<ProtectedRoute allowedRoles={['cashier']}><ChangePassword /></ProtectedRoute>} />
            <Route path="/cashier/hold-items" element={<ProtectedRoute allowedRoles={['cashier']}><HoldItems /></ProtectedRoute>} />
            <Route path="/cashier/purchases" element={<ProtectedRoute allowedRoles={['cashier']}><Purchases /></ProtectedRoute>} />
            
            {/* Staff routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffPage /></ProtectedRoute>} />
            <Route path="/staff/add-supplier" element={<ProtectedRoute allowedRoles={['staff']}><AddSupplier /></ProtectedRoute>} />
            <Route path="/staff/suppliers" element={<ProtectedRoute allowedRoles={['staff']}><SupplierList /></ProtectedRoute>} />
            <Route path="/staff/add-item" element={<ProtectedRoute allowedRoles={['staff']}><AddItem /></ProtectedRoute>} />
            <Route path="/staff/items" element={<ProtectedRoute allowedRoles={['staff']}><ItemList /></ProtectedRoute>} />
            <Route path="/staff/add-stocks" element={<ProtectedRoute allowedRoles={['staff']}><AddStocks /></ProtectedRoute>} />
            <Route path="/staff/stocks" element={<ProtectedRoute allowedRoles={['staff']}><StocksList /></ProtectedRoute>} />
            <Route path="/staff/sales" element={<ProtectedRoute allowedRoles={['staff']}><StaffSales /></ProtectedRoute>} />
            <Route path="/staff/purchases" element={<ProtectedRoute allowedRoles={['staff']}><StaffPurchases /></ProtectedRoute>} />
            <Route path="/staff/void-requests" element={<ProtectedRoute allowedRoles={['staff']}><VoidRequestsPage /></ProtectedRoute>} />
            <Route path="/staff/change-password" element={<ProtectedRoute allowedRoles={['staff']}><StaffChangePassword /></ProtectedRoute>} />
            <Route path="/staff/audit-trail" element={<ProtectedRoute allowedRoles={['staff']}><StaffAuditTrailPage /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={['admin']}><AccountsPage /></ProtectedRoute>} />
            <Route path="/admin/tax-discounts" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><InventoryPage /></ProtectedRoute>} />
            <Route path="/admin/branch" element={<ProtectedRoute allowedRoles={['admin']}><BranchPage /></ProtectedRoute>} />
            <Route path="/admin/sales" element={<ProtectedRoute allowedRoles={['admin']}><AdminSalesPage /></ProtectedRoute>} />
            <Route path="/admin/audit-trail" element={<ProtectedRoute allowedRoles={['admin']}><AuditTrailPage /></ProtectedRoute>} />
            
            {/* Catch all - redirect to login */}
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
