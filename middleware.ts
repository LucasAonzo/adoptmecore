import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Helper para verificar variables de entorno (opcional pero recomendado)
function checkEnvVariable(varName: string): string {
  const value = process.env[varName]
  if (!value) {
    throw new Error(`Environment variable ${varName} is not set.`)
  }
  return value
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Leer variables de entorno una sola vez
  const supabaseUrl = checkEnvVariable('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = checkEnvVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  // Crear cliente Supabase específico para middleware
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Si la cookie necesita ser seteada, clonamos la respuesta para poder modificarla
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Si la cookie necesita ser removida, clonamos la respuesta
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refrescar la sesión (importante para mantenerla activa)
  const { data: { session } } = await supabase.auth.getSession()

  // --- Lógica de protección de rutas ---
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = ['/pets/new']

  // Si el usuario no está autenticado y intenta acceder a una ruta protegida
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Redirigir a la página de login
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado y intenta acceder a login/signup, redirigir a home
  if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // Si todo está bien, continuar con la respuesta original (posiblemente modificada por set/remove cookies)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*) ',
  ],
} 