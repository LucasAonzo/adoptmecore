'use client';

import React, { useMemo } from 'react';
import { useReceivedAdoptionRequests } from '@/lib/hooks/useAdoptionQueries';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ReceivedAdoptionRequest, ADOPTION_REQUEST_STATUS } from '@/lib/services/adoptionRequests';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useApproveAdoptionRequest,
    useRejectAdoptionRequest,
} from '@/lib/hooks/useAdoptionMutations';

// Helper para obtener un estilo visual para cada estado
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case ADOPTION_REQUEST_STATUS.APPROVED:
            return "default"; // Verde/Azul por defecto de Shadcn
        case ADOPTION_REQUEST_STATUS.REJECTED:
        case ADOPTION_REQUEST_STATUS.CANCELLED:
            return "destructive"; // Rojo
        case ADOPTION_REQUEST_STATUS.PENDING:
            return "secondary"; // Gris/amarillo
        default:
            return "outline";
    }
};

export default function ReceivedRequestsPage() {
    // Obtener usuario y estado de carga desde useAuth
    const { user, isLoading: isLoadingAuth } = useAuth();
    const ownerUserId = user?.id;

    // Pasar el ownerUserId obtenido de useAuth al hook
    const { data: requests, isLoading: isLoadingRequests, isError, error } = useReceivedAdoptionRequests(ownerUserId);

    // Hooks de mutación
    const { approveRequest, isPending: isApproving } = useApproveAdoptionRequest();
    const { rejectRequest, isPending: isRejecting } = useRejectAdoptionRequest();

    // Usar isLoadingAuth directamente para el estado de carga general inicial
    const isLoading = isLoadingAuth || isLoadingRequests;

    const renderedRequests = useMemo(() => {
        if (!requests) return null;
        return requests.map((req: ReceivedAdoptionRequest) => (
            <TableRow key={req.id}>
                <TableCell className="font-medium">{req.id}</TableCell>
                <TableCell>{req.pets?.name ?? 'Mascota no encontrada'}</TableCell>
                {/* Formatear fecha */}
                <TableCell>{new Date(req.request_date).toLocaleDateString()}</TableCell>
                 {/* Mostrar ID solicitante como antes */}
                <TableCell>
                    <span title={req.user_id}>{req.user_id.substring(0, 8)}...</span>
                </TableCell>
                 {/* Estado con Badge */}
                <TableCell>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                </TableCell>
                {/* Columna de Acciones */}
                <TableCell className="text-right">
                    {req.status === ADOPTION_REQUEST_STATUS.PENDING && (
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveRequest(req.id)}
                                disabled={isApproving || isRejecting} // Deshabilitar si alguna mutación está en curso
                            >
                                {isApproving ? 'Aprobando...' : 'Aprobar'}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => rejectRequest(req.id)}
                                disabled={isApproving || isRejecting} // Deshabilitar si alguna mutación está en curso
                            >
                                {isRejecting ? 'Rechazando...' : 'Rechazar'}
                            </Button>
                        </div>
                    )}
                     {/* Mostrar un mensaje o nada si no está pendiente */}
                    {req.status !== ADOPTION_REQUEST_STATUS.PENDING && (
                        <span className="text-xs text-muted-foreground">Acción realizada</span>
                    )}
                </TableCell>
            </TableRow>
        ));
    }, [requests, approveRequest, rejectRequest, isApproving, isRejecting]);

    if (isLoading) {
        // Mostrar un spinner más genérico mientras carga auth o datos
        return (
            <div className="container mx-auto p-4 flex justify-center items-center h-[calc(100vh-200px)]">
                 <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-4">
                 <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error al cargar solicitudes</AlertTitle>
                    <AlertDescription>
                        {error?.message || 'Ocurrió un error inesperado.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Solicitudes Recibidas</h1>
             <div className="border rounded-lg">
                <Table>
                    <TableCaption>Lista de solicitudes de adopción recibidas para tus mascotas.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Mascota</TableHead>
                            <TableHead>Fecha Solicitud</TableHead>
                            <TableHead>ID Solicitante</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests && requests.length > 0 ? (
                            renderedRequests
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No has recibido ninguna solicitud de adopción aún.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 