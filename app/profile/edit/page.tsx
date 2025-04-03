// Basic structure for the edit profile page
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileById, updateProfile, type Profile, type UpdateProfilePayload } from '@/lib/services/profiles';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner";

// Zod schema for profile form validation
const profileFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre no puede exceder los 50 caracteres."),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").max(50, "El apellido no puede exceder los 50 caracteres."),
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }).max(50).regex(/^[a-zA-Z0-9_]+$/, {
      message: "Solo letras, números y guión bajo."
  }).optional().or(z.literal('')),
  phone_number: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, "La biografía no puede exceder los 500 caracteres.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// --- Profile Update Mutation Hook ---
const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { supabase, user } = useAuth();

  return useMutation<Profile | null, Error, UpdateProfilePayload>({
      mutationFn: (updates) => {
          if (!supabase || !user?.id) throw new Error("Usuario no autenticado");
          return updateProfile(supabase, user.id, updates);
      },
      onSuccess: (updatedProfile) => {
          toast.success("Perfil actualizado con éxito!");
          // Update the profile cache
          queryClient.setQueryData(['profile', user?.id], updatedProfile);
          // Optionally invalidate other queries that might use profile data
      },
      onError: (error) => {
          toast.error(`Error al actualizar perfil: ${error.message}`);
      },
  });
};
// ----------------------------------

export default function EditProfilePage() {
  const { supabase, user, isLoading: isAuthLoading } = useAuth();
  const { mutate: updateProfileMutate, isPending: isUpdatingProfile } = useUpdateProfileMutation();

  // Fetch current profile data
  const { 
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError 
  } = useQuery<Profile | null, Error>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return null;
      return getProfileById(supabase, user.id);
    },
    enabled: !!supabase && !!user?.id, // Only run if supabase and user are available
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      phone_number: '',
      city: '',
      province: '',
      bio: '',
    },
    mode: 'onChange',
  });

  // Populate form with fetched profile data once available
  useEffect(() => {
    if (profile) {
      console.log("Populating form with profile data:", JSON.stringify(profile, null, 2)); 
      form.reset({
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        username: profile.username ?? '',
        phone_number: profile.phone_number ?? '',
        city: profile.city ?? '',
        province: profile.province ?? '',
        bio: profile.bio ?? '',
      });
    }
  }, [profile, form.reset]);

  // Form submission handler
  function onSubmit(values: ProfileFormValues) {
    console.log("Form submitted:", values);
    const payload: UpdateProfilePayload = {
        first_name: values.firstName,
        last_name: values.lastName,
        username: values.username || null,
        phone_number: values.phone_number || null,
        city: values.city || null,
        province: values.province || null,
        bio: values.bio || null,
        avatar_url: profile?.avatar_url === undefined ? null : profile?.avatar_url,
    };
    updateProfileMutate(payload);
  }

  // Handle loading states
  if (isAuthLoading || (isLoadingProfile && !profile)) {
    return <div className="container mx-auto p-4 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // Handle error state
  if (profileError) {
    return <div className="container mx-auto p-4 text-red-500">Error al cargar perfil: {profileError.message}</div>;
  }

  // Handle case where user is not logged in (should ideally be caught by middleware/layout)
  if (!user) {
      return <div className="container mx-auto p-4 text-red-500">Debes iniciar sesión para editar tu perfil.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de Usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: juanperez99" {...field} />
                </FormControl>
                <FormDescription>
                  Un nombre único (letras, números, _). No uses tu email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: +54 9 11 12345678" {...field} value={field.value ?? ''} />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad (Opcional)</FormLabel>
                    <FormControl>
                       <Input placeholder="Ej: Buenos Aires" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia/Estado (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CABA" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
           </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía (Opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Cuéntanos un poco sobre ti..."
                      {...field}
                      value={field.value ?? ''}
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                   <FormDescription>
                    Máximo 500 caracteres.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Button type="submit" disabled={isUpdatingProfile || !form.formState.isDirty}>
            {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </form>
      </Form>

    </div>
  );
} 