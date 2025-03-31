import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Podríamos necesitar Badge también
import { type Pet } from '@/lib/services/pets'; // Reutilizar tipo si es posible

interface PetCardProps {
  pet: Pet; // Usar un tipo Pet más específico sería ideal
}

// Placeholder para imagen si no hay URL
const placeholderImage = "/placeholder-pet.svg"; // Crear este SVG si se necesita

export default function PetCard({ pet }: PetCardProps) {
  // Usar la URL primaria obtenida o el placeholder
  const imageUrl = pet.primary_image_url || placeholderImage;

  // Construir la URL del detalle
  const detailUrl = `/pets/${pet.id}`;

  return (
    <Link href={detailUrl} legacyBehavior passHref>
      <a className="block group">
        <Card className="overflow-hidden transition-shadow duration-200 group-hover:shadow-lg">
          <CardHeader className="p-0">
            <div className="aspect-video relative w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt={`Foto de ${pet.name}`}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = placeholderImage }} // Fallback si la URL falla
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-1 truncate">{pet.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600 truncate">
              {pet.breed || pet.species || "Especie no especificada"}
            </CardDescription>
            {/* Podríamos añadir más info como edad o tamaño aquí */}
            {/* <p className="text-xs mt-1">{pet.age_years ? `${pet.age_years} años` : 'Edad desconocida'}</p> */}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            {/* Podríamos usar Badges para el status */}
            <Badge variant={pet.status === 'available' ? "default" : "secondary"}>
              {pet.status === 'available' ? 'Disponible' : pet.status}
            </Badge>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
} 