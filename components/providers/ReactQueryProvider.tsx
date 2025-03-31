'use client' // El proveedor necesita ser un componente cliente

import React from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
// Opcional: Importar React Query DevTools
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export default function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Crear el cliente una sola vez por renderizado del proveedor
  // Usar useState para asegurar que no se recree en cada render
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Opciones globales para queries (opcional)
        // staleTime: 60 * 1000, // 1 minuto
        refetchOnWindowFocus: false, // Deshabilitar refetch al enfocar ventana
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Opcional: Añadir DevTools para desarrollo */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
} 