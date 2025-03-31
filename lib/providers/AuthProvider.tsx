'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabaseClient';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

interface AuthContextType {
    supabase: SupabaseClient;
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    // Podríamos añadir funciones login/logout aquí, pero por ahora mantenemos la lógica en las páginas
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const supabase = createClient();
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function getInitialSession() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('AuthProvider: Error getting initial session:', error.message);
                    throw error;
                }
                // Solo actualizar si el componente sigue montado
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                 console.error('AuthProvider: Failed to get initial session', error);
                 if (mounted) {
                    setSession(null);
                    setUser(null);
                 }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // No necesitamos verificar si está montado aquí, ya que la suscripción se limpia
            console.log('AuthProvider: Auth state changed', _event, !!session);
            setSession(session);
            setUser(session?.user ?? null);
            // Podríamos resetear el estado de carga aquí si fuera necesario,
            // pero usualmente solo importa la carga inicial.
             if (isLoading) setIsLoading(false); // Asegurarse de que no nos quedemos cargando si la sesión inicial tarda
        });

        // Limpiar suscripción y flag de montaje al desmontar
        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Ejecutar solo una vez al montar, supabase client es estable

    const value = {
        supabase,
        session,
        user,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Renderizar children solo cuando la carga inicial haya terminado */} 
            {/* O mostrar un loader global aquí si se prefiere */} 
            {/* {!isLoading ? children : <GlobalLoader />} */} 
             {children} 
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 