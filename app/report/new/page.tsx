'use client'; // Necesario para hooks como useLoadScript

import React from 'react';
// Corregido: Importar ReportFormData desde el schema
import { ReportForm } from '@/components/forms/ReportForm'; 
import { type ReportFormData } from '@/lib/schemas/reportSchema'; 
import { useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react'; // Para el spinner

// Definir las librerías de Google Maps necesarias - Corregido tipo
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

// TODO: Importar y renderizar el componente ReportForm
// import ReportForm from '@/components/forms/ReportForm';

export default function NewReportPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', // Reemplaza con tu variable de entorno
    libraries,
  });

  // Placeholder para la función onSubmit - Corregido tipo
  const handleReportSubmit = (values: ReportFormData) => {
    console.log("Formulario enviado:", values);
    // Aquí iría la lógica para enviar los datos (ej. mutación de React Query)
    alert("Formulario enviado (ver consola)"); // Feedback temporal
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
           // Pasar la función onSubmit al formulario
           <ReportForm onSubmit={handleReportSubmit} />
        )}
      </div>
    </main>
  );
} 