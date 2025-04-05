'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Clock, ChevronRight, Share2, BookmarkPlus } from 'lucide-react';

import { type Tables } from '@/lib/database.types'; // Use Tables for the Report type
import { getReverseGeocoding } from '@/lib/mapsUtils'; // Import the new utility function
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { reportTypeStyles, defaultReportStyle } from '@/lib/constants/reportStyles';

// Define the Report type using Tables from database.types
type Report = Tables<'reports'>;

// Update props with Save/Share (interface remains the same)
interface ReportCardProps {
  report: Report;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
}

// Original Placeholder Image
const placeholderImage = "/placeholder-report.svg";

export function ReportCard({ report, onSave, onShare, isSaved = false }: ReportCardProps) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null);
  const [saved, setSaved] = useState(isSaved);
  const [mounted, setMounted] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null); // State for resolved location

  // Calculate timeAgo on client-side (original logic)
  useEffect(() => {
    setMounted(true);
    const updateTimeAgo = () => {
      try {
          setTimeAgo(
            formatDistanceToNow(new Date(report.created_at), {
              addSuffix: true,
              locale: es,
            })
          );
      } catch (error) {
          console.error("Error formatting date:", report.created_at, error);
          setTimeAgo("Fecha inválida");
      }
    };

    updateTimeAgo();
    // Update time every minute
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [report.created_at]);

  // Fetch reverse geocoding if description is missing and coordinates are available
  useEffect(() => {
    if (
      !report.location_description &&
      typeof report.location_lat === 'number' &&
      typeof report.location_lon === 'number'
    ) {
      let isCancelled = false;
      const fetchLocation = async () => {
        const location = await getReverseGeocoding(
          report.location_lat as number,
          report.location_lon as number,
        );
        if (!isCancelled) {
          setResolvedLocation(location);
        }
      };

      fetchLocation();

      return () => {
        isCancelled = true; // Prevent state update on unmounted component
      };
    } else {
      // Clear resolved location if description exists or coordinates are invalid
      setResolvedLocation(null);
    }
  }, [report.location_description, report.location_lat, report.location_lon]);

  // Use imported styles (original logic)
  const { badgeVariant, icon: ReportIcon, label } = reportTypeStyles[report.report_type] || defaultReportStyle;
  const isEmergency = report.report_type === 'EMERGENCY';

  // Status mapping with colors (original logic, keeping original closed color)
  const statusConfig = {
    ACTIVE: { text: "Activo", color: "text-green-600" },
    RESOLVED: { text: "Resuelto", color: "text-blue-600" },
    CLOSED: { text: "Cerrado", color: "text-muted-foreground" }, // Kept original color
  }[report.status] || { text: report.status, color: "text-muted-foreground" };

  // Handlers for Save/Share (original logic)
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) onSave(report.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) onShare(report.id);
  };

  return (
    <Card
      className={cn(
        "group h-full flex flex-col overflow-hidden transition-all duration-300 font-body",
        "border hover:shadow-md hover:-translate-y-1 bg-card",
        isEmergency && "border-destructive/70 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
      )}
    >
      <Link href={`/report/${report.id}`} passHref className="flex flex-col flex-grow h-full">
        <div className="relative">
          {isEmergency && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-destructive py-1.5 px-3 backdrop-blur-sm">
              <p className="text-xs font-medium text-white flex items-center justify-center font-body">
                <ReportIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                Requiere Atención Urgente
              </p>
            </div>
          )}

          <div className="relative w-full aspect-[3/2] bg-muted overflow-hidden">
            {report.image_url ? (
              <Image
                src={report.image_url}
                alt={`Imagen de ${report.pet_name || report.pet_type}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={isEmergency}
                onError={(e) => { e.currentTarget.src = placeholderImage }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted/80 to-muted">
                <div className="text-center p-4">
                  <ReportIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                  <span className="text-sm text-muted-foreground">Sin imagen disponible</span>
                </div>
              </div>
            )}

            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90",
                        saved ? "text-primary" : "text-muted-foreground",
                      )}
                      onClick={handleSave}
                      aria-label="Guardar reporte"
                    >
                      <BookmarkPlus className={cn("h-4 w-4", saved && "fill-current")} />
                      <span className="sr-only">Guardar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{saved ? "Guardado" : "Guardar reporte"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 text-muted-foreground"
                      onClick={handleShare}
                      aria-label="Compartir reporte"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Compartir</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compartir reporte</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {!isEmergency && (
              <div className="absolute bottom-0 left-0 p-2 z-10">
                <Badge variant={badgeVariant} className="capitalize font-body font-medium text-xs shadow-sm flex items-center rounded-full">
                  <ReportIcon className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                  {label}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-grow min-w-0">
              <h3 className="text-lg font-heading font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {report.pet_name || report.pet_type || "Reporte"}
              </h3>
              <p className="text-sm text-muted-foreground capitalize line-clamp-1 font-body">
                {(report.pet_name && report.pet_type !== report.pet_name) ? report.pet_type : ''}
                {report.pet_breed ? `${(report.pet_name && report.pet_type !== report.pet_name) ? ' - ' : ''}${report.pet_breed}` : ''}
                {!(report.pet_type || report.pet_breed) ? 'Detalles no especificados' : ''}
              </p>
            </div>

            {report.status && (
              <Badge variant="outline" className={cn("text-xs font-medium flex-shrink-0 ml-2 rounded-full", statusConfig.color)}>
                {statusConfig.text}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 py-2 flex-grow">
          <p className="text-sm text-foreground/90 line-clamp-2 mb-3 font-body">
            {report.description || "Sin descripción disponible."}
          </p>

          <div className="space-y-2 text-xs text-muted-foreground font-body">
            {(report.location_description || resolvedLocation) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/70 mt-0.5" />
                <span className="line-clamp-2">{report.location_description || resolvedLocation}</span>
              </div>
            )}

            {mounted && timeAgo && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
                <span>{`Reportado ${timeAgo}`}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t border-border/40 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-xs font-body font-medium group-hover:text-primary transition-colors h-auto py-1 px-2"
            tabIndex={-1}
            aria-hidden="true"
          >
            Ver detalles
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}