import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, HelpCircle, HeartPulse, Search, Check } from 'lucide-react';
import type { ReportType } from '@/lib/services/reports'; // Asumiendo que ReportType está en services
import { type VariantProps } from 'class-variance-authority';
import { badgeVariants } from "@/components/ui/badge"; // Importar tipo de variante

// Interfaz para estilos de tipo de reporte
export interface ReportTypeStyle {
  // Inferir el tipo de la variante usando VariantProps
  badgeVariant: VariantProps<typeof badgeVariants>['variant'];
  icon: LucideIcon;
  label: string;
  markerColor?: string; // Añadir color para marcador de mapa opcionalmente
}

// Objeto constante con los estilos por tipo de reporte
export const reportTypeStyles: Record<ReportType, ReportTypeStyle> = {
  LOST: {
    badgeVariant: 'destructive',
    icon: HelpCircle, // Cambiado de AlertTriangle a HelpCircle para 'Perdido'?
    label: 'Perdido',
    markerColor: '#EF4444' // red-500
  },
  FOUND: {
    badgeVariant: 'secondary',
    icon: CheckCircle,
    label: 'Encontrado',
    markerColor: '#3B82F6' // blue-500
  },
  EMERGENCY: {
    badgeVariant: 'destructive',
    icon: AlertTriangle, // Mantenido AlertTriangle para Urgencia
    label: 'Urgencia',
    markerColor: '#F97316' // orange-500
  },
};

// Estilo por defecto si el tipo no coincide
export const defaultReportStyle: ReportTypeStyle = {
  badgeVariant: 'outline',
  icon: HelpCircle,
  label: 'Desconocido',
  markerColor: '#6B7280' // gray-500
};

// Opcional: Estilos específicos para marcadores (si son diferentes de los iconos de Badge)
export const markerIcons: Record<ReportType, LucideIcon> = {
    LOST: Search,
    FOUND: Check,
    EMERGENCY: HeartPulse,
};

export const defaultMarkerIcon = Search; 