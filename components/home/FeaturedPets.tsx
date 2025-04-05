'use client';

import React from 'react';
import Link from "next/link";
import { usePets } from '@/lib/hooks/usePets';
import { type Pet } from '@/lib/services/pets';
import PetCard from '@/components/PetCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ArrowRight } from "lucide-react";

export function FeaturedPets() {
  const { data: queryResult, isLoading, isError, error } = usePets(
    'homepage', // queryContext for this specific use case
    undefined, // searchTerm
    undefined, // species
    undefined, // gender
    undefined, // size
    undefined, // ageCategory
    1,         // page
    4          // limit (fetch 4 featured pets)
  );
  const pets = queryResult?.data ?? [];

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Un Vistazo a Algunas de <span className="text-primary">Nuestras Mascotas</span>
          </h2>
          <Link 
            href="/adopt" 
            className="text-primary hover:text-primary/80 transition-colors flex items-center font-body font-medium"
          >
            Ver todas las mascotas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="mt-0">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-[180px] w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px] rounded-lg" />
                    <Skeleton className="h-4 w-[100px] rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle className="font-heading font-semibold">Error al cargar mascotas</AlertTitle>
              <AlertDescription className="font-body">
                {error instanceof Error ? error.message : JSON.stringify(error)}
              </AlertDescription>
            </Alert>
          ) : pets && pets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {pets.map((pet: Pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-body">
              No hay mascotas destacadas disponibles en este momento.
            </p>
          )}
        </div>
      </div>
    </section>
  );
} 