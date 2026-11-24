# SeñaText

SeñaText es un prototipo web que apoya la atención de personas usuarias de Lengua de Señas Chilena en CESFAM. La vista de paciente captura una seña dentro de un vocabulario acotado y la vista de funcionario muestra el texto reconocido. Es un Proyecto APT de Ingeniería en Informática de Duoc UC.

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

Docker queda pendiente. El flujo de ejecución documentado usa Vite y se conecta a Supabase y a la API de reconocimiento mediante las variables de entorno.

## Evidencias

- [Fase 1 · Definición del proyecto](Fase%201)
- [Fase 2 · Desarrollo y evidencias](Fase%202)
- [Fase 3 · Presentación final y reflexiones](Fase%203)
- [Casos de uso](Fase%202/Evidencias%20Proyecto/Diagrama%20de%20casos%20de%20uso%20Se%C3%B1aText.png)
- [Secuencia del reconocimiento](Fase%202/Evidencias%20Proyecto/Diagrama%20de%20secuencia%20Se%C3%B1aText.md)
- [Componentes](Fase%202/Evidencias%20Proyecto/Diagrama%20de%20componentes%20Se%C3%B1aText.md)
- [Modelo entidad–relación](Fase%202/Evidencias%20Proyecto/Modelo%20Entidad-Relaci%C3%B3n%20Se%C3%B1aText.png)
