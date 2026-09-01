import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useCropStore } from '../../store/cropStore';
import { useNotificationStore } from '../../store/notificationStore';

export const AppLayout: React.FC = () => {
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
    <div className="flex min-h-screen bg-[#FDFBF7] text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
