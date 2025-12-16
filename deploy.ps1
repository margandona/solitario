# Script de Deploy para Firebase Hosting
# Nombre del sitio: solitario-wely

Write-Host "🎴 Desplegando Solitario para la Abuelita a Firebase..." -ForegroundColor Green
Write-Host ""

# Verificar que Firebase CLI esté instalado
Write-Host "📦 Verificando Firebase CLI..." -ForegroundColor Yellow
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCmd) {
    Write-Host "❌ Error: Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host "Instala con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Firebase CLI encontrado" -ForegroundColor Green
Write-Host ""

# Compilar frontend
Write-Host "🔨 Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar frontend" -ForegroundColor Red
    Write-Host $buildResult
    Set-Location ..
    exit 1
}
Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Desplegar a Firebase
Write-Host "🚀 Desplegando a Firebase Hosting (solitario-wely)..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Deploy exitoso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Tu juego está disponible en:" -ForegroundColor Cyan
    Write-Host "   https://solitario-wely.web.app" -ForegroundColor White
    Write-Host "   https://solitario-wely.firebaseapp.com" -ForegroundColor White
    Write-Host ""
    Write-Host "💝 La abuelita puede jugar ahora! 🎴" -ForegroundColor Magenta
} else {
    Write-Host ""
    Write-Host "❌ Error en el deploy" -ForegroundColor Red
    Write-Host "Verifica que hayas ejecutado 'firebase login' y configurado el proyecto" -ForegroundColor Yellow
    exit 1
}
