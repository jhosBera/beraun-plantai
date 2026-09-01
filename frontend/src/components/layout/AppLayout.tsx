import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useCropStore } from '../../store/cropStore';
import { useNotificationStore } from '../../store/notificationStore';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { fetchPlots, fetchCrops } = useCropStore();
  const { fetchNotifications, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchPlots();
    fetchCrops();
    fetchNotifications();
    fetchUnreadCount();

    // Polling notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] text-black overflow-x-hidden">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 box-border">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
