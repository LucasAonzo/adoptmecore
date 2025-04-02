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
  full_name: z.string().min(2, {
    message: "El nombre completo debe tener al menos 2 caracteres.",
  }).max(100).optional().or(z.literal('')), // Allow empty string or optional
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres.",
  }).max(50).regex(/^[a-zA-Z0-9_]+$/, {
      message: "Solo letras, números y guión bajo."
  }).optional().or(z.literal('')),
  // avatar_url: z.string().url({ message: "Por favor ingresa una URL válida." }).optional().or(z.literal('')),
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
      full_name: '', // Initialize empty
      username: '',
      // avatar_url: '',
    },
    mode: 'onChange',
  });

  // Populate form with fetched profile data once available
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        // avatar_url: profile.avatar_url ?? '',
      });
    }
  }, [profile, form.reset]);

  // Form submission handler
  function onSubmit(values: ProfileFormValues) {
    console.log("Form submitted:", values);
    const payload: UpdateProfilePayload = {
        full_name: values.full_name || null,
        username: values.username || null,
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
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Juan Perez" {...field} />
                </FormControl>
                <FormDescription>
                  Tu nombre como quieres que aparezca.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  Un nombre único para identificarte (letras, números, _).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Add Avatar URL field later if needed */}

          <Button type="submit" disabled={isUpdatingProfile || !form.formState.isDirty}>
            {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Guardar Cambios
          </Button>
        </form>
      </Form>

    </div>
  );
} 