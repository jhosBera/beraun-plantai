import React, { useState } from 'react';
import { Settings, Server, Check, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl } from '../../api/client';
import { Modal } from './Modal';
import { Button } from './Button';

export const ServerConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiUrl(url);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
      window.location.reload();
    }, 800);
  };

  const handleResetDefault = () => {
    localStorage.removeItem('custom_api_url');
    setUrl(getApiBaseUrl());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración del Servidor API">
      <form onSubmit={handleSave} className="space-y-4">
        <p className="text-xs font-bold text-zinc-600">
          Indica la dirección IP o dominio de tu servidor backend donde corre la IA y la base de datos:
        </p>

        <div>
          <label className="block text-xs font-black text-black mb-1">
            URL DEL BACKEND API (con /api al final)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://192.168.101.2:8000/api"
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-xs font-mono font-bold focus:outline-none focus:bg-white shadow-neo-sm"
            />
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 text-[11px] font-bold text-amber-900 space-y-1">
          <p>💡 <strong>Tip para pruebas:</strong></p>
          <p>• Asegúrate de que el backend esté corriendo en tu PC con: <code className="bg-white px-1 py-0.5 rounded border border-amber-400">python manage.py runserver 0.0.0.0:8000</code></p>
          <p>• Tu teléfono y tu PC deben estar conectados a la misma red Wi-Fi.</p>
        </div>

        {saved && (
          <div className="p-2.5 bg-green-100 text-green-800 rounded-xl text-xs font-black flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>¡URL del servidor guardada! Reiniciando...</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleResetDefault}
            className="flex-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1 bg-[#00C2CB] text-black"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Guardar Conexión</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
