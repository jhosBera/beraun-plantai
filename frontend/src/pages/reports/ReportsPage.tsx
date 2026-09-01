import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileDown,
  Bell,
  Calendar,
  Plus,
  Droplets,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useCropStore } from '../../store/cropStore';
import { useNotificationStore } from '../../store/notificationStore';
import { apiClient } from '../../api/client';
import { Alert } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const ReportsPage: React.FC = () => {
  const { crops } = useCropStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedCropForPDF, setSelectedCropForPDF] = useState<string>('');

  const [alertForm, setAlertForm] = useState({
    crop: '',
    alert_type: 'watering',
    title: 'Recordatorio de Riego',
    description: '',
    scheduled_for: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    recurrence_days: 2,
  });
  const [creatingAlert, setCreatingAlert] = useState(false);

  useEffect(() => {
    fetchAlerts();
    if (crops.length > 0 && !selectedCropForPDF) {
      setSelectedCropForPDF(crops[0].id.toString());
      setAlertForm(prev => ({ ...prev, crop: crops[0].id.toString() }));
    }
  }, [crops]);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await apiClient.get('/alerts/');
      setAlerts(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.crop) return;
    setCreatingAlert(true);

    try {
      await apiClient.post('/alerts/', alertForm);
      setIsAlertModalOpen(false);
      fetchAlerts();
      setAlertForm({
        crop: crops[0]?.id.toString() || '',
        alert_type: 'watering',
        title: 'Recordatorio de Riego',
        description: '',
        scheduled_for: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        recurrence_days: 2,
      });
    } catch (err) {
      console.error('Error creating alert:', err);
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    if (confirm('¿Eliminar este recordatorio?')) {
      try {
        await apiClient.delete(`/alerts/${alertId}/`);
        fetchAlerts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownloadPDF = async (cropId: string) => {
    if (!cropId) return;
    try {
      const res = await apiClient.get(`/reports/crops/${cropId}/pdf/`, {
        responseType: 'blob',
      });
      const crop = crops.find(c => c.id.toString() === cropId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Salud_${crop?.species || 'Cultivo'}_${cropId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#22C55E] p-4 sm:p-8 rounded-3xl border-3 border-black shadow-neo-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-black rounded-lg">
            <span>📊 REPORTES Y ALERTAS</span>
          </div>
          <h2 className="text-xl sm:text-4xl font-black text-black tracking-tight">
            Reportes y Alertas de Cuidado
          </h2>
          <p className="text-xs sm:text-sm font-bold text-zinc-900 max-w-xl">
            Exporta historiales de salud en formato PDF profesional e implementa recordatorios periódicos para riego y aplicaciones sanitarias.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: PDF Report Generator & In-App Notifications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Exportación de Reportes PDF Card */}
          <Card shadowColor="yellow" borderWidth="3" className="p-6 space-y-4">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <FileDown className="w-5 h-5 text-black" />
              <span>1. Descarga de Reportes PDF</span>
            </h3>
            <p className="text-xs font-bold text-zinc-600">
              Genera un documento imprimible con el historial agronómico, diagnósticos de IA y registros de evolución de tu cultivo.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-black text-black mb-1">
                  SELECCIONA EL CULTIVO *
                </label>
                <select
                  value={selectedCropForPDF}
                  onChange={(e) => setSelectedCropForPDF(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.species} - {c.plot_name})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => handleDownloadPDF(selectedCropForPDF)}
                disabled={!selectedCropForPDF}
                className="w-full"
              >
                <FileDown className="w-5 h-5" />
                <span>Exportar Informe PDF</span>
              </Button>
            </div>
          </Card>

          {/* In-App Notifications Feed */}
          <Card shadowColor="teal" borderWidth="2" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-black flex items-center gap-2">
                <Bell className="w-4 h-4 text-black" />
                <span>Notificaciones In-App</span>
              </h3>
              {notifications.some(n => !n.is_read) && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs font-bold text-zinc-500 bg-[#FDFBF7] rounded-xl border border-dashed border-zinc-300">
                  No hay notificaciones recibidas.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 rounded-xl border-2 border-black transition-all cursor-pointer ${
                      !n.is_read ? 'bg-[#DCFCE7] shadow-neo-sm' : 'bg-white text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-black">{n.title}</h4>
                      <span className="text-[9px] font-bold text-zinc-500">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-800 mt-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Scheduled Alerts & Celery Scheduler (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card shadowColor="black" borderWidth="3" className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
              <div>
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-black" />
                  <span>2. Programación de Alertas de Cuidado</span>
                </h3>
                <p className="text-xs font-bold text-zinc-600 mt-0.5">
                  Automatizadas mediante Celery Beat con notificaciones programadas
                </p>
              </div>

              <Button
                variant="yellow"
                size="md"
                onClick={() => setIsAlertModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Alerta</span>
              </Button>
            </div>

            {/* Alerts List */}
            {loadingAlerts ? (
              <div className="text-center py-8 text-xs font-bold text-zinc-500">
                Cargando alertas...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#FDFBF7] rounded-2xl border-2 border-dashed border-zinc-300">
                <div className="w-12 h-12 rounded-xl bg-amber-100 border border-black mx-auto flex items-center justify-center text-2xl">
                  ⏰
                </div>
                <h4 className="text-sm font-black text-black">No tienes alertas de cuidado activas</h4>
                <p className="text-xs font-bold text-zinc-500 max-w-sm mx-auto">
                  Configura recordatorios automáticos de riego, abonado o revisión fitosanitaria para tus cultivos.
                </p>
                <Button
                  size="sm"
                  variant="yellow"
                  onClick={() => setIsAlertModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Primer Recordatorio</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-4 bg-white rounded-2xl border-2 border-black shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-x-0.5 transition-transform"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            al.alert_type === 'watering'
                              ? 'blue'
                              : al.alert_type === 'disease_check'
                              ? 'red'
                              : 'yellow'
                          }
                        >
                          {al.alert_type_display || al.alert_type}
                        </Badge>
                        <span className="text-xs font-black text-zinc-600">
                          🌱 {al.crop_name || 'Cultivo'} ({al.crop_species})
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-black">{al.title}</h4>
                      {al.description && (
                        <p className="text-xs text-zinc-600">{al.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-black text-black">
                          <Clock className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{new Date(al.scheduled_for).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 block">
                          {al.recurrence_days > 0 ? `Cada ${al.recurrence_days} días` : 'Una sola vez'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(al.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        title="Eliminar alerta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal Programar Alerta */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Programar Recordatorio de Cuidado"
      >
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-black mb-1">
              CULTIVO DESTINO *
            </label>
            <select
              required
              value={alertForm.crop}
              onChange={(e) => setAlertForm({ ...alertForm, crop: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            >
              <option value="">Selecciona un cultivo...</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.species} - {c.plot_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                TIPO DE ALERTA *
              </label>
              <select
                value={alertForm.alert_type}
                onChange={(e) => setAlertForm({ ...alertForm, alert_type: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              >
                <option value="watering">💧 Recordatorio de Riego</option>
                <option value="fertilization">🧪 Aplicación de Fertilizante / Abono</option>
                <option value="disease_check">🔍 Revisión Fitosanitaria / Síntomas</option>
                <option value="pruning">✂️ Poda</option>
                <option value="fumigation">🛡️ Fumigación Preventiva</option>
                <option value="custom">🔔 Alerta Personalizada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                REPETICIÓN (DÍAS)
              </label>
              <input
                type="number"
                min="0"
                value={alertForm.recurrence_days}
                onChange={(e) => setAlertForm({ ...alertForm, recurrence_days: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
              <span className="text-[10px] text-zinc-500 font-bold">0 = alerta única</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              TÍTULO DEL RECORDATORIO *
            </label>
            <input
              type="text"
              required
              value={alertForm.title}
              onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
              placeholder="Ej: Riego matutino con abono líquido"
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              FECHA Y HORA PROGRAMADA *
            </label>
            <input
              type="datetime-local"
              required
              value={alertForm.scheduled_for}
              onChange={(e) => setAlertForm({ ...alertForm, scheduled_for: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              INSTRUCCIONES / DETALLES ADICIONALES
            </label>
            <textarea
              rows={2}
              value={alertForm.description}
              onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
              placeholder="Ej: Aplicar 2L de agua por planta antes de las 9:00 AM..."
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <Button
            type="submit"
            variant="yellow"
            size="md"
            isLoading={creatingAlert}
            className="w-full mt-2"
          >
            Guardar y Programar Alerta
          </Button>
        </form>
      </Modal>
    </div>
  );
};
