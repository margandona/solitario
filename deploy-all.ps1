# Script completo de deploy
# Construye backend, frontend y despliega todo a Firebase

Write-Host "🎴 DEPLOYMENT COMPLETO - Solitario para la Abuelita" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# 1. BUILD FUNCTIONS
Write-Host "📦 [1/4] Compilando Firebase Functions..." -ForegroundColor Yellow
Set-Location functions
$buildFunctions = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar functions" -ForegroundColor Red
    Write-Host $buildFunctions
    Set-Location ..
    exit 1
}
Write-Host "✅ Functions compiladas" -ForegroundColor Green
Set-Location ..
Write-Host ""

# 2. BUILD FRONTEND
Write-Host "🔨 [2/4] Compilando Frontend..." -ForegroundColor Yellow
Set-Location frontend
$buildFrontend = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar frontend" -ForegroundColor Red
    Write-Host $buildFrontend
    Set-Location ..
    exit 1
}
Write-Host "✅ Frontend compilado" -ForegroundColor Green
Set-Location ..
Write-Host ""

# 3. DEPLOY A FIREBASE
Write-Host "🚀 [3/4] Desplegando a Firebase..." -ForegroundColor Yellow
firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy exitoso!" -ForegroundColor Green
} else {
    Write-Host "❌ Error en el deploy" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. RESUMEN
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ ¡DEPLOYMENT COMPLETADO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend:" -ForegroundColor Yellow
Write-Host "   https://solitario-wely.web.app" -ForegroundColor White
Write-Host "   https://solitario-wely.firebaseapp.com" -ForegroundColor White
Write-Host ""
Write-Host "🔧 API:" -ForegroundColor Yellow
Write-Host "   https://solitario-wely.web.app/api" -ForegroundColor White
Write-Host ""
Write-Host "💝 La abuelita ya puede jugar! 🎴" -ForegroundColor Magenta
Write-Host ""
