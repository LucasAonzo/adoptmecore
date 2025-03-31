import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdoptionRequest, type AdoptionRequestPayload } from '../services/adoptionRequests';
import { toast } from 'sonner';
import {
    updateAdoptionRequestStatus,
    AdoptionRequestStatus,
    ADOPTION_REQUEST_STATUS,
    ReceivedAdoptionRequest
} from '../services/adoptionRequests';

/**
 * Hook para crear una nueva solicitud de adopción.
 */
export function useCreateAdoptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdoptionRequestPayload) => createAdoptionRequest(payload),

    onSuccess: (data) => {
      // Invalidar queries relacionadas si es necesario (ej: lista de "Mis Solicitudes")
      // queryClient.invalidateQueries({ queryKey: ['myAdoptionRequests'] });
      toast.success('¡Solicitud de adopción enviada con éxito!');
      console.log("Adoption request successful:", data);
    },
    onError: (error) => {
      console.error("Error submitting adoption request:", error);
      // Mostrar el mensaje de error específico que lanzamos desde el servicio
      toast.error(error.message || 'Error al enviar la solicitud.');
    },
  });
}

// Clave de query para invalidar (debe coincidir con la usada en useReceivedAdoptionRequests)
const RECEIVED_ADOPTIONS_QUERY_KEY = 'receivedAdoptionRequests';

interface UpdateStatusPayload {
    requestId: number;
    newStatus: AdoptionRequestStatus;
}

/**
 * Hook base para actualizar el estado de una solicitud de adopción.
 */
export function useUpdateAdoptionRequestStatus() {
    const queryClient = useQueryClient();

    return useMutation<ReceivedAdoptionRequest, Error, UpdateStatusPayload>({
        mutationFn: ({ requestId, newStatus }) => updateAdoptionRequestStatus(requestId, newStatus),
        onSuccess: (data, variables) => {
            toast.success(`Solicitud ${variables.requestId} actualizada a ${variables.newStatus}.`);
            // Invalidar la query de solicitudes recibidas para refrescar la lista
            queryClient.invalidateQueries({ queryKey: [RECEIVED_ADOPTIONS_QUERY_KEY] });

            // Opcional: Actualizar manualmente el caché si se prefiere una respuesta más inmediata
            // queryClient.setQueryData([RECEIVED_ADOPTIONS_QUERY_KEY], (oldData: ReceivedAdoptionRequest[] | undefined) => {
            //     return oldData ? oldData.map(req => req.id === variables.requestId ? data : req) : [];
            // });
        },
        onError: (error, variables) => {
            console.error(`Error updating request ${variables.requestId} to ${variables.newStatus}:`, error);
            toast.error(error.message || 'Error al actualizar la solicitud.');
        },
    });
}

/**
 * Hook específico para aprobar una solicitud de adopción.
 */
export function useApproveAdoptionRequest() {
    const { mutate, isPending, isError, error, isSuccess } = useUpdateAdoptionRequestStatus();

    const approveRequest = (requestId: number) => {
        mutate({ requestId, newStatus: ADOPTION_REQUEST_STATUS.APPROVED });
    };

    return { approveRequest, isPending, isError, error, isSuccess };
}

/**
 * Hook específico para rechazar una solicitud de adopción.
 */
export function useRejectAdoptionRequest() {
    const { mutate, isPending, isError, error, isSuccess } = useUpdateAdoptionRequestStatus();

    const rejectRequest = (requestId: number) => {
        mutate({ requestId, newStatus: ADOPTION_REQUEST_STATUS.REJECTED });
    };

    return { rejectRequest, isPending, isError, error, isSuccess };
}

// Podríamos añadir un hook para cancelar si fuese necesario
// export function useCancelAdoptionRequest() { ... }

// Aquí podríamos añadir más hooks para actualizar/cancelar solicitudes en el futuro 