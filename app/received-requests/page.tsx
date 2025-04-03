'use client';

import React, { useMemo } from 'react';
import { useReceivedAdoptionRequests } from '@/lib/hooks/useAdoptionQueries';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ReceivedAdoptionRequest, ADOPTION_REQUEST_STATUS } from '@/lib/services/adoptionRequests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, Inbox, User, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useApproveAdoptionRequest,
    useRejectAdoptionRequest,
} from '@/lib/hooks/useAdoptionMutations';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case ADOPTION_REQUEST_STATUS.APPROVED:
            return "default";
        case ADOPTION_REQUEST_STATUS.REJECTED:
        case ADOPTION_REQUEST_STATUS.CANCELLED:
            return "destructive";
        case ADOPTION_REQUEST_STATUS.PENDING:
            return "secondary";
        default:
            return "outline";
    }
};

const formatStatus = (status: string): string => {
    switch (status) {
        case ADOPTION_REQUEST_STATUS.APPROVED: return 'Aprobada';
        case ADOPTION_REQUEST_STATUS.REJECTED: return 'Rechazada';
        case ADOPTION_REQUEST_STATUS.PENDING: return 'Pendiente';
        case ADOPTION_REQUEST_STATUS.CANCELLED: return 'Cancelada';
        default: return status;
    }
}

export default function ReceivedRequestsPage() {
    const { user, isLoading: isLoadingAuth } = useAuth();
    const ownerUserId = user?.id;
    const { data: requests, isLoading: isLoadingRequests, isError, error } = useReceivedAdoptionRequests(ownerUserId);
    const { approveRequest, isPending: isApproving } = useApproveAdoptionRequest();
    const { rejectRequest, isPending: isRejecting } = useRejectAdoptionRequest();

    const isLoading = isLoadingAuth || isLoadingRequests;

    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-10">
                 <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error al Cargar Solicitudes Recibidas</AlertTitle>
                    <AlertDescription>
                        {error?.message || 'Ocurrió un error inesperado.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes de Adopción Recibidas</CardTitle>
                    <CardDescription>Solicitudes enviadas por otros usuarios para adoptar tus mascotas.</CardDescription>
                </CardHeader>
                <CardContent>
                     {requests && requests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mascota</TableHead>
                                    <TableHead>Fecha Solicitud</TableHead>
                                    <TableHead>Solicitante</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">
                                            {req.pets ? (
                                                <Link href={`/pets/${req.pet_id}`} className="hover:underline text-primary flex items-center gap-1">
                                                    <PawPrint size={16} /> {req.pets.name}
                                                </Link>
                                            ) : (
                                                <span>Mascota ID: {req.pet_id}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{format(new Date(req.request_date), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                                        <TableCell>
                                            {req.profiles ? (
                                                <span title={req.profiles.email || req.user_id} className="flex items-center gap-1">
                                                    <User size={16} /> 
                                                    {req.profiles.full_name || req.profiles.email || 'Usuario Desconocido'}
                                                </span>
                                            ) : (
                                                <span title={req.user_id}>{req.user_id.substring(0, 8)}...</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(req.status)}>{formatStatus(req.status)}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === ADOPTION_REQUEST_STATUS.PENDING && (
                                                <div className="space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => approveRequest(req.id)}
                                                        disabled={isApproving || isRejecting}
                                                    >
                                                        {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                        {isApproving ? 'Aprobando...' : 'Aprobar'}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => rejectRequest(req.id)}
                                                        disabled={isApproving || isRejecting}
                                                    >
                                                         {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                         {isRejecting ? 'Rechazando...' : 'Rechazar'}
                                                    </Button>
                                                </div>
                                            )}
                                            {req.status !== ADOPTION_REQUEST_STATUS.PENDING && (
                                                <span className="text-xs text-muted-foreground">Acción realizada</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <Inbox className="mx-auto h-12 w-12 mb-4" />
                            <p>No has recibido ninguna solicitud de adopción aún.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 