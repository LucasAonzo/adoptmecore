'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReport } from '@/lib/hooks/useReportsQueries';
import { useUpdateReport } from '@/lib/hooks/useReportsMutations';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ReportForm } from '@/components/forms/ReportForm'; // Asumiendo que el formulario está aquí
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button"; // <-- Añadir importación de Button
import { type ReportSubmitData } from '@/lib/schemas/reportSchema'; // Tipo para datos de formulario
import { toast } from 'sonner';

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  const { user } = useAuth();

  // 1. Obtener datos del reporte actual
  const { data: report, error: reportError, isLoading: isLoadingReport, isError: isReportError } = useReport(reportId);
  
  // 2. Hook para la mutación de actualización
  const { mutate: updateReportMutate, isPending: isUpdating } = useUpdateReport();

  // 3. Función onSubmit para el formulario
  const handleUpdateSubmit = (formData: ReportSubmitData) => {
    if (!report || !user || user.id !== report.reported_by_user_id) {
        toast.error('No tienes permiso para editar este reporte.');
        return;
    }

    // TODO: Mapear formData a los campos que realmente se pueden editar.
    // Por ejemplo, no permitir editar report_type o reported_by_user_id.
    // Podríamos necesitar una versión diferente de ReportSubmitData o filtrar aquí.
    const updateData: Partial<typeof formData> = {
      // Campos permitidos para editar:
      pet_name: formData.pet_name,
      pet_type: formData.pet_type,
      pet_breed: formData.pet_breed,
      description: formData.description,
      location_lat: formData.location_lat,
      location_lon: formData.location_lon,
      location_description: formData.location_description,
      contact_info: formData.contact_info,
      // No incluir: report_type, status, image_url (la imagen se maneja aparte?)
    };

    console.log("Updating report with ID:", reportId, "Data:", updateData);

    updateReportMutate({ reportId, updateData }, {
        onSuccess: () => {
            toast.success('Reporte actualizado correctamente.');
            // Redirigir de vuelta a la página de detalles
            router.push(`/report/${reportId}`);
            // La invalidación de queries la maneja el hook useUpdateReport
        },
        onError: (error) => {
             // El hook ya muestra el error, pero podemos añadir logs si es necesario
            console.error('Error en la mutación de actualización:', error);
        }
    });
  };

  // --- Renderizado Condicional ---

  // Estado de Carga del reporte
  if (isLoadingReport) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">Cargando datos del reporte...</span>
      </div>
    );
  }

  // Estado de Error al cargar el reporte
  if (isReportError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive min-h-[60vh]">
        <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
        <h1 className="text-2xl font-bold mb-4">Error al cargar el reporte</h1>
        <p>{reportError?.message || 'No se pudo encontrar el reporte a editar.'}</p>
      </div>
    );
  }

  // Si no hay reporte o no hay usuario autenticado
  if (!report || !user) {
     return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground min-h-[60vh]">
        <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
        <h1 className="text-2xl font-bold mb-4">Reporte no encontrado o sesión inválida</h1>
        <p>No se puede editar el reporte en este momento.</p>
      </div>
    );
  }

  // Verificar si el usuario es el dueño
  if (user.id !== report.reported_by_user_id) {
       return (
        <div className="container mx-auto px-4 py-8 text-center text-destructive-foreground bg-destructive/80 rounded-lg p-8 min-h-[60vh]">
            <ShieldAlert className="mx-auto h-12 w-12 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
            <p>No tienes permiso para editar este reporte.</p>
            <Button variant="secondary" onClick={() => router.back()} className="mt-6">
                Volver
            </Button>
      </div>
    );
  }

  // Si todo está OK, mostrar el formulario
  return (
    <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Editar Reporte</h1>
        {/* Pasar datos iniciales y la función de submit */}
        {/* Asumimos que ReportForm acepta initialData y onSubmit */}
        {/* También necesita un prop para indicar que es modo 'edit'? */}
        <ReportForm 
            initialData={report} // <-- Pasa los datos actuales
            onSubmit={handleUpdateSubmit} // <-- Pasa la función de actualización
            isSubmitting={isUpdating} // <-- Pasar estado de carga
            submitButtonText="Guardar Cambios" // <-- Texto del botón
            // mode="edit" // <-- Posible prop para diferenciar de crear
        />
    </main>
  );
} 