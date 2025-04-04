'use client'; // Volver a marcar como Client Component

import React, { useState, useMemo, useEffect } from 'react'; // Importar useMemo y useEffect
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
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"; // Import pagination components
import { cn } from "@/lib/utils"; // Import cn function for conditional classes

// Renamed from HomePage to AdoptPage
export default function AdoptPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Estados para los filtros, usando 'all' como valor para "Todos"
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const limit = 12; // Items per page

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Hook usePets now includes page and limit, and returns { data, count }
  const { 
    data: queryResult, // Rename data to queryResult to avoid conflict
    isLoading, 
    isFetching, 
    isError, 
    error 
  } = usePets(
      debouncedSearchTerm,
      speciesFilter === 'all' ? undefined : speciesFilter,
      genderFilter === 'all' ? undefined : genderFilter,
      sizeFilter === 'all' ? undefined : sizeFilter,
      currentPage, // Pass current page
      limit // Pass limit
    );

  // Extract pets and count from the query result
  const pets = queryResult?.data ?? [];
  const totalCount = queryResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Determinar si hay algún filtro activo para mostrar el botón de reset
  const isAnyFilterActive = useMemo(() => {
      return debouncedSearchTerm !== '' || speciesFilter !== 'all' || genderFilter !== 'all' || sizeFilter !== 'all';
  }, [debouncedSearchTerm, speciesFilter, genderFilter, sizeFilter]);

  // Función para resetear filtros Y VOLVER A PÁGINA 1
  const handleResetFilters = () => {
      setSearchTerm('');
      setSpeciesFilter('all');
      setGenderFilter('all');
      setSizeFilter('all');
      setCurrentPage(1); // Reset page to 1 when filters change
  };

  // Handlers for pagination
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Reset page to 1 when filters change (useEffect approach)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, speciesFilter, genderFilter, sizeFilter]); // Dependencies that affect the total count

  return (
    // Aplicar fuente body por defecto al contenedor principal
    <div className="container mx-auto px-4 py-8 space-y-8 font-body">
      {/* Aplicar fuente heading al título */}
      <h1 className="text-3xl font-heading font-bold">Encuentra tu compañero ideal</h1>

      {/* Contenedor de filtros usa bg-card, border-border por defecto desde globals.css */}
      <div className="p-4 border rounded-lg bg-card shadow-sm">
         <div className="space-y-3 md:space-y-0 md:flex md:items-end md:gap-3">
            {/* Búsqueda: Input y Select ya usan estilos de Shadcn/theme */}
            <div className="relative grow md:grow-[2]">
                <label htmlFor="search-pets" className="sr-only">Buscar mascotas</label>
                {/* Icon color ajustado por text-muted-foreground */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                    id="search-pets"
                    type="text"
                    placeholder="Buscar por nombre, descripción, raza..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full h-10 font-body" // Asegurar font-body
                />
                {(isLoading || isFetching) && debouncedSearchTerm && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                )}
            </div>

            {/* Grupo de Filtros: Selects ya usan estilos de Shadcn/theme */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap md:flex-nowrap md:gap-3">
                 <div className="flex-shrink-0 w-full sm:w-auto">
                    <label htmlFor="filter-species" className="sr-only">Filtrar por especie</label>
                    <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                        {/* Asegurar font-body en trigger */} 
                        <SelectTrigger id="filter-species" className="w-full sm:w-[140px] h-10 font-body">
                            <SelectValue placeholder="Especie" />
                        </SelectTrigger>
                        {/* SelectContent usa popover styles */}
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {speciesOptions.map(option => (
                                <SelectItem key={option} value={option} className="font-body">
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="flex-shrink-0 w-full sm:w-auto">
                     <label htmlFor="filter-gender" className="sr-only">Filtrar por género</label>
                     <Select value={genderFilter} onValueChange={setGenderFilter}>
                        {/* Asegurar font-body en trigger */} 
                         <SelectTrigger id="filter-gender" className="w-full sm:w-[140px] h-10 font-body">
                            <SelectValue placeholder="Género" />
                        </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {genderOptions.map(option => (
                                <SelectItem key={option} value={option} className="font-body">
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 </div>
                 <div className="flex-shrink-0 w-full sm:w-auto">
                    <label htmlFor="filter-size" className="sr-only">Filtrar por tamaño</label>
                    <Select value={sizeFilter} onValueChange={setSizeFilter}>
                         {/* Asegurar font-body en trigger */} 
                        <SelectTrigger id="filter-size" className="w-full sm:w-[140px] h-10 font-body">
                            <SelectValue placeholder="Tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {sizeOptions.map(option => (
                                <SelectItem key={option} value={option} className="font-body">
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            {/* Botón Reset: variant="outline" usa colores del tema */}
             <div className="flex-shrink-0 w-full md:w-auto">
                 {isAnyFilterActive && (
                    <Button variant="outline" onClick={handleResetFilters} size="sm" className="w-full md:w-auto h-10 font-body font-medium"> {/* Asegurar font-body y peso */}
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Limpiar
                    </Button>
                )}
             </div>
        </div>
       </div>

      {/* Estado de Carga: Skeleton usa colores theme */}
      {(isLoading && !isFetching) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[180px] w-full rounded-lg" /> {/* Usar rounded-lg si --radius es 0.5rem */} 
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado de Error: Alert variant="destructive" usa colores del tema */}
      {isError && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          {/* Aplicar fuentes a título y descripción */}
          <AlertTitle className="font-body font-medium">Error al buscar mascotas</AlertTitle>
          <AlertDescription className="font-body">
            {error?.message || "Ocurrió un error inesperado."}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Mascotas: PetCard necesitará refactorización separada */}
      {!isLoading && !isError && (
        <div className="pt-6">
          {pets && pets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            // Mensaje de no encontrados: usa text-muted-foreground del tema
            <p className="text-muted-foreground text-center pt-10 font-body">
              {(debouncedSearchTerm || speciesFilter !== 'all' || genderFilter !== 'all' || sizeFilter !== 'all')
                ? "No se encontraron mascotas que coincidan con los filtros."
                : "No hay mascotas disponibles en este momento."
              }
            </p>
          )}
        </div>
      )}

      {/* Controles de Paginación: Componentes Shadcn usan colores/fuentes theme */}
      {totalPages > 1 && (
          <div className="flex justify-center items-center pt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      size="icon"
                      href="#"
                      onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePrevPage(); }} 
                      aria-disabled={currentPage <= 1}
                      className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                      {/* Aplicar fuente body */}
                      <span className="px-4 py-2 text-sm font-body font-medium">
                          Página {currentPage} de {totalPages}
                      </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      size="icon"
                      href="#"
                      onClick={(e: React.MouseEvent) => { e.preventDefault(); handleNextPage(); }}
                      aria-disabled={currentPage >= totalPages}
                      className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
          </div>
      )}
    </div>
  );
} 