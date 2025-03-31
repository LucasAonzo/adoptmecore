import { z } from "zod";

// Opciones predefinidas (ejemplo)
const SPECIES = ["dog", "cat", "other"] as const;
const GENDERS = ["male", "female", "unknown"] as const;
const SIZES = ["small", "medium", "large", "xlarge"] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const petSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(50, "El nombre no puede exceder los 50 caracteres."),
  species: z.enum(SPECIES, { errorMap: () => ({ message: "Selecciona una especie válida." }) }).optional().nullable(),
  breed: z.string().max(50, "La raza no puede exceder los 50 caracteres.").optional().nullable(),
  // Usar .coerce para convertir la entrada del formulario (string) a número
  age_years: z.coerce.number().int().min(0).max(30).optional().nullable(),
  age_months: z.coerce.number().int().min(0).max(11).optional().nullable(),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Selecciona un género válido." }) }).optional().nullable(),
  size: z.enum(SIZES, { errorMap: () => ({ message: "Selecciona un tamaño válido." }) }).optional().nullable(),
  description: z.string().max(1000, "La descripción no puede exceder los 1000 caracteres.").optional().nullable(),
  // Para el input de archivo, la validación suele ser más compleja y se hace en el submit.
  // Aquí no incluimos image_url porque se generará después de subir a Storage.
  // shelter_id: z.coerce.number().int().positive().optional().nullable(), // Si tuviéramos selección de refugio
  status: z.enum(['available', 'pending_adoption', 'adopted']).optional(),
  image: z
    .any()
    // Hacer la validación de imagen opcional en el schema base,
    // podríamos requerirla específicamente en el formulario si es necesario.
    .refine((files) => !files || files?.[0]?.size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
    .refine(
      (files) => !files || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Solo se aceptan formatos .jpg, .jpeg, .png y .webp."
    )
    .optional(),
});

// Tipo inferido del esquema
export type PetSchema = z.infer<typeof petSchema>;

// Exportar opciones para usarlas en los <select>
export const speciesOptions = SPECIES;
export const genderOptions = GENDERS;
export const sizeOptions = SIZES; 