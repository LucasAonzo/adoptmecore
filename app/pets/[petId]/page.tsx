'use client'; // Marcar como Client Component

import React from 'react';
import { notFound, useParams } from 'next/navigation'; // Importar useParams
import Image from 'next/image';
// import { getPetById } from '@/lib/services/pets'; // Ya no se llama directamente
import { usePetById } from '@/lib/hooks/usePets'; // Usar hook cliente
import { useAuth } from '@/lib/providers/AuthProvider'; // Usar useAuth
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Para estado de carga
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Para error
import { Terminal } from 'lucide-react';
import DeletePetButton from '@/components/DeletePetButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RequestAdoptionButton from '@/components/RequestAdoptionButton';

const placeholderImage = "/placeholder-pet.svg";

// Ya no necesitamos Props con params, useParams lo maneja
// interface PetDetailPageProps { ... }

// Ya no necesitamos generateMetadata aquí, se podría mover a un archivo dedicado si se quisiera RSC metadata
// export async function generateMetadata({ params }: PetDetailPageProps): Promise<Metadata> { ... }

export default function PetDetailPage(/* { params }: PetDetailPageProps */) {
  const params = useParams(); // Obtener params con hook
  const petId = params.petId as string; // Asumir que siempre estará como string

  // Obtener datos de autenticación
  const { session, user, isLoading: isLoadingAuth } = useAuth();
  const userId = user?.id;

  // Obtener datos de la mascota con el hook cliente
  // El hook internamente usa useAuth para `enabled` y para pasar el cliente
  const { data: pet, isLoading: isLoadingPet, isError, error } = usePetById(petId);

  const isLoading = isLoadingAuth || isLoadingPet;

  // --- Renderizado condicional --- 

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <Skeleton className="h-64 md:h-96 w-full" />
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
           <CardFooter>
             <Skeleton className="h-10 w-full sm:w-32" />
           </CardFooter>
        </Card>
      </div>
    );
  }

  // Manejo de error o notFound (si el hook devuelve null y no está cargando)
  if (isError || (!isLoading && !pet)) {
      if (isError) {
         return (
             <div className="container mx-auto p-4">
                 <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error al cargar mascota</AlertTitle>
                    <AlertDescription>
                        {error?.message || 'No se pudo cargar la información de la mascota.'}
                    </AlertDescription>
                </Alert>
            </div>
         );
      }
      // Si no hubo error pero pet es null/undefined (y no está cargando)
      notFound();
  }

  // Aserción para TypeScript: Si llegamos aquí, pet existe.
  if (!pet) {
     // Esto no debería ocurrir debido al chequeo anterior, pero satisface al linter.
     return null; // O un estado de error diferente
  }

  // Ahora podemos usar `pet` de forma segura
  const isOwner = userId && pet.added_by_user_id === userId;
  const canRequestAdoption = !!session && !isOwner && pet.status === 'available';

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-96 w-full">
          <Image
            src={pet.primary_image_url ?? placeholderImage}
            alt={`Foto de ${pet.name}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{pet.name}</CardTitle>
          <CardDescription>
            {pet.breed || 'Raza no especificada'} - {pet.species || 'Especie no especificada'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {pet.age_years !== null && <Badge variant="outline">{pet.age_years} años</Badge>}
            {pet.age_months !== null && <Badge variant="outline">{pet.age_months} meses</Badge>}
            {pet.gender && <Badge variant="outline">{pet.gender}</Badge>}
            {pet.size && <Badge variant="outline">Tamaño: {pet.size}</Badge>}
            <Badge variant={pet.status === 'available' ? 'default' : 'secondary'}>
              {pet.status === 'available' ? 'Disponible' : pet.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {pet.description || 'No hay descripción disponible.'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto">
            <RequestAdoptionButton
                petId={pet.id}
                shelterId={pet.shelter_id}
                isUserLoggedIn={!!session} // Pasar boolean
                canRequest={canRequestAdoption}
            />
          </div>
          {isOwner && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href={`/pets/${pet.id}/edit`} passHref className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full">Editar</Button>
              </Link>
              <div className="flex-1 sm:flex-none">
                 <DeletePetButton petId={pet.id} />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 