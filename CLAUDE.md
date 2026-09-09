# CLAUDE.md — SeñaText

## Resumen del sistema

SeñaText es una aplicación web (MVP) que traduce **Lengua de Señas Chilena (LSCh) a texto en tiempo real**,
para facilitar la comunicación entre pacientes sordos y funcionarios de un CESFAM durante la atención presencial.

Proyecto APT — Ingeniería en Informática, Duoc UC (Sede Antonio Varas). Metodología Scrum, 9 sprints de 2 semanas.

El paciente responde frente a una cámara; MediaPipe Holistic extrae landmarks de manos/pose/rostro y (a futuro)
un modelo de Deep Learning clasifica la secuencia. El funcionario ve el texto reconocido, puede corregirlo
manualmente y registrarlo como síntoma en la ficha. Estado actual: **frontend con inferencia simulada**,
sin backend ni despliegue institucional real.

### Stack

- **Frontend (este repo):** React 18 + Vite 6, React Router v6, Tailwind CSS 3, lucide-react (íconos).
- **Visión:** `@mediapipe/holistic` + `@mediapipe/drawing_utils` (los assets del modelo se cargan desde CDN jsDelivr).
- **Backend (planificado, fuera de este repo):** FastAPI / Python, Supabase (PostgreSQL), TensorFlow/Keras. Deploy en Cloudflare.

### Comandos

```bash
npm run dev       # servidor de desarrollo Vite en http://localhost:3000 (abre el navegador)
npm run build     # build de producción
npm run preview   # sirve el build
npm run lint      # eslint (js,jsx) — max-warnings 0
```

### Arquitectura del código

- **Convención de nombres:** carpetas en **inglés** (`context`, `components`, `pages`), archivos y símbolos en **español**.
- **Rutas** (`src/App.jsx`): `/` VistaInicio · `/login` LoginFuncionario · `/paciente` VistaPaciente · `/funcionario` VistaFuncionario · `/admin` VistaAdmin · `*` → `/`.
- **Estado global:** `src/context/ContextoPreguntas.jsx` (`ProveedorPreguntas` / `usarContextoPreguntas`).
  Sincroniza pregunta activa, texto reconocido, mensaje de estado y lista de preguntas entre ambas vistas.
  `PREGUNTAS_PREDETERMINADAS` define el vocabulario de preguntas del funcionario.
- **Componentes:**
  - `components/patient/` → `ContenedorCamara` (video + canvas + pipeline MediaPipe), `TarjetaPregunta`.
  - `components/official/` → `LoginFuncionario`, `EncabezadoSuperior`, `BarraLateral` (selección/creación de preguntas),
    `VisualizadorTraduccion` (muestra el texto y reusa `ContenedorCamara`), `ControlesAccion` (corregir / registrar síntoma).
  - `components/common/` → `PiePagina`, `BarraDesarrollo` (barra de dev con botones "simular seña"; actualmente no montada).
- Alias de importación: `@` → `src/`.
- `ContenedorCamara` limita el procesamiento a ~15 FPS y limpia stream + `holistic.close()` al desmontar.

## Paleta de colores

Fuente tipográfica: **Inter** (Google Fonts), con fallback a system-ui.

### Color institucional `cesfam` (definido en `tailwind.config.js`)

| Token | Hex | Uso |
|-------|-----|-----|
| `cesfam-50` | `#f0f9ff` | fondos muy suaves |
| `cesfam-100` | `#e0f2fe` | fondos suaves |
| `cesfam-200` | `#bae6fd` | bordes claros |
| `cesfam-300` | `#7dd3fc` | bordes/hover |
| `cesfam-400` | `#38bdf8` | acentos |
| `cesfam-500` | `#009fe3` | **azul activo brillante** (según mockup), color de selección |
| `cesfam-600` | `#0284c7` | |
| `cesfam-700` | `#0369a1` | |
| `cesfam-800` | `#075985` | |
| `cesfam-900` | `#0f3b60` | **azul institucional oscuro** (botón principal, p. ej. "Registrar síntoma") |
| `cesfam-950` | `#0a2540` | hover del botón oscuro |

### Colores de apoyo (utilidades Tailwind estándar usadas en la UI)

- **Neutros / superficies:** `slate-50`/`slate-100` (fondos de página), `white` (tarjetas), `slate-200`/`slate-300` (bordes), `slate-500`–`slate-900` (texto).
- **Encabezado y barra de dev:** `slate-900` con texto blanco.
- **Acento primario en componentes:** familia `sky-*` y `blue-700` (preguntas activas, enlaces, hovers).
- **Estados:**
  - Rojo/rosa `rose-*` → badge "TEXTO RECONOCIDO" en vivo.
  - Verde `emerald-*` → confirmación "síntoma registrado".
  - Ámbar `amber-400` → indicador de simulación en la barra de dev.
- **Sombras personalizadas:** `shadow-card`, `shadow-active-pill` (en `tailwind.config.js`).
- **Landmarks MediaPipe (colores fijos en canvas):** rostro `#C0C0C070`, pose `#00FF00`/`#FF0000`, mano izq. `#CC0000`, mano der. `#00CC00`.

## Roles

### Roles de usuario en el sistema

| Rol | Ruta | Descripción |
|-----|------|-------------|
| **Paciente** (sordo) | `/paciente` | Ve la pregunta actual del funcionario y responde en LSCh frente a la cámara. Interfaz simple, texto grande, sin login. |
| **Funcionario** CESFAM | `/funcionario` | Panel de atención: elige o escribe preguntas, ve el texto reconocido, lo corrige manualmente y registra el síntoma en la ficha. A futuro requerirá inicio de sesión. |

En la maqueta el funcionario aparece como *"D. Robert (Somatometría)"*.

### Equipo del proyecto

| Persona | Rol |
|---------|-----|
| Ariel Valverde | Scrum Master / Full Stack |
| Vicente Tramon | Full Stack / Científico de Datos |
| Martín Quiroga | Backend / Ingeniero de IA |
| Diego Robert | Product Owner / Full Stack |
