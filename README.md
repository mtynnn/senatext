# SeñaText — Traductor de Lengua de Señas Chilena (LSCh) a Texto para CESFAM

# Descripción
SeñaText es un prototipo web de accesibilidad digital que apoya la atención presencial de personas sordas usuarias de Lengua de Señas Chilena (LSCh) en los mesones de Centros de Salud Familiar (CESFAM). La vista de paciente captura una seña dentro de un vocabulario acotado y la vista de funcionario muestra el texto reconocido en pantalla. Es un Proyecto APT de Ingeniería en Informática de Duoc UC (Sede Antonio Varas).
¿A quién va dirigido? A pacientes sordos usuarios de Lengua de Señas Chilena (LSCh) y a funcionarios administrativos de atención primaria de salud (CESFAM).
¿Qué problema resuelve? Reduce la barrera comunicacional en los mesones de atención primaria donde no existe un intérprete de LSCh disponible, entregando autonomía al paciente y disminuyendo malentendidos en trámites críticos (solicitud de horas, farmacia, orientación y síntomas básicos).

# Tecnologías utilizadas
Frontend: React, Vite, Tailwind CSS, WebRTC y MediaPipe JS (Edge Computing para extracción de landmarks en el navegador).
Backend e Inteligencia Artificial: Python, FastAPI y modelo de Deep Learning (LSTM / 1D-CNN) para clasificación de secuencias temporales de señas.
Base de Datos y Autenticación: Supabase (PostgreSQL, Supabase Auth con JWT/RBAC y Edge Function manage-users).
Cloud y Despliegue: Cloudflare (hosting/seguridad), Docker Compose (entorno de desarrollo) y GitHub.
Pruebas QA: Python unittest y Selenium WebDriver.

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
