import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Plus,
  Sparkles,
  History,
  Trash2,
  X,
  Bot,
  MessageSquare,
  Sprout,
  Clock,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { ChatSession, ChatMessage } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';

export const AssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSessionId = searchParams.get('session');

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
      setIsHistoryOpen(false);
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
      setIsHistoryOpen(false);
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Deseas eliminar esta consulta del historial?')) return;
    try {
      await apiClient.delete(`/chat/sessions/${sessionId}/`);
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      if (currentSession?.id === sessionId) {
        if (updated.length > 0) {
          loadSession(updated[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('No se pudo eliminar la consulta.');
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
      console.error('Error sending message:', err);
      alert('Error al obtener respuesta del asistente. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { title: "Ajuste de Riego", text: "💧 ¿Cómo ajustar el riego si mi cultivo tiene síntomas de hongo foliar?" },
    { title: "Plan de Tratamiento", text: "💊 Recomiéndame un plan de fungicida orgánico y químico con dosis por litro" },
    { title: "Nutrición y Floración", text: "🧪 ¿Qué fertilizante aplicar para estimular la floración y cuajado de frutos?" },
    { title: "Control de Plagas", text: "🦟 ¿Cómo controlar la plaga de mosca blanca y pulgones sin dañar polinizadores?" }
  ];

  return (
    <div className="relative w-full h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* Sleek Main Chat Card - Takes full height and width */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border-3 border-black shadow-neo-xl overflow-hidden min-h-0">
        
        {/* Compact Integrated Chat Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#FDFBF7] border-b-3 border-black flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#00C2CB] border-2 border-black flex items-center justify-center text-lg font-black shadow-neo-sm">
                🌱
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-sm sm:text-base text-black truncate">
                  {currentSession?.title || 'Asistente Agronómico Beraun AI'}
                </h2>
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-md shrink-0">
                  Qwen 3.8
                </span>
              </div>
              <p className="text-[11px] font-bold text-zinc-500 truncate">
                {currentSession?.crop_name 
                  ? `Cultivo vinculado: ${currentSession.crop_name}`
                  : 'Ingeniero Agrónomo y Fitopatólogo Virtual'}
              </p>
            </div>
          </div>

          {/* Action Buttons: History Drawer Toggle + New Chat */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="gap-1.5 text-xs font-black shadow-neo-sm"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Historial</span>
              {sessions.length > 0 && (
                <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 text-[10px] font-black rounded-full border border-black">
                  {sessions.length}
                </span>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateNewSession}
              className="gap-1.5 text-xs font-black shadow-neo-sm bg-[#FFD200] hover:bg-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Consulta</span>
            </Button>
          </div>
        </div>

        {/* Message Viewport - Centered Clean Reading Width */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6 bg-[#FDFBF7]">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-[#FFD200] border-3 border-black flex items-center justify-center text-4xl shadow-neo">
                  🌾
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                    Consultorio Agronómico Inteligente
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-zinc-600 mt-1 max-w-md mx-auto">
                    Diagnósticos fitosanitarios, prevención de plagas, nutrición vegetal y calendarios de riego adaptados.
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.text)}
                      className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-neo-sm hover:shadow-neo hover:bg-amber-50/60 hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group"
                    >
                      <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider mb-1">
                        {q.title}
                      </span>
                      <p className="text-xs font-bold text-zinc-800 leading-snug">
                        {q.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-[#00C2CB] border-2 border-black flex items-center justify-center text-base font-black shrink-0 shadow-neo-sm mt-1">
                      🌱
                    </div>
                  )}

                  <div
                    className={`max-w-2xl sm:max-w-3xl p-4 sm:p-5 rounded-2xl border-2 border-black leading-relaxed shadow-neo-sm text-xs sm:text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#FFD200] text-black font-bold whitespace-pre-wrap'
                        : 'bg-white text-zinc-900'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-[#22C55E] border-2 border-black flex items-center justify-center text-base font-black shrink-0 shadow-neo-sm mt-1">
                      👨‍🌾
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-[#00C2CB] border-2 border-black flex items-center justify-center text-base font-black shrink-0 animate-bounce shadow-neo-sm">
                  🌱
                </div>
                <div className="p-4 rounded-2xl border-2 border-black bg-white shadow-neo-sm text-xs font-black text-zinc-700 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#00C2CB] animate-spin" />
                  <span>El Ingeniero Agrónomo IA está redactando la recomendación fitosanitaria...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating / Fixed Clean Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t-3 border-black shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu consulta agronómica (ej: dosis de fertilizante para café o control de roya)..."
              className="flex-1 px-4 py-3 sm:py-3.5 bg-[#FDFBF7] border-2 border-black rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:bg-white shadow-neo-sm transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isLoading}
              className="shrink-0 px-4 sm:px-6 rounded-2xl shadow-neo-sm bg-[#00C2CB] hover:bg-cyan-400 font-black text-black"
            >
              <Send className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Slide-over Consultation History Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsHistoryOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-full max-w-md bg-white h-full border-l-3 border-black shadow-neo-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#FFD200] border-b-3 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-black" />
                <h3 className="font-black text-base text-black">Historial de Consultas</h3>
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-full">
                  {sessions.length}
                </span>
              </div>
              
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/10 border-2 border-black text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New Session Button inside Drawer */}
            <div className="p-3 border-b-2 border-black bg-[#FDFBF7]">
              <Button
                variant="accent"
                size="sm"
                onClick={handleCreateNewSession}
                className="w-full justify-center gap-2 font-black shadow-neo-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Iniciar Nueva Consulta</span>
              </Button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#F5F0EA]">
              {loadingSessions ? (
                <div className="text-center py-8 text-xs font-bold text-zinc-500">
                  Cargando historial...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-zinc-500 space-y-2">
                  <p>No tienes consultas previas.</p>
                  <p className="text-[11px] text-zinc-400">Tus conversaciones con el bot se guardarán aquí.</p>
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => loadSession(sess.id)}
                    className={`group w-full p-3.5 rounded-2xl border-2 border-black transition-all cursor-pointer flex items-center justify-between gap-3 shadow-neo-sm hover:translate-x-0.5 ${
                      currentSession?.id === sess.id
                        ? 'bg-[#FFD200] text-black font-black'
                        : 'bg-white text-zinc-800 hover:bg-amber-50/50 font-bold'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-xs truncate">{sess.title}</p>
                        {sess.diagnosis_disease && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 shrink-0">
                            {sess.diagnosis_disease.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{new Date(sess.updated_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(sess.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      title="Eliminar consulta"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-200 text-zinc-600 hover:text-red-700 transition-all border border-transparent hover:border-black shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
