'use client'; // Necesario para usar hooks (useState, useForm) y manejo de eventos

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { signUpSchema, SignUpSchema } from "@/lib/schemas/authSchemas"; // Importamos el esquema y tipo
import { createClient } from "@/lib/supabaseClient"; // Importamos la función creadora
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner"; // Para mostrar notificaciones
import { Loader2 } from "lucide-react";
import Link from "next/link"; // Importar Link

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Crear la instancia del cliente Supabase llamando a la función
  const supabase = createClient();

  // 1. Definir el formulario usando react-hook-form
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 2. Definir el handler para el submit
  async function onSubmit(values: SignUpSchema) {
    setLoading(true);
    toast.info("Creando cuenta..."); // Notificación de inicio

    try {
      // 1. Registrar en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        throw authError; // Lanzar error de autenticación
      }

      // Verificar si se obtuvo el usuario (importante para ID)
      if (!authData.user) {
        throw new Error("No se pudo obtener el usuario después del registro.");
      }

      // 2. Crear perfil llamando a la función RPC (SI Auth tuvo éxito)
      try {
        const { error: rpcError } = await supabase.rpc('create_user_profile', {
          user_id: authData.user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email // Pasar email también
        });

        if (rpcError) {
          // Error específico al crear perfil (Auth funcionó pero RPC falló)
          console.error("Error RPC create_user_profile:", rpcError);
          // Quizás revertir Auth? O notificar para completar manualmente?
          // Por ahora, solo notificamos el problema específico.
          throw new Error(`Error al crear el perfil: ${rpcError.message}`);
        }

        // Éxito completo (Auth + Profile)
        toast.success("¡Cuenta creada con éxito!", {
          description: "Revisa tu email para confirmar si es necesario. Serás redirigido.",
          duration: 5000,
        });
        // Redirigir a login o a una página de bienvenida/perfil
        setTimeout(() => router.push('/login'), 5000);

      } catch (profileError: any) {
        // Capturar error específico de la creación del perfil
        // El usuario Auth ya existe, pero el perfil falló
        toast.error("Error al guardar datos del perfil", {
          description: profileError.message || "Tu cuenta fue creada pero hubo un problema al guardar tus datos. Por favor, edita tu perfil más tarde.",
          duration: 7000
        });
        // Redirigir a login de todas formas?
        setTimeout(() => router.push('/login'), 7000);
      }

    } catch (authError: any) {
      // Capturar error del signUp inicial
      console.error("Error en SignUp (Auth):", authError);
      toast.error("Error al crear la cuenta", {
        description: authError.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Crear Cuenta</h2>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormDescription>
                    Debe tener al menos 8 caracteres.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormDescription>
                    Por favor, confirma tu contraseña.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} 
              {loading ? "Creando..." : "Crear Cuenta"}
            </Button>
             {/* Opcional: Añadir link a la página de login */}
             <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Inicia Sesión
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
} 