import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Sprout, Calendar, Droplets, Sun, ChevronRight, Layers } from 'lucide-react';
import { useCropStore } from '../../store/cropStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const PlotsList: React.FC = () => {
  const { plots, crops, createPlot, createCrop } = useCropStore();

  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Plot form state
  const [plotForm, setPlotForm] = useState({
    name: '',
    location: '',
    area_hectares: 1.0,
    soil_type: 'Franco Arenoso',
    notes: '',
  });

  // Crop form state
  const [cropForm, setCropForm] = useState({
    plot: '',
    name: '',
    species: 'Tomate',
    variety: '',
    planting_date: new Date().toISOString().split('T')[0],
    water_requirement: 'Cada 2 días',
    sunlight_requirement: 'Pleno Sol (6-8h)',
    notes: '',
  });
  const [cropImage, setCropImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPlot(plotForm);
      setIsPlotModalOpen(false);
      setPlotForm({
        name: '',
        location: '',
        area_hectares: 1.0,
        soil_type: 'Franco Arenoso',
        notes: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropForm.plot) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('plot', cropForm.plot);
      formData.append('name', cropForm.name);
      formData.append('species', cropForm.species);
      formData.append('variety', cropForm.variety);
      formData.append('planting_date', cropForm.planting_date);
      formData.append('water_requirement', cropForm.water_requirement);
      formData.append('sunlight_requirement', cropForm.sunlight_requirement);
      formData.append('notes', cropForm.notes);
      if (cropImage) {
        formData.append('image', cropImage);
      }

      await createCrop(formData);
      setIsCropModalOpen(false);
      setCropImage(null);
      setCropForm({
        plot: '',
        name: '',
        species: 'Tomate',
        variety: '',
        planting_date: new Date().toISOString().split('T')[0],
        water_requirement: 'Cada 2 días',
        sunlight_requirement: 'Pleno Sol (6-8h)',
        notes: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const commonSpecies = ['Tomate', 'Papa', 'Café', 'Maíz', 'Pimiento', 'Vid / Uva', 'Manzano', 'Cacao', 'Fresa', 'Cebolla'];

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black flex items-center gap-2">
            <span>🗺️</span> Parcelas y Cultivos
          </h2>
          <p className="text-xs sm:text-sm font-bold text-zinc-600">
            Administra tus sectores de siembra y el registro de plantas registradas
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsPlotModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Parcela</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (plots.length > 0) {
                setCropForm(prev => ({ ...prev, plot: plots[0].id.toString() }));
              }
              setIsCropModalOpen(true);
            }}
            disabled={plots.length === 0}
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Cultivo</span>
          </Button>
        </div>
      </div>

      {/* No Plots Banner */}
      {plots.length === 0 && (
        <Card shadowColor="yellow" className="p-8 text-center space-y-4">
          <div className="inline-flex p-4 bg-[#FEF08A] rounded-2xl border-2 border-black">
            <Layers className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-xl font-black text-black">Aún no has creado ninguna parcela</h3>
          <p className="text-sm font-bold text-zinc-600 max-w-md mx-auto">
            Una parcela representa un lote, huerto o invernadero. Crea tu primera parcela para poder asociar cultivos.
          </p>
          <Button
            variant="yellow"
            size="lg"
            onClick={() => setIsPlotModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Crear Primera Parcela</span>
          </Button>
        </Card>
      )}

      {/* Plots and nested Crops List */}
      <div className="space-y-6">
        {plots.map((plot) => {
          const plotCrops = crops.filter(c => c.plot === plot.id);

          return (
            <Card key={plot.id} shadowColor="black" borderWidth="3" className="overflow-hidden">
              {/* Plot Header Banner */}
              <div className="p-5 sm:p-6 bg-[#F5F0EA] border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#FFD200] rounded-lg border-2 border-black">
                      <MapPin className="w-4 h-4 text-black" />
                    </span>
                    <h3 className="text-xl font-black text-black">{plot.name}</h3>
                    <Badge variant="blue">{plot.area_hectares} ha</Badge>
                  </div>
                  <p className="text-xs font-bold text-zinc-600">
                    📍 {plot.location || 'Ubicación sin especificar'} · Suelo: {plot.soil_type || 'Estándar'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => {
                      setCropForm(prev => ({ ...prev, plot: plot.id.toString() }));
                      setIsCropModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Cultivo</span>
                  </Button>
                </div>
              </div>

              {/* Crops Inside Plot */}
              <div className="p-5 sm:p-6">
                {plotCrops.length === 0 ? (
                  <div className="text-center py-6 text-xs font-bold text-zinc-500 bg-[#FDFBF7] rounded-xl border-2 border-dashed border-zinc-300">
                    No hay cultivos registrados en esta parcela. Haz clic en "Añadir Cultivo".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plotCrops.map((crop) => (
                      <Link
                        key={crop.id}
                        to={`/crops/${crop.id}`}
                        className="group bg-white p-4 rounded-xl border-2 border-black shadow-neo-sm hover:shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-zinc-500">
                              {crop.species}
                            </span>
                            <h4 className="font-black text-base text-black group-hover:text-green-700 transition-colors">
                              {crop.name}
                            </h4>
                            {crop.variety && (
                              <p className="text-xs font-bold text-zinc-600">
                                Var: {crop.variety}
                              </p>
                            )}
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
                        </div>

                        <div className="space-y-1.5 text-xs font-bold text-zinc-600 pt-2 border-t-2 border-zinc-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Siembra: {new Date(crop.planting_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            <span>Riego: {crop.water_requirement}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-black text-black">
                          <span>Ver Ficha y Cuidados</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Crear Parcela */}
      <Modal
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        title="Crear Nueva Parcela / Sector"
      >
        <form onSubmit={handleCreatePlot} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-black mb-1">
              NOMBRE DE LA PARCELA *
            </label>
            <input
              type="text"
              required
              value={plotForm.name}
              onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })}
              placeholder="Ej: Lote San Antonio A"
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              UBICACIÓN / SECTOR GEOGRÁFICO
            </label>
            <input
              type="text"
              value={plotForm.location}
              onChange={(e) => setPlotForm({ ...plotForm, location: e.target.value })}
              placeholder="Ej: Sector Valle Central Km 12"
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                ÁREA (HECTÁREAS)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={plotForm.area_hectares}
                onChange={(e) => setPlotForm({ ...plotForm, area_hectares: parseFloat(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                TIPO DE SUELO
              </label>
              <select
                value={plotForm.soil_type}
                onChange={(e) => setPlotForm({ ...plotForm, soil_type: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              >
                <option value="Franco Arenoso">Franco Arenoso</option>
                <option value="Franco Arcilloso">Franco Arcilloso</option>
                <option value="Arcilloso">Arcilloso</option>
                <option value="Limoso">Limoso</option>
                <option value="Orgánico / Compost">Orgánico / Compost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              OBSERVACIONES O NOTAS
            </label>
            <textarea
              rows={2}
              value={plotForm.notes}
              onChange={(e) => setPlotForm({ ...plotForm, notes: e.target.value })}
              placeholder="Detalles sobre pendiente, drenaje, acceso..."
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
          >
            Guardar Parcela
          </Button>
        </form>
      </Modal>

      {/* Modal Crear Cultivo */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title="Registrar Nuevo Cultivo"
      >
        <form onSubmit={handleCreateCrop} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-black mb-1">
              PARCELA DESTINO *
            </label>
            <select
              required
              value={cropForm.plot}
              onChange={(e) => setCropForm({ ...cropForm, plot: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            >
              <option value="">Selecciona una parcela...</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location || 'Sin ubicación'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                NOMBRE DEL LOTE / CULTIVO *
              </label>
              <input
                type="text"
                required
                value={cropForm.name}
                onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                placeholder="Ej: Tomate Invernadero A"
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                ESPECIE *
              </label>
              <select
                value={cropForm.species}
                onChange={(e) => setCropForm({ ...cropForm, species: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              >
                {commonSpecies.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                VARIEDAD
              </label>
              <input
                type="text"
                value={cropForm.variety}
                onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                placeholder="Ej: Canchán, Caturra, Río Grande"
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                FECHA DE SIEMBRA *
              </label>
              <input
                type="date"
                required
                value={cropForm.planting_date}
                onChange={(e) => setCropForm({ ...cropForm, planting_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                FRECUENCIA DE RIEGO
              </label>
              <input
                type="text"
                value={cropForm.water_requirement}
                onChange={(e) => setCropForm({ ...cropForm, water_requirement: e.target.value })}
                placeholder="Ej: Cada 2 días"
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                EXPOSICIÓN SOLAR
              </label>
              <input
                type="text"
                value={cropForm.sunlight_requirement}
                onChange={(e) => setCropForm({ ...cropForm, sunlight_requirement: e.target.value })}
                placeholder="Ej: Pleno Sol"
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              FOTO REFERENCIAL (OPCIONAL)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCropImage(e.target.files?.[0] || null)}
              className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-black file:text-xs file:font-black file:bg-[#FFD200] file:text-black hover:file:bg-[#ecc200]"
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
          >
            Registrar Cultivo
          </Button>
        </form>
      </Modal>
    </div>
  );
};
