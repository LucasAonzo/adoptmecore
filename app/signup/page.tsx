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
import { cn } from "@/lib/utils"; // Import cn

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
    mode: 'onBlur'
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
          description: "Revisa tu email si es necesario verificarla. Serás redirigido a la página principal.",
          duration: 4000, // Reduced duration slightly
        });
        // Redirigir a la página principal
        router.push('/');
        router.refresh(); // Refresh layout/auth state

      } catch (profileError: any) {
        // Capturar error específico de la creación del perfil
        // El usuario Auth ya existe, pero el perfil falló
        toast.error("Error al guardar datos del perfil", {
          description: profileError.message || "Tu cuenta fue creada pero hubo un problema al guardar tus datos. Por favor, edita tu perfil más tarde. Serás redirigido a la página principal.",
          duration: 7000
        });
        // Redirigir a la página principal de todas formas
        router.push('/');
        router.refresh(); // Refresh layout/auth state
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
    // Aplicar fuente body y usar fondo global (sin clase explícita)
    <div className="flex items-center justify-center min-h-screen px-4 font-body">
      {/* Card usa bg-card, border, shadow, etc */}
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg border border-border">
        {/* Título: Aplicar fuente heading */}
        <h2 className="text-2xl font-heading font-bold text-center mb-6 text-foreground">Crear Cuenta</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    {/* Label: Aplicar fuente body y color foreground */}
                    <FormLabel className="font-body text-foreground">Nombre</FormLabel>
                    <FormControl>
                      {/* Input: Usa estilos theme, asegurar fuente body */}
                      <Input placeholder="Tu nombre" {...field} className="font-body" />
                    </FormControl>
                    {/* FormMessage: Usa destructive color, asegurar fuente body */}
                    <FormMessage className="font-body" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    {/* Label: Aplicar fuente body y color foreground */}
                    <FormLabel className="font-body text-foreground">Apellido</FormLabel>
                    <FormControl>
                      {/* Input: Usa estilos theme, asegurar fuente body */}
                      <Input placeholder="Tu apellido" {...field} className="font-body" />
                    </FormControl>
                     {/* FormMessage: Usa destructive color, asegurar fuente body */}
                    <FormMessage className="font-body" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  {/* Label: Aplicar fuente body y color foreground */}
                  <FormLabel className="font-body text-foreground">Email</FormLabel>
                  <FormControl>
                    {/* Input: Usa estilos theme, asegurar fuente body */}
                    <Input placeholder="tu@email.com" {...field} className="font-body" />
                  </FormControl>
                  {/* FormMessage: Usa destructive color, asegurar fuente body */}
                  <FormMessage className="font-body" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  {/* Label: Aplicar fuente body y color foreground */}
                  <FormLabel className="font-body text-foreground">Contraseña</FormLabel>
                  <FormControl>
                    {/* Input: Usa estilos theme, asegurar fuente body */}
                    <Input type="password" placeholder="••••••••" {...field} className="font-body" />
                  </FormControl>
                   {/* Description: Usa muted-foreground, asegurar fuente body */}
                  <FormDescription className="font-body text-xs">
                    Debe tener al menos 8 caracteres.
                  </FormDescription>
                  {/* FormMessage: Usa destructive color, asegurar fuente body */}
                  <FormMessage className="font-body" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  {/* Label: Aplicar fuente body y color foreground */}
                  <FormLabel className="font-body text-foreground">Confirmar Contraseña</FormLabel>
                  <FormControl>
                    {/* Input: Usa estilos theme, asegurar fuente body */}
                    <Input type="password" placeholder="••••••••" {...field} className="font-body" />
                  </FormControl>
                  {/* FormMessage: Usa destructive color, asegurar fuente body */}
                  <FormMessage className="font-body" />
                </FormItem>
              )}
            />
            {/* Button: variant="default" usa primary, asegurar fuente body y peso */} 
            <Button type="submit" disabled={loading} className="w-full font-body font-medium">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} 
              {loading ? "Creando..." : "Crear Cuenta"}
            </Button>
            {/* Texto inferior: usa muted-foreground, asegurar fuente body */}
            <p className="mt-4 text-center text-sm text-muted-foreground font-body">
             ¿Ya tienes cuenta?{" "}
             {/* Link: usa text-primary en hover, asegurar fuente y peso */}
             <Link href="/login" className="underline hover:text-primary font-medium">
               Inicia Sesión
             </Link>
           </p>
          </form>
        </Form>
      </div>
    </div>
  );
} 