@echo off
cd /d "%~dp0"
echo === Zaustavljam Docker verziju shopa (ako radi)...
docker compose stop web >nul 2>&1
echo === Oslobadjam port 3001...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>&1
echo === Proveravam da baza radi...
docker compose up -d postgres minio
echo.
echo === Pokrecem shop na http://localhost:3001 (Ctrl+C za gasenje)
echo.
npm run dev
pause
