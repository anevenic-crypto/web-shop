@echo off
cd /d "%~dp0.."
echo === Izvozim lokalnu bazu u scripts\dump.sql ...
docker compose exec -T postgres pg_dump -U postgres --no-owner --no-privileges web-shop > scripts\dump.sql
if errorlevel 1 (echo GRESKA - da li Docker i baza rade? & pause & exit /b 1)
echo Gotovo: scripts\dump.sql
pause
