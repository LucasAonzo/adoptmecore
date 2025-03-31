import { useQuery } from '@tanstack/react-query';
import { getMyAdoptionRequests, getReceivedAdoptionRequests } from '../services/adoptionRequests';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useState, useEffect } from 'react';

// Clave de query para MIS solicitudes
const MY_ADOPTIONS_QUERY_KEY = 'myAdoptionRequests';
// Clave de query base para solicitudes RECIBIDAS
const RECEIVED_ADOPTIONS_QUERY_KEY = 'receivedAdoptionRequests';

/**
 * Hook para obtener las solicitudes de adopción creadas por el usuario actual.
 */
export function useMyAdoptionRequests() {
    const { user, isLoading: isLoadingAuth } = useAuth();
    const userId = user?.id;

    return useQuery({
        queryKey: [MY_ADOPTIONS_QUERY_KEY, userId],
        queryFn: () => {
            if (!userId) {
                console.warn('useMyAdoptionRequests: No user ID found (useAuth import issue)');
                return Promise.resolve([]);
            }
            return getMyAdoptionRequests(userId);
        },
        enabled: !isLoadingAuth && !!userId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook para obtener las solicitudes de adopción recibidas por un usuario específico (dueño de la mascota).
 * @param ownerUserId - El ID del usuario dueño de las mascotas.
 */
export function useReceivedAdoptionRequests(ownerUserId?: string) {
    const { isLoading: isLoadingAuth } = useAuth();
    return useQuery({
        queryKey: [RECEIVED_ADOPTIONS_QUERY_KEY, ownerUserId],
        queryFn: () => {
            if (!ownerUserId) {
                return Promise.resolve([]);
            }
            return getReceivedAdoptionRequests(ownerUserId);
        },
        enabled: !isLoadingAuth && !!ownerUserId,
        staleTime: 1000 * 60 * 5,
    });
} 