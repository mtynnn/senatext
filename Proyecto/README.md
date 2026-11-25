# SeñaText

Sistema web de traducción de Lengua de Señas Chilena (LSCh) a texto en tiempo real, orientado a facilitar la comunicación entre pacientes sordos y funcionarios de un CESFAM durante la atención presencial.

Proyecto APT — Ingeniería en Informática, Duoc UC (Sede Antonio Varas).

## Equipo
- **Ariel Valverde** — Scrum Master / Full Stack
- **Vicente Tramon** — Full Stack / Científico de Datos
- **Martín Quiroga** — Backend / Ingeniero de IA
- **Diego Robert** — Product Owner / Full Stack

## Descripción
El sistema captura mediante cámara los movimientos de manos del paciente, los procesa con un modelo de Deep Learning (extracción de landmarks con MediaPipe Holistic y clasificación de secuencias temporales) y muestra el texto reconocido al funcionario. El MVP reconoce un vocabulario cerrado y validado, correspondiente al flujo de atención primaria en CESFAM.

## Stack tecnológico
- **Frontend:** React / Next.js, Tailwind CSS
- **Backend:** FastAPI, Python
- **Base de datos:** Supabase (PostgreSQL)
- **ML/IA:** TensorFlow/Keras, MediaPipe Holistic
- **Deploy:** Cloudflare

## Reconocimiento local v2: respuestas generales

La API local permite `Sí`, `No`, `No entiendo` y `Por favor` además de las cuatro
respuestas específicas de cada pregunta preparada. Conserva `POST /reconocer`
con `video` y `contexto` en FormData.

Para aplicar esta política al adaptador local `api_local.py` ya preparado:

```powershell
# Desde Proyecto/, con PowerShell 7
./scripts/habilitar-comunicacion-local.ps1
Set-Location "$env:LOCALAPPDATA/SeñaText/backend-v2"
$env:PYTHONUTF8 = '1'
./.venv/Scripts/python.exe -m uvicorn api_local:app --host 127.0.0.1 --port 8000
```

Detén primero la instancia anterior con Ctrl+C. El script conserva una copia
`api_local.py.antes-comunicacion.bak` y amplía los grupos en memoria al arrancar;
no modifica pesos, `config.json` ni `senatext_runtime.py`. El arranque imprime
`POLITICA: respuestas generales habilitadas en todos los contextos`.
El cliente usa `VITE_URL_RECONOCEDOR=http://127.0.0.1:8000` y
`VITE_MODO_SIMULADO=false` en `.env.local`. Un servicio externo también debe
implementar esta ampliación; cambiar únicamente el frontend no basta.

Al competir ocho respuestas, los márgenes anteriores dejan de ser comparables.
No se añade rechazo automático de señas desconocidas ni se cambian los contextos
de preguntas libres.

## Estado del proyecto
En desarrollo — MVP con implementación simulada, sin despliegue institucional real.

## Metodología
Desarrollo ágil basado en Scrum, con Product Backlog y Sprint Backlog organizados en 9 sprints de 2 semanas.
