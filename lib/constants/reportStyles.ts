import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Search, PawPrint, Heart, HelpCircle } from 'lucide-react';
import type { ReportType } from '@/lib/services/reports'; // Asumiendo que ReportType está en services
import { type VariantProps } from 'class-variance-authority';
import { badgeVariants } from "@/components/ui/badge"; // Importar tipo de variante

// Interfaz para estilos de tipo de reporte
export interface ReportTypeStyle {
  badgeVariant: VariantProps<typeof badgeVariants>['variant'];
  icon: LucideIcon;
  label: string;
  priority?: number; // Añadir prioridad si se usa para ordenar
}

// Objeto constante con los estilos por tipo de reporte
export const reportTypeStyles: Record<string, ReportTypeStyle> = {
  LOST: {
    badgeVariant: 'default',
    icon: Search,
    label: 'Perdido',
    priority: 2,
  },
  FOUND: {
    badgeVariant: 'secondary',
    icon: PawPrint,
    label: 'Encontrado',
    priority: 3,
  },
  EMERGENCY: {
    badgeVariant: 'destructive',
    icon: AlertTriangle,
    label: 'Emergencia',
    priority: 1,
  },
  ADOPTION: {
    badgeVariant: 'outline',
    icon: Heart,
    label: 'Adopción',
    priority: 4,
  },
};

// Estilo por defecto si el tipo no coincide
export const defaultReportStyle: ReportTypeStyle = {
  badgeVariant: 'outline',
  icon: HelpCircle,
  label: 'Reporte',
  priority: 5,
};

// Opcional: Estilos específicos para marcadores (si son diferentes de los iconos de Badge)
// export const markerIcons: Record<ReportType, LucideIcon> = {
//     LOST: Search,
//     FOUND: Check,
//     EMERGENCY: HeartPulse,
// };
// export const defaultMarkerIcon = Search; 