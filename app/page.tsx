'use client'; // Volver a marcar como Client Component

import React, { useState, useMemo } from 'react'; // Importar useMemo si se usa más adelante
import { usePets } from '@/lib/hooks/usePets'; // Usar hook cliente
import { useDebounce } from '@/lib/hooks/useDebounce'; // Importar debounce
import PetCard from '@/components/PetCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Search, Loader2, RotateCcw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importar Select
import { speciesOptions, genderOptions, sizeOptions } from "@/lib/schemas/petSchema"; // Importar opciones
import { Button } from "@/components/ui/button"; // Importar Button

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Estados para los filtros, usando 'all' como valor para "Todos"
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Pasar filtros al hook usePets (el valor 'all' será ignorado por getPets)
  const { data: pets, isLoading, isFetching, isError, error } = usePets(
      debouncedSearchTerm,
      speciesFilter === 'all' ? undefined : speciesFilter, // Pasar undefined si es 'all'
      genderFilter === 'all' ? undefined : genderFilter,
      sizeFilter === 'all' ? undefined : sizeFilter
    );

  // Determinar si hay algún filtro activo para mostrar el botón de reset
  const isAnyFilterActive = useMemo(() => {
      return debouncedSearchTerm !== '' || speciesFilter !== 'all' || genderFilter !== 'all' || sizeFilter !== 'all';
  }, [debouncedSearchTerm, speciesFilter, genderFilter, sizeFilter]);

  // Función para resetear filtros
  const handleResetFilters = () => {
      setSearchTerm('');
      setSpeciesFilter('all');
      setGenderFilter('all');
      setSizeFilter('all');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Encuentra tu compañero ideal</h1>

      {/* --- Contenedor Visualmente Agrupado --- */}
      <div className="p-4 border rounded-lg bg-card shadow-sm">
         <div className="space-y-3 md:space-y-0 md:flex md:items-end md:gap-3">
            {/* Búsqueda (más prominente) */}
            <div className="relative grow md:grow-[2]">
                <label htmlFor="search-pets" className="sr-only">Buscar mascotas</label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                    id="search-pets"
                    type="text"
                    placeholder="Buscar por nombre, descripción, raza..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10"
                />
                {(isLoading || isFetching) && debouncedSearchTerm && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                )}
            </div>

            {/* Grupo de Filtros (agrupados) */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap md:flex-nowrap md:gap-3">
                {/* Filtro Especie */}
                 <div className="flex-shrink-0 w-full sm:w-auto">
                    <label htmlFor="filter-species" className="sr-only">Filtrar por especie</label>
                    <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                        <SelectTrigger id="filter-species" className="w-full sm:w-[140px] h-10">
                            <SelectValue placeholder="Especie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {speciesOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                {/* Filtro Género */}
                 <div className="flex-shrink-0 w-full sm:w-auto">
                     <label htmlFor="filter-gender" className="sr-only">Filtrar por género</label>
                     <Select value={genderFilter} onValueChange={setGenderFilter}>
                         <SelectTrigger id="filter-gender" className="w-full sm:w-[140px] h-10">
                            <SelectValue placeholder="Género" />
                        </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {genderOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 </div>
                {/* Filtro Tamaño */}
                 <div className="flex-shrink-0 w-full sm:w-auto">
                    <label htmlFor="filter-size" className="sr-only">Filtrar por tamaño</label>
                    <Select value={sizeFilter} onValueChange={setSizeFilter}>
                        <SelectTrigger id="filter-size" className="w-full sm:w-[140px] h-10">
                            <SelectValue placeholder="Tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {sizeOptions.map(option => (
                                <SelectItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            {/* Botón Reset (estilo outline) */}
             <div className="flex-shrink-0 w-full md:w-auto">
                 {isAnyFilterActive && (
                    <Button variant="outline" onClick={handleResetFilters} size="sm" className="w-full md:w-auto h-10">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Limpiar
                    </Button>
                )}
             </div>
        </div>
       </div>

       {/* Estado de Carga Inicial (Grid Skeleton) */}
       {(isLoading && !isFetching) && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-[180px] w-full rounded-xl" />
                    <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
            ))}
            </div>
       )}

        {/* Estado de Error */}
        {isError && (
             <Alert variant="destructive" className="mt-6">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al buscar mascotas</AlertTitle>
                <AlertDescription>
                    {error?.message || "Ocurrió un error inesperado."}
                </AlertDescription>
            </Alert>
        )}

      {/* Lista de Mascotas */} 
      {!isLoading && !isError && (
            <div className="pt-6">
                {pets && pets.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {pets.map((pet) => (
                        <PetCard key={pet.id} pet={pet} />
                    ))}
                 </div>
            ) : (
                  <p className="text-muted-foreground text-center pt-10">
                    {(debouncedSearchTerm || speciesFilter !== 'all' || genderFilter !== 'all' || sizeFilter !== 'all')
                        ? "No se encontraron mascotas que coincidan con los filtros."
                        : "No hay mascotas disponibles en este momento."
                    }
                    </p>
            )}
            </div>
        )}
    </div>
  );
}
