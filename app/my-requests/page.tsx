'use client';

import React from 'react';
import { useMyAdoptionRequests } from '@/lib/hooks/useAdoptionQueries';
import { useAuth } from '@/lib/providers/AuthProvider'; // Importar useAuth
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, Inbox, User, PawPrint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { format } from 'date-fns'; // Para formatear fechas
import { es } from 'date-fns/locale'; // Locale español para date-fns
import { ADOPTION_REQUEST_STATUS } from '@/lib/services/adoptionRequests'; // Importar constantes de estado

// Helper para obtener un estilo visual para cada estado (similar a ReceivedRequestsPage)
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

// Helper para formatear el nombre del estado (opcional, pero mejora UI)
const formatStatus = (status: string): string => {
    switch (status) {
        case ADOPTION_REQUEST_STATUS.APPROVED: return 'Aprobada';
        case ADOPTION_REQUEST_STATUS.REJECTED: return 'Rechazada';
        case ADOPTION_REQUEST_STATUS.PENDING: return 'Pendiente';
        case ADOPTION_REQUEST_STATUS.CANCELLED: return 'Cancelada';
        default: return status;
    }
}

export default function MyRequestsPage() {
    // Usar useAuth para obtener el estado de carga.
    // useMyAdoptionRequests internamente usa useAuth para obtener el userId.
    const { isLoading: isLoadingAuth } = useAuth();
    const { data: requests, isLoading: isLoadingRequests, isError, error } = useMyAdoptionRequests();

    const isLoading = isLoadingAuth || isLoadingRequests;

    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
    }

    if (isError) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al Cargar Mis Solicitudes</AlertTitle>
                <AlertDescription>
                    {error?.message || "No se pudieron cargar tus solicitudes de adopción."}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Mis Solicitudes de Adopción</CardTitle>
                    <CardDescription>Solicitudes que has enviado para adoptar mascotas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests && requests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mascota Solicitada</TableHead>
                                    <TableHead>Fecha Solicitud</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                    {/* Podríamos añadir columna de Notas si existiera en MyAdoptionRequest */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">
                                            {/* Asumiendo que MyAdoptionRequest tiene info de la mascota */}
                                            {req.pets ? (
                                                <Link href={`/pets/${req.pet_id}`} className="hover:underline text-primary flex items-center gap-1">
                                                    <PawPrint size={16} /> {req.pets.name}
                                                </Link>
                                            ) : (
                                                <span>Mascota ID: {req.pet_id}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{format(new Date(req.request_date), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={getStatusBadgeVariant(req.status)}>
                                                {formatStatus(req.status)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <Inbox className="mx-auto h-12 w-12 mb-4" />
                            <p>No has enviado ninguna solicitud de adopción aún.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 