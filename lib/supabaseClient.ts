// Usar createBrowserClient para el cliente que se usará en el navegador
import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Mantener las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar que las variables estén presentes
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables.')
}

/**
 * Crea un cliente Supabase para componentes del lado del cliente (navegador).
 */
export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )

/**
 * Crea un cliente Supabase para componentes del lado del servidor (RSC, API Routes, Server Actions).
 * Requiere el store de cookies de Next.js.
 */
export const createServerSupabaseClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Definir set y remove para Server Actions si es necesario más adelante
        // set(name: string, value: string, options: CookieOptions) {
        //   cookieStore.set({ name, value, ...options });
        // },
        // remove(name: string, options: CookieOptions) {
        //   cookieStore.set({ name, value: '', ...options });
        // },
      },
    }
  )
}

/**
 * Crea un cliente Supabase específicamente para el Middleware de Next.js.
 * Requiere request y response.
 */
// Esta función puede no ser necesaria si manejamos todo en el middleware principal
// export const createMiddlewareClient = (req: NextRequest, res: NextResponse) => {
//   return createServerClient(
//     supabaseUrl,
//     supabaseAnonKey,
//     {
//       cookies: {
//         get(name: string) {
//           return req.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           res.cookies.set({ name, value, ...options });
//         },
//         remove(name: string, options: CookieOptions) {
//           res.cookies.set({ name, value: '', ...options });
//         },
//       },
//     }
//   );
// };

// Nota: Si necesitáramos un cliente diferente para Server Components/Server Actions,
// podríamos crear una función getSupabaseServerClient() separada usando createServerClient
// o ajustar esta exportación. 