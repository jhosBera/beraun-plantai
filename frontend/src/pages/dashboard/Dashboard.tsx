import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ScanSearch,
  BotMessageSquare,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCropStore } from '../../store/cropStore';
import { useNotificationStore } from '../../store/notificationStore';
import { apiClient } from '../../api/client';
import { Diagnosis } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { plots, crops } = useCropStore();
  const { unreadCount } = useNotificationStore();
  const [recentDiagnoses, setRecentDiagnoses] = useState<Diagnosis[]>([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiagnoses = async () => {
      setLoadingDiagnoses(true);
      try {
        const res = await apiClient.get('/diagnosis/');
        setRecentDiagnoses((res.data.results || res.data).slice(0, 4));
      } catch (err) {
        console.error('Error fetching recent diagnoses:', err);
      } finally {
        setLoadingDiagnoses(false);
      }
    };
    fetchDiagnoses();
  }, []);

  const totalCrops = crops.length;
  const totalPlots = plots.length;
  const sickCrops = crops.filter(c => c.status === 'alert').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#FFD200] p-6 sm:p-8 rounded-3xl border-3 border-black shadow-neo-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-black rounded-lg">
            <span>👋 BIENVENIDO AL PANEL AGRÍCOLA</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            Hola, {user?.first_name || 'Agricultor'}!
          </h2>
          <p className="text-sm font-bold text-zinc-900 max-w-xl">
            Monitorea la sanidad vegetal de tus cultivos, detecta enfermedades tempranas con Deep Learning y consulta al asesor agronómico.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/diagnosis')}
            className="bg-black text-white hover:bg-zinc-800"
          >
            <Sparkles className="w-5 h-5 text-[#FFD200]" />
            <span>Escanear Hoja</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/assistant')}
          >
            <BotMessageSquare className="w-5 h-5 text-black" />
            <span>Asesor IA</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card shadowColor="green" className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-zinc-600 uppercase">Cultivos Activos</span>
            <div className="p-2 bg-[#DCFCE7] rounded-xl border border-black">
              <Sprout className="w-5 h-5 text-[#15803D]" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">{totalCrops}</p>
          <span className="text-xs font-bold text-zinc-500 mt-1 block">En {totalPlots} parcelas</span>
        </Card>

        <Card shadowColor="teal" className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-zinc-600 uppercase">Parcelas / Lotes</span>
            <div className="p-2 bg-[#E0F2FE] rounded-xl border border-black">
              <MapPin className="w-5 h-5 text-[#0369A1]" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">{totalPlots}</p>
          <span className="text-xs font-bold text-zinc-500 mt-1 block">Sectores registrados</span>
        </Card>

        <Card shadowColor="pink" className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-zinc-600 uppercase">Enfermos / Alerta</span>
            <div className="p-2 bg-[#FEE2E2] rounded-xl border border-black">
              <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">{sickCrops}</p>
          <span className="text-xs font-bold text-[#B91C1C] mt-1 block">
            {sickCrops > 0 ? 'Requieren tratamiento' : 'Todos saludables'}
          </span>
        </Card>

        <Card shadowColor="yellow" className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-zinc-600 uppercase">Alertas y Avisos</span>
            <div className="p-2 bg-[#FEF08A] rounded-xl border border-black">
              <Calendar className="w-5 h-5 text-[#854D0E]" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">{unreadCount}</p>
          <span className="text-xs font-bold text-zinc-500 mt-1 block">Pendientes de revisión</span>
        </Card>
      </div>

      {/* Main Grid: Recent Diagnoses & Active Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Diagnoses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <ScanSearch className="w-5 h-5 text-black" />
              <span>Diagnósticos Fitosanitarios Recientes</span>
            </h3>
            <Link to="/diagnosis" className="text-xs font-black text-black hover:underline flex items-center gap-1">
              Ver todos &rarr;
            </Link>
          </div>

          {loadingDiagnoses ? (
            <div className="p-12 text-center text-sm font-bold text-zinc-500 bg-white rounded-2xl border-2 border-black">
              Cargando diagnósticos...
            </div>
          ) : recentDiagnoses.length === 0 ? (
            <Card shadowColor="black" className="p-8 text-center space-y-3">
              <div className="inline-flex p-3 bg-zinc-100 rounded-2xl border-2 border-black">
                <ScanSearch className="w-8 h-8 text-zinc-400" />
              </div>
              <h4 className="font-black text-base text-black">Aún no hay diagnósticos registrados</h4>
              <p className="text-xs font-bold text-zinc-500 max-w-sm mx-auto">
                Toma una foto de una hoja con síntomas para que el modelo de Deep Learning identifique la enfermedad.
              </p>
              <Button
                variant="accent"
                size="md"
                onClick={() => navigate('/diagnosis')}
              >
                <Sparkles className="w-4 h-4" />
                <span>Realizar Primer Diagnóstico</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentDiagnoses.map((diag) => (
                <Card key={diag.id} shadowColor={diag.is_healthy ? 'green' : 'pink'} className="overflow-hidden p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={diag.image}
                      alt={diag.disease_common_name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-black shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge variant={diag.is_healthy ? 'green' : 'red'}>
                          {diag.is_healthy ? 'Saludable' : diag.severity}
                        </Badge>
                        <span className="text-[11px] font-black bg-[#FFD200] px-1.5 py-0.5 rounded border border-black">
                          {diag.confidence}% Certeza
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-black truncate">
                        {diag.disease_common_name}
                      </h4>
                      <p className="text-[11px] italic text-zinc-500 truncate">
                        {diag.disease_scientific_name}
                      </p>
                      {diag.crop_name && (
                        <p className="text-[11px] font-bold text-zinc-700 mt-1">
                          🌿 {diag.crop_name} ({diag.crop_species})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t-2 border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500">
                      {new Date(diag.diagnosed_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="yellow"
                      onClick={() => navigate(`/assistant`)}
                    >
                      <span>Tratamiento IA</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Crops Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <Sprout className="w-5 h-5 text-black" />
              <span>Mis Cultivos</span>
            </h3>
            <Link to="/crops" className="text-xs font-black text-black hover:underline flex items-center gap-1">
              Ver todos &rarr;
            </Link>
          </div>

          <Card shadowColor="teal" className="p-4 space-y-3">
            {crops.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs font-bold text-zinc-500">No tienes cultivos registrados</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/crops')}
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Cultivo</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {crops.slice(0, 5).map((crop) => (
                  <Link
                    key={crop.id}
                    to={`/crops/${crop.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border-2 border-black bg-[#FDFBF7] hover:bg-[#F5F0EA] transition-all hover:translate-x-0.5"
                  >
                    <div>
                      <h4 className="font-black text-xs text-black">{crop.name}</h4>
                      <p className="text-[10px] font-bold text-zinc-500">
                        {crop.species} · {crop.plot_name || 'Parcela'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        crop.status === 'healthy'
                          ? 'green'
                          : crop.status === 'alert'
                          ? 'red'
                          : 'blue'
                      }
                    >
                      {crop.status_display || crop.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => navigate('/crops')}
            >
              <Plus className="w-4 h-4" />
              <span>Gestionar Parcelas y Cultivos</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
