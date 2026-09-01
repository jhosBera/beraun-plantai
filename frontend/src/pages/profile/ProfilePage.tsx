import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Home, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    farm_name: '',
  });

  const [prefs, setPrefs] = useState({
    email_alerts: true,
    in_app_alerts: true,
    watering_reminders: true,
    disease_warnings: true,
    daily_summary: false,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        farm_name: user.farm_name || '',
      });
      if (user.notification_preferences) {
        setPrefs({
          email_alerts: !!user.notification_preferences.email_alerts,
          in_app_alerts: !!user.notification_preferences.in_app_alerts,
          watering_reminders: !!user.notification_preferences.watering_reminders,
          disease_warnings: !!user.notification_preferences.disease_warnings,
          daily_summary: !!user.notification_preferences.daily_summary,
        });
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await updateProfile({
        ...formData,
        notification_preferences: prefs,
      });
      setSuccessMsg('¡Perfil y preferencias actualizadas con éxito!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('Hubo un error al actualizar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrefToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 max-w-4xl w-full mx-auto overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#FFD200] p-4 sm:p-8 rounded-3xl border-3 border-black shadow-neo-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-black text-white text-xs font-black rounded-lg">
            <span>👤 CONFIGURACIÓN DE PERFIL</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-black tracking-tight">
            Gestión de Perfil y Preferencias
          </h2>
          <p className="text-xs font-bold text-zinc-900">
            Actualiza tus datos personales, información de tu huerto y frecuencia de notificaciones.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#DCFCE7] border-2 border-black rounded-2xl text-xs font-black text-[#15803D] flex items-center gap-2 shadow-neo-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Farm Data */}
        <Card shadowColor="teal" borderWidth="3" className="p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-black flex items-center gap-2 pb-3 border-b-2 border-black">
            <User className="w-5 h-5 text-black" />
            <span>1. Información Personal y Finca</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                CORREO ELECTRÓNICO (NO MODIFICABLE)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 border-2 border-black rounded-xl text-sm font-bold text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                NOMBRE DE LA FINCA / HUERTO *
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="Ej: Finca Los Cedros"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                NOMBRES *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                APELLIDOS
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              TELÉFONO / WHATSAPP
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+51 987654321"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card shadowColor="yellow" borderWidth="3" className="p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-black flex items-center gap-2 pb-3 border-b-2 border-black">
            <Bell className="w-5 h-5 text-black" />
            <span>2. Preferencias de Notificación</span>
          </h3>

          <div className="space-y-3">
            {[
              {
                id: 'in_app_alerts',
                title: 'Notificaciones en la Plataforma (In-App)',
                desc: 'Mostrar alertas y recordatorios en el panel superior y feed de avisos.',
                val: prefs.in_app_alerts,
              },
              {
                id: 'watering_reminders',
                title: 'Recordatorios de Riego Programados',
                desc: 'Avisar cuando se cumpla la fecha estimada de riego de cada cultivo.',
                val: prefs.watering_reminders,
              },
              {
                id: 'disease_warnings',
                title: 'Alertas Fitosanitarias de Alta Severidad',
                desc: 'Avisos prioritarios cuando un diagnóstico detecte una plaga crítica como Tizón o Rancha.',
                val: prefs.disease_warnings,
              },
              {
                id: 'email_alerts',
                title: 'Notificaciones por Correo Electrónico',
                desc: 'Enviar resumen de alertas fitosanitarias a tu bandeja de entrada.',
                val: prefs.email_alerts,
              },
              {
                id: 'daily_summary',
                title: 'Resumen Semanal de Sanidad y Cuidados',
                desc: 'Reporte consolidado del estado de salud de todos los lotes de tu finca.',
                val: prefs.daily_summary,
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => handlePrefToggle(item.id as keyof typeof prefs)}
                className={`p-4 rounded-xl border-2 border-black flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  item.val ? 'bg-[#DCFCE7] shadow-neo-sm' : 'bg-[#FDFBF7] opacity-80'
                }`}
              >
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-black">{item.title}</h4>
                  <p className="text-[11px] text-zinc-600 font-medium mt-0.5">{item.desc}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center font-black text-xs shrink-0 ${
                    item.val ? 'bg-[#22C55E] text-black' : 'bg-white'
                  }`}
                >
                  {item.val ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={saving}
          className="w-full"
        >
          <Save className="w-5 h-5" />
          <span>Guardar Cambios de Perfil</span>
        </Button>
      </form>
    </div>
  );
};
