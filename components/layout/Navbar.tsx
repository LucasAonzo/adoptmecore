'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { PawPrint, Menu, X, LogOut, UserCircle, LayoutGrid, PlusCircle, Mail, Inbox, MessageSquare } from 'lucide-react'; // Icons
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
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Enlaces Principales (Siempre visibles) ---
const mainNavLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/adopt', label: 'Adoptar' },
  { href: '/lost-found', label: 'Perdidos/Encontrados' },
];

// --- Enlaces del Menú de Usuario (Visibles logueado) ---
const userMenuLinks = [
  { href: '/pets', label: 'Ver Mascotas', icon: LayoutGrid },
  { href: '/pets/new', label: 'Agregar Mascota', icon: PlusCircle },
  { href: '/my-requests', label: 'Mis Solicitudes', icon: Mail },
  { href: '/received-requests', label: 'Solicitudes Recibidas', icon: Inbox },
];

export default function Navbar() {
    const router = useRouter();
    const { user, session, isLoading, supabase, hasGloballyUnread } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const pathname = usePathname();
    console.log("[Navbar] AuthContext -> hasGloballyUnread:", hasGloballyUnread);

    const handleLogout = async () => {
        setIsSheetOpen(false); // Cerrar sheet si está abierto
        await supabase?.auth.signOut();
        router.push('/'); // Redirigir al inicio
        router.refresh(); // Refrescar para asegurar estado actualizado
    };

    const getInitials = (email: string | undefined): string => {
        return email ? email.substring(0, 2).toUpperCase() : 'U';
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-primary py-2">
            <div className="container flex h-14 items-center justify-between px-6 md:px-8">
                {/* Logo */} 
                 <Link href="/" className="flex items-center gap-2 font-heading font-bold text-primary-foreground mr-8 flex-shrink-0">
                    <PawPrint className="h-6 w-6" />
                    <span className="hidden sm:inline-block">AdoptMe Tuc</span>
                </Link>

                {/* --- Mobile Main Navigation (Visible below md breakpoint) --- */}
                <nav className="flex md:hidden flex-grow items-center justify-center gap-3">
                    {mainNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-xs font-medium transition-colors",
                                pathname === link.href
                                    ? "text-primary-foreground bg-primary-600 px-3 py-1 rounded-full hover:text-primary-foreground/80"
                                    : "text-primary-200 hover:text-primary-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* --- Navegación Escritorio (Enlaces Principales) --- */} 
                 <nav className="hidden md:flex items-center gap-4 lg:gap-6 font-body">
                     {mainNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === link.href 
                                    ? "text-primary-foreground bg-primary-600 px-3 py-1 rounded-full hover:text-primary-foreground/80"
                                    : "text-primary-200 hover:text-primary-foreground"
                            )}
                        >
                            {link.label}
                         </Link>
                     ))}
                  </nav>

                {/* --- Menú Usuario / Botones Auth (Escritorio) --- */} 
                 <div className="hidden md:flex items-center gap-2 md:gap-4">
                    {isLoading && (
                        <Button variant="ghost" disabled size="sm" className="text-primary-foreground">Cargando...</Button>
                     )}
                    {/* Added My Chats link BEFORE the dropdown */} 
                    {!isLoading && user && (
                        <Link
                            href="/my-chats"
                            className={cn(
                                "relative text-sm font-body font-medium transition-colors",
                                pathname === '/my-chats' 
                                    ? "text-primary-foreground bg-primary-600 px-3 py-1 rounded-full hover:text-primary-foreground/80"
                                    : "text-primary-200 hover:text-primary-foreground"
                            )}
                        >
                            Mis Chats
                            {/* Use hasGloballyUnread from context */}
                            {hasGloballyUnread && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                                </span>
                            )}
                        </Link>
                    )}
                    {!isLoading && user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className="relative h-9 w-auto px-2 py-1 rounded-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-body text-sm font-medium ml-2 hidden lg:inline-block truncate max-w-[150px] text-primary-foreground">{user.email}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                align="end" 
                                forceMount 
                                className={cn(
                                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                                    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                                    "w-56"
                                )}
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="font-body text-sm font-medium leading-none">Mi Cuenta</p>
                                        <p className="font-body text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild className="font-body cursor-pointer">
                                        <Link href="/profile/edit">
                                            <UserCircle className="mr-2 h-4 w-4" />
                                            <span>Editar Perfil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {userMenuLinks.map((link) => (
                                        <DropdownMenuItem key={link.href} asChild className="font-body cursor-pointer">
                                            <Link href={link.href}>
                                                <link.icon className="mr-2 h-4 w-4" />
                                                <span>{link.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="font-body cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                     {!isLoading && !user && (
                         <div className="flex items-center gap-2">
                             <Button variant="ghost" asChild size="sm" className="font-body text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                                <Link href="/login">Login</Link>
                             </Button>
                             <Button asChild size="sm" variant="secondary" className="font-body">
                                <Link href="/signup">Sign Up</Link>
                             </Button>
                         </div>
                     )}
                  </div>

                {/* --- Botón Menú Móvil --- */} 
                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary-foreground/10">
                            <Menu className="h-6 w-6 text-primary-foreground" />
                            <span className="sr-only">Abrir menú</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-primary border-l border-border">
                        <SheetHeader className="text-left mb-6">
                            <SheetTitle>
                                <Link href="/" className="flex items-center gap-2 font-heading font-bold text-primary-foreground" onClick={() => setIsSheetOpen(false)}>
                                    <PawPrint className="h-6 w-6" />
                                    <span>AdoptMe Tuc</span>
                                </Link>
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex h-full flex-col justify-between p-6 font-body">
                            {/* --- Top Section: Main Links & User/Auth Links --- */}
                            <div className="flex-grow space-y-4">
                                {mainNavLinks.map((link) => (
                                    <SheetClose asChild key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "block text-lg font-medium transition-colors",
                                                pathname === link.href
                                                    ? "text-primary-foreground bg-primary-foreground/10 px-3 py-1 rounded-full hover:text-primary-foreground/80"
                                                    : "text-primary-200 hover:text-primary-foreground"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                ))}

                                {/* --- User Links Section --- */}
                                {user && (
                                    <div className="border-t border-primary-foreground/20 pt-6 mt-6 space-y-4">
                                        <SheetClose asChild>
                                            <Link
                                                href="/my-chats"
                                                className={cn(
                                                    "relative flex items-center text-lg font-medium transition-colors",
                                                    pathname === '/my-chats'
                                                        ? "text-primary-foreground bg-primary-foreground/10 px-3 py-1 rounded-full hover:text-primary-foreground/80"
                                                        : "text-primary-200 hover:text-primary-foreground"
                                                )}
                                            >
                                                <MessageSquare className="mr-3 h-5 w-5" />
                                                Mis Chats
                                                {hasGloballyUnread && (
                                                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                                                    </span>
                                                )}
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link href="/profile/edit" className="flex items-center text-lg font-medium text-primary-200 transition-colors hover:text-primary-foreground">
                                                <UserCircle className="mr-3 h-5 w-5" />
                                                Editar Perfil
                                            </Link>
                                        </SheetClose>
                                        {userMenuLinks.map((link) => (
                                            <SheetClose asChild key={link.href}>
                                                <Link href={link.href} className="flex items-center text-lg font-medium text-primary-200 transition-colors hover:text-primary-foreground">
                                                    <link.icon className="mr-3 h-5 w-5" />
                                                    {link.label}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>
                                )}

                                {/* --- Auth Buttons Section (Logged Out) --- */}
                                {!isLoading && !user && (
                                    <div className="border-t border-primary-foreground/20 pt-6 mt-6 space-y-4">
                                        <SheetClose asChild>
                                            <Button variant="secondary" asChild className="w-full text-lg font-body">
                                                <Link href="/login">Login</Link>
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button variant="secondary" asChild className="w-full text-lg font-body">
                                                <Link href="/signup">Sign Up</Link>
                                            </Button>
                                        </SheetClose>
                                    </div>
                                )}
                            </div>

                            {/* --- Bottom Section: Logout Button --- */}
                            {user && (
                                <div className="mt-auto border-t border-primary-foreground/20 pt-6">
                                    <SheetClose asChild>
                                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg font-medium text-primary-200 transition-colors hover:text-primary-foreground hover:bg-transparent">
                                            <LogOut className="mr-3 h-5 w-5" />
                                            Logout
                                        </Button>
                                    </SheetClose>
                                </div>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
} 