@echo off
title Iniciar Proyecto SeñaText
echo ==========================================
echo        Iniciando SeñaText MVP
echo ==========================================
echo.

echo [1/2] Iniciando el Servidor de Inteligencia Artificial (FastAPI)...
start "Backend IA - SeñaText" cmd /k ".\iniciar-ia.cmd"

echo [2/2] Iniciando la Aplicacion Web (Vite/React)...
start "Frontend Web - SeñaText" cmd /k "npm run dev"

echo.
echo ==========================================
echo  ¡Listo! Se han abierto dos ventanas nuevas:
echo  1. El servidor backend de Python (Puerto 8000)
echo  2. El servidor frontend de React (Puerto 5173)
echo.
echo  Ve a la ventana del Frontend o abre tu navegador en:
echo  http://localhost:5173
echo ==========================================
pause
