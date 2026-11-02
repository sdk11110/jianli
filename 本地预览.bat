@echo off
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel% equ 0 (
  python scripts\preview.py --port 8877
) else (
  py -3 scripts\preview.py --port 8877
)
pause
