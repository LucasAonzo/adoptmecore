'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { petSchema, PetSchema, speciesOptions, genderOptions, sizeOptions } from "@/lib/schemas/petSchema";
import { useAddPet } from "@/lib/hooks/usePetsMutations"; // Hook de mutación

export default function AddPetPage() {
  const router = useRouter();
  const addPetMutation = useAddPet(); // Obtener la mutación
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<PetSchema>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: undefined,
      breed: "",
      age_years: undefined,
      age_months: undefined,
      gender: undefined,
      size: undefined,
      description: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setImageFile(file);
        // Crear previsualización
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setImageFile(null);
        setImagePreview(null);
    }
  };

  async function onSubmit(values: PetSchema) {
    if (!imageFile) {
        toast.error("Por favor, selecciona una imagen para la mascota.");
        return;
    }
    // Llamar a la mutación con los datos del formulario y el archivo
    addPetMutation.mutate({ petData: values, imageFile });
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Agregar Nueva Mascota</h1>
      <Form {...form}>
        {/* Usar encType="multipart/form-data" si subiéramos de forma tradicional, pero con Supabase client no es estrictamente necesario */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Buddy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Imagen */}
          <FormItem>
             <FormLabel>Imagen Principal *</FormLabel>
             <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
             </FormControl>
             {imagePreview && (
                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Previsualización:</p>
                    <img src={imagePreview} alt="Previsualización" className="h-40 w-auto rounded-md object-cover" />
                </div>
             )}
             <FormMessage>{!imageFile && form.formState.isSubmitted ? "La imagen es requerida." : ""}</FormMessage>
          </FormItem>

          {/* Especie (Select) */}
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
                    {speciesOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            {/* Capitalizar opción */} 
                            {option.charAt(0).toUpperCase() + option.slice(1)}
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
                  {/* Asegurarse de pasar null si el valor es vacío */}
                  <Input placeholder="Labrador" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value || null)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Edad (Años y Meses) - Podríamos usar un layout grid aquí */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="age_years"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Años</FormLabel>
                    <FormControl>
                    <Input type="number" min="0" placeholder="2" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="age_months"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Meses</FormLabel>
                    <FormControl>
                     <Input type="number" min="0" max="11" placeholder="6" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          {/* Género (Select) */}
           <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genderOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tamaño (Select) */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamaño</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tamaño" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizeOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe la personalidad, historia, necesidades..."
                    className="resize-y min-h-[100px]"
                    {...field}
                    value={field.value ?? ''}
                     onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={addPetMutation.isPending} className="w-full">
            {addPetMutation.isPending ? "Agregando Mascota..." : "Agregar Mascota"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 