import { useQuery } from '@tanstack/react-query'
import { getPets, getPetById } from '@/lib/services/pets'
import { useAuth } from '@/lib/providers/AuthProvider'

// Clave base para las queries de mascotas
const PETS_QUERY_KEY = 'pets';

// Definir tipo para los filtros para mayor claridad
interface PetFilters {
    search?: string;
    species?: string;
    gender?: string;
    size?: string;
    page?: number;
    limit?: number;
}

/**
 * Hook para obtener la lista paginada de mascotas, con soporte para búsqueda y filtros.
 * @param searchTerm - Término de búsqueda opcional.
 * @param species - Filtro de especie opcional.
 * @param gender - Filtro de género opcional.
 * @param size - Filtro de tamaño opcional.
 * @param page - Número de página opcional.
 * @param limit - Número de elementos por página opcional.
 */
export function usePets(
    searchTerm?: string,
    species?: string,
    gender?: string,
    size?: string,
    page: number = 1,
    limit: number = 12
) {
  const { supabase, isLoading: isLoadingAuth } = useAuth();

  // Crear objeto de filtros para la queryKey (incluir page y limit)
  const filters: PetFilters = { page, limit };
  if (searchTerm) filters.search = searchTerm;
  if (species) filters.species = species;
  if (gender) filters.gender = gender;
  if (size) filters.size = size;

  // La query key ahora incluye el objeto de filtros completo
  const queryKey = [PETS_QUERY_KEY, filters];

  return useQuery({
    queryKey: queryKey,
    // Pasar todos los filtros, page y limit a la función de servicio
    queryFn: () => getPets(supabase, searchTerm, species, gender, size, page, limit),
    enabled: !isLoadingAuth,
    // Consider adjusting staleTime if frequent page changes are expected
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook para obtener los detalles de una mascota por ID.
 */
export function usePetById(id: string | number | undefined | null) {
  const { supabase, isLoading: isLoadingAuth } = useAuth();
  const enabled = !isLoadingAuth && !!id;

  return useQuery({
    queryKey: [PETS_QUERY_KEY, 'detail', id],
    queryFn: () => {
      if (!enabled || !id) {
        return Promise.resolve(null);
      }
      return getPetById(supabase, id);
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 10,
  });
} 