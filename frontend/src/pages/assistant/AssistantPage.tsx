import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Plus,
  Sparkles,
  Droplets,
  Calendar,
  ShieldCheck,
  Sprout,
  HelpCircle
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { ChatSession, ChatMessage } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSessionId = searchParams.get('session');

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (initialSessionId) {
      loadSession(Number(initialSessionId));
    }
  }, [initialSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await apiClient.get('/chat/sessions/');
      const list = res.data.results || res.data;
      setSessions(list);

      if (!initialSessionId && list.length > 0 && !currentSession) {
        loadSession(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching chat sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSession = async (sessionId: number) => {
    try {
      const res = await apiClient.get(`/chat/sessions/${sessionId}/`);
      setCurrentSession(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error loading session:', err);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      const res = await apiClient.post('/chat/sessions/', {
        title: 'Nueva Consulta Agronómica'
      });
      const newSession = res.data;
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    let session = currentSession;
    if (!session) {
      try {
        const res = await apiClient.post('/chat/sessions/', {
          title: text.slice(0, 30) + '...'
        });
        session = res.data;
        setCurrentSession(session);
        setSessions([session, ...sessions]);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    // Optimistic user message update
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      session: session.id,
      role: 'user',
      content: text,
      sent_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await apiClient.post(`/chat/sessions/${session.id}/messages/`, {
        content: text
      });
      const { assistant_message } = res.data;
      setMessages((prev) => [...prev.slice(0, -1), res.data.user_message, assistant_message]);
      fetchSessions();
    } catch (err) {
      console.error('Error sending message to DeepSeek:', err);
      alert('Error al obtener respuesta del asistente. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "💧 ¿Cómo ajustar el riego si mi cultivo tiene síntomas de hongo foliar?",
    "💊 Recomiéndame un plan de fungicida orgánico y químico con dosis",
    "🧪 ¿Qué fertilizante aplicar para estimular la floración y cuajado?",
    "🦟 ¿Cómo controlar la plaga de mosca blanca y pulgones sin dañar polinizadores?"
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#FFD200] p-4 sm:p-6 rounded-3xl border-3 border-black shadow-neo-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-black text-white text-xs font-black rounded-lg">
            <span>🤖 ASISTENTE BOTÁNICO</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-black tracking-tight">
            Consultorio Agronómico con Inteligencia Artificial
          </h2>
          <p className="text-xs font-bold text-zinc-900">
            Potenciado por DeepSeek AI — Asesoramiento técnico, planes de acción fitosanitarios y ajustes de calendario de riego.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleCreateNewSession}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Consulta</span>
        </Button>
      </div>

      {/* Main Chat Layout: Sidebar Sessions + Chat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] h-[calc(100vh-250px)]">
        {/* Sessions Sidebar (4 cols) */}
        <Card shadowColor="black" borderWidth="2" className="lg:col-span-4 p-4 flex flex-col h-full overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              Historial de Consultas
            </span>
            <Button
              size="sm"
              variant="accent"
              onClick={handleCreateNewSession}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-3">
            {loadingSessions ? (
              <div className="text-center py-6 text-xs font-bold text-zinc-500">
                Cargando sesiones...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-6 text-xs font-bold text-zinc-500">
                No hay consultas previas. Haz una pregunta.
              </div>
            ) : (
              sessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => loadSession(sess.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 border-black transition-all ${
                    currentSession?.id === sess.id
                      ? 'bg-[#FFD200] text-black shadow-neo-sm font-black'
                      : 'bg-[#FDFBF7] text-zinc-800 hover:bg-zinc-100 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <p className="text-xs truncate">{sess.title}</p>
                    {sess.diagnosis_disease && (
                      <span className="text-[9px] font-black px-1 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                        {sess.diagnosis_disease.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {new Date(sess.updated_at).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Feed Area (8 cols) */}
        <Card shadowColor="teal" borderWidth="3" className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          {/* Active Chat Header */}
          <div className="p-4 bg-[#F5F0EA] border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C2CB] border-2 border-black flex items-center justify-center font-black text-black shadow-neo-sm">
                🌱
              </div>
              <div>
                <h3 className="font-black text-sm text-black">
                  {currentSession?.title || 'Asistente Agronómico Beraun AI'}
                </h3>
                {currentSession?.crop_name && (
                  <p className="text-[11px] font-bold text-zinc-600">
                    Cultivo vinculado: {currentSession.crop_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FDFBF7]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 p-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FFD200] border-2 border-black flex items-center justify-center text-3xl shadow-neo-sm">
                  🌾
                </div>
                <div>
                  <h4 className="font-black text-base text-black">¿En qué puedo orientarte hoy?</h4>
                  <p className="text-xs font-bold text-zinc-600 mt-1">
                    Pregunta sobre control de plagas, planes de fertilización o ajustes de riego para tus plantas.
                  </p>
                </div>

                <div className="w-full space-y-2 text-left">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                    Consultas Frecuentes:
                  </span>
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border-2 border-black shadow-neo-sm hover:bg-amber-50 hover:translate-x-0.5 transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-[#00C2CB] border-2 border-black flex items-center justify-center text-sm font-black shrink-0 mt-1">
                      🌱
                    </div>
                  )}

                  <div
                    className={`max-w-2xl p-4 rounded-2xl border-2 border-black text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed shadow-neo-sm ${
                      msg.role === 'user'
                        ? 'bg-[#FFD200] text-black font-bold'
                        : 'bg-white text-zinc-900'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-[#22C55E] border-2 border-black flex items-center justify-center text-sm font-black shrink-0 mt-1">
                      👨‍🌾
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#00C2CB] border-2 border-black flex items-center justify-center text-sm font-black shrink-0 animate-bounce">
                  🌱
                </div>
                <div className="p-3.5 rounded-2xl border-2 border-black bg-white shadow-neo-sm text-xs font-black text-zinc-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00C2CB] animate-spin" />
                  <span>El Ingeniero Agrónomo IA está redactando la respuesta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t-2 border-black">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu consulta agronómica (ej: dosis de abono para tomates en floración)..."
                className="flex-1 px-4 py-3 bg-[#FDFBF7] border-2 border-black rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim() || isLoading}
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
