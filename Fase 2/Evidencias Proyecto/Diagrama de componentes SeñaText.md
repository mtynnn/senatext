# Componentes de SeñaText

La aplicación web utiliza un servicio externo de reconocimiento y Supabase. El servicio de reconocimiento se configura mediante su URL.

```mermaid
flowchart LR
    subgraph WEB["Aplicación web SeñaText · React"]
        VP["«component»<br/>Vista paciente y captura de video"]
        VF["«component»<br/>Vista funcionario"]
        VA["«component»<br/>Panel administrador"]
        SYNC["«component»<br/>Sincronización entre pestañas"]
        HTTP["«component»<br/>Cliente de reconocimiento"]
        SB["«component»<br/>Cliente Supabase"]

        VP <-->|Pregunta, grabación y resultado| SYNC
        VF <-->|Pregunta, grabación y resultado| SYNC
        VP --> HTTP
        VF --> SB
        VA --> SB
    end

    subgraph REC["Servicio de reconocimiento"]
        API["«component»<br/>API FastAPI"]
        MOTOR["«component»<br/>Motor de reconocimiento de señas"]
        API -->|Ejecuta reconocimiento| MOTOR
    end

    subgraph DATA["Supabase"]
        AUTH["«component»<br/>Auth"]
        PG[("PostgreSQL")]
        EDGE["«component»<br/>Edge Function manage-users"]
        EDGE -->|Valida sesión y administra cuentas| AUTH
        EDGE -->|Consulta el rol de funcionario| PG
    end

    HTTP -->|POST /reconocer · video y contexto| API
    SB -->|Sesión y autenticación| AUTH
    SB -->|Consultas y registro de atención| PG
    SB -->|Gestión de cuentas| EDGE
```
