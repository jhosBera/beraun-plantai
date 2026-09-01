import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BotMessageSquare,
  History,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { useCropStore } from '../../store/cropStore';
import { apiClient } from '../../api/client';
import { Diagnosis } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const DiagnosisPage: React.FC = () => {
  const { crops } = useCropStore();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<Diagnosis | null>(null);
  const [pastDiagnoses, setPastDiagnoses] = useState<Diagnosis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get('/diagnosis/');
      setPastDiagnoses(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosisResult(null);
    }
  };

  const handleRunDiagnosis = async () => {
    if (!selectedFile) return;
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedCropId) {
        formData.append('crop_id', selectedCropId);
      }

      const res = await apiClient.post('/diagnosis/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDiagnosisResult(res.data);
      fetchHistory();
    } catch (err: any) {
      console.error('Error running diagnosis:', err);
      alert('Hubo un problema al procesar la imagen. Intenta nuevamente.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiagnosisResult(null);
  };

  const handleGetAITreatment = async (diagnosisId: number) => {
    try {
      const res = await apiClient.post('/chat/sessions/treatment-from-diagnosis/', {
        diagnosis_id: diagnosisId
      });
      navigate(`/assistant?session=${res.data.session_id}`);
    } catch (err) {
      console.error(err);
      navigate('/assistant');
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#00C2CB] p-4 sm:p-8 rounded-3xl border-3 border-black shadow-neo-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-black rounded-lg">
            <span>🔬 DIAGNÓSTICO CON IA</span>
          </div>
          <h2 className="text-xl sm:text-4xl font-black text-black tracking-tight">
            Diagnóstico Fitosanitario Inteligente
          </h2>
          <p className="text-xs sm:text-sm font-bold text-zinc-900 max-w-xl">
            Toma una foto de la hoja afectada o sube una imagen de tu galería para detectar hongos, bacterias, virus o plagas con redes neuronales.
          </p>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Capture / Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card shadowColor="yellow" borderWidth="3" className="p-6 space-y-5">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <Camera className="w-5 h-5 text-black" />
              <span>1. Capturar o Subir Imagen</span>
            </h3>

            {/* Associate with Crop Selection */}
            <div>
              <label className="block text-xs font-black text-black mb-1">
                ASOCIAR AL CULTIVO (OPCIONAL)
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              >
                <option value="">Análisis general (sin asociar a cultivo)</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.species} - {c.plot_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area / Preview Box */}
            <div className="space-y-4">
              {previewUrl ? (
                <div className="relative rounded-2xl border-3 border-black overflow-hidden shadow-neo bg-black flex items-center justify-center max-h-80">
                  <img
                    src={previewUrl}
                    alt="Vista previa de hoja"
                    className="w-full h-80 object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
                      <div className="w-full h-1 bg-[#22C55E] shadow-[0_0_15px_#22C55E] animate-scan" />
                      <div className="mt-4 px-4 py-2 bg-black/80 text-white rounded-xl border border-white text-xs font-black animate-pulse">
                        🧠 Ejecutando Inferencia PyTorch...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-3 border-dashed border-black rounded-2xl p-8 text-center bg-[#FDFBF7] hover:bg-amber-50/50 cursor-pointer transition-colors space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FFD200] border-2 border-black mx-auto flex items-center justify-center shadow-neo-sm">
                    <Upload className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-black">
                      Haz clic para subir imagen o arrastra el archivo aquí
                    </p>
                    <p className="text-xs font-bold text-zinc-500 mt-1">
                      Soporta JPG, PNG, WEBP (hasta 20MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tomar Foto</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4" />
                  <span>Galería</span>
                </Button>
              </div>

              {previewUrl && (
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    isLoading={isScanning}
                    onClick={handleRunDiagnosis}
                    className="flex-1"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Analizar con IA</span>
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    onClick={handleReset}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Diagnosis Result Presentation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {diagnosisResult ? (
            <Card
              shadowColor={diagnosisResult.is_healthy ? 'green' : 'pink'}
              borderWidth="3"
              className="p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Result Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={diagnosisResult.is_healthy ? 'green' : 'red'}>
                      {diagnosisResult.is_healthy ? 'Planta Sana' : `Severidad: ${diagnosisResult.severity}`}
                    </Badge>
                    {diagnosisResult.crop_name && (
                      <span className="text-xs font-black text-zinc-600">
                        🌿 {diagnosisResult.crop_name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-black">
                    {diagnosisResult.disease_common_name}
                  </h3>
                  <p className="text-sm italic font-bold text-zinc-600">
                    {diagnosisResult.disease_scientific_name}
                  </p>
                </div>

                {/* Confidence Score Gauge */}
                <div className="bg-[#FFD200] p-4 rounded-2xl border-2 border-black shadow-neo-sm text-center shrink-0">
                  <span className="text-[10px] font-black uppercase text-black block">
                    Nivel de Certeza
                  </span>
                  <span className="text-3xl font-black text-black">
                    {diagnosisResult.confidence}%
                  </span>
                </div>
              </div>

              {/* Symptoms Identified */}
              {diagnosisResult.symptoms && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Síntomas Reconocidos</span>
                  </h4>
                  <p className="text-sm font-medium text-zinc-800 bg-[#FDFBF7] p-3.5 rounded-xl border-2 border-black/20">
                    {diagnosisResult.symptoms}
                  </p>
                </div>
              )}

              {/* Initial Action Recommendation */}
              {diagnosisResult.treatment_plan && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Plan de Acción Inicial</span>
                  </h4>
                  <p className="text-sm font-medium text-zinc-800 bg-amber-50 p-3.5 rounded-xl border-2 border-black/20">
                    {diagnosisResult.treatment_plan}
                  </p>
                </div>
              )}

              {/* Top 3 Predictions Breakdown */}
              {diagnosisResult.top_predictions && diagnosisResult.top_predictions.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">
                    Probabilidades del Modelo (Top Candidatos)
                  </h4>
                  <div className="space-y-2">
                    {diagnosisResult.top_predictions.map((pred, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border-2 border-black flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-black truncate">
                            {idx + 1}. {pred.common_name}
                          </p>
                          <p className="text-[10px] italic text-zinc-500 truncate">
                            {pred.scientific_name} ({pred.crop})
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 bg-zinc-200 h-3 rounded-full border border-black overflow-hidden hidden sm:block">
                            <div
                              className="bg-[#22C55E] h-full"
                              style={{ width: `${pred.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-black">
                            {pred.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Treatment Plan with AI Assistant Button */}
              <div className="pt-4 border-t-2 border-black">
                <Button
                  variant="yellow"
                  size="lg"
                  onClick={() => handleGetAITreatment(diagnosisResult.id)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BotMessageSquare className="w-5 h-5" />
                    <span>Generar Plan de Acción & Ajustar Calendario con Asistente IA</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ) : (
            <Card shadowColor="yellow" className="p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFD200] border-2 border-black mx-auto flex items-center justify-center text-2xl shadow-neo-sm">
                🔍
              </div>
              <h4 className="text-base font-black text-black">Aún no has seleccionado o analizado una hoja</h4>
              <p className="text-xs font-bold text-zinc-600 max-w-sm mx-auto">
                Sube una imagen o toma una foto desde tu dispositivo para obtener un diagnóstico con redes neuronales.
              </p>
            </Card>
          )}

          {/* Past Diagnoses History */}
          <Card shadowColor="black" borderWidth="3" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-base font-black text-black flex items-center gap-2">
                <History className="w-4 h-4 text-black" />
                <span>Historial de Diagnósticos Realizados</span>
              </h3>
            </div>

            {loadingHistory ? (
              <div className="p-6 text-center text-xs font-bold text-zinc-500">
                Cargando historial...
              </div>
            ) : pastDiagnoses.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-zinc-500 bg-white rounded-xl border-2 border-black">
                No hay diagnósticos previos registrados.
              </div>
            ) : (
              <div className="space-y-3">
                {pastDiagnoses.slice(0, 5).map((diag) => (
                  <div
                    key={diag.id}
                    className="p-3.5 bg-white rounded-xl border-2 border-black shadow-neo-sm flex items-center justify-between gap-4 hover:translate-x-0.5 transition-transform"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={diag.image}
                        alt={diag.disease_common_name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-black shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-black truncate">
                          {diag.disease_common_name}
                        </h4>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(diag.diagnosed_at).toLocaleDateString()} · {diag.confidence}% Certeza
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={diag.is_healthy ? 'green' : 'red'}>
                        {diag.is_healthy ? 'Sano' : diag.severity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGetAITreatment(diag.id)}
                      >
                        <BotMessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tratar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
