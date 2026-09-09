# 🌱 Beraun PlantAI — Sistema Integral Fitosanitario y Manejo Agronómico

Plataforma integral de gestión agrícola con diagnóstico fitosanitario basado en **Deep Learning (PyTorch)**, consultorio agronómico con **Inteligencia Artificial (DeepSeek API)**, bitácora de evolución, alertas automáticas con **Celery** y reportes exportables en **PDF**.

---

## 🚀 Arquitectura y Tecnologías

- **Backend**: Python 3.11, Django 5.0, Django REST Framework, SimpleJWT (Autenticación sin estado)
- **Deep Learning**: PyTorch 2.2, torchvision (Clasificación de 38 clases con dataset PlantVillage)
- **Asistente IA**: Integración multi-proveedor con **Groq API** (`qwen/qwen3.8-27b`), **DeepSeek** y **Ollama** para formulación de tratamientos, planes de acción fitosanitarios y respuestas agronómicas en Markdown
- **Base de Datos**: PostgreSQL 15 (Persistencia relacional en Docker)
- **Asincronía & Tareas**: Redis 7 + Celery Worker + Celery Beat (Recordatorios y alertas automáticas)
- **Reportes**: ReportLab (Generador de PDF para historiales de salud)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons (Sistema de Diseño Neo-Brutalista con soporte para Markdown y renderizado enriquecido)
- **Servidor Web & Proxy**: Nginx con soporte SSL / HTTPS (Let's Encrypt)
- **Contenedores**: Docker & Docker Compose multi-contenedor (6 microservicios)

---

## 📦 Módulos y Requerimientos Funcionales

| Módulo | Requerimiento | Descripción |
|---|---|---|
| **Módulo 1: Usuarios y Perfiles** | **RF-01** | Registro e inicio de sesión seguro con JWT (email/contraseña). |
| | **RF-02** | Gestión de perfil de agricultor, finca y preferencias de notificación. |
| **Módulo 2: Cultivos y Parcelas** | **RF-03** | Registro jerárquico de parcelas y cultivos (especie, variedad, siembra, requerimientos). |
| | **RF-04** | Historial de eventos de cuidado (riego, fertilización, podas, fumigaciones con dosis). |
| | **RF-05** | Bitácora de estado general y seguimiento fotográfico de evolución. |
| **Módulo 3: Diagnóstico Fitosanitario (DL)** | **RF-06** | Captura con cámara en tiempo real o carga de fotos desde la galería. |
| | **RF-07** | Detección automática de enfermedades foliares con nombre común y científico. |
| | **RF-08** | Visualización del porcentaje de certeza / confianza (0-100%). |
| | **RF-09** | Almacenamiento histórico de fotos y diagnósticos vinculados al cultivo. |
| **Módulo 4: Asistente Botánico (IA)** | **RF-10** | Chatbot interactivo experto en agronomía para resolver dudas técnicas. |
| | **RF-11** | Generación automática de plan de acción (fungicida/abono, dosis orgánicas y sintéticas). |
| | **RF-12** | Sugerencia automática de modificaciones en el calendario de riego y exposición solar. |
| **Módulo 5: Reportes y Alertas** | **RF-13** | Exportación del historial de salud del cultivo en formato imprimible PDF. |
| | **RF-14** | Sistema de alertas programadas y notificaciones in-app con Celery Beat. |

---

## 🛠️ Instrucciones de Despliegue Local con Docker

### 1. Iniciar los contenedores con Docker Compose
```bash
# Construir e iniciar todos los 6 servicios en segundo plano
docker compose up -d --build
```
*O ejecuta directamente en PowerShell:*
```powershell
.\deploy.ps1
```

### 2. Verificar estado de los contenedores
```bash
docker compose ps
```

### 3. Cargar datos de prueba (Demo Seed Data)
```bash
docker compose exec backend python manage.py seed_demo_data
```

### 4. Acceder a las aplicaciones
- 🌐 **Frontend (Web App)**: [http://localhost](http://localhost) (o [http://localhost:5173](http://localhost:5173) en modo desarrollo)
- 🔌 **API REST Swagger Docs**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- ⚙️ **Panel de Administración Django**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 🧪 Ejecución de Pruebas Unitarias (Tests)
```bash
docker compose exec backend python manage.py test
```
