# Beraun PlantAI — Script de despliegue local automatizado con Docker Compose

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  🌱 BERAUN PLANTAI — DOCKER DEPLOYMENT  " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker no está instalado o no se encuentra en el PATH."
    exit 1
}

# 2. Copiar .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "[1/4] Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[1/4] Archivo .env detectado." -ForegroundColor Cyan
}

# 3. Construir e iniciar contenedores con Docker Compose
Write-Host "[2/4] Construyendo e iniciando contenedores con Docker Compose..." -ForegroundColor Yellow
docker compose up -d --build

# 4. Esperar a que la base de datos y backend estén listos
Write-Host "[3/4] Esperando inicialización de servicios..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Ejecutar migraciones en el backend
Write-Host "[4/4] Verificando migraciones de base de datos..." -ForegroundColor Yellow
docker compose exec -T backend python manage.py migrate

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  ✓ DESPLIEGUE COMPLETADO CON ÉXITO!     " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🌐 Aplicación Web:       http://localhost" -ForegroundColor Cyan
Write-Host "🔌 API REST Backend:     http://localhost:8000/api/" -ForegroundColor Cyan
Write-Host "📑 Swagger Docs (API):   http://localhost:8000/api/docs/" -ForegroundColor Cyan
Write-Host "⚙️ Django Admin:         http://localhost:8000/admin/" -ForegroundColor Cyan
