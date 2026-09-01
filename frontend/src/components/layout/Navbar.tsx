import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Sparkles, User as UserIcon, LogOut, CheckCheck, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Button } from '../ui/Button';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b-3 border-black">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 bg-[#F5F0EA] rounded-xl border-2 border-black shadow-neo-sm lg:hidden hover:bg-amber-100 transition-colors"
          title="Menú Principal"
        >
          <Menu className="w-5 h-5 text-black" />
        </button>

        <h1 className="text-lg sm:text-xl font-black tracking-tight text-black flex items-center gap-2">
          <span className="bg-[#22C55E] text-black px-2 py-0.5 rounded-lg border-2 border-black shadow-neo-sm">
            🌱 BERAUN
          </span>
          <span className="hidden sm:inline font-black text-black">PLANTAI</span>
        </h1>
        {user?.farm_name && (
          <span className="hidden md:inline-flex items-center px-3 py-1 bg-[#FEF08A] text-black text-xs font-black rounded-full border-2 border-black shadow-neo-sm">
            🏡 {user.farm_name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Diagnose CTA */}
        <Button
          size="sm"
          variant="accent"
          onClick={() => navigate('/diagnosis')}
          className="hidden sm:flex"
        >
          <Sparkles className="w-4 h-4" />
          <span>Diagnosticar Hoja</span>
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white rounded-xl border-2 border-black shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm transition-all"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 bg-[#EF4444] text-white text-xs font-black rounded-full border-2 border-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border-3 border-black shadow-neo-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-3 bg-[#F5F0EA] border-b-2 border-black">
                <span className="font-black text-sm">Notificaciones ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Marcar todas leídas
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y-2 divide-zinc-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-bold text-zinc-500">
                    No tienes notificaciones pendientes
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 cursor-pointer hover:bg-amber-50 transition-colors ${
                        !n.is_read ? 'bg-green-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-black text-black">{n.title}</p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <Link
                to="/reports"
                onClick={() => setShowNotifications(false)}
                className="block text-center py-2.5 bg-[#FFD200] font-black text-xs border-t-2 border-black hover:bg-[#ecc200] transition-colors"
              >
                Ver todas las alertas y reportes &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* User Profile avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 bg-[#F5F0EA] rounded-xl border-2 border-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFD200] border-2 border-black flex items-center justify-center font-black text-sm text-black">
            {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-black pr-2 hidden md:inline">
            {user?.first_name}
          </span>
        </Link>
      </div>
    </header>
  );
};
