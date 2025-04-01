import { SupabaseClient, type User } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types'; // Asumiendo que tus tipos generados están aquí
import { v4 as uuidv4 } from 'uuid'; // Necesitaremos uuid para nombres de archivo únicos
import { type ReportSubmitData } from '@/lib/schemas/reportSchema'; // Tipo para datos de entrada
import { type StorageError } from '@supabase/storage-js'; // Importar tipo de error

// Tipos basados en los ENUMs de la base de datos (ajustar si los nombres son diferentes)
export type ReportType = 'LOST' | 'FOUND' | 'EMERGENCY';
export type ReportStatus = 'ACTIVE' | 'RESOLVED' | 'CLOSED';

// Interfaz para representar un reporte completo (ASEGURARSE DE QUE ESTÉ EXPORTADA)
export interface Report { 
  id: string;
  report_type: ReportType;
  pet_name?: string | null;
  pet_type: string;
  pet_breed?: string | null;
  description: string;
  image_url?: string | null;
  location_lat: number;
  location_lon: number;
  location_description?: string | null;
  contact_info: string;
  reported_by_user_id: string;
  created_at: string;
  updated_at: string;
  status: ReportStatus;
}

// Interfaz para los límites geográficos del mapa
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Interfaz para filtros, ahora incluye bounds opcionales y permite 'ALL'
export interface ReportFilters {
  reportType?: ReportType | 'ALL'; // Permitir 'ALL' como opción válida
  petType?: string | 'ALL';      // Permitir 'ALL' como opción válida
  bounds?: MapBounds;             // Límites geográficos opcionales
}

// Constante para el número de items por página
const REPORTS_PAGE_SIZE = 10;
// CORRECCIÓN DEFINITIVA DEL NOMBRE DEL BUCKET
const REPORT_IMAGES_BUCKET = 'pet-images'; 

/**
 * Obtiene un reporte específico por su ID.
 * @param supabase Cliente Supabase.
 * @param id ID (UUID) del reporte.
 * @returns El reporte encontrado o null si no existe/error.
 */
export const getReportById = async (
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*') 
    .eq('id', id)
    .single(); 
  if (error) {
    console.error('Error fetching report by ID:', error);
    return null;
  }
  return data as Report;
};

/**
 * Obtiene una lista paginada de reportes activos, aplicando filtros opcionales.
 * @param supabase Cliente Supabase.
 * @param filters Objeto con los filtros a aplicar (incluyendo bounds).
 * @param page Número de página (0-indexed).
 * @returns Un array de reportes.
 */
export const getReports = async (
  supabase: SupabaseClient<Database>,
  filters: ReportFilters = {},
  page: number = 0
): Promise<{ reports: Report[], error?: string }> => { // Devolver objeto con error opcional
  try {
    const { from, to } = getPaginationRange(page, REPORTS_PAGE_SIZE);
    let query = supabase
      .from('reports')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Aplicar filtros estándar
    if (filters.reportType && filters.reportType !== 'ALL') { // Ahora la comparación es válida
      query = query.eq('report_type', filters.reportType);
    }
    if (filters.petType && filters.petType !== 'ALL') {       // Ahora la comparación es válida
      // Usar ilike para case-insensitive matching
      query = query.ilike('pet_type', `%${filters.petType}%`);
    }

    // Aplicar filtro geoespacial si se proporcionan los bounds
    if (filters.bounds) {
      const { north, south, east, west } = filters.bounds;
      // Filtrar latitud entre south y north
      query = query.gte('location_lat', south);
      query = query.lte('location_lat', north);
      // Filtrar longitud entre west y east
      query = query.gte('location_lon', west);
      query = query.lte('location_lon', east);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      // Lanzar error para que sea capturado por el catch
      throw new Error(`Error al obtener reportes: ${error.message}`);
    }

    // Devolver los datos sin error
    return { reports: data as Report[] };

  } catch (err) {
    // Capturar errores (de la query o lanzados manualmente)
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener reportes.';
    console.error('Caught error in getReports:', errorMessage);
    // Devolver un array vacío y el mensaje de error
    return { reports: [], error: errorMessage };
  }
};

/**
 * Sube una imagen para un reporte al bucket de Supabase Storage.
 * @param supabase Cliente Supabase.
 * @param file Archivo de imagen a subir.
 * @returns La URL pública de la imagen subida o null en caso de error.
 */
const uploadReportImage = async (
  supabase: SupabaseClient<Database>,
  file: File
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`; // Subir directamente al bucket raíz o a una carpeta si se prefiere

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(REPORT_IMAGES_BUCKET) // Usará 'pet-images'
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(REPORT_IMAGES_BUCKET) // Usará 'pet-images'
      .getPublicUrl(filePath); // Usar filePath directamente

    return urlData.publicUrl;

  } catch (error) {
    console.error('Error uploading report image to Supabase Storage. Full Error Object:', error);
    return null; 
  }
};

/**
 * Crea un nuevo reporte, subiendo una imagen si se proporciona.
 * @param supabase Cliente Supabase.
 * @param user Usuario autenticado actual.
 * @param reportData Datos del reporte (sin id, created_at, etc.).
 * @param imageFile Archivo de imagen opcional.
 * @returns El reporte creado o null en caso de error.
 */
export const createReport = async (
  supabase: SupabaseClient<Database>,
  user: User | null,
  reportData: ReportSubmitData, // Usar el tipo del schema
  imageFile?: File
): Promise<Report | null> => {
  if (!user) {
    throw new Error('Debes estar autenticado para crear un reporte.');
  }
  let imageUrl: string | null = null;
  if (imageFile) {
     console.log('Attempting to upload file:', { 
        name: imageFile.name, 
        size: imageFile.size, 
        type: imageFile.type 
     });
    try {
        imageUrl = await uploadReportImage(supabase, imageFile);
        if (!imageUrl) { // Verificar si uploadReportImage devolvió null
           throw new Error('La función uploadReportImage devolvió null.');
        }
    } catch (uploadError) {
        console.error("Fallo en uploadReportImage dentro de createReport:", uploadError);
         throw new Error('Error al subir la imagen. Inténtalo de nuevo.'); 
    }
  }

  const reportToInsert = {
    ...reportData,
    reported_by_user_id: user.id,
    image_url: imageUrl, 
  };

  try {
    const { data, error } = await supabase
      .from('reports')
      .insert(reportToInsert)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as Report;

  } catch(dbError) {
     console.error('Error inserting report into database:', dbError);
     if (imageUrl) { 
        try {
             const pathToRemove = imageUrl.substring(imageUrl.indexOf(REPORT_IMAGES_BUCKET) + REPORT_IMAGES_BUCKET.length + 1);
             console.log('Attempting to remove orphaned image:', pathToRemove);
             await supabase.storage.from(REPORT_IMAGES_BUCKET).remove([pathToRemove]);
        } catch (removeError) {
            console.error('Failed to remove orphaned image after DB error:', removeError);
        }
     }
     throw new Error('Error al guardar el reporte en la base de datos.');
  }
};

/**
 * Placeholder para actualizar un reporte (ej: cambiar status).
 * @param supabase Cliente Supabase.
 * @param reportId ID del reporte a actualizar.
 * @param updateData Datos a actualizar.
 * @returns El reporte actualizado o null en caso de error.
 */
export const updateReport = async (
  supabase: SupabaseClient<Database>,
  reportId: string,
  updateData: Partial<Pick<Report, 'status' | 'description' /* u otros campos */>>
): Promise<Report | null> => {
  // RLS se encargará de los permisos (owner o admin)
  const { data, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single();
  if (error) {
    console.error('Error updating report:', error);
    return null;
  }
  return data as Report;
};

// --- Helpers ---

/**
 * Calcula el rango para la paginación de Supabase.
 * @param page Número de página (0-indexed).
 * @param size Tamaño de la página.
 * @returns Objeto { from, to }.
 */
const getPaginationRange = (page: number, size: number) => {
  const from = page * size;
  const to = from + size - 1;
  return { from, to };
}; 