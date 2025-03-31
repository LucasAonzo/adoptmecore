'use client'; // Necesario para usar hooks de cliente (usePets)

import React from 'react';
import { usePets } from '@/lib/hooks/usePets';
import PetCard from '@/components/PetCard'; // Importar PetCard
import { Skeleton } from '@/components/ui/skeleton'; // Para el estado de carga
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Para errores
import { Terminal } from 'lucide-react'; // Icono para alerta
import { type Pet } from '@/lib/services/pets'; // Importar tipo Pet

export default function PetsPage() {
  // Tipar explícitamente data para mejor DX
  const { data: pets, isLoading, isError, error } = usePets() as { data: Pet[] | undefined | null; isLoading: boolean; isError: boolean; error: Error | null };

  if (isLoading) {
    // Mostrar esqueletos de carga mientras los datos se obtienen
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[180px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    // Mostrar mensaje de error
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error al cargar mascotas</AlertTitle>
        <AlertDescription>
          {error?.message || "Ocurrió un error inesperado. Inténtalo de nuevo más tarde."}
        </AlertDescription>
      </Alert>
    );
  }

  // Si hay datos y no hay error/carga
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mascotas en Adopción</h1>

      {pets && pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Usar el componente PetCard */} 
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <p>No hay mascotas disponibles en este momento.</p>
      )}
    </div>
  );
} 