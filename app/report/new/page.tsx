import React from 'react';
import { ReportForm } from '@/components/forms/ReportForm';

// TODO: Importar y renderizar el componente ReportForm
// import ReportForm from '@/components/forms/ReportForm';

export default function NewReportPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Reporte</h1>
      <p className="mb-6">
        Utiliza este formulario para reportar una mascota perdida, encontrada o
        una situación de emergencia. Asegúrate de proporcionar información clara y precisa.
      </p>
      {/* Renderizar el componente del formulario */}
      <div className="max-w-2xl mx-auto">
         <ReportForm />
      </div>
    </main>
  );
} 