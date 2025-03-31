import { z } from "zod";

// Esquema para el formulario de Registro
export const signUpSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string()
})
// Refinar para asegurar que las contraseñas coincidan
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], // Mostrar error en el campo de confirmar contraseña
});

// Tipo inferido del esquema de registro
export type SignUpSchema = z.infer<typeof signUpSchema>;


// Esquema para el formulario de Inicio de Sesión
export const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }), // Mínimo 1 para saber que no está vacío
});

// Tipo inferido del esquema de inicio de sesión
export type LoginSchema = z.infer<typeof loginSchema>; 