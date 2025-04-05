'use client'; // Marcar como Client Component

import React, { useState, useEffect } from 'react';
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
import { Terminal, Loader2, MessageCircle, Calendar, MapPin, Info, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'; // <-- Añadir iconos
import DeletePetButton from '@/components/DeletePetButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RequestAdoptionButton from '@/components/RequestAdoptionButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Add Tabs
import { Separator } from "@/components/ui/separator"; // Add Separator

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

// --- New Content Component --- 
function PetDetailPageContent() {
  const params = useParams();
  const petId = params.petId as string;
  const router = useRouter();

  // State for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { session, user, isLoading: isLoadingAuth } = useAuth();
  const userId = user?.id;
  const { data: pet, isLoading: isLoadingPet, isError, error } = usePetById(petId);
  const { mutate: startChatMutate, isPending: isStartingChat } = useCreateOrGetPetConversation();

  // --- Scroll to top on mount/pet change --- 
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [petId]);
  // ------------------------------------------

  const isLoading = isLoadingAuth || isLoadingPet;

  // --- Conditional Rendering (Loading State - Example Structure) ---
  if (isLoading) {
    return (
      // Use example loading structure
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          {/* Back button skeleton */}
          <Skeleton className="h-10 w-24" /> 
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg">
              <Skeleton className="h-80 w-full" />
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Characteristics Card Skeleton */}
            <Card>
              <CardHeader className="p-6 pb-4">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
             {/* Actions Card Skeleton */}
            <Card>
               <CardHeader className="p-6 pb-4">
                 <Skeleton className="h-8 w-32" />
               </CardHeader>
               <CardContent className="p-6 pt-0">
                 <Skeleton className="h-10 w-full" />
               </CardContent>
             </Card>
          </div>
          {/* Right Column Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-6 pb-4">
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Skeleton className="h-8 w-full mb-6" /> {/* Tabs Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32 mb-3" /> {/* Title Skeleton */}
                  <Skeleton className="h-20 w-full" /> {/* Description Skeleton */}
                  <Separator className="my-6" />
                  <Skeleton className="h-16 w-full" /> {/* Details Grid Skeleton */}
                </div>
              </CardContent>
            </Card>
             {/* Similar Pets Skeleton */}
            <Card>
              <CardHeader className="p-6 pb-4">
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                 <Skeleton className="h-24 w-full" />
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- Conditional Rendering (Error/Not Found - Example Structure) --- 
  if (isError || (!isLoading && !pet)) {
    if (isError) {
      return (
        <div className="container mx-auto p-4 max-w-3xl my-12">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error al cargar mascota</AlertTitle>
            <AlertDescription>{error?.message || "No se pudo cargar la información de la mascota."}</AlertDescription>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              {/* Link back to a relevant page, e.g., /pets or / */}
              <Link href="/pets">Volver a mascotas</Link> 
            </Button>
          </div>
        </div>
      );
    }
    notFound();
  }

  // Assertion: pet exists here
  if (!pet) {
    return null;
  }

  // --- Gallery Logic --- 
  // Use primary_image_url from pet data, assume gallery_images doesn't exist in current type
  const allImages = [pet.primary_image_url ?? placeholderImage].filter(Boolean);
  const currentImage = allImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  // --- End Gallery Logic ---

  // --- Keep existing permission/chat logic --- 
  const isOwner = userId && pet.added_by_user_id === userId;
  const canChat = !!user && !isOwner;
  // Keep original adoption logic if needed
  const canRequestAdoption = !!session && !isOwner && pet.status === 'available'; 

  const handleStartChat = () => {
    if (!petId) return;
    startChatMutate({ petId });
  };
  // --- End Permission/Chat Logic ---

  // --- Helper Functions (from example, adapted) --- 
  const getAgeText = () => {
    // Use age_years and age_months from pet data
    if (pet.age_years === null && pet.age_months === null) return "Edad desconocida";
    const parts = [];
    if (pet.age_years !== null && pet.age_years !== undefined) parts.push(`${pet.age_years} ${pet.age_years === 1 ? "año" : "años"}`);
    if (pet.age_months !== null && pet.age_months !== undefined) parts.push(`${pet.age_months} ${pet.age_months === 1 ? "mes" : "meses"}`);
    return parts.join(" y ") || "Recién nacido"; // Add fallback for 0 years/months
  };

  const getStatusBadgeVariant = () => {
    switch (pet.status) {
      case "available": return "default";
      case "adopted": return "secondary";
      // Add other statuses if they exist in your DB enum
      // case "pending": return "warning"; 
      // case "foster": return "outline";
      default: return "secondary";
    }
  };

  const getStatusText = () => {
    switch (pet.status) {
      case "available": return "Disponible";
      case "adopted": return "Adoptado";
       // Add other statuses if they exist
      // case "pending": return "En proceso";
      // case "foster": return "En acogida";
      default: return pet.status || "Desconocido"; // Handle null/undefined status
    }
  };
  // --- End Helper Functions ---

  // --- Main Return Statement (Example Structure) --- 
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Gallery Card */}
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="relative h-80 w-full bg-muted">
              <Image
                src={currentImage} // Use state variable
                alt={`Foto de ${pet.name}`}
                fill
                style={{ objectFit: "cover" }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="transition-all duration-300"
              />
              {/* Gallery Controls (only if more than 1 image) */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {/* Position Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {allImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-background/60"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant={getStatusBadgeVariant()} className="text-sm py-1 px-3">
                  {getStatusText()}
                </Badge>
              </div>
            </div>
            {/* Quick Info Below Image */}
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getAgeText()}</span>
                </div>
                {/* Omit location text as it's not in DB */} 
                {/* <div className="flex items-center gap-2"> ... </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Characteristics Card - OMITTED as boolean fields not in DB */}
          {/* <Card> ... </Card> */}

          {/* Actions Card */}
          <Card>
             <CardHeader className="p-6 pb-4">
              <h2 className="text-xl font-semibold">Acciones</h2>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {/* Adoption Button (Keep original logic if needed) */}
              {/* {canRequestAdoption && ( ... )} */}
              
              {/* Chat Button (Use original logic) */} 
              {canChat ? (
                <Button
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                  className="w-full"
                  // Adjust variant based on whether adoption button is present 
                  // variant={canRequestAdoption ? "outline" : "default"} 
                   variant={"default"} // Defaulting to primary if adoption isn't shown
                >
                  {isStartingChat ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando chat...</>
                  ) : (
                    <><MessageCircle className="mr-2 h-4 w-4" /> Contactar por Chat</>
                  )}
                </Button>
              ) : (
                // Show login prompt only if not owner and not logged in
                !isOwner && !user && (
                   <Button asChild variant="outline" className="w-full">
                     <Link href="/login">Inicia sesión para contactar</Link>
                   </Button>
                 )
              )}
              
              {/* Owner Actions (Use original logic) */}
              {isOwner && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t mt-4"> {/* Add separator */} 
                  <Link href={`/pets/${pet.id}/edit`} passHref className="col-span-1">
                    <Button variant="outline" className="w-full">Editar</Button>
                  </Link>
                  <div className="col-span-1">
                    <DeletePetButton petId={pet.id} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - MODIFIED */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="p-6 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-bold">{pet.name}</CardTitle>
                <CardDescription className="text-lg capitalize">
                  {/* Use original logic for subtitle */}
                   {pet.breed || 'Raza no especificada'} - {pet.species || 'Especie no especificada'}
                </CardDescription>
              </div>
            </CardHeader>
            {/* --- Modified CardContent: Removed Tabs --- */}
            <CardContent className="p-6 pt-0">
              {/* Section 1: Description */}
              <div className="mb-8"> {/* Add bottom margin */} 
                 <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                 <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                   {pet.description || "No hay descripción disponible para esta mascota."}
                 </p>
              </div>

              <Separator className="my-8" /> {/* Separator */} 

              {/* Section 2: Pet Details Grid */}
              <div className="mb-8"> {/* Add bottom margin */} 
                  <h2 className="text-xl font-semibold mb-4">Detalles</h2> {/* Title for this section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Especie</h3>
                          <p className="capitalize">{pet.species || "No especificada"}</p>
                      </div>
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Raza</h3>
                          <p className="capitalize">{pet.breed || "No especificada"}</p>
                      </div>
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Edad</h3>
                          <p>{getAgeText()}</p>
                      </div>
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Género</h3>
                          <p className="capitalize">{pet.gender || "No especificado"}</p>
                      </div>
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Tamaño</h3>
                          <p className="capitalize">{pet.size || "No especificado"}</p>
                      </div>
                  </div>
              </div>

              <Separator className="my-8" /> {/* Separator */} 

              {/* Section 3: Additional Info */}
              <div>
                  <h2 className="text-xl font-semibold mb-4">Información adicional</h2> {/* Title for this section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Fecha de registro</h3>
                          <p>{new Date(pet.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Última actualización</h3>
                          <p>{new Date(pet.updated_at).toLocaleDateString()}</p>
                      </div>
                      {pet.shelter_id && (
                          <div className="col-span-1 sm:col-span-2">
                              <h3 className="text-sm font-medium text-muted-foreground">Refugio Asociado (ID)</h3>
                              <p>{pet.shelter_id}</p> 
                          </div>
                      )}
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Pets Card (Placeholder) */}
          <Card>
            <CardHeader className="p-6 pb-4">
              <h2 className="text-xl font-semibold">Mascotas similares</h2>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {/* Replace with actual similar pets component later */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Próximamente</p>
                    </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Modified Default Export --- 
export default function PetDetailPage() {
  // Render content directly without QueryProvider wrapper for now
  return (
      <PetDetailPageContent />
  );
} 