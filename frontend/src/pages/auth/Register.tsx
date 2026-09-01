import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, User, Phone, Home, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    farm_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        setError(`${firstKey}: ${Array.isArray(val) ? val[0] : val}`);
      } else {
        setError('Error al registrar usuario. Verifica los campos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#00C2CB] rounded-2xl border-3 border-black shadow-neo">
            <Sprout className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-black">
            CREAR CUENTA
          </h2>
          <p className="text-sm font-bold text-zinc-600">
            Regístrate en Beraun PlantAI y protege tus cultivos
          </p>
        </div>

        {/* Register Card */}
        <Card shadowColor="teal" borderWidth="3" className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-[#FEE2E2] border-2 border-black rounded-xl text-xs font-black text-[#B91C1C] shadow-neo-sm">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-black mb-1">
                  NOMBRES *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">
                  APELLIDOS
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                CORREO ELECTRÓNICO *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="agricultor@ejemplo.pe"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-black mb-1">
                  NOMBRE DE FINCA / HUERTO
                </label>
                <div className="relative">
                  <Home className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="farm_name"
                    value={formData.farm_name}
                    onChange={handleChange}
                    placeholder="Finca Santa María"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+51 987654321"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-black mb-1">
                  CONTRASEÑA *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">
                  CONFIRMAR CONTRASEÑA *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={loading}
              className="w-full mt-2"
            >
              <span>Crear Mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-zinc-200 text-center">
            <p className="text-xs font-bold text-zinc-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-black text-black underline hover:text-[#00a7af]">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
