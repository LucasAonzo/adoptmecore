import { createClient as createBrowserClient } from "../supabaseClient"; // Renombrar import para claridad
import type { SupabaseClient } from '@supabase/supabase-js'; // Importar tipo
import { type PetSchema } from '../schemas/petSchema'; // Importar tipo del schema

// // Crear una instancia del cliente para usar en este módulo (ELIMINADO)
// const supabase = createBrowserClient();

// Tipo Pet actualizado para reflejar el alias de la imagen
export interface Pet {
    id: number;
    shelter_id: number | null;
    name: string;
    species: string | null;
    breed: string | null;
    age_years: number | null;
    age_months: number | null;
    gender: string | null;
    size: string | null;
    description: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    added_by_user_id: string | null;
    // El select ahora devolverá un array para pet_images
    pet_images?: { image_url: string }[] | null;
    // Mantenemos el campo aplanado para los componentes
    primary_image_url?: string | null;
}

/**
 * Defines the age ranges for filtering.
 */
const ageFilterRanges = {
  puppy: { min: 0, max: 0 }, // age_years = 0
  young: { min: 1, max: 2 }, // age_years >= 1 AND age_years <= 2 (equivalent to < 3)
  adult: { min: 3, max: 6 }, // age_years >= 3 AND age_years <= 6 (equivalent to < 7)
  senior: { min: 7, max: null }, // age_years >= 7
};
type AgeCategory = keyof typeof ageFilterRanges;

/**
 * Obtiene las mascotas, opcionalmente filtradas por búsqueda y otros criterios.
 * @param supabase - Instancia del cliente Supabase.
 * @param searchTerm - Término opcional para buscar.
 * @param species - Especie opcional para filtrar.
 * @param gender - Género opcional para filtrar.
 * @param size - Tamaño opcional para filtrar.
 * @param ageCategory - Categoría de edad opcional para filtrar ('puppy', 'young', 'adult', 'senior').
 * @param page - Número de página para paginación.
 * @param limit - Número de elementos por página.
 */
export async function getPets(
    supabase: SupabaseClient,
    searchTerm?: string,
    species?: string,
    gender?: string,
    size?: string,
    ageCategory?: string,
    page: number = 1, 
    limit: number = 12 
): Promise<{ data: Pet[], count: number | null }> { 

  const pageNum = Math.max(1, page);
  const limitNum = Math.max(1, limit);
  const rangeFrom = (pageNum - 1) * limitNum;
  const rangeTo = rangeFrom + limitNum - 1;

  let query = supabase
    .from('pets')
    .select(`
      *,
      pet_images ( image_url )
    `, { count: 'exact' });

  // Apply search filter
  if (searchTerm && searchTerm.trim() !== '') {
    const cleanedSearchTerm = searchTerm.trim();
    console.log('Applying search filter: ', cleanedSearchTerm);
    query = query.or(`name.ilike.%${cleanedSearchTerm}%,description.ilike.%${cleanedSearchTerm}%,breed.ilike.%${cleanedSearchTerm}%`);
  }

  // Apply exact filters
  if (species && species !== '') {
      console.log('Applying species filter: ', species);
      query = query.eq('species', species);
  }
  if (gender && gender !== '') {
      console.log('Applying gender filter: ', gender);
      query = query.eq('gender', gender);
  }
  if (size && size !== '') {
      console.log('Applying size filter: ', size);
      query = query.eq('size', size);
  }

  // Apply age filter based on age_years
  if (ageCategory && ageFilterRanges[ageCategory as AgeCategory]) {
      console.log('Applying age filter: ', ageCategory);
      const range = ageFilterRanges[ageCategory as AgeCategory];
      
      if (ageCategory === 'puppy') {
        query = query.eq('age_years', 0);
      } else {
        if (range.min !== null) {
            query = query.gte('age_years', range.min);
        }
        if (range.max !== null) {
            query = query.lte('age_years', range.max); 
        }
      }
  } else if (ageCategory) {
      console.warn('Invalid ageCategory provided:', ageCategory);
  }

  query = query.order('created_at', { ascending: false });
  query = query.range(rangeFrom, rangeTo);

  console.log(`Executing query with pagination: page=${pageNum}, limit=${limitNum}, range=(${rangeFrom}-${rangeTo})`);
  const { data, error, count } = await query;

   if (error) {
    console.error("Error fetching pets:", JSON.stringify(error, null, 2)); 
    throw new Error(error.message || JSON.stringify(error));
  }

  const petsWithImages = data?.map(pet => {
       const typedPet = pet as Pet;
       const primaryImageUrl = typedPet.pet_images?.[0]?.image_url || null;
       return {
           ...typedPet,
           pet_images: undefined,
           primary_image_url: primaryImageUrl,
       } as Pet;
   }) ?? [];
   
  return { data: petsWithImages, count }; 
}

/**
 * Obtiene los detalles de una mascota específica por su ID, incluyendo imagen principal.
 * @param supabase - Instancia del cliente Supabase.
 * @param id - ID de la mascota.
 */
export async function getPetById(supabase: SupabaseClient, id: string | number): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .select(`
      *,
      pet_images ( image_url )
    `)
    .eq('pet_images.is_primary', true)
    .limit(1, { foreignTable: 'pet_images' })
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching pet with id ${id}:`, error);
    if (error.code === 'PGRST116') { // Código para 'No rows found'
        // Intentar buscar la mascota sin el filtro de imagen si no se encontró con él
        const { data: petOnlyData, error: petOnlyError } = await supabase
            .from('pets')
            .select('*')
            .eq('id', id)
            .single();

        if (petOnlyError) {
            console.error(`Error fetching pet fallback with id ${id}:`, petOnlyError);
            throw new Error(petOnlyError.message);
        }
        // Devuelve la mascota sin imagen si se encuentra
        return petOnlyData ? { ...petOnlyData, primary_image_url: null } : null;
    }
    throw new Error(error.message);
  }

  if (!data) return null;

  // Mapear para aplanar la URL
  const typedPet = data as Pet;
  const primaryImageUrl = typedPet.pet_images?.[0]?.image_url || null;
  const petWithImage: Pet = {
      ...typedPet,
      pet_images: undefined,
      primary_image_url: primaryImageUrl,
  };

  return petWithImage;
}

/**
 * Sube una imagen al bucket de Supabase Storage.
 * @param supabase - Instancia del cliente Supabase.
 * @param file Archivo de imagen a subir.
 * @param petName Nombre de la mascota (para organizar la ruta).
 * @returns La URL pública de la imagen subida.
 */
async function uploadPetImage(supabase: SupabaseClient, file: File, petName: string): Promise<string> {
  if (!file) throw new Error("No se proporcionó archivo de imagen.");

  // Crear un nombre de archivo único (ej: buddy-1711828800000.jpg)
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${petName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
  const filePath = `public/${uniqueFileName}`; // Carpeta dentro del bucket

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pet-images') // Nombre del bucket
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  // Obtener la URL pública
  const { data: urlData } = supabase.storage
    .from('pet-images')
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    // Esto no debería pasar si la subida fue exitosa y el bucket es público
    console.error("Error getting public URL for:", filePath);
    throw new Error("No se pudo obtener la URL pública de la imagen después de subirla.");
  }

  return urlData.publicUrl;
}

/**
 * Añade una nueva mascota a la base de datos, incluyendo la subida de su imagen principal.
 * @param supabase - Instancia del cliente Supabase.
 * @param petData Datos de la mascota validados por Zod.
 * @param imageFile Archivo de la imagen principal.
 * @returns El objeto de la mascota recién creada.
 */
export async function addPet(supabase: SupabaseClient, petData: PetSchema, imageFile: File) {
  // 1. Obtener el ID del usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuario no autenticado. No se puede agregar mascota.");
  }

  // 2. Subir la imagen principal (si existe)
  let imageUrl: string | undefined;
  if (imageFile) {
    try {
      // Usar nombre tentativo o un placeholder si el nombre no está definido aún
      imageUrl = await uploadPetImage(supabase, imageFile, petData.name || 'new-pet');
    } catch (uploadError) {
        // Decidir si continuar sin imagen o lanzar error
        console.error("Fallo al subir imagen, se creará mascota sin imagen principal:", uploadError);
        // O podrías: throw uploadError;
    }
  }

  // 3. Preparar los datos para insertar en la tabla `pets`
  const petToInsert = {
    ...petData,
    added_by_user_id: user.id,
    // Nota: status por defecto es 'available' en la DB
    // shelter_id: petData.shelter_id, // Añadir si se implementa selección de refugio
  };

  // 4. Insertar en la tabla `pets`
  const { data: newPetData, error: insertPetError } = await supabase
    .from('pets')
    .insert(petToInsert)
    .select() // Devolver el registro insertado
    .single(); // Esperamos un solo registro

  if (insertPetError) {
    console.error("Error inserting pet:", insertPetError);
    // Considerar eliminar la imagen subida si la inserción falla?
    throw new Error(`Error al guardar la mascota: ${insertPetError.message}`);
  }

  if (!newPetData) {
     throw new Error("No se recibieron datos de la mascota creada desde la base de datos.");
  }

  // 5. (Opcional/Mejora) Insertar la URL de la imagen en `pet_images`
  if (imageUrl) {
      const { error: insertImageError } = await supabase
        .from('pet_images')
        .insert({ pet_id: newPetData.id, image_url: imageUrl, is_primary: true });

      if (insertImageError) {
          // Loggear el error pero no necesariamente fallar toda la operación
          console.error("Error inserting primary image URL to pet_images:", insertImageError);
          // Podríamos añadir lógica para reintentar o notificar
      }
  }

  return newPetData; // Devolver la mascota creada
}

/**
 * Elimina una mascota y sus imágenes asociadas del storage y la base de datos.
 * @param supabase - Instancia del cliente Supabase.
 * @param petId - ID de la mascota a eliminar.
 */
export async function deletePet(supabase: SupabaseClient, petId: string | number): Promise<void> {
  console.warn(`Attempting to delete pet with ID: ${petId}`);

  // 1. Obtener URLs de imágenes asociadas (opcional pero bueno para limpiar storage)
  const { data: images, error: imageError } = await supabase
    .from('pet_images')
    .select('image_url')
    .eq('pet_id', petId);

  if (imageError) {
    console.error("Error fetching pet images for deletion:", imageError);
    // Podríamos continuar o detenernos
  }

  // 2. Eliminar la mascota de la DB (RLS debe permitirlo)
  const { error: deleteError } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);

  if (deleteError) {
    console.error(`Error deleting pet ${petId}:`, deleteError);
    throw new Error(`No se pudo eliminar la mascota: ${deleteError.message}`);
  }

  console.log(`Pet ${petId} deleted successfully from DB.`);

  // 3. Si la eliminación fue exitosa y obtuvimos imágenes, eliminarlas del storage
  if (images && images.length > 0) {
    const filePaths = images.map(img => {
        try {
            // Extraer el path del archivo desde la URL pública
            const url = new URL(img.image_url);
            // Asumiendo que el path es /public/nombre-archivo.ext
            // Quitar el /object/public/pet-images/ inicial si está presente
            const pathSegments = url.pathname.split('/');
            // Encontrar el segmento 'public' y tomar todo lo que sigue
            const publicIndex = pathSegments.indexOf('public');
            if (publicIndex !== -1) {
                return pathSegments.slice(publicIndex).join('/');
            }
            console.warn('Could not determine file path from URL:', img.image_url);
            return null;
        } catch (e) {
            console.error('Error parsing image URL:', img.image_url, e);
            return null;
        }
    }).filter((path): path is string => path !== null);

    if (filePaths.length > 0) {
        console.log(`Attempting to delete ${filePaths.length} images from storage for pet ${petId}:`, filePaths);
        const { data: deleteResult, error: deleteStorageError } = await supabase.storage
            .from('pet-images')
            .remove(filePaths);

        if (deleteStorageError) {
            console.error("Error deleting images from storage:", deleteStorageError);
            // No lanzamos error aquí, la mascota ya fue eliminada de la DB.
        } else {
            console.log(`Storage cleanup successful for pet ${petId}.`, deleteResult);
        }
    }
  }
}

/**
 * Actualiza los datos de una mascota existente.
 * @param supabase - Instancia del cliente Supabase.
 * @param petId - ID de la mascota a actualizar.
 * @param petData - Datos a actualizar.
 * @returns La mascota actualizada (sin garantía de incluir imagen actualizada).
 */
export async function updatePet(
    supabase: SupabaseClient,
    petId: string | number,
    petData: Partial<Omit<PetSchema, 'image' | 'id' | 'added_by_user_id' | 'created_at' | 'updated_at'>>
): Promise<Pet> {

    const updatePayload = {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age_years: petData.age_years,
        age_months: petData.age_months,
        gender: petData.gender,
        size: petData.size,
        description: petData.description,
        status: petData.status,
    };

    // Eliminar claves undefined del payload
    Object.keys(updatePayload).forEach(key =>
        (updatePayload as any)[key] === undefined && delete (updatePayload as any)[key]
    );

    // Verificar si el payload no está vacío para evitar updates innecesarios
    if (Object.keys(updatePayload).length === 0) {
        console.warn("UpdatePet called with no data to update.");
        // Si no hay nada que actualizar, ¿devolvemos la mascota actual o lanzamos error?
        // Por ahora, intentaremos obtenerla para devolver algo consistente.
        const currentPet = await getPetById(supabase, petId);
        if (!currentPet) {
            throw new Error(`Pet with id ${petId} not found.`);
        }
        return currentPet;
    }

    const { data: updatedPetData, error } = await supabase
        .from('pets')
        .update(updatePayload)
        .eq('id', petId)
        .select()
        .single();

    if (error) {
        console.error(`Error updating pet with id ${petId}:`, error);
        throw new Error(error.message || JSON.stringify(error));
    }

    if (!updatedPetData) {
        throw new Error(`Pet with id ${petId} not found or update failed (RLS?).`);
    }

    // Mapear a tipo Pet, asumiendo que no tenemos la imagen aquí
    const returnedPet: Pet = {
        ...updatedPetData,
        primary_image_url: null, // Asumir null tras update simple
    };

    return returnedPet;
}

/**
 * Elimina un archivo de Supabase Storage dada su URL pública completa.
 * @param supabase - Instancia del cliente Supabase.
 * @param publicUrl - URL pública del archivo a eliminar.
 */
export async function deleteStorageFile(supabase: SupabaseClient, publicUrl: string): Promise<void> {
  try {
    const urlParts = publicUrl.split('/pet-images/');
    if (urlParts.length < 2) {
      console.warn(`Could not extract file path from URL to delete: ${publicUrl}`);
      return;
    }
    const filePath = urlParts[1];
    if (!filePath) {
      console.warn(`Empty file path extracted from URL: ${publicUrl}`);
      return;
    }
    console.log(`Attempting to delete file from storage: ${filePath}`);
    const { error: deleteError } = await supabase.storage
      .from('pet-images')
      .remove([filePath]);
    if (deleteError) {
      console.error(`Error deleting file ${filePath} from storage:`, deleteError.message);
    }
  } catch (error) {
    console.error(`Unexpected error in deleteStorageFile for URL ${publicUrl}:`, error);
  }
}

/**
 * Actualiza la imagen principal de una mascota.
 * @param supabase - Instancia del cliente Supabase.
 * @param petId - ID de la mascota.
 * @param newImageFile - Nuevo archivo de imagen.
 * @param petName - Nombre opcional de la mascota.
 * @returns URL de la nueva imagen subida.
 */
export async function updatePetPrimaryImage(
    supabase: SupabaseClient,
    petId: string | number,
    newImageFile: File,
    petName?: string
): Promise<string> {
  // ... (código interno sin cambios)
    // 1. Subir la nueva imagen
    const newImageUrl = await uploadPetImage(supabase, newImageFile, petName || `pet-${petId}`);

    // 2. Encontrar la imagen primaria antigua
    const { data: oldImages, error: findError } = await supabase
        .from('pet_images')
        .select('id, image_url')
        .eq('pet_id', petId)
        .eq('is_primary', true);

    if (findError) {
        console.error(`Error finding old primary image for pet ${petId}:`, findError);
    }

    // 3 & 4. Eliminar entrada antigua de DB y archivo de Storage
    if (oldImages && oldImages.length > 0) {
        for (const oldImage of oldImages) {
            const { error: deleteDbError } = await supabase
                .from('pet_images')
                .delete()
                .eq('id', oldImage.id);
            if (deleteDbError) {
                console.error(`Error deleting old image record ${oldImage.id} from pet_images:`, deleteDbError);
            }
            await deleteStorageFile(supabase, oldImage.image_url);
        }
    }

    // 5. Insertar la nueva entrada en pet_images
    const { error: insertError } = await supabase
        .from('pet_images')
        .insert({ pet_id: petId, image_url: newImageUrl, is_primary: true });

    if (insertError) {
        console.error(`Error inserting new primary image record for pet ${petId}:`, insertError);
        await deleteStorageFile(supabase, newImageUrl);
        throw new Error(`Failed to link new primary image for pet ${petId}: ${insertError.message}`);
    }

    return newImageUrl;

}
