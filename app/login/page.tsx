'use client'; // Necesario para usar hooks (useState, useForm) y manejo de eventos

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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
import { loginSchema, LoginSchema } from "@/lib/schemas/authSchemas"; // Importamos el esquema y tipo
import { createClient } from "@/lib/supabaseClient"; // Importamos la función creadora

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Crear la instancia del cliente Supabase aquí
  const supabase = createClient();

  // 1. Definir el formulario
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: 'onBlur'
  });

  // 2. Definir el handler para el submit
  async function onSubmit(values: LoginSchema) {
    setIsLoading(true);
    toast.info("Iniciando sesión...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast.success("¡Inicio de sesión exitoso!", {
        description: "Serás redirigido en breve.",
        duration: 3000,
      });
      // Redirigir a la página principal (o a donde sea apropiado)
      router.push('/');
      router.refresh(); // Asegurar refresco del estado de autenticación global

    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión", {
        description: error.code === 'auth/invalid-credential' || error.message.includes('Invalid login credentials')
          ? "Credenciales inválidas. Verifica tu email y contraseña."
          : error.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <div className="max-w-md w-full bg-background p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</> : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="underline hover:text-primary">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
} 