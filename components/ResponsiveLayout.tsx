'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <NotificationProvider>
      <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Navbar toggleSidebar={toggleSidebar} />
        <main className={`flex-1 p-4 md:p-8 pt-24 md:pt-20 min-h-screen ${isSidebarOpen ? 'md:ml-64' : 'md:ml-64'} transition-all duration-300 ease-in-out`}>
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
