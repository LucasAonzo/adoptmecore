import React from 'react';
import Link from 'next/link';
import { PawPrint, Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 md:py-12 mt-auto border-t border-border">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col items-start space-y-2">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
              <PawPrint className="h-6 w-6" />
              <span>AdoptMe Tuc</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Encontrando hogares felices.
            </p>
          </div>

          <div className="md:col-start-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Navegación</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/adopt" className="hover:text-primary-foreground/80 transition-colors">Adoptar</Link>
              <Link href="/lost-found" className="hover:text-primary-foreground/80 transition-colors">Perdidos/Encontrados</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Legal</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/privacy" className="hover:text-primary-foreground/80 transition-colors">Política de Privacidad</Link>
              <Link href="/terms" className="hover:text-primary-foreground/80 transition-colors">Términos de Servicio</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Síguenos</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center sm:text-left">
          <p className="text-xs text-primary-foreground/70">
            &copy; {new Date().getFullYear()} AdoptMe Tuc. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
} 