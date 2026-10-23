@echo off
cd /d "%~dp0.."
echo ================================================
echo   Prebacivanje baze: Neon  -->  Supabase
echo ================================================
if not exist scripts\veze.txt (
  echo Nedostaje scripts\veze.txt  - napravi ga u Notepadu sa dva reda:
  echo   NEON_URL=postgresql://...
  echo   SUPA_URL=postgresql://...
  pause & exit /b 1
)
for /f "usebackq tokens=1,* delims==" %%a in ("scripts\veze.txt") do set %%a=%%b
echo === 1/3 Izvozim bazu sa Neona ...
docker compose exec -T postgres pg_dump "%NEON_URL%" --no-owner --no-privileges --schema=public > scripts\dump-neon.sql
if errorlevel 1 (echo GRESKA pri izvozu sa Neona & pause & exit /b 1)
echo === 2/3 Uvozim u Supabase ...
docker compose exec -T postgres psql "%SUPA_URL%" < scripts\dump-neon.sql > scripts\supabase-import.log 2>&1
echo === 3/3 Proveravam ...
docker compose exec -T postgres psql "%SUPA_URL%" -c "select (select count(*) from product) as proizvoda, (select count(*) from product_image) as slika, (select count(*) from \"user\") as korisnika;" > scripts\supabase-provera.txt 2>&1
type scripts\supabase-provera.txt
echo.
echo GOTOVO. Prozor se zatvara za 10s.
timeout /t 10 >nul
