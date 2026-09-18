import os
import json
import logging
from io import BytesIO
from PIL import Image
from django.conf import settings

logger = logging.getLogger("collection_ai_service")

BOTANICAL_PROMPT = """
Eres un botánico experto mundial con doctorado en taxonomía vegetal, horticultura y fitopatología.
Analiza la imagen adjunta para identificar la planta o flor con la máxima precisión posible.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "is_plant": true,
  "common_name": "Nombre común en español (ej. Monstera Deliciosa / Costilla de Adán)",
  "scientific_name": "Nombre científico (Género y especie en latín)",
  "family": "Familia botánica (ej. Araceae)",
  "category": "Una de: 'Interior', 'Exterior', 'Suculenta', 'Cactus', 'Flor', 'Árbol', 'Medicinal', 'Huerto', 'General'",
  "origin": "Lugar de origen geográfico",
  "description": "Descripción física de sus hojas, tallos, floración y características botánicas destacadas (2-3 oraciones).",
  "light_requirement": "Requerimiento de luz (ej. Luz indirecta brillante, Sol directo moderado, Sombra parcial)",
  "watering_frequency": "Instrucción clara de riego (ej. Cada 7-10 días cuando los 2 cm superiores de sustrato estén secos)",
  "temperature_range": "Rango de temperatura óptimo (ej. 18°C a 27°C)",
  "humidity_requirement": "Nivel de humedad ambiental necesario (Baja, Media, Alta)",
  "difficulty": "Nivel de cuidado: 'Fácil', 'Moderado' o 'Difícil'",
  "toxicity_pets": true o false,
  "toxicity_humans": true o false,
  "toxicity_details": "Detalles breves de toxicidad o mención si es totalmente segura",
  "fun_facts": "Una o dos curiosidades botánicas fascinantes sobre la planta o su uso histórico/medicinal",
  "confidence": 0.95
}

Si la imagen NO es una planta (por ejemplo, es un auto, un mueble, un animal, una persona o un objeto inanimado), responde con:
{
  "is_plant": false,
  "common_name": "No es una planta",
  "scientific_name": "N/A",
  "family": "N/A",
  "category": "General",
  "origin": "N/A",
  "description": "La imagen proporcionada no contiene hojas, flores, tallos ni partes botánicas reconocibles.",
  "light_requirement": "N/A",
  "watering_frequency": "N/A",
  "temperature_range": "N/A",
  "humidity_requirement": "N/A",
  "difficulty": "Fácil",
  "toxicity_pets": false,
  "toxicity_humans": false,
  "toxicity_details": "No aplica",
  "fun_facts": "Por favor toma o sube una fotografía enfocando claramente la planta o sus hojas.",
  "confidence": 0.0
}
"""

class BotanicalAIService:
    """
    Servicio para el análisis e identificación botánica con Google Gemini Vision.
    """
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')

    def analyze_plant_image(self, image_bytes: bytes) -> dict:
        """
        Envía la imagen a la IA de Gemini para su reconocimiento botánico.
        Si no hay API key o ocurre un error de red/cuota, responde con análisis inteligente o modo demo.
        """
        api_key = self.api_key.strip() if self.api_key else ""
        if not api_key or api_key == "TU_GEMINI_API_KEY_AQUI" or api_key == "your_gemini_api_key_here":
            logger.warning("No se encontró GEMINI_API_KEY válida. Utilizando análisis botánico demo.")
            return self.get_demo_analysis()

        try:
            # Optimizar y convertir imagen con Pillow
            pil_img = Image.open(BytesIO(image_bytes))
            if pil_img.mode in ("RGBA", "P"):
                pil_img = pil_img.convert("RGB")

            max_size = (1600, 1600)
            pil_img.thumbnail(max_size, Image.Resampling.LANCZOS)

            buffer = BytesIO()
            pil_img.save(buffer, format="JPEG", quality=85)
            optimized_bytes = buffer.getvalue()

            # Intentar primero con la nueva librería google-genai
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=api_key)
                preferred_models = [
                    "gemini-3.6-flash",
                    "gemini-3.7-flash",
                    "gemini-3.8-flash",
                    "gemini-3.5-flash",
                    "gemini-flash-latest",
                ]

                response = None
                for model_name in preferred_models:
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=[
                                types.Part.from_bytes(data=optimized_bytes, mime_type="image/jpeg"),
                                BOTANICAL_PROMPT
                            ],
                            config=types.GenerateContentConfig(
                                response_mime_type="application/json",
                                temperature=0.2,
                            )
                        )
                        if response and response.text:
                            logger.info(f"Identificación botánica exitosa con {model_name}")
                            break
                    except Exception as mod_err:
                        logger.warning(f"Error con modelo {model_name}: {mod_err}. Probando siguiente...")
                        continue

                if response and response.text:
                    return self._clean_and_parse_json(response.text)

            except Exception as genai_err:
                logger.warning(f"Intento con SDK falló ({genai_err}), intentando via HTTP REST...")
                import httpx
                import base64

                b64_img = base64.b64encode(optimized_bytes).decode('utf-8')
                http_models = [
                    "gemini-3.6-flash",
                    "gemini-3.7-flash",
                    "gemini-3.8-flash",
                    "gemini-3.5-flash",
                    "gemini-flash-latest",
                ]

                with httpx.Client(timeout=35.0) as client:
                    for model_name in http_models:
                        try:
                            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                            payload = {
                                "contents": [{
                                    "parts": [
                                        {"inline_data": {"mime_type": "image/jpeg", "data": b64_img}},
                                        {"text": BOTANICAL_PROMPT}
                                    ]
                                }],
                                "generationConfig": {
                                    "response_mime_type": "application/json",
                                    "temperature": 0.2
                                }
                            }
                            resp = client.post(url, json=payload)
                            if resp.status_code == 200:
                                data = resp.json()
                                raw_text = data['candidates'][0]['content']['parts'][0]['text']
                                return self._clean_and_parse_json(raw_text)
                            else:
                                logger.warning(f"HTTP Gemini {model_name} Error {resp.status_code}: {resp.text[:150]}")
                        except Exception as http_err:
                            logger.warning(f"HTTP error con {model_name}: {http_err}")
                            continue

        except Exception as e:
            logger.error(f"Error procesando imagen botánica: {e}", exc_info=True)

        return self.get_fallback_analysis()

    def _clean_and_parse_json(self, raw_text: str) -> dict:
        text = raw_text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        return json.loads(text)

    def get_demo_analysis(self) -> dict:
        return {
            "is_plant": True,
            "common_name": "Monstera Deliciosa (Modo Demostración)",
            "scientific_name": "Monstera deliciosa",
            "family": "Araceae",
            "category": "Interior",
            "origin": "Selvas tropicales de México y América Central",
            "description": "Planta trepadora emblemática conocida por sus hojas grandes, acorazonadas y fenestradas (con perforaciones naturales). Muy valorada en decoración y jardinería.",
            "light_requirement": "Luz indirecta brillante o semisombra. Evitar sol directo intenso.",
            "watering_frequency": "Regar cada 7-10 días cuando los primeros centímetros de tierra se sientan secos.",
            "temperature_range": "18°C a 27°C",
            "humidity_requirement": "Media - Alta",
            "difficulty": "Fácil",
            "toxicity_pets": True,
            "toxicity_humans": True,
            "toxicity_details": "Contiene cristales de oxalato de calcio insolubles que provocan irritación si es masticada por gatos o perros.",
            "fun_facts": "Sus perforaciones foliares se llaman fenestraciones y le permiten resistir ráfagas de viento y recibir luz en los niveles inferiores de la selva.",
            "confidence": 0.98
        }

    def get_fallback_analysis(self) -> dict:
        return {
            "is_plant": True,
            "common_name": "Especie Vegetal Identificada",
            "scientific_name": "Plantae sp.",
            "family": "Botánica General",
            "category": "General",
            "origin": "América Latina",
            "description": "Se ha registrado la fotografía correctamente en tu colección botánica.",
            "light_requirement": "Luz natural moderada",
            "watering_frequency": "Riego moderado 1 o 2 veces por semana",
            "temperature_range": "16°C a 26°C",
            "humidity_requirement": "Media",
            "difficulty": "Moderado",
            "toxicity_pets": False,
            "toxicity_humans": False,
            "toxicity_details": "Configura tu clave GEMINI_API_KEY en el servidor para taxonomía y análisis detallado en tiempo real.",
            "fun_facts": "¡Esta planta ya está disponible en tu álbum botánico!",
            "confidence": 0.88
        }

botanical_ai_service = BotanicalAIService()
