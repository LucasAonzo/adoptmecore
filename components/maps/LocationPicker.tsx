'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Loader2, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { cn } from '@/lib/utils';

const defaultInitialZoom = 11;
const defaultSelectedZoom = 16;

interface LocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  initialZoom?: number;
  selectedZoom?: number;
  mapHeight?: string;
  biasLocation?: { lat: number; lng: number };
  
}

const mapContainerBaseStyle = {
  width: '100%',
  borderRadius: '0.5rem',
};

const defaultCenterCoords = {
  lat: -34.6037, // Buenos Aires
  lng: -58.3816,
};
const defaultHeight = '300px';

const googleMapsLibraries: ('places')[] = ['places'];

interface LocationPickerInnerProps extends LocationPickerProps {
  // No necesita props adicionales por ahora, pero las hereda
}

// --- Helper para validar coordenadas aproximadas de Argentina ---
const isValidArgentinianCoord = (coord: { lat: number; lng: number } | undefined | null): boolean => {
  if (!coord) return false;
  // Rango MUY amplio para latitud y longitud de Argentina
  return coord.lat >= -56 && coord.lat <= -21 && coord.lng >= -74 && coord.lng <= -53;
};
// ----------------------------------------------------------------

function LocationPickerInner({
  onLocationChange,
  initialCenter,
  center: dynamicCenter,
  initialZoom = defaultInitialZoom,
  selectedZoom = defaultSelectedZoom,
  mapHeight = defaultHeight,
  biasLocation
}: LocationPickerInnerProps) {

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    dynamicCenter || initialCenter || null
  );
  const mapRef = useRef<google.maps.Map | null>(null);

  const {
    ready,
    value,
    suggestions: { status, data: suggestionsData },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: biasLocation ? new google.maps.LatLng(biasLocation.lat, biasLocation.lng) : undefined,
      radius: biasLocation ? 100000 : undefined, // 100 km radius bias
      componentRestrictions: { country: 'ar' },
      types: ['address'],
    },
    debounce: 300,
  });

  const effectiveCenter = useMemo(() => dynamicCenter || initialCenter || defaultCenterCoords, [dynamicCenter, initialCenter]);
  const effectiveZoom = useMemo(() =>
    (dynamicCenter || markerPosition) ? selectedZoom : initialZoom,
    [dynamicCenter, markerPosition, initialZoom, selectedZoom]
  );

  const mapContainerStyle = useMemo(() => ({
    ...mapContainerBaseStyle,
    height: mapHeight,
  }), [mapHeight]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setMarkerPosition(newLocation);
      setValue('');
      clearSuggestions();
      onLocationChange(newLocation);
    }
  }, [onLocationChange, setValue, clearSuggestions]);

  const handleSelectSuggestion = useCallback(async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      const newLocation = { lat, lng };
      setMarkerPosition(newLocation);
      onLocationChange(newLocation);
      mapRef.current?.panTo(newLocation);
      mapRef.current?.setZoom(selectedZoom);
    } catch (error) {
      console.error("Error getting location coordinates: ", error);
    }
  }, [setValue, clearSuggestions, onLocationChange, selectedZoom]);

  useEffect(() => {
    if (dynamicCenter) {
      setMarkerPosition(dynamicCenter);
      setValue('');
    }
  }, [dynamicCenter, setValue]);

  if (!ready) {
    return (
      <div style={{ ...mapContainerStyle, height: mapHeight }} className="flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Inicializando búsqueda de lugares...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar dirección o lugar..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className="pr-10"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setValue('')}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {status === 'OK' && (
          <ul className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            {suggestionsData.map(({ place_id, description }) => (
              <li key={place_id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                  onClick={() => handleSelectSuggestion(description)}
                >
                  {description}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {status === 'ZERO_RESULTS' && value && (
          <p className="text-sm text-muted-foreground mt-1">No se encontraron resultados.</p>
        )}
      </div>
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={effectiveCenter}
        zoom={effectiveZoom}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
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
    </div>
  );
}

export function LocationPicker(props: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: googleMapsLibraries,
  });

  const mapHeight = props.mapHeight || defaultHeight;
  const mapContainerStyle = useMemo(() => ({
    ...mapContainerBaseStyle,
    height: mapHeight,
  }), [mapHeight]);

  if (loadError) {
    return <div className="text-destructive p-4 text-center">Error al cargar API de Google Maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando API de Google Maps...</span>
      </div>
    );
  }

  return <LocationPickerInner {...props} />;
}