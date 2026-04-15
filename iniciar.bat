@echo off
echo ========================================
echo   INICIANDO CINEWORLD
echo ========================================
echo.

echo [1/2] Iniciando backend na porta 3001...
start "CineWorld Backend" cmd /k "cd /d %~dp0back-end && node script.js"

timeout /t 2 /nobreak >nul

echo [2/2] Iniciando frontend na porta 3000...
start "CineWorld Frontend" cmd /k "cd /d %~dp0front-end && npx serve -p 3000"

echo.
echo ========================================
echo   ACESSE: http://localhost:3000
echo ========================================
echo.
pause
