import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addPet, deletePet, updatePet, updatePetPrimaryImage, type Pet } from '@/lib/services/pets'
import { type PetSchema } from '@/lib/schemas/petSchema'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation' // Para redirigir
import { useAuth } from '@/lib/providers/AuthProvider'; // Importar useAuth

// Clave base para queries de mascotas (importar o redefinir si es necesario)
const PETS_QUERY_KEY = 'pets';

interface AddPetPayload {
  petData: PetSchema;
  imageFile: File;
}

/**
 * Hook para la mutación de añadir una nueva mascota.
 */
export function useAddPet() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { supabase } = useAuth(); // Obtener supabase del contexto

  return useMutation<unknown, Error, AddPetPayload>({
    mutationFn: ({ petData, imageFile }) => {
      if (!supabase) throw new Error("Supabase client is not available.");
      // Pasar supabase a la función addPet
      return addPet(supabase, petData, imageFile);
    },
    onSuccess: (data) => { 
      toast.success("¡Mascota agregada exitosamente!");
      queryClient.invalidateQueries({ queryKey: [PETS_QUERY_KEY] });
      if (data && typeof data === 'object' && 'id' in data && data.id) {
          router.push(`/pets/${data.id}`);
      } else {
          router.push('/');
      }
    },
    onError: (error) => {
      console.error("Error en mutación addPet:", error);
      toast.error("Error al agregar la mascota", {
        description: error.message || "Ocurrió un error inesperado.",
      });
    },
  });
}

/**
 * Hook para eliminar una mascota.
 */
export function useDeletePet() {
    const queryClient = useQueryClient();
    const { supabase } = useAuth(); // <-- Obtener supabase

    return useMutation<void, Error, string | number>({ // <-- Especificar tipos para claridad
        mutationFn: (petId: string | number) => {
            if (!supabase) throw new Error("Supabase client is not available."); // <-- Chequeo
            return deletePet(supabase, petId); // <-- Pasar supabase
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet', variables] });
            toast.success('Mascota eliminada con éxito.');
        },
        onError: (error) => {
            console.error("Error deleting pet:", error);
            toast.error(`Error al eliminar mascota: ${error.message}`);
        },
    });
}

interface UpdatePetVariables {
    petId: string | number;
    formData: PetSchema; 
    newImageFile?: File; 
}

/**
 * Hook para actualizar una mascota existente (datos y/o imagen).
 */
export function useUpdatePet() {
  const queryClient = useQueryClient();
  const { supabase } = useAuth(); // <-- Obtener supabase

  return useMutation<Pet, Error, UpdatePetVariables>({
    mutationFn: async (variables: UpdatePetVariables) => {
      if (!supabase) throw new Error("Supabase client is not available."); // <-- Chequeo
      const { petId, formData, newImageFile } = variables;

      // 1. Actualizar los datos principales
      const { image, ...petDataToUpdate } = formData;
      const updatedPetData = await updatePet(supabase, petId, petDataToUpdate); // <-- Pasar supabase

      // 2. Actualizar imagen si es necesario
      let finalImageUrl = updatedPetData.primary_image_url;
      if (newImageFile) {
        console.log("Updating primary image...");
        try {
            // Pasar supabase a updatePetPrimaryImage
            finalImageUrl = await updatePetPrimaryImage(supabase, petId, newImageFile, petDataToUpdate.name);
            console.log("Primary image updated successfully.");
        } catch (imageError) {
            console.error("Failed to update primary image:", imageError);
            throw imageError;
        }
      }
      return { ...updatedPetData, primary_image_url: finalImageUrl };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', variables.petId] });
      toast.success(`Mascota "${data.name}" actualizada con éxito.`);
    },
    onError: (error, variables) => {
      console.error(`Error updating pet ${variables.petId}:`, error);
      toast.error(`Error al actualizar mascota: ${error.message}`);
    },
  });
}

// Podríamos añadir aquí hooks useUpdatePet, useDeletePet, etc. 