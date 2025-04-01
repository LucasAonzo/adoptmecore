'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useReports } from '@/lib/hooks/useReportsQueries'; // Asumiendo que tu hook se llama así
import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ReportMap } from '@/components/maps/ReportMap'; // Importar ReportMap
import { ReportFilters, type ReportFiltersState } from '@/components/filters/ReportFilters'; // Importar filtros
import { type ReportFilters as ReportFiltersType, type MapBounds } from '@/lib/services/reports'; // Importar MapBounds aquí también

// Coordenadas por defecto (Buenos Aires como fallback)
const defaultCenterCoords = {
  lat: -34.6037,
  lng: -58.3816,
};

// TODO: Añadir filtros (ReportFilters)
// TODO: Añadir integración con mapa (Paso 7)

export default function LostFoundPage() {
    // Estado para los filtros activos
    const [activeFilters, setActiveFilters] = useState<ReportFiltersState>({ 
        reportType: 'ALL', 
        petType: 'ALL' 
    });
    // Estado para la ubicación del usuario
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // NUEVO estado para los límites del mapa
    const [mapBounds, setMapBounds] = useState<MapBounds | undefined>(undefined);

    // --- Obtener ubicación del usuario al montar --- 
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocalización no soportada.");
            setLocationStatus('error');
            return;
        }
        setLocationStatus('loading');
        console.log('[LostFoundPage] Intentando obtener geolocalización...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newUserLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                console.log('[LostFoundPage] Geolocalización obtenida:', newUserLocation);
                setUserLocation(newUserLocation);
                setLocationStatus('success');
            },
            (error) => {
                console.error("[LostFoundPage] Error obteniendo ubicación:", error);
                setLocationStatus('error');
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 1000 * 60 * 5 } // Opciones menos agresivas
        );
    }, []); // Ejecutar solo al montar
    // --- Fin obtención ubicación ---

    // Hook useReports ahora recibe los filtros activos Y los bounds
    const queryFilters: ReportFiltersType = useMemo(() => ({
        reportType: activeFilters.reportType === 'ALL' ? undefined : activeFilters.reportType,
        petType: activeFilters.petType === 'ALL' ? undefined : activeFilters.petType,
        bounds: mapBounds, // <-- Incluir bounds aquí
    }), [activeFilters, mapBounds]); // Recalcular filtros cuando cambien los filtros o los bounds
    
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useReports(queryFilters); 

    // Función para manejar cambios en los filtros
    const handleFiltersChange = (newFilters: ReportFiltersState) => {
        const cleanPetType = newFilters.petType?.trim() || 'ALL';
        setActiveFilters({ 
            reportType: newFilters.reportType || 'ALL', 
            petType: cleanPetType
        });
    };

    // NUEVA función para manejar cambios en los límites del mapa
    const handleBoundsChange = useCallback((newBounds: MapBounds) => {
        console.log("[LostFoundPage] Map bounds changed:", newBounds);
        setMapBounds(newBounds);
    }, []); // useCallback para evitar re-creaciones innecesarias

    // Combinar todos los reportes de todas las páginas cargadas Y FILTRAR inválidos
    const allReports = useMemo(() => {
        const reportsFromPages = data?.pages.flatMap(page => 
            // Asegurarse de que page.reports existe y es un array
            Array.isArray(page?.reports) ? page.reports : []
        ) ?? [];

        // Filtrar reportes con coordenadas inválidas
        const validReports = reportsFromPages.filter(report => {
            const isValidLat = typeof report.location_lat === 'number' && !isNaN(report.location_lat) && report.location_lat >= -90 && report.location_lat <= 90;
            const isValidLon = typeof report.location_lon === 'number' && !isNaN(report.location_lon) && report.location_lon >= -180 && report.location_lon <= 180;
            
            if (!isValidLat || !isValidLon) {
                console.warn(`Reporte filtrado por coordenadas inválidas (ID: ${report.id}):`, { lat: report.location_lat, lon: report.location_lon });
                return false; // Excluir este reporte
            }
            return true; // Incluir este reporte
        });

        // Ordenar reportes: Emergencias primero, luego por fecha más reciente
        return validReports.sort((a, b) => {
            // Si uno es emergencia y el otro no, la emergencia va primero
            if (a.report_type === 'EMERGENCY' && b.report_type !== 'EMERGENCY') return -1;
            if (a.report_type !== 'EMERGENCY' && b.report_type === 'EMERGENCY') return 1;
            
            // Si ambos son del mismo tipo (o no son emergencias), ordenar por fecha
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Más reciente primero
        });
    }, [data]); // Recalcular solo cuando cambien los datos de la query

    // Determinar el centro inicial para el mapa SOLO cuando la ubicación esté lista o haya error
    const initialMapCenter = useMemo(() => {
        if (locationStatus === 'success' && userLocation) {
            return userLocation;
        }
        // Si hay error o aún no está lista, usar fallback
        return defaultCenterCoords; // Usar el default de Buenos Aires
    }, [locationStatus, userLocation]);

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Mascotas Perdidas y Encontradas</h1>
            <p className="mb-6 text-muted-foreground">
                Explora los últimos reportes de mascotas perdidas, encontradas o en
                situación de emergencia en la comunidad.
            </p>

            {/* Componente de Filtros */}
            <ReportFilters 
                onFiltersChange={handleFiltersChange} 
            />

            {/* Sección del Mapa - Renderizado Condicional */}
            <div className="mb-8 h-[500px]"> {/* Contenedor con altura fija */} 
                {locationStatus === 'loading' && (
                    <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                        <span>Obteniendo tu ubicación para el mapa...</span>
                    </div>
                )}
                {(locationStatus === 'success' || locationStatus === 'error') && (
                    <ReportMap 
                       reports={allReports} 
                       initialCenter={initialMapCenter} 
                       mapHeight="100%" 
                       onBoundsChange={handleBoundsChange} // <-- Pasar la nueva función callback
                    />
                )}
            </div>

            {/* Estado de carga inicial */} 
            {status === 'pending' ? (
                <div className="text-center py-10">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-2" />
                    <p>Cargando reportes...</p>
                </div>
            ) : status === 'error' ? (
                // Estado de error
                <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
                    <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    <p>Error al cargar los reportes: {error?.message}</p>
                </div>
            ) : (
                // Contenido principal (Lista de reportes)
                <>
                    {allReports.length === 0 && !isFetching ? (
                        <p className="text-center text-muted-foreground py-10">
                          {activeFilters.reportType !== 'ALL' || activeFilters.petType !== 'ALL' 
                            ? 'No se encontraron reportes con los filtros aplicados.'
                            : 'No se encontraron reportes activos.' } 
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {allReports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}

                    {/* Botón Cargar más */} 
                    <div className="text-center">
                        {hasNextPage && (
                            <Button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Cargar más reportes
                            </Button>
                        )}
                        {!hasNextPage && allReports.length > 0 && (
                            <p className="text-muted-foreground">Has llegado al final.</p>
                        )}
                    </div>
                </>
            )}

            {/* Indicador de carga en esquina inferior (opcional) */} 
            {isFetching && !isFetchingNextPage && status !== 'pending' && (
                <div className="fixed bottom-4 right-4 bg-background p-2 rounded-full shadow-lg border">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            )}
        </main>
    );
} 