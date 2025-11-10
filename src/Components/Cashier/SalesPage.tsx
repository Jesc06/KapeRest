import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Sales from './Sales';
import TintedBackdrop from '../TintedBackdrop';

interface SalesRecord {
  receiptNumber: string;
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

  const [sales] = useState<SalesRecord[]>([
    {
      receiptNumber: '2B4000A9',
      dateTime: '2025-11-01T09:02:35.5638233',
      subtotal: 12,
      tax: 1.44,
      discount: 1.2,
      total: 12.24,
      status: 'Completed',
    },
    {
      receiptNumber: '2B4000AA',
      dateTime: '2025-11-01T10:15:20.1234567',
      subtotal: 250,
      tax: 30,
      discount: 25,
      total: 255,
      status: 'Completed',
    },
    {
      receiptNumber: '2B4000AB',
      dateTime: '2025-11-01T14:30:45.9876543',
      subtotal: 450.50,
      tax: 54.06,
      discount: 45,
      total: 459.56,
      status: 'Completed',
    },
    {
      receiptNumber: '2B4000AC',
      dateTime: '2025-11-01T16:45:30.5555555',
      subtotal: 180,
      tax: 21.6,
      discount: 18,
      total: 183.6,
      status: 'Pending',
    },
    {
      receiptNumber: '2B4000AD',
      dateTime: '2025-10-31T18:00:00.1111111',
      subtotal: 320,
      tax: 38.4,
      discount: 32,
      total: 326.4,
      status: 'Completed',
    },
    {
      receiptNumber: '2B4000AE',
      dateTime: '2025-10-30T11:22:15.2222222',
      subtotal: 95.75,
      tax: 11.49,
      discount: 9.58,
      total: 97.66,
      status: 'Completed',
    },
    {
      receiptNumber: '2B4000AF',
      dateTime: '2025-10-25T09:45:30.3333333',
      subtotal: 580,
      tax: 69.6,
      discount: 58,
      total: 591.6,
      status: 'Completed',
    },
    {
      receiptNumber: '2B4000B0',
      dateTime: '2025-10-20T15:30:00.4444444',
      subtotal: 145.25,
      tax: 17.43,
      discount: 14.52,
      total: 148.16,
      status: 'Completed',
    },
  ]);

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
