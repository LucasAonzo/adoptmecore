'use client';

import React, { useEffect } from 'react';
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
  Pencil,
  Share2, 
  Calendar, 
  Tag, 
  User,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

import { useReport } from '@/lib/hooks/useReportsQueries';
import { useResolveReport } from '@/lib/hooks/useReportsMutations';
import { useAuth } from '@/lib/providers/AuthProvider';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareButtons } from '@/components/ShareButtons';
import { ReportMap } from '@/components/maps/ReportMap';
import { reportTypeStyles, defaultReportStyle } from '@/lib/constants/reportStyles';

export default function ReportDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const reportId = params.reportId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: report, error, isLoading, isError } = useReport(reportId, {
    enabled: !!reportId
  });
  const { mutate: resolveReportMutate, isPending: isResolving } = useResolveReport();
  
  const pageIsLoading = isLoading || isAuthLoading;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [reportId]);

  if (pageIsLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="text-lg font-medium">Cargando información del reporte...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="container mx-auto max-w-3xl my-12">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error al cargar el reporte</h1>
          <p className="text-muted-foreground">
            {error?.message || "No se pudo encontrar el reporte solicitado o ocurrió un error."}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/lost-found">Volver a reportes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
     return (
      <Card className="container mx-auto max-w-3xl my-12">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Reporte no encontrado</h1>
          <p className="text-muted-foreground">El reporte que buscas no existe o fue eliminado.</p>
          <Button className="mt-6" asChild>
            <Link href="/lost-found">Volver a reportes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { badgeVariant, icon: Icon, label } = reportTypeStyles[report.report_type as keyof typeof reportTypeStyles] || defaultReportStyle;
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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      {report.status !== "ACTIVE" && (
        <div
          className={`w-full mb-6 p-4 rounded-lg ${report.status === "RESOLVED" ? "bg-green-50 border border-green-200 text-green-800" : "bg-muted"}`}
        >
          <div className="flex items-center justify-center gap-2">
            {report.status === "RESOLVED" ? <CheckCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            <span className="font-medium">
              {report.status === "RESOLVED" ? "Este reporte ha sido marcado como resuelto" : `Estado: ${report.status}`}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="relative w-full aspect-square bg-muted">
              {report.image_url ? (
                <Image
                  src={report.image_url}
                  alt={`Imagen de ${report.pet_name || report.pet_type}`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                  className="transition-all hover:scale-105 duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span>Sin imagen disponible</span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <Badge variant={badgeVariant} className="text-lg self-start py-1.5 px-3">
                  <Icon className="mr-2 h-5 w-5" />
                  {label}
                </Badge>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{timeAgo}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground capitalize">{report.pet_type}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6 pb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" /> Información de Contacto
              </h2>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {report.contact_info ? (
                <div className="flex items-start gap-3 bg-secondary/30 p-4 rounded-lg border">
                  <Info className="h-5 w-5 text-secondary-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-secondary-foreground">{report.contact_info}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Contacta directamente a la persona que realizó el reporte.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No hay información de contacto adicional provista.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6 pb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Share2 className="mr-2 h-5 w-5" /> Compartir
              </h2>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Ayuda a difundir este reporte compartiendo en redes sociales
              </p>
              <ShareButtons url={fullUrl} title={shareTitle} description={report.description} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="p-6 pb-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold capitalize">{report.pet_name || report.pet_type}</h1>
                {(report.pet_name && report.pet_name !== report.pet_type) || (!report.pet_name && report.pet_breed) ? (
                  <p className="text-lg text-muted-foreground capitalize">
                    {report.pet_type} {report.pet_breed ? `- ${report.pet_breed}` : ""}
                  </p>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{report.description}</p>
                </div>

                {report.pet_breed && (
                  <>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Raza</h3>
                        <p className="capitalize">{report.pet_breed}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator className="my-8" />

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-3 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" /> Ubicación
                  </h2>
                  {report.location_description && (
                    <p className="text-muted-foreground mb-4">{report.location_description}</p>
                  )}
                </div>

                <div className="rounded-lg overflow-hidden border h-[300px] mb-4">
                  <ReportMap reports={mapReports} initialCenter={mapCenter} initialZoom={15} /> 
                </div>

                <p className="text-xs text-muted-foreground/80">
                  Coordenadas: {report.location_lat.toFixed(5)}, {report.location_lon.toFixed(5)}
                </p>
              </div>
            </CardContent>

            {isOwner && isActive && (
              <CardFooter className="p-6 border-t flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleMarkAsResolved}
                  disabled={isResolving}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  {isResolving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resolviendo...</>
                  ) : (
                    <><CheckSquare className="mr-2 h-4 w-4" /> Marcar como Resuelto</>
                  )}
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href={`/report/${reportId}/edit`}> 
                    <Pencil className="mr-2 h-4 w-4" /> Editar Reporte
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader className="p-6 pb-4">
              <h2 className="text-xl font-semibold">Reportes similares</h2>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p>No hay reportes similares en esta zona actualmente.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 