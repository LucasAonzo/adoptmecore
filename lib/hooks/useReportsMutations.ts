import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createReport,
  updateReport,
  resolveReport,
  type Report,
  type ReportStatus
} from '@/lib/services/reports';
// Eliminar la importación incorrecta de useSupabase
// import { useSupabase } from '@/lib/providers/SupabaseProvider';
import { useAuth } from '@/lib/providers/AuthProvider'; // Hook que provee supabase y user
import { type ReportSubmitData } from '@/lib/schemas/reportSchema';

// Tipamos explícitamente las variables de la mutación para claridad
interface CreateReportVariables {
  reportData: ReportSubmitData;
  imageFile?: File;
}

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  // Obtener cliente Supabase Y usuario actual desde useAuth
  const { supabase, user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ reportData, imageFile }: CreateReportVariables) => {
      // Verificar si supabase existe (importante si el provider aún no lo ha inicializado)
      if (!supabase) throw new Error('Supabase client is not available');
      // user ya está disponible desde el contexto del hook

      const createdReport = await createReport(supabase, user, reportData, imageFile);

      if (!createdReport) {
        throw new Error('Error al crear el reporte. Inténtalo de nuevo.');
      }
      return createdReport;
    },
    onSuccess: (data) => {
      toast.success(`Reporte "${data.pet_name || 'sin nombre'}" creado con éxito!`);

      // Invalidar queries relevantes para que se recarguen
      // Por ejemplo, la query que obtiene la lista de reportes
      // Asumiendo que la queryKey para getReports es algo como ['reports', filters]
      // Necesitamos una forma más robusta de invalidar o ser más específicos si es posible
      queryClient.invalidateQueries({ queryKey: ['reports'] });

      // Podríamos redirigir al usuario o resetear el formulario aquí si es necesario
      // Ejemplo: router.push(`/report/${data.id}`);
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast.error(error.message || 'Ocurrió un error inesperado al crear el reporte.');
    },
  });

  return mutation; // Devuelve el objeto de mutación completo (mutate, isPending, etc.)
};

// --- Hook para actualizar un Reporte ---

// Interfaz para las variables de la mutación de actualización
interface UpdateReportVariables {
  reportId: string;
  updateData: Partial<Pick<Report, 'status' | 'description' /* u otros campos permitidos */>>;
}

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  const { supabase } = useAuth(); // Solo necesitamos supabase aquí

  return useMutation({
    mutationFn: async ({ reportId, updateData }: UpdateReportVariables) => {
      if (!supabase) throw new Error('Supabase client is not available');

      const updatedReport = await updateReport(supabase, reportId, updateData);

      if (!updatedReport) {
        throw new Error('Error al actualizar el reporte. Inténtalo de nuevo.');
      }
      return updatedReport;
    },
    onSuccess: (data, variables) => {
      // 'data' es el reporte actualizado devuelto por updateReport
      // 'variables' son los datos que se pasaron a mutate ({ reportId, updateData })
      toast.success(`Reporte actualizado con éxito.`);

      // Invalidar la query específica de este reporte para refrescar sus detalles
      queryClient.invalidateQueries({ queryKey: ['reports', 'detail', variables.reportId] });

      // Invalidar también las queries de listas generales para reflejar el cambio (ej. status)
      // Podríamos ser más específicos si tuviéramos los filtros activos aquí,
      // pero invalidar todas las listas es más simple y generalmente aceptable.
      queryClient.invalidateQueries({ queryKey: ['reports', 'list'] });
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast.error(error.message || 'Ocurrió un error inesperado al actualizar el reporte.');
    },
  });
};

// --- NUEVO HOOK para Marcar Reporte como Resuelto usando RPC ---

interface ResolveReportVariables {
  reportId: string;
  userId: string; // Necesitamos el userId para pasarlo a la función RPC
}

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  const { supabase } = useAuth();

  return useMutation<void, Error, ResolveReportVariables>({
    mutationFn: async ({ reportId, userId }) => {
      if (!supabase) throw new Error('Supabase client is not available');
      // Llamar al nuevo servicio que usa RPC
      await resolveReport(supabase, reportId, userId);
    },
    onSuccess: (data, variables) => {
      // data es void en este caso
      toast.success('Reporte marcado como resuelto.');

      // Invalidar queries para refrescar
      queryClient.invalidateQueries({ queryKey: ['reports', 'detail', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'list'] });
    },
    onError: (error) => {
      console.error('Error resolving report via RPC:', error);
      // El mensaje de error puede venir de la EXCEPTION en la función SQL
      toast.error(error.message || 'Ocurrió un error inesperado al marcar como resuelto.');
    },
  });
};

// Podríamos añadir aquí el hook useUpdateReport en el futuro 