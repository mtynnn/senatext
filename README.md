# SeñaText — Traductor de Lengua de Señas Chilena (LSCh) a Texto para CESFAM

# Descripción
SeñaText es un prototipo web de accesibilidad digital que apoya la atención presencial de personas sordas usuarias de Lengua de Señas Chilena (LSCh) en los mesones de Centros de Salud Familiar (CESFAM). La vista de paciente captura una seña dentro de un vocabulario acotado y la vista de funcionario muestra el texto reconocido en pantalla. Es un Proyecto APT de Ingeniería en Informática de Duoc UC (Sede Antonio Varas).
¿A quién va dirigido? A pacientes sordos usuarios de Lengua de Señas Chilena (LSCh) y a funcionarios administrativos de atención primaria de salud (CESFAM).
¿Qué problema resuelve? Reduce la barrera comunicacional en los mesones de atención primaria donde no existe un intérprete de LSCh disponible, entregando autonomía al paciente y disminuyendo malentendidos en trámites críticos (solicitud de horas, farmacia, orientación y síntomas básicos).

# Tecnologías utilizadas

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe_JS-0097A7?style=for-the-badge&logo=google&logoColor=white)

### Backend e Inteligencia Artificial
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Deep Learning](https://img.shields.io/badge/LSTM_%2F_1D--CNN-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

### Base de Datos, Cloud y QA
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)


# Arquitectura de la solución
SeñaText implementa una Arquitectura de 3 Capas combinada con Edge Computing:
Capa de Presentación (Frontend): Aplicación web en React/Vite que separa las vistas de paciente (/paciente), funcionario (/funcionario) y administrador (/admin). Utiliza WebRTC y MediaPipe JS para capturar la cámara localmente y extraer coordenadas espaciales 3D (landmarks), protegiendo la privacidad del paciente al evitar el envío de video crudo por la red.
Capa de Lógica de Negocio e IA (Backend): API en FastAPI que recibe las coordenadas JSON, ejecuta la inferencia con el modelo entrenado y aplica un umbral de confianza (Confidence Threshold) antes de retornar la palabra reconocida.
Capa de Datos y Seguridad (Persistencia): Supabase gestiona la autenticación institucional (JWT y control de acceso basado en roles RBAC) y persiste en PostgreSQL las tablas funcionarios, atenciones, interacciones, preguntas, vocabulario, contextos_preguntas y project_heartbeat.

# Metodología de trabajo
El proyecto se desarrolló bajo el marco ágil Scrum organizado en 8 Sprints de 2 semanas (16 semanas totales, Agosto–Noviembre 2026), planificando y gestionando 27 Historias de Usuario (HU-0101 a HU-0903) mediante Product Backlog, Sprint Backlog, Hoja de Ruta (Agile Roadmap), Definition of Done (DoD) y reuniones de Retrospectiva por iteración.

# Integrantes del equipo y roles
| Integrante | Correo | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Ariel Valverde P.** | `ari.valverde@duocuc.cl` | Scrum Master / Desarrollador Full Stack / QA |
| **Diego Robert S.** | `di.robert@duocuc.cl` | Product Owner / Desarrollador Full Stack |
| **Martín Quiroga U.** | `ma.quiroga@duocuc.cl` | Desarrollador Backend / Ingeniero de IA |
| **Vicente Tramon F.** | `vi.tramon@duocuc.cl` | Desarrollador Full Stack / Científico de Datos |

## Ejecutar en desarrollo

Se requiere Node.js y npm. Desde la raíz del repositorio:

```sh
cd Proyecto
npm ci
```

Copia `.env.example` como `.env.local` dentro de `Proyecto/` y configura:

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase. |
| `VITE_URL_RECONOCEDOR` | URL base de la API FastAPI para el reconocimiento real. Si se omite, la aplicación usa el modo simulado. |
| `VITE_MODO_SIMULADO` | Configura `true` para forzar la simulación. |

Las variables `VITE_*` quedan visibles en el navegador. Usa solo la clave pública de Supabase en el cliente. La [guía de Supabase](Proyecto/supabase/README.md) documenta la configuración de la función `manage-users`.

```sh
npm run dev
```

Abre la URL que imprime Vite. Para probar el flujo de atención, abre las vistas de funcionario y paciente en dos pestañas del mismo navegador y con el mismo origen. La vista paciente requiere acceso a la cámara para grabar señas. Para generar el paquete de producción del frontend, ejecuta `npm run build`.

## Ejecutar con Docker Compose

Con Docker y Compose activos, copia `Proyecto/.env.example` como `Proyecto/.env.local` y completa las variables de la tabla. Desde la raíz:

```sh
docker compose up --build
```

Abre [http://localhost:3000](http://localhost:3000). Compose ejecuta el frontend de desarrollo con Vite. Supabase y la API de reconocimiento se configuran como servicios externos. Sin URL de reconocimiento, la aplicación usa el modo simulado.

Para detener el contenedor, ejecuta `docker compose down`.

## Evidencias

- [Fase 1 · Definición del proyecto](Fase%201)
- [Fase 2 · Desarrollo y evidencias](Fase%202)
- [Fase 3 · Presentación final y reflexiones](Fase%203)
- [Casos de uso](Fase%202/Evidencias%20Proyecto/Diagrama%20de%20casos%20de%20uso%20Se%C3%B1aText.png)
- [Secuencia del reconocimiento](Fase%202/Evidencias%20Proyecto/Diagrama%20de%20secuencia%20Se%C3%B1aText.md)
- [Componentes](Fase%202/Evidencias%20Proyecto/Diagrama%20de%20componentes%20Se%C3%B1aText.md)
- [Modelo entidad–relación](Fase%202/Evidencias%20Proyecto/Modelo%20Entidad-Relaci%C3%B3n%20Se%C3%B1aText.png)
