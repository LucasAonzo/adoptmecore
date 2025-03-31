import { createClient } from "../supabaseClient"; // Corregir ruta de importación
import { PostgrestError } from '@supabase/supabase-js';

// Crear una instancia del cliente para usar en este módulo
const supabase = createClient();

export interface AdoptionRequestPayload {
  pet_id: number;
  user_id: string;
  shelter_id?: number | null; // Opcional, si la mascota está asociada a un refugio
  notes?: string | null; // Notas opcionales del adoptante
}

// Definir una interfaz para el tipo de dato que devolverá la nueva función
export interface MyAdoptionRequest {
    id: number;
    pet_id: number;
    user_id: string;
    request_date: string;
    status: string;
    notes: string | null;
    updated_at: string;
    // Datos de la mascota asociada (del join) - Ahora es un objeto
    pets: {
        name: string;
    } | null; // Sigue siendo nullable
}

// Interfaz para solicitudes recibidas (SIN info del solicitante por ahora)
export interface ReceivedAdoptionRequest {
    id: number;
    pet_id: number;
    user_id: string; // ID del solicitante
    request_date: string;
    status: string;
    notes: string | null;
    updated_at: string;
    pets: {
        id: number;
        name: string;
        added_by_user_id: string; // ID del dueño (para verificación)
    } | null;
}

// Definición de estados válidos para las solicitudes de adopción
export const ADOPTION_REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled', // Estado opcional si el solicitante puede cancelar
} as const; // 'as const' para crear un tipo literal a partir de las claves/valores

// Tipo para los estados válidos
export type AdoptionRequestStatus = typeof ADOPTION_REQUEST_STATUS[keyof typeof ADOPTION_REQUEST_STATUS];

/**
 * Crea una nueva solicitud de adopción en la base de datos.
 * Asume que RLS está configurado para permitir la inserción al usuario autenticado.
 */
export async function createAdoptionRequest(
    payload: AdoptionRequestPayload
): Promise<any> { // Devolver la solicitud creada (o ajustar tipo de retorno)

    // Validar que el user_id esté presente (aunque RLS debería encargarse)
    if (!payload.user_id) {
        throw new Error('User ID is required to create an adoption request.');
    }

    const { data, error } = await supabase
        .from('adoption_requests')
        .insert({
            pet_id: payload.pet_id,
            user_id: payload.user_id,
            shelter_id: payload.shelter_id,
            notes: payload.notes,
            status: 'pending' // Estado inicial por defecto
        })
        .select() // Devolver el registro creado
        .single();

    if (error) {
        console.error("Error creating adoption request:", error);
        // Podríamos verificar errores específicos, ej: violación de FK si pet_id no existe
        if (error.code === '23503') { // Foreign key violation
             throw new Error('La mascota especificada no existe o hubo un problema.');
        }
         if (error.code === '23505') { // Unique constraint violation (ej: si definimos que un user solo puede pedir una vez por pet)
             throw new Error('Ya has enviado una solicitud para esta mascota.');
        }
        throw new Error(error.message || 'No se pudo crear la solicitud de adopción.');
    }

    if (!data) {
        throw new Error('Failed to create adoption request, no data returned.');
    }

    console.log('Adoption request created:', data);
    return data;
}

/**
 * Obtiene todas las solicitudes de adopción para un usuario específico.
 */
export async function getMyAdoptionRequests(userId: string): Promise<MyAdoptionRequest[]> {
    if (!userId) {
        console.warn("getMyAdoptionRequests called without userId");
        return [];
    }

    // Definir el tipo esperado de la consulta Supabase (más genérico)
    type SupabaseRequestData = {
        id: number;
        pet_id: number;
        user_id: string;
        request_date: string;
        status: string;
        notes: string | null;
        updated_at: string;
        pets: {
            name: string;
        } | null; // Supabase devuelve objeto o null para relaciones uno-a-uno/muchos-a-uno
    };

    const { data, error } = await supabase
        .from('adoption_requests')
        .select(`
            id,
            pet_id,
            user_id,
            request_date,
            status,
            notes,
            updated_at,
            pets ( name )
        `)
        .eq('user_id', userId)
        .order('request_date', { ascending: false })
        // Indicar a Supabase que esperamos este tipo (ayuda levemente a inferencia)
        .returns<SupabaseRequestData[]>();

    if (error) {
        console.error("Error fetching user's adoption requests:", error);
        throw new Error(error.message || "No se pudieron obtener las solicitudes.");
    }

    // Mapeo manual para asegurar el tipo MyAdoptionRequest[]
    const mappedData: MyAdoptionRequest[] = (data || []).map(req => ({
        id: req.id,
        pet_id: req.pet_id,
        user_id: req.user_id,
        request_date: req.request_date,
        status: req.status,
        notes: req.notes,
        updated_at: req.updated_at,
        // Asegurar que el objeto pets tenga la estructura correcta o sea null
        pets: req.pets ? { name: req.pets.name } : null,
    }));

    return mappedData;
}

/**
 * Obtiene todas las solicitudes de adopción recibidas por un usuario (ownerUserId).
 * Realiza un filtrado final en JS para asegurar la lógica correcta sobre los datos visibles por RLS.
 */
export async function getReceivedAdoptionRequests(ownerUserId: string): Promise<ReceivedAdoptionRequest[]> {
    if (!ownerUserId) {
        console.warn("getReceivedAdoptionRequests called without ownerUserId");
        return [];
    }

    // Tipo esperado
    type SupabaseReceivedData = {
        id: number;
        pet_id: number;
        user_id: string;
        request_date: string;
        status: string;
        notes: string | null;
        updated_at: string;
        pets: { id: number; name: string; added_by_user_id: string; } | null;
    };

    // Consulta sin el filtro explícito por owner en pets
    const { data, error } = await supabase
        .from('adoption_requests')
        .select(`
            id,
            pet_id,
            user_id,
            request_date,
            status,
            notes,
            updated_at,
            pets ( id, name, added_by_user_id )
        `)
        // NO filtramos por pets.added_by_user_id aquí. RLS determina visibilidad base.
        .order('request_date', { ascending: false })
        .returns<SupabaseReceivedData[]>();

    if (error) {
        console.error(`Error fetching base received adoption requests for owner ${ownerUserId}:`, error);
        throw new Error("No se pudieron obtener las solicitudes recibidas base.");
    }

    const allVisibleRequests = data || [];
    console.log(`[${ownerUserId}] RLS visible requests:`, allVisibleRequests.length);

    // Mapeo inicial
    const mappedData: ReceivedAdoptionRequest[] = allVisibleRequests.map(req => ({
        id: req.id,
        pet_id: req.pet_id,
        user_id: req.user_id,
        request_date: req.request_date,
        status: req.status,
        notes: req.notes,
        updated_at: req.updated_at,
        pets: req.pets ? { id: req.pets.id, name: req.pets.name, added_by_user_id: req.pets.added_by_user_id } : null,
    }));

    // Filtrado explícito en JavaScript para asegurar que solo queden las RECIBIDAS
    const filteredData = mappedData.filter(req => req.pets?.added_by_user_id === ownerUserId);
    console.log(`[${ownerUserId}] Filtered received requests:`, filteredData.length);

    return filteredData;
}

/**
 * Actualiza el estado de una solicitud de adopción específica.
 * La política RLS asegura que solo el dueño de la mascota pueda llamar a esto.
 * @param requestId - El ID de la solicitud a actualizar.
 * @param newStatus - El nuevo estado (debe ser uno de los valores de ADOPTION_REQUEST_STATUS).
 * @returns El objeto de la solicitud actualizada con el tipo correcto.
 * @throws Si ocurre un error durante la actualización.
 */
export async function updateAdoptionRequestStatus(
    requestId: number,
    newStatus: AdoptionRequestStatus
): Promise<ReceivedAdoptionRequest> {
    console.log(`Updating request ${requestId} to status: ${newStatus}`);

    if (!Object.values(ADOPTION_REQUEST_STATUS).includes(newStatus)) {
        console.error(`Invalid status provided: ${newStatus}`);
        throw new Error(`Estado de solicitud inválido: ${newStatus}`);
    }

    // Definir un tipo intermedio que refleje lo que Supabase podría devolver (pets como array)
    type SupabaseUpdateResult = Omit<ReceivedAdoptionRequest, 'pets'> & {
        pets: { id: number; name: string; added_by_user_id: string; }[] | null;
    };

    const { data, error } = await supabase
        .from('adoption_requests')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select(`
            id,
            pet_id,
            user_id,
            request_date,
            status,
            notes,
            updated_at,
            pets ( id, name, added_by_user_id )
        `)
        .single<SupabaseUpdateResult>(); // Usar el tipo intermedio aquí

    if (error) {
        console.error(`Error updating adoption request ${requestId} status:`, error);
        if (error.code === '42501') {
            throw new Error("Permiso denegado. Asegúrate de ser el dueño de la mascota.");
        }
        throw new Error("No se pudo actualizar el estado de la solicitud.");
    }

    if (!data) {
        console.warn(`No data returned after updating request ${requestId}. RLS might have prevented update/select.`);
        throw new Error("No se encontró la solicitud o no se pudo actualizar (posible problema de permisos).");
    }

    console.log(`Request ${requestId} successfully updated raw data:`, data);

    // Mapeo explícito para asegurar la estructura correcta de ReceivedAdoptionRequest
    const mappedData: ReceivedAdoptionRequest = {
        ...data,
        // Si pets es un array, toma el primer elemento, sino déjalo como null.
        pets: Array.isArray(data.pets) && data.pets.length > 0 ? data.pets[0] : null,
    };

    return mappedData;
} 