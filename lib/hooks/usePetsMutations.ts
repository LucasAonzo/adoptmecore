import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addPet, deletePet, updatePet, updatePetPrimaryImage } from '@/lib/services/pets'
import { type PetSchema } from '@/lib/schemas/petSchema'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation' // Para redirigir

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

  return useMutation<unknown, Error, AddPetPayload>({
    // La función que se ejecutará al llamar a la mutación
    mutationFn: ({ petData, imageFile }) => addPet(petData, imageFile),

    // Acciones a realizar cuando la mutación sea exitosa
    onSuccess: (data) => { // data es lo que devuelve addPet (la nueva mascota)
      toast.success("¡Mascota agregada exitosamente!");

      // Invalidar la query de la lista de mascotas para que se actualice
      // Invalida todas las queries que empiezan con [PETS_QUERY_KEY]
      queryClient.invalidateQueries({ queryKey: [PETS_QUERY_KEY] });

      // Opcional: Pre-popular la caché de la query de detalle para esta nueva mascota
      // if (data && typeof data === 'object' && 'id' in data) {
      //   queryClient.setQueryData([PETS_QUERY_KEY, 'detail', data.id], data);
      // }

      // Redirigir a la página de la mascota recién creada o a la lista
      // Asumiendo que `data` contiene el objeto de la mascota con su `id`
      if (data && typeof data === 'object' && 'id' in data && data.id) {
          router.push(`/pets/${data.id}`);
      } else {
          router.push('/'); // Fallback a la home si no podemos obtener el ID
      }
    },

    // Acciones a realizar si la mutación falla
    onError: (error) => {
      console.error("Error en mutación addPet:", error);
      toast.error("Error al agregar la mascota", {
        description: error.message || "Ocurrió un error inesperado.",
      });
    },

    // Opcional: Acciones al iniciar la mutación (ej: mostrar un toast)
    // onMutate: (variables) => {
    //   toast.info("Agregando mascota...");
    // },
  });
}

/**
 * Hook para eliminar una mascota.
 */
export function useDeletePet() {
    const queryClient = useQueryClient();

    return useMutation({ // Especificar tipo del argumento (petId)
        mutationFn: (petId: string | number) => deletePet(petId),
        onSuccess: (data, variables) => {
            // Invalidar la query de la lista de mascotas
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            // Opcionalmente, invalidar la query específica de esta mascota si todavía existe
            queryClient.invalidateQueries({ queryKey: ['pet', variables] });
            // Podríamos también removerla directamente del caché:
            // queryClient.removeQueries({ queryKey: ['pet', variables] });
            toast.success('Mascota eliminada con éxito.');
            // Aquí podríamos añadir lógica de redirección si estamos en la página de detalle
        },
        onError: (error) => {
            console.error("Error deleting pet:", error);
            toast.error(`Error al eliminar mascota: ${error.message}`);
        },
    });
}

/**
 * Hook para actualizar una mascota existente (datos y/o imagen).
 */
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    // La función de mutación recibe el ID, los datos del formulario, y opcionalmente el nuevo archivo de imagen
    mutationFn: async (variables: {
      petId: string | number;
      formData: PetSchema; // Datos validados del formulario
      newImageFile?: File; // Archivo opcional para la nueva imagen
    }) => {
      const { petId, formData, newImageFile } = variables;

      // 1. Actualizar los datos principales de la mascota
      // Excluir el campo 'image' del formData ya que lo manejamos por separado
      const { image, ...petDataToUpdate } = formData;
      const updatedPetData = await updatePet(petId, petDataToUpdate);

      // 2. Si se proporcionó una nueva imagen, actualizarla
      let finalImageUrl = updatedPetData.primary_image_url; // Usar URL existente por defecto
      if (newImageFile) {
        console.log("Updating primary image...");
        try {
            finalImageUrl = await updatePetPrimaryImage(petId, newImageFile, petDataToUpdate.name);
            console.log("Primary image updated successfully.");
        } catch (imageError) {
            console.error("Failed to update primary image:", imageError);
            // Lanzar el error para que onError de la mutación lo capture
            throw imageError;
        }
      }

      // Devolver los datos actualizados (con la URL de imagen potencialmente nueva)
      return { ...updatedPetData, primary_image_url: finalImageUrl };
    },

    onSuccess: (data, variables) => {
      // Invalidar tanto la lista general como la entrada específica de esta mascota
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', variables.petId] });
      toast.success(`Mascota "${data.name}" actualizada con éxito.`);
      // Podríamos navegar a la página de detalles actualizada aquí
    },
    onError: (error, variables) => {
      console.error(`Error updating pet ${variables.petId}:`, error);
      toast.error(`Error al actualizar mascota: ${error.message}`);
    },
  });
}

// Podríamos añadir aquí hooks useUpdatePet, useDeletePet, etc. 