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

## Estado del proyecto
En desarrollo — MVP con implementación simulada, sin despliegue institucional real.

## Metodología
Desarrollo ágil basado en Scrum, con Product Backlog y Sprint Backlog organizados en 9 sprints de 2 semanas.
