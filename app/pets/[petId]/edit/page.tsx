'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petSchema, type PetSchema as PetFormSchema, speciesOptions, genderOptions, sizeOptions } from '@/lib/schemas/petSchema';
import { usePetById } from '@/lib/hooks/usePets';
import { useUpdatePet } from '@/lib/hooks/usePetsMutations';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import Image from 'next/image';

// Definir placeholder localmente
const placeholderImage = "/placeholder-pet.svg";

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 1. Obtener datos actuales de la mascota
  const { data: currentPet, isLoading: isLoadingPet, isError: isPetError, error: petError } = usePetById(petId);

  // 2. Hook de mutación para actualizar
  const { mutate: updatePetMutation, isPending: isUpdating } = useUpdatePet();

  // 3. Configuración del formulario
  const form = useForm<PetFormSchema>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      species: null,
      breed: '',
      age_years: null,
      age_months: null,
      gender: null,
      size: null,
      description: '',
      status: 'available',
      image: undefined,
    },
  });

  // 4. Efecto para llenar el formulario cuando los datos de la mascota carguen
  useEffect(() => {
    if (currentPet) {
      // Validar que el valor de species sea uno de los permitidos o null
      const validSpecies = speciesOptions.includes(currentPet.species as any) ? currentPet.species : null;
      const validGender = genderOptions.includes(currentPet.gender as any) ? currentPet.gender : null;
      const validSize = sizeOptions.includes(currentPet.size as any) ? currentPet.size : null;
      // Asumiendo que status viene bien de la DB o usar un default
      const validStatus = ['available', 'pending_adoption', 'adopted'].includes(currentPet.status as any) ? currentPet.status : 'available';

      form.reset({
        name: currentPet.name || '',
        species: validSpecies as PetFormSchema['species'],
        breed: currentPet.breed || '',
        age_years: currentPet.age_years,
        age_months: currentPet.age_months,
        gender: validGender as PetFormSchema['gender'],
        size: validSize as PetFormSchema['size'],
        description: currentPet.description || '',
        status: validStatus as PetFormSchema['status'],
        image: undefined,
      });
      // Mostrar imagen actual como preview inicial
      setPreviewImage(currentPet.primary_image_url ?? placeholderImage);
    }
  }, [currentPet, form]);

  // 5. Manejador de Submit
  const onSubmit = (formData: PetFormSchema) => {
    console.log("Form data submitted:", formData);
    const newImageFile = formData.image?.[0]; // Obtener el archivo si se seleccionó uno nuevo

    updatePetMutation(
        { petId, formData, newImageFile },
        {
            onSuccess: (updatedPet) => {
                // Redirigir a la página de detalles después de actualizar
                toast.success(`"${updatedPet.name}" actualizado.`); // Mensaje extra opcional
                router.push(`/pets/${petId}`);
                router.refresh(); // Asegurar que la página de detalles cargue datos frescos
            },
            // onError ya se maneja en el hook
        }
    );
  };

  // 6. Manejo de cambio de imagen para preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Si se deselecciona el archivo, volver a mostrar la imagen original (si existe)
      setPreviewImage(currentPet?.primary_image_url ?? placeholderImage);
    }
  };

  // --- Renderizado --- //

  if (isLoadingPet) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isPetError || !currentPet) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error al cargar datos</AlertTitle>
        <AlertDescription>
          {petError?.message || "No se pudo cargar la información de la mascota para editar."}
        </AlertDescription>
      </Alert>
    );
  }

  // TODO: Añadir verificación de permisos (si el usuario actual es el owner)
  // const { data: { session } } = useSupabase().auth.getSession(); -> Necesitaríamos hook/contexto de sesión
  // if (session?.user?.id !== currentPet.added_by_user_id) { return <p>No tienes permiso...</p> }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Editar Mascota: {currentPet.name}</CardTitle>
          <CardDescription>Actualiza la información de la mascota.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Buddy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Imagen Preview y Upload */}
              <FormItem>
                 <FormLabel>Imagen Principal</FormLabel>
                 <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded border overflow-hidden bg-muted">
                        <Image
                            src={previewImage ?? placeholderImage}
                            alt="Vista previa"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="96px"
                        />
                    </div>
                    <FormControl>
                        <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        {...form.register("image", { onChange: handleImageChange })} // Registrar y manejar cambio
                        />
                    </FormControl>
                 </div>
                 <FormMessage>{form.formState.errors.image?.message?.toString()}</FormMessage>
                 <FormDescription>
                   Puedes subir una nueva imagen principal (Max 5MB: jpg, png, webp).
                 </FormDescription>
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Especie */}
                <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una especie" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {speciesOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option === 'dog' ? 'Perro' : option === 'cat' ? 'Gato' : 'Otro'}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Raza */}
                <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Raza</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Mestizo" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Años */}
                 <FormField
                    control={form.control}
                    name="age_years"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Años</FormLabel>
                        <FormControl>
                            <Input type="number" min="0" max="30" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 {/* Meses */}
                 <FormField
                    control={form.control}
                    name="age_months"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Meses</FormLabel>
                        <FormControl>
                            <Input type="number" min="0" max="11" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 {/* Género */}
                 <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona género" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {genderOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option === 'male' ? 'Macho' : option === 'female' ? 'Hembra' : 'Desconocido'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tamaño */}
                <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tamaño</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tamaño" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {sizeOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                    {option === 'small' ? 'Pequeño' : option === 'medium' ? 'Mediano' : option === 'large' ? 'Grande' : 'Muy Grande'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Status */}
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? 'available'}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="available">Disponible</SelectItem>
                                <SelectItem value="pending_adoption">Adopción Pendiente</SelectItem>
                                <SelectItem value="adopted">Adoptado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe la historia, temperamento, necesidades especiales..."
                        className="resize-none"
                        rows={5}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()} // Volver a la página anterior
                    disabled={isUpdating}
                 >
                    Cancelar
                 </Button>
                 <Button type="submit" disabled={isUpdating}>
                   {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
                 </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 