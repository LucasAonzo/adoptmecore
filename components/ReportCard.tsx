'use client'; // Necesario si usamos hooks como Link o Image de next/image

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato en español

import { type Report, type ReportType } from '@/lib/services/reports'; // Importar también ReportType
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils'; // Para combinar clases
import { AlertTriangle, CheckCircle, HelpCircle, HeartPulse } from 'lucide-react'; // Iconos

interface ReportCardProps {
  report: Report;
}

// Definir un tipo más explícito para los estilos
interface ReportTypeStyle {
  // Usar un tipo literal con los variantes conocidos de Badge
  badgeVariant: 'destructive' | 'secondary' | 'outline' | 'default';
  icon: React.ElementType;
  label: string; // Añadir etiqueta para mostrar
}

// Mapeo de tipos de reporte a estilos
// Usamos ReportType como clave directamente
const reportTypeStyles: Record<ReportType, ReportTypeStyle> = {
  LOST: { badgeVariant: 'destructive', icon: HelpCircle, label: 'Perdido' },
  FOUND: { badgeVariant: 'secondary', icon: CheckCircle, label: 'Encontrado' },
  EMERGENCY: { badgeVariant: 'destructive', icon: AlertTriangle, label: 'Urgencia' },
};

const defaultReportStyle: ReportTypeStyle = { badgeVariant: 'outline', icon: HelpCircle, label: 'Desconocido' };

export function ReportCard({ report }: ReportCardProps) {
  const { badgeVariant, icon: Icon, label } = reportTypeStyles[report.report_type] || defaultReportStyle;

  // Parsear la fecha y formatearla de forma segura
  let timeAgo = 'Fecha desconocida';
  if (report.created_at) {
    try {
      const dateObject = parseISO(report.created_at); // Intentar parsear el string ISO
      if (isValid(dateObject)) { // Verificar si la fecha es válida
        timeAgo = formatDistanceToNow(dateObject, { addSuffix: true, locale: es });
      } else {
        console.warn(`Invalid date format received for report ${report.id}:`, report.created_at);
      }
    } catch (error) {
        console.error(`Error parsing date for report ${report.id}:`, report.created_at, error);
    }
  }

  return (
    <Link href={`/report/${report.id}`} passHref legacyBehavior>
      <a className="block hover:shadow-lg transition-shadow duration-200 ease-in-out h-full">
        <Card className={cn("overflow-hidden h-full flex flex-col", {
          'border-destructive border-2': report.report_type === 'EMERGENCY'
        })}>
          {/* Banner de Urgencia */}
          {report.report_type === 'EMERGENCY' && (
            <div className="bg-destructive/10 px-4 py-1 text-center">
              <p className="text-xs font-medium text-destructive flex items-center justify-center">
                <HeartPulse className="h-4 w-4 mr-1 animate-pulse" />
                Requiere Atención Urgente
              </p>
            </div>
          )}
          {/* Imagen (Opcional) */}
          {report.image_url ? (
            <div className="relative w-full h-48 bg-muted"> {/* Placeholder background */}
              <Image
                src={report.image_url}
                alt={`Imagen de ${report.pet_name || report.pet_type}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                // Considerar añadir un placeholder de baja calidad (blurDataURL)
                // placeholder="blur"
                // blurDataURL="data:image/png;base64,..."
              />
            </div>
          ) : (
             <div className="relative w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
               <span>Sin imagen</span>
             </div>
          )}

          <CardHeader>
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-1">
                    {/* Mostrar tipo de animal si no hay nombre */}
                    {report.pet_name || report.pet_type}
                </CardTitle>
                <Badge variant={badgeVariant} className="flex-shrink-0 capitalize">
                    <Icon className="mr-1 h-4 w-4" />
                    {label} {/* Usar la etiqueta definida */}
                </Badge>
            </div>
            {/* Mostrar nombre solo si existe y es diferente al título principal */}
            {report.pet_name && report.pet_name !== report.pet_type && (
                 <CardDescription className="text-sm text-muted-foreground capitalize">
                    {report.pet_type} {report.pet_breed ? `- ${report.pet_breed}` : ''}
                 </CardDescription>
            )}
            {/* Si no hay nombre, mostrar raza directamente si existe */}
            {!report.pet_name && report.pet_breed && (
                 <CardDescription className="text-sm text-muted-foreground capitalize">
                    {report.pet_breed}
                 </CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex-grow pb-3">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {report.description}
            </p>
          </CardContent>

          <CardFooter className="pt-0 text-xs text-muted-foreground">
            <p>Reportado {timeAgo}</p>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
} 