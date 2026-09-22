@echo off
cd /d "%~dp0.."
set /p NEON_URL=Nalepi Neon DATABASE_URL (postgresql://...sslmode=require): 
echo === Uvozim scripts\dump.sql u Neon ...
docker compose exec -T postgres psql "%NEON_URL%" < scripts\dump.sql
if errorlevel 1 (echo GRESKA pri uvozu & pause & exit /b 1)
echo Gotovo! Baza je na Neon-u.
pause
