'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { PawPrint, Menu, X } from 'lucide-react'; // Icons
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { useAuth } from '@/lib/providers/AuthProvider';

export default function Navbar() {
    const router = useRouter();
    const { user, session, isLoading, supabase } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleLogout = async () => {
        setIsSheetOpen(false); // Cerrar sheet antes o después del logout
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            console.log('Logout successful');
        }
    };

    // --- Definir los enlaces y botones --- 

    // Links comunes
    const commonLinks = (
         <Link href="/pets" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Ver Mascotas
        </Link>
    );

    // Links/Botones para usuarios logueados
    const loggedInItems = (
        <>
            <Link href="/pets/new" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Agregar Mascota
            </Link>
            <Link href="/my-requests" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                 Mis Solicitudes
            </Link>
            <Link href="/received-requests" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                 Solicitudes Recibidas
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-transparent justify-start p-0 h-auto">
                Logout ({user?.email?.split('@')[0]}) {/* Safe navigation for user */}
            </Button>
        </>
    );

    // Botones para usuarios no logueados
    const loggedOutButtons = (
         <>
             <Button variant="ghost" asChild size="sm">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
            </Button>
        </>
    );

     const loadingButton = (
        <Button variant="ghost" disabled size="sm">
            Cargando...
        </Button>
     );


    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */} 
                 <Link href="/" className="flex items-center gap-2 font-bold">
                    <PawPrint className="h-6 w-6 text-primary" />
                    <span>AdoptMe Tuc</span>
                </Link>

                {/* --- Navegación Escritorio --- */} 
                 <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6">
                     {commonLinks}
                     {!isLoading && user && loggedInItems}
                     {isLoading && loadingButton}
                     {!isLoading && !user && loggedOutButtons}
                 </nav>

                {/* --- Botón Menú Móvil --- */} 
                <div className="md:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                             <Button variant="outline" size="icon">
                                {isSheetOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle className="text-left">
                                     {/* Wrap logo link with SheetClose for mobile */} 
                                     <SheetClose asChild>
                                        <Link href="/" className="flex items-center gap-2 font-bold">
                                            <PawPrint className="h-6 w-6 text-primary" />
                                            <span>AdoptMe Tuc</span>
                                        </Link>
                                     </SheetClose>
                                </SheetTitle>
                            </SheetHeader>
                            {/* --- Navegación Móvil --- */} 
                            <nav className="flex flex-col space-y-4 mt-6">
                                 {/* Wrap common links with SheetClose */} 
                                <SheetClose asChild>{commonLinks}</SheetClose>
                                
                                {/* Wrap logged in items with SheetClose */} 
                                {!isLoading && user && (
                                    React.Children.map(loggedInItems.props.children, child => (
                                        <SheetClose asChild>{child}</SheetClose>
                                    ))
                                )}
                                
                                {isLoading && (
                                     <Button variant="ghost" disabled className="justify-start">
                                        Cargando...
                                    </Button>
                                )}
                                
                                {/* Wrap logged out buttons with SheetClose */} 
                                {!isLoading && !user && (
                                     React.Children.map(loggedOutButtons.props.children, child => (
                                        <SheetClose asChild>{child}</SheetClose>
                                    ))
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                 </div>
            </div>
        </header>
    );
} 