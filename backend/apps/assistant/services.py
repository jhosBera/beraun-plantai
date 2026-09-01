import os
import httpx
from django.conf import settings
from .prompts import SYSTEM_PROMPT_AGRONOMIST

class DeepSeekChatService:
    """
    Servicio de integración con la API de DeepSeek para el Chatbot Asesor (RF-10, RF-11, RF-12).
    """
    def __init__(self):
        self.api_key = getattr(settings, 'DEEPSEEK_API_KEY', '') or os.getenv('DEEPSEEK_API_KEY', '')
        self.api_url = getattr(settings, 'DEEPSEEK_API_URL', 'https://api.deepseek.com')

    def generate_response(self, conversation_history: list[dict], extra_system_context: str = "") -> str:
        """
        Envía el historial de la conversación al modelo deepseek-chat.
        """
        system_content = SYSTEM_PROMPT_AGRONOMIST
        if extra_system_context:
            system_content += f"\n\nContexto adicional del diagnóstico:\n{extra_system_context}"

        messages = [{"role": "system", "content": system_content}]

        for msg in conversation_history:
            role = msg.get("role", "user")
            if role in ["user", "assistant"]:
                messages.append({
                    "role": role,
                    "content": msg.get("content", "")
                })

        if not self.api_key:
            return self._generate_offline_response(conversation_history[-1]["content"] if conversation_history else "")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1200,
            "stream": False
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    f"{self.api_url}/chat/completions",
                    json=payload,
                    headers=headers
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    print(f"Error DeepSeek API status {response.status_code}: {response.text}")
                    return self._generate_offline_response(conversation_history[-1]["content"] if conversation_history else "")
        except Exception as e:
            print(f"Excepción conectando a DeepSeek API: {e}")
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
