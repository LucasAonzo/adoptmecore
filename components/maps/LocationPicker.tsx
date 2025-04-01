'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

interface LocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  initialZoom?: number;
  selectedZoom?: number;
  mapHeight?: string;
}

const mapContainerBaseStyle = {
  width: '100%',
  borderRadius: '0.5rem',
};

const defaultCenterCoords = {
  lat: -34.6037, // Buenos Aires
  lng: -58.3816,
};
const defaultInitialZoom = 11;
const defaultSelectedZoom = 16;
const defaultHeight = '300px';

// Definir fuera y con tipo simple
const googleMapsLibraries: ('places')[] = ['places'];

export function LocationPicker({
  onLocationChange,
  initialCenter,
  center: dynamicCenter,
  initialZoom = defaultInitialZoom,
  selectedZoom = defaultSelectedZoom,
  mapHeight = defaultHeight
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: googleMapsLibraries,
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    dynamicCenter || initialCenter || null
  );

  const effectiveCenter = useMemo(() => dynamicCenter || initialCenter || defaultCenterCoords, [dynamicCenter, initialCenter]);
  const effectiveZoom = useMemo(() =>
    (dynamicCenter || markerPosition) ? selectedZoom : initialZoom,
    [dynamicCenter, markerPosition, initialZoom, selectedZoom]
  );

  const mapContainerStyle = useMemo(() => ({
    ...mapContainerBaseStyle,
    height: mapHeight,
  }), [mapHeight]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPosition(newLocation);
      onLocationChange(newLocation);
    }
  }, [onLocationChange]);

  useEffect(() => {
    if (dynamicCenter) {
      setMarkerPosition(dynamicCenter);
    }
  }, [dynamicCenter]);

  if (loadError) {
    return <div className="text-destructive p-4 text-center">Error al cargar el mapa: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando selector de ubicación...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={effectiveCenter}
      zoom={effectiveZoom}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {markerPosition && (
        <MarkerF
          position={markerPosition}
        />
      )}
    </GoogleMap>
  );
}