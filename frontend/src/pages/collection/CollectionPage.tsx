import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  BookOpen,
  Search,
  Trash2,
  Edit3,
  Sun,
  Droplets,
  Thermometer,
  Wind,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  FileText,
  Layers,
  Sparkle,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { collectionApi } from '../../api/client';
import { CollectedPlant, PlantAnalysisResult, CollectionStats } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const CollectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'album'>('scanner');
  
  // Scanner state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PlantAnalysisResult | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Album state
  const [plants, setPlants] = useState<CollectedPlant[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState<CollectionStats | null>(null);

  // Detail Modal state
  const [selectedPlant, setSelectedPlant] = useState<CollectedPlant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'Todas las Categorías' },
    { id: 'Interior', label: 'Interior' },
    { id: 'Exterior', label: 'Exterior' },
    { id: 'Suculenta', label: 'Suculenta' },
    { id: 'Cactus', label: 'Cactus' },
    { id: 'Flor', label: 'Flor' },
    { id: 'Árbol', label: 'Árbol' },
    { id: 'Medicinal', label: 'Medicinal' },
    { id: 'Huerto', label: 'Huerto' },
  ];

  useEffect(() => {
    fetchAlbumData();
  }, [selectedCategory, searchQuery]);

  const fetchAlbumData = async () => {
    setLoadingPlants(true);
    try {
      const params: Record<string, any> = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const [plantsRes, statsRes] = await Promise.all([
        collectionApi.getAll(params),
        collectionApi.getStats()
      ]);

      setPlants(plantsRes.data.results || plantsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error al cargar la colección botánica:', err);
    } finally {
      setLoadingPlants(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setSaveSuccess(false);
    }
  };

  const handleScanPlant = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setSaveSuccess(false);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await collectionApi.identify(formData);
      setAnalysisResult(res.data);
    } catch (err) {
      console.error('Error al identificar planta con IA:', err);
      alert('Ocurrió un error al contactar con el servicio de IA de Gemini.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToCollection = async () => {
    if (!selectedFile || !analysisResult) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('common_name', analysisResult.common_name);
      formData.append('scientific_name', analysisResult.scientific_name);
      formData.append('family', analysisResult.family);
      formData.append('category', analysisResult.category || 'General');
      formData.append('origin', analysisResult.origin || '');
      formData.append('description', analysisResult.description || '');
      formData.append('light_requirement', analysisResult.light_requirement || '');
      formData.append('watering_frequency', analysisResult.watering_frequency || '');
      formData.append('temperature_range', analysisResult.temperature_range || '');
      formData.append('humidity_requirement', analysisResult.humidity_requirement || '');
      formData.append('difficulty', analysisResult.difficulty || 'Moderado');
      formData.append('toxicity_pets', String(analysisResult.toxicity_pets));
      formData.append('toxicity_humans', String(analysisResult.toxicity_humans));
      formData.append('toxicity_details', analysisResult.toxicity_details || '');
      formData.append('fun_facts', analysisResult.fun_facts || '');
      formData.append('confidence', String(analysisResult.confidence));
      if (userNotes) formData.append('user_notes', userNotes);
      if (locationFound) formData.append('location_found', locationFound);

      await collectionApi.create(formData);
      setSaveSuccess(true);
      fetchAlbumData();
    } catch (err) {
      console.error('Error al guardar en el álbum:', err);
      alert('Error al guardar la planta en tu colección.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlant = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta planta de tu colección?')) return;
    try {
      await collectionApi.delete(id);
      setSelectedPlant(null);
      fetchAlbumData();
    } catch (err) {
      console.error('Error al eliminar planta:', err);
      alert('No se pudo eliminar la planta.');
    }
  };

  const handleOpenEditModal = (plant: CollectedPlant) => {
    setSelectedPlant(plant);
    setEditNotes(plant.user_notes || '');
    setEditLocation(plant.location_found || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateNotes = async () => {
    if (!selectedPlant) return;
    setIsUpdating(true);
    try {
      const res = await collectionApi.update(selectedPlant.id, {
        user_notes: editNotes,
        location_found: editLocation,
      });
      setSelectedPlant(res.data);
      setIsEditModalOpen(false);
      fetchAlbumData();
    } catch (err) {
      console.error('Error al actualizar notas:', err);
      alert('Error al actualizar los datos de la planta.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-3 border-black shadow-neo">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌿</span>
            <h1 className="text-2xl font-black tracking-tight">Colección Botánica Inteligente</h1>
            <Badge variant="purple" className="flex items-center gap-1 font-black">
              <Sparkles className="w-3.5 h-3.5" />
              Groq Qwen Vision
            </Badge>
          </div>
          <p className="text-sm font-bold text-zinc-600 mt-1">
            Escanea cualquier planta con IA multimodal, descubre sus cuidados, toxicidad y colecciona tu propio herbario digital.
          </p>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#FDFBF7] rounded-xl border-2 border-black shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs transition-all ${
              activeTab === 'scanner'
                ? 'bg-[#FFD200] text-black border-2 border-black shadow-neo-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Escanear Planta</span>
          </button>
          <button
            onClick={() => setActiveTab('album')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs transition-all ${
              activeTab === 'album'
                ? 'bg-[#00C2CB] text-black border-2 border-black shadow-neo-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mi Álbum ({stats?.total_plants || plants.length})</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-[#E0F2FE] p-4">
          <span className="text-xs font-black uppercase text-[#0369A1]">Plantas Coleccionadas</span>
          <p className="text-3xl font-black text-black mt-1">{stats?.total_plants || 0}</p>
          <span className="text-[11px] font-bold text-[#0369A1]">En tu herbario digital</span>
        </Card>
        <Card className="bg-[#DCFCE7] p-4">
          <span className="text-xs font-black uppercase text-[#15803D]">Familias Botánicas</span>
          <p className="text-3xl font-black text-black mt-1">{stats?.distinct_families || 0}</p>
          <span className="text-[11px] font-bold text-[#15803D]">Diversidad taxonómica</span>
        </Card>
        <Card className="bg-[#FEF08A] p-4">
          <span className="text-xs font-black uppercase text-[#854D0E]">Categorías Únicas</span>
          <p className="text-3xl font-black text-black mt-1">{stats?.category_breakdown?.length || 0}</p>
          <span className="text-[11px] font-bold text-[#854D0E]">Especialidades registradas</span>
        </Card>
        <Card className="bg-[#FEE2E2] p-4">
          <span className="text-xs font-black uppercase text-[#B91C1C]">Tóxicas para Mascotas</span>
          <p className="text-3xl font-black text-black mt-1">{stats?.toxic_pets_count || 0}</p>
          <span className="text-[11px] font-bold text-[#B91C1C]">Alertas de seguridad</span>
        </Card>
      </div>

      {/* TAB 1: SCANNER & IDENTIFICATION */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Input & Camera */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-black flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-[#00C2CB]" />
                Capturar o Subir Fotografía
              </h2>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl border-3 border-black overflow-hidden shadow-neo bg-black aspect-square flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Vista previa de planta"
                      className="w-full h-full object-cover"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                        <Sparkles className="w-10 h-10 text-[#FFD200] animate-spin mb-2" />
                        <p className="font-black text-lg">Analizando con Groq Qwen Vision...</p>
                        <p className="text-xs font-bold text-zinc-300 mt-1">
                          Extrayendo taxonomía, requerimientos y precauciones botánicas
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setAnalysisResult(null);
                      }}
                      className="flex-1"
                      disabled={isScanning}
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Cambiar Foto
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleScanPlant}
                      className="flex-1 bg-[#FFD200] text-black"
                      disabled={isScanning}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      {isScanning ? 'Identificando...' : 'Identificar Planta'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-3 border-dashed border-black rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#FFD200] border-2 border-black flex items-center justify-center mb-4 shadow-neo group-hover:scale-105 transition-transform">
                      <Upload className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="font-black text-base text-zinc-900">Haz clic para subir una foto</h3>
                    <p className="text-xs font-bold text-zinc-500 mt-1 max-w-xs">
                      Soporta JPG, PNG, WEBP. Asegúrate de enfocar con nitidez las hojas o flores.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Abrir Cámara</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Galería</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Botanical Tip Card */}
            <Card className="bg-[#F0FDF4] p-4 border-2">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <div className="text-xs font-bold text-[#15803D] leading-relaxed">
                  <span className="font-black">Consejo para máxima precisión:</span> Fotografía la planta a la luz natural, enfocando la forma de las hojas, nervaduras o pétalos.
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: AI Botanical Result & Save Form */}
          <div className="lg:col-span-7 space-y-6">
            {analysisResult ? (
              <Card className="p-6 space-y-6">
                {/* Result Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-black pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="blue">{analysisResult.category || 'General'}</Badge>
                      <Badge variant="purple">{analysisResult.family || 'Botánica'}</Badge>
                      <Badge variant={analysisResult.difficulty === 'Fácil' ? 'green' : analysisResult.difficulty === 'Difícil' ? 'red' : 'yellow'}>
                        Cuidado: {analysisResult.difficulty}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-black text-black">{analysisResult.common_name}</h2>
                    <p className="text-sm font-bold italic text-zinc-600">{analysisResult.scientific_name}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Certeza IA</span>
                    <p className="text-xl font-black text-emerald-600">
                      {Math.round(analysisResult.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">Descripción Botánica</h4>
                  <p className="text-sm font-medium text-zinc-800 leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border-2 border-black">
                    {analysisResult.description}
                  </p>
                  {analysisResult.origin && (
                    <p className="text-xs font-bold text-zinc-600 mt-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Origen: <strong>{analysisResult.origin}</strong></span>
                    </p>
                  )}
                </div>

                {/* Care Guide Grid */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-[#FFD200]" />
                    Guía Rápida de Cultivo y Cuidados
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FEF08A]/40 rounded-xl border-2 border-black flex items-start gap-2.5">
                      <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-black uppercase text-amber-900 block">Luz Solar</span>
                        <p className="text-xs font-bold text-zinc-800">{analysisResult.light_requirement || 'Luz natural brillante'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#E0F2FE]/40 rounded-xl border-2 border-black flex items-start gap-2.5">
                      <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-black uppercase text-blue-900 block">Frecuencia de Riego</span>
                        <p className="text-xs font-bold text-zinc-800">{analysisResult.watering_frequency || 'Riego moderado'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FEE2E2]/40 rounded-xl border-2 border-black flex items-start gap-2.5">
                      <Thermometer className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-black uppercase text-rose-900 block">Temperatura Óptima</span>
                        <p className="text-xs font-bold text-zinc-800">{analysisResult.temperature_range || '18°C a 25°C'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#DCFCE7]/40 rounded-xl border-2 border-black flex items-start gap-2.5">
                      <Wind className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-black uppercase text-emerald-900 block">Humedad Requerida</span>
                        <p className="text-xs font-bold text-zinc-800">{analysisResult.humidity_requirement || 'Media'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toxicity & Safety Warning */}
                <div className={`p-4 rounded-xl border-2 border-black ${analysisResult.toxicity_pets || analysisResult.toxicity_humans ? 'bg-[#FEE2E2]' : 'bg-[#DCFCE7]'}`}>
                  <div className="flex items-center gap-2 mb-2 font-black text-sm">
                    {analysisResult.toxicity_pets || analysisResult.toxicity_humans ? (
                      <>
                        <ShieldAlert className="w-5 h-5 text-[#B91C1C]" />
                        <span className="text-[#B91C1C]">Precaución de Toxicidad</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                        <span className="text-[#15803D]">Segura para Mascotas y Personas</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-bold text-zinc-800 leading-normal">
                    {analysisResult.toxicity_details || (analysisResult.toxicity_pets ? 'Tóxica si se ingiere por mascotas.' : 'No tóxica.')}
                  </p>
                </div>

                {/* Fun facts */}
                {analysisResult.fun_facts && (
                  <div className="p-3.5 bg-[#F3E8FF] rounded-xl border-2 border-black">
                    <span className="text-[11px] font-black uppercase text-purple-900 block mb-1">
                      💡 Curiosidad Botánica
                    </span>
                    <p className="text-xs font-bold text-purple-950 italic">
                      "{analysisResult.fun_facts}"
                    </p>
                  </div>
                )}

                {/* Save to Collection Section */}
                <div className="space-y-3 pt-4 border-t-2 border-black">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    Añadir a mi Álbum Botánico
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Lugar de hallazgo</label>
                      <input
                        type="text"
                        placeholder="Ej. Invernadero 2, Jardín frontal..."
                        value={locationFound}
                        onChange={(e) => setLocationFound(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-black bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Notas de campo</label>
                      <input
                        type="text"
                        placeholder="Ej. Floreció en primavera, esqueje recibido..."
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-black bg-white"
                      />
                    </div>
                  </div>

                  {saveSuccess ? (
                    <div className="p-3 bg-[#DCFCE7] text-[#15803D] rounded-xl border-2 border-black font-black text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>¡Planta guardada exitosamente en tu colección!</span>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => setActiveTab('album')}
                        className="text-xs py-1 px-2.5 bg-white text-black"
                      >
                        Ver en mi Álbum
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSaveToCollection}
                      disabled={isSaving}
                      className="w-full bg-[#00C2CB] text-black font-black text-sm py-3 shadow-neo"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {isSaving ? 'Guardando en Álbum...' : 'Guardar en mi Colección Botánica'}
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px] border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F0EA] border-2 border-black flex items-center justify-center mb-4 text-3xl">
                  🌱
                </div>
                <h3 className="font-black text-lg text-zinc-900">Esperando fotografía</h3>
                <p className="text-xs font-bold text-zinc-500 max-w-sm mt-1">
                  Sube una foto o tómala desde tu cámara y pulsa "Identificar Planta" para ver la ficha taxonómica y de cuidados.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOTANICAL ALBUM & COLLECTION */}
      {activeTab === 'album' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nombre común, científico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-black bg-[#FDFBF7]"
              />
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#FFD200] text-black shadow-neo-sm -translate-y-0.5'
                      : 'bg-white text-zinc-700 hover:bg-[#F5F0EA]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Plant Grid */}
          {loadingPlants ? (
            <div className="p-12 text-center font-black text-sm text-zinc-500">
              Cargando plantas de tu colección...
            </div>
          ) : plants.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">🪴</span>
              <h3 className="font-black text-lg text-zinc-900">No hay plantas en esta vista</h3>
              <p className="text-xs font-bold text-zinc-500 mt-1 max-w-sm">
                Comienza identificando y coleccionando tus primeras especies vegetales con la cámara.
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('scanner')}
                className="mt-4 bg-[#FFD200] text-black font-black"
              >
                <Camera className="w-4 h-4 mr-2" />
                Escanear Mi Primera Planta
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {plants.map((plant) => (
                <Card
                  key={plant.id}
                  className="overflow-hidden p-0 flex flex-col justify-between hover:shadow-neo transition-shadow group cursor-pointer"
                  onClick={() => setSelectedPlant(plant)}
                >
                  {/* Image Header */}
                  <div className="relative aspect-4/3 bg-zinc-900 border-b-2 border-black overflow-hidden">
                    <img
                      src={plant.image_url || plant.image}
                      alt={plant.common_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-black/80 text-white backdrop-blur-xs">
                        {plant.category}
                      </span>
                    </div>

                    {plant.toxicity_pets && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-md shadow-sm" title="Tóxica para mascotas">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-zinc-500">{plant.family}</span>
                      <h3 className="font-black text-base text-zinc-900 line-clamp-1">{plant.common_name}</h3>
                      <p className="text-xs font-bold italic text-zinc-600 line-clamp-1">{plant.scientific_name}</p>
                    </div>

                    {/* Quick care pill */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-700 bg-[#FDFBF7] p-2 rounded-lg border border-black/20">
                      <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{plant.watering_frequency || 'Riego moderado'}</span>
                    </div>

                    {plant.location_found && (
                      <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="truncate">{plant.location_found}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-black/10">
                      <span className="text-[10px] font-bold text-zinc-400">
                        {new Date(plant.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant={plant.difficulty === 'Fácil' ? 'green' : plant.difficulty === 'Difícil' ? 'red' : 'yellow'}>
                        {plant.difficulty}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PLANT DETAIL MODAL */}
      {selectedPlant && !isEditModalOpen && (
        <Modal
          isOpen={Boolean(selectedPlant)}
          onClose={() => setSelectedPlant(null)}
          title="Ficha Botánica Coleccionada"
        >
          <div className="space-y-6">
            {/* Modal Image & Title */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={selectedPlant.image_url || selectedPlant.image}
                alt={selectedPlant.common_name}
                className="w-full sm:w-40 h-40 object-cover rounded-xl border-2 border-black shadow-neo-sm shrink-0"
              />
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="blue">{selectedPlant.category}</Badge>
                  <Badge variant="purple">{selectedPlant.family}</Badge>
                  <Badge variant={selectedPlant.difficulty === 'Fácil' ? 'green' : selectedPlant.difficulty === 'Difícil' ? 'red' : 'yellow'}>
                    Cuidado: {selectedPlant.difficulty}
                  </Badge>
                </div>
                <h2 className="text-xl font-black text-black">{selectedPlant.common_name}</h2>
                <p className="text-xs font-bold italic text-zinc-600">{selectedPlant.scientific_name}</p>
                {selectedPlant.origin && (
                  <p className="text-xs font-bold text-zinc-500">Origen: {selectedPlant.origin}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-3 bg-[#FDFBF7] rounded-xl border-2 border-black">
              <h4 className="text-xs font-black uppercase text-zinc-500 mb-1">Descripción</h4>
              <p className="text-xs font-medium text-zinc-800 leading-relaxed">
                {selectedPlant.description || 'Sin descripción disponible.'}
              </p>
            </div>

            {/* Care Details */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-2.5 bg-[#FEF08A]/30 rounded-lg border border-black">
                <span className="text-[10px] font-black uppercase text-amber-900 block">Luz</span>
                <span>{selectedPlant.light_requirement || 'Luz brillante'}</span>
              </div>
              <div className="p-2.5 bg-[#E0F2FE]/30 rounded-lg border border-black">
                <span className="text-[10px] font-black uppercase text-blue-900 block">Riego</span>
                <span>{selectedPlant.watering_frequency || 'Regular'}</span>
              </div>
              <div className="p-2.5 bg-[#FEE2E2]/30 rounded-lg border border-black">
                <span className="text-[10px] font-black uppercase text-rose-900 block">Temperatura</span>
                <span>{selectedPlant.temperature_range || '18-25°C'}</span>
              </div>
              <div className="p-2.5 bg-[#DCFCE7]/30 rounded-lg border border-black">
                <span className="text-[10px] font-black uppercase text-emerald-900 block">Humedad</span>
                <span>{selectedPlant.humidity_requirement || 'Media'}</span>
              </div>
            </div>

            {/* Toxicity */}
            <div className={`p-3 rounded-xl border-2 border-black text-xs font-bold ${selectedPlant.toxicity_pets ? 'bg-[#FEE2E2] text-red-900' : 'bg-[#DCFCE7] text-green-900'}`}>
              <div className="flex items-center gap-1.5 font-black mb-1">
                {selectedPlant.toxicity_pets ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{selectedPlant.toxicity_pets ? 'Tóxica para Mascotas' : 'Segura para Mascotas'}</span>
              </div>
              <p className="text-[11px] font-medium">{selectedPlant.toxicity_details || 'Información de seguridad botánica verificada.'}</p>
            </div>

            {/* Notes & Location */}
            {(selectedPlant.user_notes || selectedPlant.location_found) && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-black/30 space-y-1 text-xs">
                {selectedPlant.location_found && (
                  <p className="font-bold text-zinc-700">
                    📍 Ubicación: <span className="font-normal">{selectedPlant.location_found}</span>
                  </p>
                )}
                {selectedPlant.user_notes && (
                  <p className="font-bold text-zinc-700">
                    📝 Notas: <span className="font-normal">{selectedPlant.user_notes}</span>
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t-2 border-black">
              <Button
                variant="secondary"
                onClick={() => handleOpenEditModal(selectedPlant)}
                className="flex items-center gap-1.5 text-xs font-black"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Notas</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDeletePlant(selectedPlant.id)}
                className="flex items-center gap-1.5 text-xs font-black bg-[#FEE2E2] text-red-700 hover:bg-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT NOTES MODAL */}
      {selectedPlant && isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Notas de Campo"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-zinc-800 block mb-1">Ubicación / Lugar de Hallazgo</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Ej. Invernadero, Huerto Norte, Maceta Sala..."
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-black bg-[#FDFBF7]"
              />
            </div>

            <div>
              <label className="text-xs font-black text-zinc-800 block mb-1">Notas de Campo y Cuidados</label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Anota observaciones sobre su crecimiento, riego, sustrato..."
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border-2 border-black bg-[#FDFBF7]"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateNotes}
                disabled={isUpdating}
                className="bg-[#00C2CB] text-black font-black"
              >
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CollectionPage;
