import os
import httpx
from django.conf import settings
from .prompts import SYSTEM_PROMPT_AGRONOMIST

class DeepSeekChatService:
    """
    Servicio multi-proveedor de integración con IA (Groq, DeepSeek, Ollama, OpenRouter) 
    para el Chatbot Asesor Botánico (RF-10, RF-11, RF-12).
    """
    @property
    def api_key(self) -> str:
        return (
            getattr(settings, 'GROQ_API_KEY', '') or os.getenv('GROQ_API_KEY', '') or
            getattr(settings, 'LLM_API_KEY', '') or os.getenv('LLM_API_KEY', '') or
            getattr(settings, 'DEEPSEEK_API_KEY', '') or os.getenv('DEEPSEEK_API_KEY', '')
        )

    @property
    def api_url(self) -> str:
        url = (
            getattr(settings, 'LLM_API_URL', '') or os.getenv('LLM_API_URL', '') or
            ('https://api.groq.com/openai/v1' if self.api_key.startswith('gsk_') or os.getenv('LLM_PROVIDER') == 'groq' else 'https://api.deepseek.com')
        )
        return url.rstrip('/')

    @property
    def model(self) -> str:
        return (
            getattr(settings, 'LLM_MODEL', '') or os.getenv('LLM_MODEL', '') or
            ("qwen/qwen3.8-27b" if "groq.com" in self.api_url or self.api_key.startswith("gsk_") else "deepseek-chat")
        )

    def generate_response(self, conversation_history: list[dict], extra_system_context: str = "") -> str:
        """
        Envía el historial de la conversación al modelo de IA seleccionado (Groq / DeepSeek / Ollama).
        """
        system_content = SYSTEM_PROMPT_AGRONOMIST
        if extra_system_context:
            system_content += f"\n\nContexto adicional del diagnóstico/cultivo:\n{extra_system_context}"

        messages = [{"role": "system", "content": system_content}]

        for msg in conversation_history:
            role = msg.get("role", "user")
            if role in ["user", "assistant"]:
                messages.append({
                    "role": role,
                    "content": msg.get("content", "")
                })

        if not self.api_key and "localhost" not in self.api_url and "127.0.0.1" not in self.api_url:
            return self._generate_offline_response(conversation_history[-1]["content"] if conversation_history else "")

        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        endpoint = f"{self.api_url}/chat/completions" if not self.api_url.endswith("/chat/completions") else self.api_url

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.6,
            "max_tokens": 1500,
            "stream": False
        }

        try:
            with httpx.Client(timeout=35.0) as client:
                response = client.post(
                    endpoint,
                    json=payload,
                    headers=headers
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    print(f"Error API Status {response.status_code} ({self.api_url}): {response.text}")
                    return self._generate_offline_response(conversation_history[-1]["content"] if conversation_history else "")
        except Exception as e:
            print(f"Excepción conectando a API de IA ({self.api_url}): {e}")
            return self._generate_offline_response(conversation_history[-1]["content"] if conversation_history else "")

    def _generate_offline_response(self, last_query: str) -> str:
        """
        Respuesta agronómica experta de contingencia en caso de falta de conexión externa.
        """
        query_lower = last_query.lower()
        if "riego" in query_lower or "agua" in query_lower:
            return (
                "🌱 **Recomendación de Riego (Beraun AI)**:\n\n"
                "Para la mayoría de los cultivos hortícolas y frutales, es crucial regar temprano en la mañana (6:00 - 8:00 AM) "
                "o al atardecer para evitar la evaporación rápida. Si detectas hongos o moho, reduce el riego superficial "
                "y utiliza riego por goteo evitando mojar las hojas. Asegúrate de que el suelo mantenga buena capacidad de campo sin saturación."
            )
        elif "fertiliz" in query_lower or "abono" in query_lower or "nutri" in query_lower:
            return (
                "🧪 **Guía Nutricional Agronómica**:\n\n"
                "Para la etapa vegetativa aplica mayor proporción de Nitrógeno (N) y Fósforo (P) para el desarrollo radicular. "
                "Al inicio de la floración y cuajado de frutos, incrementa el Potasio (K) y Calcio (Ca) con Boro para evitar "
                "la caída de flores y pudrición apical. Puedes alternar con biofertilizantes como biol o humus líquido."
            )
        else:
            return (
                "🌿 **Asesor Botánico Beraun PlantAI**:\n\n"
                "He recibido tu consulta. Para brindarte el mejor plan fitosanitario:\n"
                "1. Asegúrate de revisar el envés de las hojas y tallos basales en busca de pústulas, manchas o insectos vectores.\n"
                "2. Si tienes dudas, puedes tomar una foto con nuestro módulo de **Diagnóstico Fitosanitario** para un análisis por Deep Learning.\n"
                "3. Mantén una poda sanitaria retirando cualquier tejido necrótico para evitar la dispersión de esporas."
            )

deepseek_service = DeepSeekChatService()
