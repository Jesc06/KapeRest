import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Sales from './Sales';
import TintedBackdrop from '../TintedBackdrop';
import { API_BASE_URL } from '../../config/api';

interface SalesRecord {
  id: number;
  username: string;
  fullName: string;
  email: string;
  branchName: string;
  branchLocation: string;
  menuItemName: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

interface ApiSalesRecord {
  id: number;
  username: string;
  fullName: string;
  email: string;
  branchName: string;
  branchLocation: string;
  menuItemName: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

const SalesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sales, setSales] = useState<SalesRecord[]>([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          return;
        }

        // Decode JWT to get cashierId
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const cashierId = decoded.cashierId;

        if (!cashierId) {
          console.error('Cashier ID not found in token');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/CashierSalesReport/CashierDailySales?cashierId=${cashierId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiSalesRecord[] = await response.json();

        // Map API response to SalesRecord
        const mappedSales: SalesRecord[] = data.map(item => ({
          id: item.id,
          username: item.username,
          fullName: item.fullName,
          email: item.email,
          branchName: item.branchName,
          branchLocation: item.branchLocation,
          menuItemName: item.menuItemName,
          dateTime: item.dateTime,
          subtotal: item.subtotal,
          tax: item.tax,
          discount: item.discount,
          total: item.total,
          status: item.status,
        }));

        setSales(mappedSales);
      } catch (err) {
        console.error('Error fetching sales data:', err);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent text-neutral-800 transition-colors duration-300 dark:text-neutral-200 overflow-hidden">
      <TintedBackdrop />
      <div aria-hidden className="absolute inset-0 z-0 bg-stone-50/90 backdrop-blur-xl dark:bg-neutral-900/60 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Sales Panel */}
        <Sales
          sales={sales}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarExpanded={sidebarExpanded}
          onToggleSidebarExpand={() => setSidebarExpanded(!sidebarExpanded)}
        />
      </div>
    </div>
  );
};

export default SalesPage;
