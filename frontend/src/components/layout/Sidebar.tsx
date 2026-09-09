import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ScanSearch,
  BotMessageSquare,
  FileBarChart2,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/crops', label: 'Parcelas y Cultivos', icon: Sprout },
    { to: '/diagnosis', label: 'Diagnóstico IA', icon: ScanSearch, badge: 'Deep Learning' },
    { to: '/assistant', label: 'Asistente Botánico', icon: BotMessageSquare, badge: 'Qwen 3.8' },
    { to: '/reports', label: 'Reportes y Alertas', icon: FileBarChart2 },
    { to: '/profile', label: 'Mi Perfil', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Brand Logo & Title */}
        <div className="p-3 bg-[#FDFBF7] rounded-2xl border-2 border-black shadow-neo">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌱</span>
            <span className="font-black text-lg tracking-tight">BERAUN AI</span>
          </div>
          <p className="text-[11px] font-bold text-zinc-600 leading-tight">
            Inteligencia Artificial Fitosanitaria y Manejo Agronómico
          </p>
        </div>

        {/* Navigation items */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black text-xs border-2 border-black transition-all ${
                  isActive
                    ? 'bg-[#FFD200] text-black shadow-neo translate-x-0.5'
                    : 'bg-[#FDFBF7] text-zinc-800 hover:bg-[#F5F0EA] shadow-neo-sm hover:translate-x-0.5'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-black shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black text-white shrink-0 whitespace-nowrap">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Quick Promo & Logout */}
      <div className="space-y-3 pt-4 border-t-2 border-black">
        <div className="p-3 bg-[#00C2CB] rounded-xl border-2 border-black shadow-neo-sm">
          <div className="flex items-center gap-1.5 font-black text-xs text-black mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnóstico DL Activo</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-900 leading-tight">
            Identificación de más de 38 plagas y enfermedades en hojas.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#FEE2E2] text-[#B91C1C] rounded-xl font-black text-xs border-2 border-black shadow-neo-sm hover:bg-red-200 transition-colors active:translate-x-0.5 active:translate-y-0.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-white border-r-3 border-black hidden lg:flex flex-col shrink-0 min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white border-r-3 border-black h-full z-10 shadow-neo-xl overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
