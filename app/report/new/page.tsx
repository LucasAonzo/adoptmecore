'use client'; // Necesario para hooks como useLoadScript

import React from 'react';
// Corregir imports de tipos y componentes
import { ReportForm } from '@/components/forms/ReportForm'; 
import { type ReportFormData, type ReportSubmitData } from '@/lib/schemas/reportSchema'; 
import { useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react'; // Para el spinner
// Importar el hook de mutación
import { useCreateReport } from '@/lib/hooks/useReportsMutations';
import { useRouter } from 'next/navigation'; // Importar useRouter
import { type Report } from '@/lib/services/reports'; // Importar tipo Report para onSuccess

// Definir las librerías de Google Maps necesarias - Corregido tipo
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

// TODO: Importar y renderizar el componente ReportForm
// import ReportForm from '@/components/forms/ReportForm';

export default function NewReportPage() {
  const router = useRouter(); // Obtener instancia del router
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', // Reemplaza con tu variable de entorno
    libraries,
  });

  // Obtener la función de mutación y el estado pendiente
  const { mutate: createReportMutate, isPending: isSubmittingReport } = useCreateReport();

  // Función onSubmit que llama a la mutación
  const handleReportSubmit = (values: ReportFormData) => {
    console.log("Intentando enviar formulario:", values);
    
    // Separar imageFile del resto de los datos
    const { imageFile, ...reportDataValues } = values;

    // Asegurarse de que reportDataValues cumple con ReportSubmitData (puede requerir ajustes)
    // Por ahora, asumimos una conversión directa. Si hay campos extra/faltantes, ajustar aquí.
    const reportData: ReportSubmitData = reportDataValues as ReportSubmitData; 
    
    console.log("Datos para mutación:", { reportData, imageFile });

    // Llamar a la mutación
    createReportMutate(
      { reportData, imageFile }, 
      {
        // Añadir callback onSuccess para redirección
        onSuccess: (createdReport: Report) => {
          // La mutación base ya muestra el toast de éxito
          // Redirigir a la página de detalles del reporte creado
          console.log('Reporte creado con ID:', createdReport.id, 'Redirigiendo...');
          router.push(`/report/${createdReport.id}`);
        },
        // onError ya es manejado por el hook useCreateReport (muestra toast)
      }
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Reporte</h1>
      <p className="mb-6">
        Utiliza este formulario para reportar una mascota perdida, encontrada o
        una situación de emergencia. Asegúrate de proporcionar información clara y precisa.
      </p>
      
      <div className="max-w-2xl mx-auto">
        {/* Mostrar estado de carga o error */}
        {!isLoaded && (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin mr-2" /> Cargando mapa...
          </div>
        )}

        {loadError && (
          <div className="text-red-600 p-4 border border-red-300 rounded-md">
            Error al cargar Google Maps: {loadError.message}. Asegúrate de que la API Key sea correcta y tenga la Places API habilitada.
          </div>
        )}

        {/* Renderizar el formulario SOLO cuando el script esté cargado y no haya error */}
        {isLoaded && !loadError && (
           // Pasar la función onSubmit y el estado isSubmitting
           <ReportForm 
             onSubmit={handleReportSubmit} 
             isSubmitting={isSubmittingReport} 
             submitButtonText="Crear Reporte" // Texto explícito para claridad
           />
        )}
      </div>
    </main>
  );
} 