import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-24 bg-muted">
      <div className="container px-4 md:px-6">
        {/* Flex container for side-by-side layout on medium screens and up */}
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content + CTA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 md:space-y-6 flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tighter text-foreground">
              Cada Mascota Merece un Hogar con Amor. <br /> <span className="text-primary">Adopta</span> una Mascota Hoy
            </h1>
            
            <p className="max-w-[600px] text-muted-foreground md:text-lg font-body">
              Explora nuestros animales disponibles y aprende más sobre el proceso de adopción. Juntos, podemos
              <span className="font-semibold font-accent mx-1 text-primary/90"> rescatar, rehabilitar y reubicar mascotas necesitadas</span>. Gracias por
              apoyar nuestra misión de llevar alegría a las familias a través de la adopción.
            </p>
            {/* Call to Action Button */}
            <Button size="lg" asChild className="mt-4 font-body font-medium">
              <Link href="/adopt">Ver Mascotas</Link>
            </Button>
          </div>
          {/* Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <Image 
              src="/images/Dog & Cat (2).png" 
              alt="Perro y gato felices sentados juntos"
              width={500} // Intrinsic width is used for aspect ratio
              height={500} // Intrinsic height is used for aspect ratio
              className="object-contain w-full" 
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
} 