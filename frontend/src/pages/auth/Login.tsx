import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Credenciales inválidas. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#22C55E] rounded-2xl border-3 border-black shadow-neo">
            <Sprout className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-black">
            BERAUN PLANTAI
          </h2>
          <p className="text-sm font-bold text-zinc-600">
            Inicia sesión para gestionar tus cultivos y diagnósticos
          </p>
        </div>

        {/* Login Card */}
        <Card shadowColor="yellow" borderWidth="3" className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-[#FEE2E2] border-2 border-black rounded-xl text-xs font-black text-[#B91C1C] shadow-neo-sm">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                CORREO ELECTRÓNICO
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@finca.pe"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:bg-white shadow-neo-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border-2 border-black rounded-xl text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:bg-white shadow-neo-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-zinc-200 text-center">
            <p className="text-xs font-bold text-zinc-600">
              ¿No tienes una cuenta aún?{' '}
              <Link to="/register" className="font-black text-black underline hover:text-[#16a34a]">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
