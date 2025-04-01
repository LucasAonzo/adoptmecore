# Plan de Implementación - Fase Y: Mascotas Perdidas, Encontradas y Urgencias

*   [X] **1. Diseño de Base de Datos:**
    *   [X] Crear tabla `reports`
    *   [X] Crear tabla `report_history`
    *   [X] Crear trigger para `report_history` (`on_report_status_change` encontrado)
    *   [?] Índices (Pendiente confirmar, pero menos crítico ahora)
*   [X] **2. Roles y Políticas de Seguridad (RLS):** (Políticas confirmadas, `is_admin` existe)
*   [✓] **3. Backend (Servicios y Hooks):** (Archivos existen - **Necesita revisión/refinamiento**)
    *   [✓] Servicios (`lib/services/reports.ts`)
    *   [✓] Hooks (`lib/hooks/useReportsQueries.ts`, `lib/hooks/useReportsMutations.ts`)
*   [✓] **4. Frontend (UI y Componentes):** (Archivos existen - **Necesita revisión/refinamiento**)
    *   [✓] Dependencias
    *   [✓] Páginas: `/lost-found`, `/report/new`, `/report/[reportId]`
    *   [✓] Componentes:
        *   [✓] `ReportForm.tsx` (Existe - Necesita revisión interna)
        *   [✓] `ReportCard.tsx` (Existe - Necesita revisión interna)
        *   [X] `ReportsMap.tsx`
        *   [✓] `LocationPicker.tsx` (Existe - Necesita revisión interna)
        *   [?] `ReportFilters.tsx` (Existe - Necesita revisión interna)
        *   [✓] `ShareButtons.tsx` (Existe)
    *   [X] Integración: Enlace en Navbar
*   [✓] **5. Implementación de Geolocalización:**
    *   [✓] Obtención de Coordenadas (`LocationPicker.tsx` existe)
    *   [X] Visualización (Mapa)
    *   [?] Búsqueda por Proximidad (Pendiente implementar en `getReports`)
*   [?] **6. Flujo de Urgencias:** (Revisar UI/lógica específica)
*   [✓] **7. Consideraciones Adicionales:** (Asumimos OK por ahora, ~~pendiente confirmar~~ Bucket `pet-images` **confirmado**)

**Orden Sugerido de Implementación (Actualizado):**

1.  DB Schema (incluyendo `report_history` y trigger) + RLS (incluyendo rol `admin` básico y políticas). **(COMPLETADO)**
2.  Servicios backend básicos (`createReport`, `getReports` con paginación, `getReportById`). **(EXISTE - NECESITA REVISIÓN/REFINAMIENTO: Geo-filtro, errores)**
3.  Configurar subida de imágenes a Storage. **(IMPLEMENTADO en servicio - BUCKET CONFIRMADO)**
4.  Página y formulario de creación (`/report/new`, `ReportForm` sin mapa inicialmente). Hook `useCreateReport`. **(EXISTE - NECESITA REVISIÓN INTERNA)**
5.  Página de listado/detalle básica (`/lost-found`, `/report/[reportId]`, `ReportCard`). Hook `useReports` (con `useInfiniteQuery`), `useReport`. Añadir `ShareButtons`. **(EXISTE - NECESITA REVISIÓN INTERNA)**
6.  Configurar Google Maps API Key. Integrar `@react-google-maps/api` y `@googlemaps/markerclusterer`. Crear `ReportsMap` (con pines personalizados y clustering) y `LocationPicker` (con Google Maps). **(MAPA OK, PICKER EXISTE - NECESITA REVISIÓN INTERNA)**
7.  Añadir mapa (`ReportsMap`) a `/lost-found` y selector de ubicación (`LocationPicker` + geoloc) a `ReportForm`. **(MAPA AÑADIDO, PICKER/GEOLOC EXISTE - NECESITA REVISIÓN INTERNA)**
8.  Implementar filtros (`ReportFilters`) y búsqueda por proximidad/bounds. **(FILTROS EXISTEN - NECESITA REVISIÓN INTERNA, PROXIMIDAD PENDIENTE)**
9.  Refinar flujo de Urgencias. **(PENDIENTE)**
10. Implementar lógica de auditoría y RLS de admin más detallada. **(RLS BÁSICA OK, AUDITORÍA BÁSICA OK)**
11. Pruebas y ajustes. **(PENDIENTE)**
// ... (resto del archivo sin cambios) ... 