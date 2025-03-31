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
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        // Podríamos añadir opciones como metadata o redirección aquí
        // options: {
        //   emailRedirectTo: `${location.origin}/auth/callback`,
        // }
      });

      if (error) {
        throw error; // Lanzar error para capturarlo en el catch
      }

      // Éxito - Supabase enviará un email de confirmación si está habilitado
      toast.success("¡Cuenta creada! Revisa tu email para confirmar.", {
        description: "Serás redirigido al inicio de sesión.",
        duration: 5000,
      });
      // Redirigir a login después de un momento
      setTimeout(() => router.push('/login'), 5000);

    } catch (error: any) {
      console.error("Error en SignUp:", error);
      toast.error("Error al crear la cuenta", {
        description: error.message || "Ocurrió un error inesperado.",
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tu dirección de correo electrónico.
                  </FormDescription>
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
                    Debe tener al menos 6 caracteres.
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
              {loading ? "Creando..." : "Crear Cuenta"}
            </Button>
             {/* Opcional: Añadir link a la página de login */}
             <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Inicia Sesión
              </a>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
} 