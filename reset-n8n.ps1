# Script para resetear completamente n8n
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   RESET COMPLETO DE N8N" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Detener n8n si está ejecutándose
Write-Host "1. Deteniendo procesos de n8n..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar la base de datos de n8n
Write-Host "2. Limpiando base de datos de n8n..." -ForegroundColor Yellow
$n8nPath = "$env:USERPROFILE\.n8n"
if (Test-Path $n8nPath) {
    # Hacer backup primero
    $backupPath = "$n8nPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host "   - Creando backup en: $backupPath" -ForegroundColor Gray
    Copy-Item -Path $n8nPath -Destination $backupPath -Recurse
    
    # Eliminar database.sqlite
    $dbPath = "$n8nPath\database.sqlite"
    if (Test-Path $dbPath) {
        Remove-Item $dbPath -Force
        Write-Host "   - Base de datos eliminada" -ForegroundColor Green
    }
    
    # Eliminar config
    $configPath = "$n8nPath\config"
    if (Test-Path $configPath) {
        Remove-Item $configPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   - Configuración eliminada" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. n8n ha sido reseteado completamente" -ForegroundColor Green
Write-Host ""
Write-Host "OPCIONES PARA INICIAR N8N:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opción A - SIN autenticación (recomendado para empezar):" -ForegroundColor Yellow
Write-Host "   $env:N8N_USER_MANAGEMENT_DISABLED='true'; npx n8n start" -ForegroundColor White
Write-Host ""
Write-Host "Opción B - CON autenticación (configurar nuevo usuario):" -ForegroundColor Yellow
Write-Host "   npx n8n start" -ForegroundColor White
Write-Host "   (Te pedirá crear un nuevo usuario en el primer acceso)" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Preguntar al usuario qué hacer
$response = Read-Host "¿Deseas iniciar n8n ahora? (S)in auth / (C)on auth / (N)o [S/C/N]"

switch ($response.ToUpper()) {
    "S" {
        Write-Host "Iniciando n8n SIN autenticación..." -ForegroundColor Green
        $env:N8N_USER_MANAGEMENT_DISABLED = "true"
        $env:N8N_BASIC_AUTH_ACTIVE = "false"
        npx n8n start
    }
    "C" {
        Write-Host "Iniciando n8n CON autenticación..." -ForegroundColor Green
        Write-Host "Configura tu usuario en el navegador al abrir http://localhost:5678" -ForegroundColor Yellow
        npx n8n start
    }
    default {
        Write-Host "Puedes iniciar n8n más tarde con los comandos mostrados arriba." -ForegroundColor Gray
    }
}