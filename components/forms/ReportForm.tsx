'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UploadCloud, MapPin, LocateFixed } from 'lucide-react'; // Añadir LocateFixed
import { useRouter } from 'next/navigation'; // Para posible redirección
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { reportFormSchema, type ReportFormData, type ReportSubmitData } from '@/lib/schemas/reportSchema';
import { useCreateReport } from '@/lib/hooks/useReportsMutations'; // Importar el hook
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LocationPicker } from '@/components/maps/LocationPicker';
// import { toast } from 'sonner'; // toast ya se maneja en el hook

export function ReportForm() {
  const router = useRouter();
  const { mutate: createReportMutation, isPending } = useCreateReport();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      report_type: undefined,
      pet_name: '',
      pet_type: '',
      pet_breed: '',
      description: '',
      location_description: '',
      contact_info: '',
      imageFile: undefined,
    },
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationStatus('error');
      setGeolocationError('La geolocalización no es soportada por tu navegador.');
      return;
    }

    setGeolocationStatus('loading');
    setGeolocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        form.setValue('location_lat', latitude, { shouldValidate: true });
        form.setValue('location_lon', longitude, { shouldValidate: true });
        setMapCenter(newLocation);
        setGeolocationStatus('success');
      },
      (error) => {
        console.error("Error obteniendo geolocalización:", error);
        setGeolocationStatus('error');
        switch(error.code) {
            case error.PERMISSION_DENIED:
              setGeolocationError("Permiso de ubicación denegado.");
              break;
            case error.POSITION_UNAVAILABLE:
              setGeolocationError("Información de ubicación no disponible.");
              break;
            case error.TIMEOUT:
              setGeolocationError("La solicitud de ubicación expiró.");
              break;
            default:
              setGeolocationError("Ocurrió un error desconocido al obtener la ubicación.");
              break;
          }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  const currentLat = form.watch('location_lat');
  const currentLon = form.watch('location_lon');
  const initialMapCenter = mapCenter || (currentLat && currentLon ? { lat: currentLat, lng: currentLon } : undefined);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    form.setValue('location_lat', location.lat, { shouldValidate: true });
    form.setValue('location_lon', location.lng, { shouldValidate: true });
    setMapCenter(location);
  };

  function onSubmit(values: ReportFormData) {
    const { imageFile, ...reportDataToSend } = values;
    const finalReportData: ReportSubmitData = {
        report_type: reportDataToSend.report_type!,
        pet_name: reportDataToSend.pet_name || null,
        pet_type: reportDataToSend.pet_type,
        pet_breed: reportDataToSend.pet_breed || null,
        description: reportDataToSend.description,
        location_lat: reportDataToSend.location_lat, 
        location_lon: reportDataToSend.location_lon,
        location_description: reportDataToSend.location_description || null,
        contact_info: reportDataToSend.contact_info,
    };
    console.log('Submitting to backend:', finalReportData, imageFile);
    createReportMutation(
      { reportData: finalReportData, imageFile },
      {
        onSuccess: (createdReport) => {
          form.reset();
          if (createdReport?.id) {
             router.push(`/report/${createdReport.id}`);
          }
        },
        onError: (error) => {
          console.error('Error al crear reporte:', error);
          setSubmissionError(error.message || 'Ocurrió un error inesperado al guardar el reporte.');
        }
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         {/* Tipo de Reporte */}
        <FormField
          control={form.control}
          name="report_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
            
              <FormLabel>Tipo de Reporte *</FormLabel>
              <FormControl> 
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="LOST" id="type-lost" />
                    </FormControl>
                    <FormLabel htmlFor="type-lost" className="font-normal cursor-pointer">Perdido</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                     <FormControl>
                      <RadioGroupItem value="FOUND" id="type-found" />
                    </FormControl>
                    <FormLabel htmlFor="type-found" className="font-normal cursor-pointer">Encontrado</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                     <FormControl>
                      <RadioGroupItem value="EMERGENCY" id="type-emergency" />
                    </FormControl>
                    <FormLabel htmlFor="type-emergency" className="font-normal cursor-pointer">Urgencia</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            
            </FormItem>
          )}
        />

        {/* Nombre (Opcional) */}
        <FormField
          control={form.control}
          name="pet_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Mascota (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Luna" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Animal */}
        <FormField
          control={form.control}
          name="pet_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Animal *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de animal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Perro">Perro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Ave">Ave</SelectItem>
                  <SelectItem value="Roedor">Roedor</SelectItem>
                  <SelectItem value="Reptil">Reptil</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Raza (Opcional) */}
        <FormField
          control={form.control}
          name="pet_breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raza (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mestizo, Caniche" {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe la mascota, la situación, señas particulares, etc."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Cuantos más detalles, mejor. (Mínimo 10 caracteres)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Imagen (Opcional) */}
        <FormField
          control={form.control}
          name="imageFile"
          render={({ field: { onChange, value, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Imagen (Opcional)</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Vista previa" className="mx-auto h-32 w-auto object-contain rounded" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="flex text-sm text-muted-foreground justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary hover:text-primary/80"
                    >
                      <span>Sube un archivo</span>
                      <input 
                        id="image-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={(e) => {
                          onChange(e.target.files ? e.target.files[0] : null);
                          handleImageChange(e);
                        }}
                        accept="image/*" 
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF hasta 5MB</p>
                </div>
              </div>
              <FormDescription>
                Sube una foto clara si tienes una. Máximo 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden fields for latitude and longitude - MUST be registered */}
        <input type="hidden" {...form.register('location_lat')} />
        <input type="hidden" {...form.register('location_lon')} />

        {/* Location Selection Section (Manual Structure - No FormField) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <FormLabel className="text-base font-semibold flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Ubicación del Reporte *
            </FormLabel>
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={handleGetCurrentLocation}
              disabled={geolocationStatus === 'loading'}
            >
              {geolocationStatus === 'loading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              ) : (
                  <LocateFixed className="mr-2 h-4 w-4" /> 
              )}
              Usar mi ubicación
            </Button>
          </div>
          <FormDescription>
            {geolocationStatus === 'error' && geolocationError ? (
               <span className="text-destructive">Error: {geolocationError}</span> 
            ) : (
               'Haz clic en el mapa o usa tu ubicación actual.'
            )}
          </FormDescription>
          <LocationPicker
            center={initialMapCenter}
            initialZoom={11}
            selectedZoom={16}
            onLocationChange={handleLocationChange}
          />
          {(form.formState.errors.location_lat || form.formState.errors.location_lon) && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.location_lat?.message || form.formState.errors.location_lon?.message || 'Debes seleccionar una ubicación válida en el mapa.'}
            </p>
          )}
        </div>

        {/* Descripción Ubicación (Opcional) */}
        <FormField
          control={form.control}
          name="location_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Adicional de la Ubicación (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Cerca de la plaza principal, esquina Belgrano y 25" {...field} value={field.value ?? ''}/>
              </FormControl>
               <FormDescription>
                Esto aparecerá junto al marcador en el mapa.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Información de Contacto */}
        <FormField
          control={form.control}
          name="contact_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Información de Contacto *</FormLabel>
              <FormControl>
                 <Input placeholder="Tu nombre y teléfono, email, o cómo prefieres que te contacten" {...field} />
              </FormControl>
               <FormDescription>
                Esta información será visible públicamente en el reporte.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mensaje de error de envío general */}
        {submissionError && (
          <Alert variant="destructive">
            <AlertTitle>Error al Enviar</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}

        {/* Botón de Envío */}
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
          ) : 'Crear Reporte'}
        </Button>
      </form>
    </Form>
  );
} 