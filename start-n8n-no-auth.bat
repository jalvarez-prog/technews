@echo off
echo ====================================
echo Iniciando n8n SIN AUTENTICACION
echo ====================================
echo.
echo Esto iniciara n8n en modo abierto (sin login)
echo Presiona Ctrl+C para detenerlo
echo.

REM Deshabilitar autenticacion
set N8N_USER_MANAGEMENT_DISABLED=true
set N8N_BASIC_AUTH_ACTIVE=false

REM Iniciar n8n
npx n8n start

pause