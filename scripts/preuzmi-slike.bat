@echo off
cd /d "%~dp0\.."
echo Preuzimam slike iz lokalnog MinIO-a (Docker mora da radi)...
for /f "tokens=1,* delims==" %%a in ('findstr /b "MINIO_ACCESS_KEY MINIO_SECRET_KEY" apps\web\.env') do set %%a=%%b
node scripts\preuzmi-slike.mjs
echo.
pause
