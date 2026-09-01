import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  Calendar,
  Droplets,
  Sun,
  FileDown,
  Plus,
  Activity,
  History,
  ScanSearch,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { useCropStore } from '../../store/cropStore';
import { apiClient } from '../../api/client';
import { CareEvent, StatusLog, Diagnosis } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const CropDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedCrop, fetchCropDetail, deleteCrop } = useCropStore();

  const [activeTab, setActiveTab] = useState<'care' | 'status' | 'diagnoses'>('care');
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  // Care Event Form State
  const [careForm, setCareForm] = useState({
    event_type: 'watering',
    title: 'Riego por goteo',
    event_date: new Date().toISOString().slice(0, 16),
    product_used: '',
    amount: '',
    notes: '',
  });

  // Status Log Form State
  const [statusForm, setStatusForm] = useState({
    status: 'good',
    title: 'Monitoreo vegetativo regular',
    observations: '',
    logged_at: new Date().toISOString().slice(0, 16),
  });
  const [statusPhoto, setStatusPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchCropDetail(Number(id));
      fetchCropDiagnoses(Number(id));
    }
  }, [id]);

  const fetchCropDiagnoses = async (cropId: number) => {
    try {
      const res = await apiClient.get(`/diagnosis/?crop=${cropId}`);
      setDiagnoses(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCareEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await apiClient.post('/care-events/', {
        ...careForm,
        crop: Number(id),
      });
      await fetchCropDetail(Number(id));
      setIsCareModalOpen(false);
      setCareForm({
        event_type: 'watering',
        title: 'Riego por goteo',
        event_date: new Date().toISOString().slice(0, 16),
        product_used: '',
        amount: '',
        notes: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatusLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('crop', id);
      formData.append('status', statusForm.status);
      formData.append('title', statusForm.title);
      formData.append('observations', statusForm.observations);
      formData.append('logged_at', statusForm.logged_at);
      if (statusPhoto) {
        formData.append('photo', statusPhoto);
      }

      await apiClient.post('/status-logs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchCropDetail(Number(id));
      setIsStatusModalOpen(false);
      setStatusPhoto(null);
      setStatusForm({
        status: 'good',
        title: 'Monitoreo vegetativo regular',
        observations: '',
        logged_at: new Date().toISOString().slice(0, 16),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/reports/crops/${id}/pdf/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Salud_${selectedCrop?.species}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este cultivo? Se borrará todo su historial.')) {
      await deleteCrop(Number(id));
      navigate('/crops');
    }
  };

  if (!selectedCrop) {
    return (
      <div className="p-12 text-center text-sm font-bold text-zinc-500">
        Cargando detalles del cultivo...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Back & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/crops"
          className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Parcelas</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="pink"
            size="sm"
            onClick={handleDownloadPDF}
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar Reporte PDF</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Crop Profile Card */}
      <Card shadowColor="yellow" borderWidth="3" className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border-2 border-black flex items-center justify-center text-3xl shrink-0 shadow-neo-sm">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase text-zinc-500">
                  {selectedCrop.species} · {selectedCrop.plot_name || 'Parcela'}
                </span>
                <Badge
                  variant={
                    selectedCrop.status === 'healthy'
                      ? 'green'
                      : selectedCrop.status === 'alert'
                      ? 'red'
                      : 'blue'
                  }
                >
                  {selectedCrop.status_display || selectedCrop.status}
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black">
                {selectedCrop.name}
              </h2>
              {selectedCrop.variety && (
                <p className="text-xs font-bold text-zinc-600">
                  Variedad: <span className="text-black font-extrabold">{selectedCrop.variety}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FDFBF7] p-4 rounded-2xl border-2 border-black">
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block">Siembra</span>
              <span className="text-xs font-black text-black">
                {new Date(selectedCrop.planting_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block">Riego Sugerido</span>
              <span className="text-xs font-black text-black">{selectedCrop.water_requirement}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase block">Exposición Solar</span>
              <span className="text-xs font-black text-black">{selectedCrop.sunlight_requirement}</span>
            </div>
          </div>
        </div>

        {selectedCrop.notes && (
          <div className="p-3 bg-amber-50 rounded-xl border-2 border-black text-xs font-bold text-zinc-800">
            📝 <b>Notas:</b> {selectedCrop.notes}
          </div>
        )}
      </Card>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-2">
        <button
          onClick={() => setActiveTab('care')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs border-2 border-black transition-all ${
            activeTab === 'care'
              ? 'bg-[#FFD200] text-black shadow-neo'
              : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Cuidados</span>
          <span className="ml-1 px-1.5 py-0.5 rounded bg-black text-white text-[10px]">
            {selectedCrop.care_events?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs border-2 border-black transition-all ${
            activeTab === 'status'
              ? 'bg-[#00C2CB] text-black shadow-neo'
              : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Bitácora de Estado</span>
          <span className="ml-1 px-1.5 py-0.5 rounded bg-black text-white text-[10px]">
            {selectedCrop.status_logs?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('diagnoses')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs border-2 border-black transition-all ${
            activeTab === 'diagnoses'
              ? 'bg-[#22C55E] text-black shadow-neo'
              : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <ScanSearch className="w-4 h-4" />
          <span>Diagnósticos Fitosanitarios</span>
          <span className="ml-1 px-1.5 py-0.5 rounded bg-black text-white text-[10px]">
            {diagnoses.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Historial de Cuidados */}
      {activeTab === 'care' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-black">
              Eventos de Riego, Fertilización y Manejo
            </h3>
            <Button
              size="sm"
              variant="yellow"
              onClick={() => setIsCareModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Cuidado</span>
            </Button>
          </div>

          {(!selectedCrop.care_events || selectedCrop.care_events.length === 0) ? (
            <Card shadowColor="black" className="p-8 text-center text-xs font-bold text-zinc-500">
              No hay eventos de cuidado registrados todavía. Registra riegos, abonos o podas.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCrop.care_events.map((event) => (
                <Card key={event.id} shadowColor="black" className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="blue">{event.event_type_display || event.event_type}</Badge>
                      <h4 className="font-black text-sm text-black mt-1">{event.title}</h4>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-500">
                      {new Date(event.event_date).toLocaleString()}
                    </span>
                  </div>

                  {(event.product_used || event.amount) && (
                    <p className="text-xs font-bold text-zinc-700 bg-[#F5F0EA] p-2 rounded-lg border border-black/30">
                      🧪 Insumo: {event.product_used || 'N/A'} {event.amount ? `(${event.amount})` : ''}
                    </p>
                  )}

                  {event.notes && (
                    <p className="text-xs text-zinc-600 italic">{event.notes}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bitácora de Estado */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-black">
              Evolución y Bitácora de Salud
            </h3>
            <Button
              size="sm"
              variant="accent"
              onClick={() => setIsStatusModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Entrada en Bitácora</span>
            </Button>
          </div>

          {(!selectedCrop.status_logs || selectedCrop.status_logs.length === 0) ? (
            <Card shadowColor="black" className="p-8 text-center text-xs font-bold text-zinc-500">
              No hay entradas en la bitácora de evolución aún.
            </Card>
          ) : (
            <div className="space-y-4">
              {selectedCrop.status_logs.map((log) => (
                <Card key={log.id} shadowColor="teal" className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                  {log.photo && (
                    <img
                      src={log.photo}
                      alt="Foto de evolución"
                      className="w-24 h-24 object-cover rounded-xl border-2 border-black shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.status === 'healthy' || log.status === 'recovered'
                              ? 'green'
                              : log.status === 'critical'
                              ? 'red'
                              : 'yellow'
                          }
                        >
                          {log.status_display || log.status}
                        </Badge>
                        <h4 className="font-black text-sm text-black">{log.title}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-500">
                        {new Date(log.logged_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-700">{log.observations}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Diagnósticos Fitosanitarios */}
      {activeTab === 'diagnoses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-black">
              Historial de Diagnósticos por Deep Learning
            </h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/diagnosis')}
            >
              <ScanSearch className="w-4 h-4" />
              <span>Nuevo Análisis de Hoja</span>
            </Button>
          </div>

          {diagnoses.length === 0 ? (
            <Card shadowColor="black" className="p-8 text-center text-xs font-bold text-zinc-500">
              No hay diagnósticos asociados a este cultivo. Escanea una hoja para detectar plagas.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnoses.map((diag) => (
                <Card key={diag.id} shadowColor={diag.is_healthy ? 'green' : 'pink'} className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={diag.image}
                      alt={diag.disease_common_name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-black shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant={diag.is_healthy ? 'green' : 'red'}>
                          {diag.is_healthy ? 'Saludable' : diag.severity}
                        </Badge>
                        <span className="text-[10px] font-black bg-[#FFD200] px-1.5 py-0.5 rounded border border-black">
                          {diag.confidence}% Certeza
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-black">{diag.disease_common_name}</h4>
                      <p className="text-[11px] italic text-zinc-500">{diag.disease_scientific_name}</p>
                    </div>
                  </div>

                  {diag.treatment_plan && (
                    <div className="p-2.5 bg-[#F5F0EA] rounded-xl border border-black/30 text-xs font-medium text-zinc-800 line-clamp-3">
                      <b>Tratamiento:</b> {diag.treatment_plan}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500">
                      {new Date(diag.diagnosed_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="yellow"
                      onClick={() => navigate('/assistant')}
                    >
                      <span>Consultar Asistente IA</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Registrar Cuidado */}
      <Modal
        isOpen={isCareModalOpen}
        onClose={() => setIsCareModalOpen(false)}
        title="Registrar Evento de Cuidado"
      >
        <form onSubmit={handleCreateCareEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-black mb-1">
              TIPO DE ACTIVIDAD *
            </label>
            <select
              value={careForm.event_type}
              onChange={(e) => setCareForm({ ...careForm, event_type: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            >
              <option value="watering">💧 Riego</option>
              <option value="fertilization">🧪 Fertilización / Abono</option>
              <option value="pruning">✂️ Poda</option>
              <option value="fumigation">🛡️ Fumigación / Tratamiento Fitosanitario</option>
              <option value="harvest">🧺 Cosecha</option>
              <option value="monitoring">🔍 Monitoreo General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              TÍTULO O ACCIÓN REALIZADA *
            </label>
            <input
              type="text"
              required
              value={careForm.title}
              onChange={(e) => setCareForm({ ...careForm, title: e.target.value })}
              placeholder="Ej: Riego por goteo matutino con fertilizante NPK"
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                PRODUCTO / INSUMO UTILIZADO
              </label>
              <input
                type="text"
                value={careForm.product_used}
                onChange={(e) => setCareForm({ ...careForm, product_used: e.target.value })}
                placeholder="Ej: Compost, Sulfato de Cobre, Biol"
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                CANTIDAD / DOSIS
              </label>
              <input
                type="text"
                value={careForm.amount}
                onChange={(e) => setCareForm({ ...careForm, amount: e.target.value })}
                placeholder="Ej: 200 L / 50g por planta"
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              FECHA Y HORA *
            </label>
            <input
              type="datetime-local"
              required
              value={careForm.event_date}
              onChange={(e) => setCareForm({ ...careForm, event_date: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              OBSERVACIONES ADICIONALES
            </label>
            <textarea
              rows={2}
              value={careForm.notes}
              onChange={(e) => setCareForm({ ...careForm, notes: e.target.value })}
              placeholder="Detalles sobre clima, respuesta de la planta..."
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <Button
            type="submit"
            variant="yellow"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
          >
            Guardar Registro de Cuidado
          </Button>
        </form>
      </Modal>

      {/* Modal Registrar Entrada de Bitácora */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Nueva Entrada en Bitácora de Estado"
      >
        <form onSubmit={handleCreateStatusLog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                ESTADO GENERAL *
              </label>
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              >
                <option value="healthy">🟢 Excelente / Saludable</option>
                <option value="good">🟡 Bueno / Normal</option>
                <option value="warning">🟠 Alerta / Síntomas Leves</option>
                <option value="critical">🔴 Crítico / Plaga Avanzada</option>
                <option value="recovered">🟣 Recuperado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                FECHA *
              </label>
              <input
                type="datetime-local"
                required
                value={statusForm.logged_at}
                onChange={(e) => setStatusForm({ ...statusForm, logged_at: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              TÍTULO DEL ESTADO *
            </label>
            <input
              type="text"
              required
              value={statusForm.title}
              onChange={(e) => setStatusForm({ ...statusForm, title: e.target.value })}
              placeholder="Ej: Crecimiento vigoroso de nuevos brotes"
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              OBSERVACIONES DETALLADAS *
            </label>
            <textarea
              rows={3}
              required
              value={statusForm.observations}
              onChange={(e) => setStatusForm({ ...statusForm, observations: e.target.value })}
              placeholder="Describe color de hojas, turgencia, presencia de flores o frutos..."
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              FOTO DE EVIDENCIA (OPCIONAL)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setStatusPhoto(e.target.files?.[0] || null)}
              className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-black file:text-xs file:font-black file:bg-[#00C2CB] file:text-black hover:file:bg-[#00a7af]"
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
          >
            Guardar en Bitácora
          </Button>
        </form>
      </Modal>
    </div>
  );
};
