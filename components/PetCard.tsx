'use client'; // Necesario para useState y onClick

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react'; // Importar useState
import { Heart, Calendar, Ruler, Venus, Mars } from "lucide-react"; // Importar iconos
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Importar Button
import { type Pet } from '@/lib/services/pets';
import { cn } from "@/lib/utils"; // Importar cn

// Interfaz actualizada para incluir props de favoritos
interface PetCardProps {
  pet: Pet & {
    age_years?: number | null;
    age_months?: number | null;
    size?: string | null;
    gender?: string | null;
    // location?: string | null; // Location no está en nuestro tipo Pet actual
  };
  onFavorite?: (id: string) => void; // Callback opcional
  isFavorite?: boolean; // Estado inicial opcional
}

// Placeholder para imagen si no hay URL (mantenemos el nuestro)
const placeholderImage = "/placeholder-pet.svg";

// Helper para formatear la edad (mantenemos el nuestro)
function formatAge(years?: number | null, months?: number | null): string | null {
  if (years === null || years === undefined || years < 0) years = 0;
  if (months === null || months === undefined || months < 0) months = 0;

  if (years === 0 && months === 0) return "Edad desconocida"; // Cambiado a "Edad desconocida" como en el ejemplo

  let ageString = '';
  if (years > 0) {
    ageString += `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  if (months > 0) {
    if (ageString) ageString += ' y ';
    ageString += `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  return ageString || null;
}

// Helper para obtener la variante del Badge basado en el estado (mantenemos el nuestro)
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) { // Asegurar comparación lowercase
    case "available":
      return "default"; // Usar 'default' para 'available' (primario)
    case "adopted":
      return "secondary";
    case "pending":
      return "outline";
     // case "cancelled": // Añadir si tenemos este estado
     // return "destructive";
    default:
      return "secondary";
  }
};

// Helper para traducir el estado (similar al ejemplo pero usando nuestros valores)
const formatStatus = (status: string): string => {
   switch (status.toLowerCase()) {
        case 'available': return 'Disponible';
        case 'adopted': return 'Adoptado';
        case 'pending': return 'En Proceso';
        // case 'cancelled': return 'Cancelado';
        default: return status.charAt(0).toUpperCase() + status.slice(1); // Capitalizar otros estados
    }
}

export default function PetCard({ pet, onFavorite, isFavorite = false }: PetCardProps) {
  const [favorite, setFavorite] = useState(isFavorite); // Estado para favoritos
  const imageUrl = pet.primary_image_url || placeholderImage; // Usar nuestro placeholder
  const detailUrl = `/pets/${pet.id}`;
  const formattedAge = formatAge(pet.age_years, pet.age_months);
  const statusVariant = getStatusBadgeVariant(pet.status);
  const statusLabel = formatStatus(pet.status);

  // Handler para el botón de favorito (del ejemplo)
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    if (onFavorite) onFavorite(String(pet.id));
  };

  return (
    <Card className="group font-body overflow-hidden transition-all duration-300 hover:shadow-xl border border-border/40 h-full flex flex-col bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={`Foto de ${pet.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = placeholderImage }}
            priority={false}
          />
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 z-10 h-8 w-8 rounded-full",
              favorite ? "text-rose-500" : "text-muted-foreground",
            )}
            onClick={handleFavorite}
            aria-label="Marcar como favorito"
          >
            <Heart className={cn("h-4 w-4", favorite ? "fill-rose-500 text-rose-500" : "")} />
            <span className="sr-only">Favorito</span>
          </Button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
            <Badge variant={statusVariant} className="font-body font-medium text-xs tracking-wide">
              {statusLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <Link href={detailUrl} legacyBehavior={false} passHref className="flex-grow flex flex-col">
        <CardContent className="p-4 pt-5 flex-grow flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-heading font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {pet.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 font-body">{pet.breed || pet.species || "Mascota"}</p>
          </div>
          <div className="mt-auto space-y-2 text-sm text-muted-foreground font-body">
            {formattedAge && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{formattedAge}</span>
              </div>
            )}
            {pet.size && (
              <div className="flex items-center gap-2">
                <Ruler className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="line-clamp-1">
                  {pet.size === "small" ? "Pequeño"
                  : pet.size === "medium" ? "Mediano"
                  : pet.size === "large" ? "Grande"
                  : pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}
                </span>
              </div>
            )}
            {pet.gender && (
              <div className="flex items-center gap-2">
                {pet.gender.toLowerCase() === "male" ? (
                  <Mars className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                ) : (
                  <Venus className="h-3.5 w-3.5 flex-shrink-0 text-pink-500" />
                )}
                <span className="line-clamp-1">{pet.gender.toLowerCase() === "male" ? "Macho" : "Hembra"}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t border-border/60 mt-auto">
          <Button variant="ghost" size="sm" className="ml-auto text-xs font-body font-medium hover:text-primary h-auto py-1 px-2">
            Ver detalles
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
} 