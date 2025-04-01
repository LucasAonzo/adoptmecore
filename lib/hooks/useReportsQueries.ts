import {
  useQuery,
  useInfiniteQuery,
  type QueryFunctionContext,
  type QueryKey,
} from '@tanstack/react-query';

import { getReportById, getReports, type ReportFilters } from '@/lib/services/reports';
import { useAuth } from '@/lib/providers/AuthProvider'; // Hook para obtener supabase

// Query Key Factory
const reportsKeys = {
  all: ['reports'] as const,
  lists: (filters: ReportFilters = {}) => [...reportsKeys.all, 'list', filters] as const,
  list: (filters: ReportFilters = {}) => [...reportsKeys.lists(filters)] as const,
  details: () => [...reportsKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportsKeys.details(), id] as const,
};

/**
 * Hook para obtener los detalles de un reporte específico.
 * @param reportId El ID (UUID) del reporte.
 * @param options Opciones adicionales para useQuery.
 */
export const useReport = (reportId: string, options = {}) => {
  const { supabase } = useAuth();

  return useQuery({
    queryKey: reportsKeys.detail(reportId),
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client is not available');
      if (!reportId) return null; // No buscar si no hay ID

      const report = await getReportById(supabase, reportId);
      if (!report) {
        // Lanzar error para que React Query lo maneje como error
        throw new Error(`Reporte con ID ${reportId} no encontrado.`);
      }
      return report;
    },
    enabled: !!supabase && !!reportId, // Habilitar solo si hay cliente y ID
    staleTime: 1000 * 60 * 5, // Mantener datos frescos por 5 minutos
    ...options, // Permitir sobrescribir opciones
  });
};

/**
 * Hook para obtener la lista paginada de reportes activos con filtros.
 * @param filters Objeto con los filtros a aplicar.
 * @param options Opciones adicionales para useInfiniteQuery.
 */
export const useReports = (filters: ReportFilters = {}, options = {}) => {
  const { supabase } = useAuth();

  return useInfiniteQuery({
    queryKey: reportsKeys.list(filters), // Clave incluye los filtros
    queryFn: async ({ pageParam = 0 }: QueryFunctionContext<QueryKey, number>) => {
      if (!supabase) throw new Error('Supabase client is not available');
      // Llamamos a getReports con la página correspondiente
      const reports = await getReports(supabase, filters, pageParam);
      return reports;
    },
    initialPageParam: 0, // Empezar en la página 0
    getNextPageParam: (lastPage, allPages) => {
      // Si la última página tuvo resultados (asumiendo REPORTS_PAGE_SIZE constante),
      // entonces la siguiente página es la longitud actual de allPages.
      // Si la última página vino vacía o con menos elementos que el tamaño de página,
      // significa que no hay más páginas.
      const reportsPerPage = 10; // Debería coincidir con REPORTS_PAGE_SIZE en services/reports.ts
      return lastPage.length === reportsPerPage ? allPages.length : undefined;
    },
    enabled: !!supabase, // Habilitar solo si el cliente Supabase está listo
    staleTime: 1000 * 60 * 2, // Mantener datos frescos por 2 minutos
    ...options,
  });
}; 