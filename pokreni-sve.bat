@echo off
title Vellure - pokretanje svega
echo ============================================
echo   VELLURE - pokrecem Docker, bota i shop
echo ============================================
echo.
echo === 1/3 Docker Desktop...
tasklist /FI "IMAGENAME eq Docker Desktop.exe" 2>nul | find /I "Docker Desktop.exe" >nul
if errorlevel 1 start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
:cekaj
docker info >nul 2>&1
if errorlevel 1 (
  echo     cekam da se Docker podigne...
  timeout /t 5 /nobreak >nul
  goto cekaj
)
echo     Docker radi.
echo.
echo === 2/3 Bot (port 8000)...
start "Vellure BOT" cmd /k "cd /d C:\Users\Repute\Downloads\ai-chat && call start.bat"
echo.
echo === 3/3 Shop (port 3001)...
start "Vellure SHOP" cmd /k "cd /d C:\Users\Repute\Desktop\projekti\web-shop && call start-shop.bat"
echo.
echo Sacekaj ~30 sekundi da se shop podigne, pa otvaram sajt...
timeout /t 30 /nobreak >nul
start http://localhost:3001
echo.
echo Gotovo! Prozore "Vellure BOT" i "Vellure SHOP" ostavi otvorene dok radis.
timeout /t 5 >nul
exit
