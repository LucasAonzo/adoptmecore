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
}

/**
 * Hook para obtener la lista de mascotas, con soporte para búsqueda y filtros.
 * @param searchTerm - Término de búsqueda opcional.
 * @param species - Filtro de especie opcional.
 * @param gender - Filtro de género opcional.
 * @param size - Filtro de tamaño opcional.
 */
export function usePets(
    searchTerm?: string,
    species?: string,
    gender?: string,
    size?: string
) {
  const { supabase, isLoading: isLoadingAuth } = useAuth();

  // Crear objeto de filtros para la queryKey (solo incluir si tienen valor)
  const filters: PetFilters = {};
  if (searchTerm) filters.search = searchTerm;
  if (species) filters.species = species;
  if (gender) filters.gender = gender;
  if (size) filters.size = size;

  // La query key ahora incluye el objeto de filtros
  const queryKey = Object.keys(filters).length > 0 ? [PETS_QUERY_KEY, filters] : [PETS_QUERY_KEY];

  return useQuery({
    queryKey: queryKey,
    // Pasar todos los filtros a la función de servicio
    queryFn: () => getPets(supabase, searchTerm, species, gender, size),
    enabled: !isLoadingAuth,
    staleTime: 1000 * 60 * 5,
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