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
// Quitar importaciones de iconos si ya no se usan directamente aquí
// import { MapPin, Clock, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
// Importar los estilos y constantes desde el nuevo archivo
import { reportTypeStyles, defaultReportStyle } from '@/lib/constants/reportStyles';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const timeAgo = formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es });
  // Usar los estilos importados
  const { badgeVariant, icon: Icon, label } = reportTypeStyles[report.report_type] || defaultReportStyle;

  // Determinar borde basado en el tipo (usando report.report_type)
  const cardBorderClass = cn(
    "border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-card",
    {
        'border-destructive border-2': report.report_type === 'EMERGENCY' // Mantener lógica de borde
    }
  );

  return (
    <Link href={`/report/${report.id}`} passHref legacyBehavior>
      <a className="block hover:shadow-lg transition-shadow duration-200 ease-in-out h-full">
        <Card className={cardBorderClass}>
          {/* Banner de Urgencia */}
          {report.report_type === 'EMERGENCY' && (
            <div className="bg-destructive/10 px-4 py-1 text-center">
              <p className="text-xs font-medium text-destructive flex items-center justify-center">
                <Icon className="h-4 w-4 mr-1 animate-pulse" />
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