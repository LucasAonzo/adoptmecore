'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
// Usar APIProvider, Map, AdvancedMarker, InfoWindow de @vis.gl
import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef, useMap } from '@vis.gl/react-google-maps';
// Quitar InfoWindowF de la librería anterior
// import { InfoWindowF } from '@react-google-maps/api'; 
import { Loader2, HeartPulse, Search, Check, type LucideIcon } from 'lucide-react'; // Importar LucideIcon
import { type Report, type ReportType, type MapBounds } from '@/lib/services/reports'; 
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { CustomPin } from './CustomPin'; // Importar nuestro pin personalizado
import { debounce } from 'lodash-es'; // Importar debounce

// Colores e iconos para marcadores por tipo de reporte
interface MarkerStyle {
  color: string;
  IconComponent: LucideIcon; // Usar tipo LucideIcon específico
}
const markerStyles: Record<ReportType, MarkerStyle> = {
  LOST: { color: '#EF4444', IconComponent: Search }, // red-500
  FOUND: { color: '#3B82F6', IconComponent: Check }, // blue-500
  EMERGENCY: { color: '#F97316', IconComponent: HeartPulse }, // orange-500
};
const defaultMarkerStyle: MarkerStyle = {
  color: '#6B7280', // gray-500
  IconComponent: Search, // Icono por defecto
};

// Definir fuera para evitar re-creación
// const googleMapsLibraries: ('places')[] = ['places']; // Ya no es necesario con APIProvider

interface ReportMapProps {
  reports: Report[];
  initialCenter?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  initialZoom?: number;
  mapHeight?: string;
  onBoundsChange?: (bounds: MapBounds) => void; // <-- Nueva prop callback
}

const mapContainerBaseStyle = {
  width: '100%',
  borderRadius: '0.5rem',
};

const defaultCenterCoords = {
  lat: -34.6037, // Buenos Aires
  lng: -58.3816,
};

const defaultZoom = 10; 
const defaultHeight = '400px';

// Componente interno para acceder al contexto del mapa
function MapContent({ 
  reports, 
  initialCenter,
  initialZoom = defaultZoom,
  onBoundsChange 
}: Omit<ReportMapProps, 'mapHeight' | 'center'>) {
  const map = useMap();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [anchorRef, anchorElement] = useAdvancedMarkerRef();

  // Callback debounced para onBoundsChange
  const debouncedOnBoundsChange = useMemo(() => {
    if (!onBoundsChange) return undefined;
    return debounce((mapInstance: google.maps.Map) => {
      const bounds = mapInstance.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onBoundsChange({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        });
      }
    }, 500); // Debounce de 500ms
  }, [onBoundsChange]);

  // Registrar listeners cuando el mapa esté listo y el callback exista
  useEffect(() => {
    if (!map || !debouncedOnBoundsChange) return;

    // Listener para cuando el mapa está inactivo (después de moverse/zoom)
    const idleListener = map.addListener('idle', () => {
      debouncedOnBoundsChange(map);
    });

    // Limpiar listener al desmontar
    return () => {
      google.maps.event.removeListener(idleListener);
    };
  }, [map, debouncedOnBoundsChange]);

  const handleMarkerClick = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedReport(null);
  }, []);

  return (
    <Map
      mapId="adoptme-map-style"
      defaultCenter={initialCenter || defaultCenterCoords}
      defaultZoom={initialZoom}
      gestureHandling={'cooperative'}
      disableDefaultUI={true}
      zoomControl={true}
      scrollwheel={true}
      draggable={true}
    >
      {reports.map((report) => {
        const { color, IconComponent } = markerStyles[report.report_type] || defaultMarkerStyle;
        return (
          <AdvancedMarker
            key={report.id}
            position={{ lat: report.location_lat, lng: report.location_lon }}
            ref={selectedReport?.id === report.id ? anchorRef : null}
            onClick={() => handleMarkerClick(report)}
          >
            <CustomPin color={color} IconComponent={IconComponent} />
          </AdvancedMarker>
        );
      })}

      {selectedReport && (
        <InfoWindow
          anchor={anchorElement}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-1 max-w-[220px] space-y-1">
            <h4 className="font-semibold text-sm capitalize truncate">
              {selectedReport.pet_name || selectedReport.pet_type || 'Reporte'}
              <Badge
                variant={selectedReport.report_type === 'LOST' || selectedReport.report_type === 'EMERGENCY' ? 'destructive' : 'secondary'}
                className="ml-1.5 text-xs px-1.5 py-0.5"
              >
                {selectedReport.report_type}
              </Badge>
            </h4>
            {selectedReport.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {selectedReport.description}
              </p>
            )}
            <Link
              href={`/report/${selectedReport.id}`}
              className="text-xs text-primary hover:underline font-medium block pt-1"
            >
              Ver detalles &rarr;
            </Link>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}

export function ReportMap({ mapHeight = defaultHeight, ...props }: ReportMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div className="text-destructive p-4 text-center">Error: API Key de Google Maps no configurada.</div>;
  }

  const mapContainerStyle = useMemo(() => ({
    ...mapContainerBaseStyle,
    height: mapHeight,
  }), [mapHeight]);

  return (
    <APIProvider apiKey={apiKey}>
      <div style={mapContainerStyle} className="bg-muted">
        <MapContent {...props} />
      </div>
    </APIProvider>
  );
}