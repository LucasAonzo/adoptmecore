import { z } from 'zod';

// Mensajes de error comunes
const REQUIRED_FIELD_MESSAGE = 'Este campo es requerido';
const INVALID_TYPE_MESSAGE = 'Tipo de dato inválido';

// Esquema base para los datos del reporte
export const reportSchemaBase = z.object({
  report_type: z.enum(['LOST', 'FOUND', 'EMERGENCY'], {
    required_error: 'Debes seleccionar el tipo de reporte',
    invalid_type_error: 'Tipo de reporte inválido',
  }),
  pet_name: z.string().optional().nullable(), // Opcional
  pet_type: z.string({
    required_error: 'Debes indicar el tipo de animal',
    invalid_type_error: INVALID_TYPE_MESSAGE,
  }).min(1, 'Debes indicar el tipo de animal'),
  pet_breed: z.string().optional().nullable(), // Opcional
  description: z.string({
    required_error: 'La descripción es requerida',
    invalid_type_error: INVALID_TYPE_MESSAGE,
  }).min(10, 'La descripción debe tener al menos 10 caracteres'),
  location_lat: z.number({
    required_error: 'La latitud es requerida',
    invalid_type_error: 'La latitud debe ser un número',
  }).min(-90, 'Latitud inválida').max(90, 'Latitud inválida'),
  location_lon: z.number({
    required_error: 'La longitud es requerida',
    invalid_type_error: 'La longitud debe ser un número',
  }).min(-180, 'Longitud inválida').max(180, 'Longitud inválida'),
  location_description: z.string().optional().nullable(), // Opcional
  contact_info: z.string({
    required_error: 'La información de contacto es requerida',
    invalid_type_error: INVALID_TYPE_MESSAGE,
  }).min(5, 'La información de contacto parece muy corta'),
});

// Esquema para la subida de imagen (usado en el formulario del cliente)
// Permitimos undefined para el caso inicial, y null si el usuario no sube nada o borra la selección.
// Limitamos tamaño y tipo de archivo.
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const reportFormSchema = reportSchemaBase.extend({
  imageFile: z
    .instanceof(File, { message: "Se esperaba un archivo." })
    .optional()
    .refine((file) => file === undefined || file?.size <= MAX_FILE_SIZE, {
      message: `El tamaño máximo es 5MB.`,
    })
    .refine(
      (file) => file === undefined || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      {
        message:
          "Formato inválido. Solo se aceptan .jpg, .jpeg, .png y .webp.",
      }
    ),
});

// Tipo inferido del esquema del formulario para usar en react-hook-form
export type ReportFormData = z.infer<typeof reportFormSchema>;

// Tipo para los datos que se enviarán al backend (sin el imageFile)
export type ReportSubmitData = z.infer<typeof reportSchemaBase>; 