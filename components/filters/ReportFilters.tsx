'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { type ReportType } from '@/lib/services/reports'; // Importar tipo

export interface ReportFiltersState {
  reportType: ReportType | 'ALL';
  petType: string | 'ALL'; // Usaremos 'ALL' para indicar sin filtro
}

interface ReportFiltersProps {
  initialFilters?: Partial<ReportFiltersState>;
  onFiltersChange: (filters: ReportFiltersState) => void;
  // Podríamos añadir una lista de tipos de mascotas disponibles si quisiéramos que fuera dinámico
}

// Opciones predefinidas para tipos de mascotas (podrían venir de la DB o una constante)
const PET_TYPES_OPTIONS = ['ALL', 'Perro', 'Gato', 'Ave', 'Roedor', 'Reptil', 'Otro'];

export function ReportFilters({ initialFilters, onFiltersChange }: ReportFiltersProps) {
  const [reportType, setReportType] = useState<ReportType | 'ALL'>(
    initialFilters?.reportType || 'ALL'
  );
  const [petType, setPetType] = useState<string | 'ALL'>(
    initialFilters?.petType || 'ALL'
  );

  // Notificar cambios al componente padre
  useEffect(() => {
    // Evitar notificar en el montaje inicial si no hay filtros iniciales definidos externamente
    if (initialFilters || reportType !== 'ALL' || petType !== 'ALL') {
        onFiltersChange({ reportType, petType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, petType]); // Dependencias correctas sin onFiltersChange

  const handleReportTypeChange = (value: string) => {
    setReportType(value as ReportType | 'ALL');
  };

  const handlePetTypeChange = (value: string) => {
    setPetType(value);
  };

  const clearFilters = useCallback(() => {
    setReportType('ALL');
    setPetType('ALL');
  }, []);

  const hasActiveFilters = reportType !== 'ALL' || petType !== 'ALL';

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card mb-6 items-end font-body">
      {/* Filtro por Tipo de Reporte */}
      <div className="flex-grow"> {/* Usar flex-grow para que ocupe espacio */}
        <Label htmlFor="filter-report-type" className="text-sm font-medium mb-1 block text-foreground font-body">Tipo de Reporte</Label>
        <Select value={reportType} onValueChange={handleReportTypeChange}>
          <SelectTrigger id="filter-report-type" className="w-full md:w-auto font-body">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent className="font-body">
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="LOST">Perdido</SelectItem>
            <SelectItem value="FOUND">Encontrado</SelectItem>
            <SelectItem value="EMERGENCY">Urgencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por Tipo de Animal */}
      <div className="flex-grow"> {/* Usar flex-grow */}
        <Label htmlFor="filter-pet-type" className="text-sm font-medium mb-1 block text-foreground font-body">Tipo de Animal</Label>
        <Select value={petType} onValueChange={handlePetTypeChange}>
          <SelectTrigger id="filter-pet-type" className="w-full md:w-auto font-body">
            <SelectValue placeholder="Todos los animales" />
          </SelectTrigger>
          <SelectContent className="font-body">
            {PET_TYPES_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'ALL' ? 'Todos' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botón para limpiar filtros */}
      <div> {/* Contenedor para alinear el botón */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50 font-body"
        >
          <X className="mr-1 h-4 w-4" />
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
}