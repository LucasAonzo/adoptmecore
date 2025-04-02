'use client'; // Marcar como Client Component

import React from 'react';
import { notFound, useParams, useRouter } from 'next/navigation'; // Importar useRouter
import Image from 'next/image';
// import { getPetById } from '@/lib/services/pets'; // Ya no se llama directamente
import { usePetById } from '@/lib/hooks/usePets'; // Usar hook cliente
import { useAuth } from '@/lib/providers/AuthProvider'; // Usar useAuth
import { useMutation, useQueryClient } from '@tanstack/react-query'; // <-- Añadir imports mutación
import { createClient } from '@/lib/supabaseClient'; // <-- Añadir cliente
import { toast } from 'sonner'; // <-- Añadir toast
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
import { Terminal, Loader2, MessageCircle } from 'lucide-react'; // <-- Añadir iconos
import DeletePetButton from '@/components/DeletePetButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RequestAdoptionButton from '@/components/RequestAdoptionButton';

const placeholderImage = "/placeholder-pet.svg";

// Ya no necesitamos Props con params, useParams lo maneja
// interface PetDetailPageProps { ... }

// Ya no necesitamos generateMetadata aquí, se podría mover a un archivo dedicado si se quisiera RSC metadata
// export async function generateMetadata({ params }: PetDetailPageProps): Promise<Metadata> { ... }

// --- Hook para llamar a la función RPC create_or_get_pet_conversation ---
function useCreateOrGetPetConversation() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<string, Error, { petId: number | string }>({ // Recibe petId (puede ser string de URL, convertir a number)
    mutationFn: async ({ petId }) => {
       // Convertir petId a número (BIGINT en DB)
       const petIdAsNumber = typeof petId === 'string' ? parseInt(petId, 10) : petId;
       if (isNaN(petIdAsNumber)) {
           throw new Error('ID de mascota inválido.');
       }

      const { data, error } = await supabase.rpc('create_or_get_pet_conversation', {
        p_pet_id: petIdAsNumber, // Pasar como número
      });

      if (error) {
        console.error('Error calling create_or_get_pet_conversation:', error);
        // Mensajes de error específicos
        if (error.message.includes('User cannot start a conversation about their own pet')) {
          throw new Error('No puedes iniciar un chat sobre tu propia mascota.');
        } else if (error.message.includes('Pet not found')) {
          throw new Error('La mascota asociada no fue encontrada.');
        } else if (error.message.includes('User must be authenticated')) {
           throw new Error('Debes iniciar sesión para iniciar un chat.');
        }
        throw new Error(error.message || 'Error al iniciar o encontrar la conversación.');
      }
      
      if (!data) {
        throw new Error('No se recibió ID de conversación desde la función.');
      }

      return data; // Devuelve el conversation_id (UUID como string)
    },
    onSuccess: (conversationId) => {
      toast.success('Redirigiendo al chat...');
      router.push(`/chat/${conversationId}`);
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo iniciar el chat.');
    },
  });
}
// --------------------------------------------------------------------

export default function PetDetailPage(/* { params }: PetDetailPageProps */) {
  const params = useParams(); // Obtener params con hook
  const petId = params.petId as string; // Asumir que siempre estará como string

  // Obtener datos de autenticación
  const { session, user, isLoading: isLoadingAuth } = useAuth();
  const userId = user?.id;

  // Obtener datos de la mascota con el hook cliente
  // El hook internamente usa useAuth para `enabled` y para pasar el cliente
  const { data: pet, isLoading: isLoadingPet, isError, error } = usePetById(petId);

  // --- Usar el hook para el chat --- 
  const { mutate: startChatMutate, isPending: isStartingChat } = useCreateOrGetPetConversation();
  // ----------------------------------

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
  const canChat = !!user && !isOwner; // Condición simple: logueado y no es dueño
  // const canRequestAdoption = !!session && !isOwner && pet.status === 'available'; // Mantener lógica de adopción separada

   // --- Función para iniciar el chat --- 
   const handleStartChat = () => {
     if (!petId) return;
     startChatMutate({ petId }); // Pasar petId a la mutación
   };
   // ----------------------------------

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
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {/* Mantener botón de Adopción si existe lógica */}
            {/* <RequestAdoptionButton
                petId={pet.id}
                shelterId={pet.shelter_id}
                isUserLoggedIn={!!session} 
                canRequest={canRequestAdoption}
            /> */}
            {/* Separador visual o espacio si ambos botones están presentes */}
            {/* {canRequestAdoption && canChat && <div className="h-2"></div>} */} 
            
             {/* --- Botón Iniciar Chat --- */}
             {canChat ? (
               <Button
                 onClick={handleStartChat}
                 disabled={isStartingChat}
                 className='w-full' // Ocupa ancho completo en móvil
               >
                  {isStartingChat ? (
                     <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando chat...</>
                  ) : (
                      <><MessageCircle className="mr-2 h-4 w-4" /> Contactar por Chat</>
                  )}
               </Button>
             ) : (
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  {/* Mensaje si no se puede chatear */}
                  {!user && 'Inicia sesión para contactar por chat.'}
                  {isOwner && 'No puedes iniciar un chat sobre tu propia mascota.'}
                </p>
             )}
              {/* --------------------------- */}
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