'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, AlertTriangle, CheckCircle, HelpCircle, Info, Phone, Mail, MapPin, CheckSquare, Pencil } from 'lucide-react';
import Link from 'next/link';

import { useReport } from '@/lib/hooks/useReportsQueries';
import { useResolveReport } from '@/lib/hooks/useReportsMutations';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ReportType } from '@/lib/services/reports';
import { ShareButtons } from '@/components/ShareButtons';
import { ReportMap } from '@/components/maps/ReportMap';
import { reportTypeStyles, defaultReportStyle } from '@/lib/constants/reportStyles';

export default function ReportDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const reportId = params.reportId as string; // Obtener ID de la URL
  const { user } = useAuth(); // Obtener usuario actual
  const { data: report, error, isLoading, isError } = useReport(reportId);
  const { mutate: resolveReportMutate, isPending: isResolving } = useResolveReport();

  // Estado de Carga
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">Cargando reporte...</span>
      </div>
    );
  }

  // Estado de Error
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Error al cargar el reporte</h1>
        <p>{error?.message || 'No se pudo encontrar el reporte solicitado o ocurrió un error.'}</p>
      </div>
    );
  }

  // Si no hay reporte (aunque useQuery debería lanzar error si no lo encuentra)
  if (!report) {
     return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Reporte no encontrado</h1>
        <p>El reporte que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  // Renderizar detalles del reporte
  const { badgeVariant, icon: Icon, label } = reportTypeStyles[report.report_type] || defaultReportStyle;
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es });

  // Construir URL completa para compartir (asumiendo que la app corre en localhost:3000 por ahora)
  // En producción, usarías process.env.NEXT_PUBLIC_SITE_URL o similar
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : `http://localhost:3000${pathname}`;
  const shareTitle = `Reporte ${label}: ${report.pet_name || report.pet_type}`;

  // Preparar datos para el mapa (si el reporte existe)
  const mapReports = report ? [report] : []; // ReportMap espera un array
  const mapCenter = report ? { lat: report.location_lat, lng: report.location_lon } : undefined;

  // Determinar si el usuario actual es el dueño y el reporte está activo
  const isOwner = user?.id === report.reported_by_user_id;
  const isActive = report.status === 'ACTIVE';

  // Función actualizada para usar resolveReportMutate
  const handleMarkAsResolved = () => {
    if (!report || !user) {
      console.error("Report or user data is missing.");
      return; 
    }
    
    resolveReportMutate({ 
      reportId: report.id, 
      userId: user.id 
    }, {
      onSuccess: () => {
        // El hook ya muestra el toast y invalida queries.
        // Añadimos la redirección aquí.
        // Opcional: un pequeño delay para que se vea el toast
        setTimeout(() => {
          router.push('/lost-found'); // <-- Redirigir a la lista principal (o '/my-reports')
        }, 1500); // Espera 1.5 segundos antes de redirigir
      },
      // onError sigue siendo manejado por el hook por defecto
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna Izquierda (Imagen y tipo) */}
        <div className="md:col-span-1 space-y-4">
          {report.image_url ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={report.image_url}
                alt={`Imagen de ${report.pet_name || report.pet_type}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 33vw"
                priority // Priorizar carga de imagen principal
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <span>Sin imagen disponible</span>
            </div>
          )}
          <Badge variant={badgeVariant} className="text-lg w-full flex items-center justify-center capitalize py-2">
             <Icon className="mr-2 h-5 w-5" />
             {label}
          </Badge>
        </div>

        {/* Columna Derecha (Detalles) */}
        <div className="md:col-span-2 space-y-6">
          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold capitalize">
                {report.pet_name || report.pet_type}
            </h1>
            {(report.pet_name && report.pet_name !== report.pet_type) || (!report.pet_name && report.pet_breed) ? (
                 <p className="text-lg text-muted-foreground capitalize">
                    {report.pet_type} {report.pet_breed ? `- ${report.pet_breed}` : ''}
                 </p>
            ) : null}
             <p className="text-sm text-muted-foreground mt-1">Reportado {timeAgo}</p>
             {/* Mostrar estado si no es ACTIVO */} 
             {report.status !== 'ACTIVE' && (
                <Badge variant={report.status === 'RESOLVED' ? 'default' : 'outline'} className="mt-2">
                    {report.status === 'RESOLVED' ? 'Resuelto' : report.status}
                </Badge>
             )}
          </div>

           {/* Descripción */}
           <div>
             <h2 className="text-xl font-semibold mb-2">Descripción</h2>
             <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
           </div>

           {/* Ubicación y Mapa */}
           <div>
             <h2 className="text-xl font-semibold mb-2 flex items-center">
               <MapPin className="mr-2 h-5 w-5" /> Ubicación
             </h2>
             {/* Mostrar descripción si existe */} 
             {report.location_description && (
                  <p className="text-muted-foreground mb-3">
                     {report.location_description}
                  </p>
             )}
             {/* Renderizar el mapa */} 
             <div className="mb-3">
                 <ReportMap
                     reports={mapReports}
                     initialCenter={mapCenter}
                     initialZoom={15} // Zoom más cercano para el detalle
                  />
             </div>
             {/* Mostrar coordenadas */} 
             <p className="text-xs text-muted-foreground/80">
               (Lat: {report.location_lat.toFixed(5)}, Lon: {report.location_lon.toFixed(5)})
             </p>
           </div>

            {/* Contacto */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Información de Contacto</h2>
              <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-md border">
                 <Info className="h-5 w-5 text-secondary-foreground" />
                 <p className="text-secondary-foreground font-medium">{report.contact_info}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                 Contacta directamente a la persona que realizó el reporte.
              </p>
            </div>

            {/* --- Botones de Acción (SOLO si es dueño y está activo) --- */}
            {isOwner && isActive && (
              <div className="pt-4 border-t flex flex-col md:flex-row md:items-center gap-3">
                  {/* Botón Marcar como Resuelto */} 
                   <Button
                      onClick={handleMarkAsResolved}
                      disabled={isResolving}
                      variant="outline"
                      className="w-full md:w-auto"
                   >
                       {isResolving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resolviendo...</>
                       ) : (
                           <><CheckSquare className="mr-2 h-4 w-4" /> Marcar como Resuelto</>
                       )}
                   </Button>
                   {/* --- NUEVO: Botón Editar Reporte --- */} 
                   <Button 
                      asChild // Para que el botón se comporte como el Link interno
                      variant="secondary" 
                      className="w-full md:w-auto"
                   >
                      <Link href={`/report/${reportId}/edit`}> 
                          <Pencil className="mr-2 h-4 w-4" /> Editar Reporte
                      </Link>
                   </Button>
                   {/* Podríamos añadir un texto explicativo común aquí si quisiéramos */}
               </div>
             )}

            {/* Botones de Compartir */}
            <div className="pt-4 border-t">
              <h3 className="text-md font-semibold mb-3">Compartir este reporte</h3>
              <ShareButtons url={fullUrl} title={shareTitle} description={report.description} />
            </div>

        </div>
      </div>
    </main>
  );
} 