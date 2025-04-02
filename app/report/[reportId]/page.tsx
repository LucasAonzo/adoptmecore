'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Info, 
  Phone, 
  Mail, 
  MapPin, 
  CheckSquare, 
  Pencil
} from 'lucide-react';
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
  const reportId = params.reportId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: report, error, isLoading, isError } = useReport(reportId);
  const { mutate: resolveReportMutate, isPending: isResolving } = useResolveReport();
  
  const pageIsLoading = isLoading || isAuthLoading;

  if (pageIsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">Cargando...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Error al cargar el reporte</h1>
        <p>{error?.message || 'No se pudo encontrar el reporte solicitado o ocurrió un error.'}</p>
      </div>
    );
  }

  if (!report) {
     return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Reporte no encontrado</h1>
        <p>El reporte que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  const { badgeVariant, icon: Icon, label } = reportTypeStyles[report.report_type] || defaultReportStyle;
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es });

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : `http://localhost:3000${pathname}`;
  const shareTitle = `Reporte ${label}: ${report.pet_name || report.pet_type}`;

  const mapReports = report ? [report] : [];
  const mapCenter = report ? { lat: report.location_lat, lng: report.location_lon } : undefined;

  const isOwner = user?.id === report.reported_by_user_id;
  const isActive = report.status === 'ACTIVE';

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
        setTimeout(() => {
          router.push('/lost-found');
        }, 1500);
      },
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          {report.image_url ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={report.image_url}
                alt={`Imagen de ${report.pet_name || report.pet_type}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
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

        <div className="md:col-span-2 space-y-6">
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
             {report.status !== 'ACTIVE' && (
                <Badge variant={report.status === 'RESOLVED' ? 'default' : 'outline'} className="mt-2">
                    {report.status === 'RESOLVED' ? 'Resuelto' : report.status}
                </Badge>
             )}
          </div>

           <div>
             <h2 className="text-xl font-semibold mb-2">Descripción</h2>
             <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
           </div>

           <div>
             <h2 className="text-xl font-semibold mb-2 flex items-center">
               <MapPin className="mr-2 h-5 w-5" /> Ubicación
             </h2>
             {report.location_description && (
                  <p className="text-muted-foreground mb-3">
                     {report.location_description}
                  </p>
             )}
             <div className="mb-3">
                 <ReportMap
                     reports={mapReports}
                     initialCenter={mapCenter}
                     initialZoom={15}
                  />
             </div>
             <p className="text-xs text-muted-foreground/80">
               (Lat: {report.location_lat.toFixed(5)}, Lon: {report.location_lon.toFixed(5)})
             </p>
           </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Información de Contacto</h2>
              {report.contact_info ? (
                <>
                  <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-md border">
                    <Info className="h-5 w-5 text-secondary-foreground flex-shrink-0" />
                    <p className="text-secondary-foreground font-medium">{report.contact_info}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contacta directamente a la persona que realizó el reporte.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay información de contacto adicional provista.
                </p>
              )}
            </div>

            {isOwner && isActive && (
              <div className="pt-4 border-t flex flex-col md:flex-row md:items-center gap-3">
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
                   <Button 
                      asChild 
                      variant="secondary" 
                      className="w-full md:w-auto"
                   >
                      <Link href={`/report/${reportId}/edit`}> 
                          <Pencil className="mr-2 h-4 w-4" /> Editar Reporte
                      </Link>
                   </Button>
               </div>
             )}

            <div className="pt-4 border-t">
              <h3 className="text-md font-semibold mb-3">Compartir este reporte</h3>
              <ShareButtons url={fullUrl} title={shareTitle} description={report.description} />
            </div>

        </div>
      </div>
    </main>
  );
} 