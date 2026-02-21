@echo off
echo Starting Crypto Backend...
cd Crypto_Backend
powershell -ExecutionPolicy Bypass -File .\run_backend.ps1
pause
