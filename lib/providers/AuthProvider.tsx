'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getMyConversations, type ConversationPreview } from '@/lib/services/chat';
import { Database } from '@/lib/database.types';

interface AuthContextType {
    supabase: SupabaseClient<Database>;
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    hasGloballyUnread: boolean;
    triggerGlobalUnreadCheck: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const supabase = createClient() as SupabaseClient<Database>;
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasGloballyUnread, setHasGloballyUnread] = useState(false);
    const queryClient = useQueryClient();

    const checkAndUpdateUnreadStatus = useCallback(async () => {
        const currentSupabase = supabase;
        const currentUser = user;
        if (currentSupabase && currentUser) {
            try {
                const conversations: ConversationPreview[] = await getMyConversations(currentSupabase);
                const anyUnread: boolean = conversations.some((convo: ConversationPreview) => convo.hasUnread);
                console.log("[AuthProvider Check Triggered] hasUnread:", anyUnread);
                setHasGloballyUnread(anyUnread);
            } catch (error) {
                console.error("[AuthProvider Check Triggered] Error fetching conversations:", error);
            }
        }
    }, [supabase, user]);

    useEffect(() => {
        let mounted = true;

        async function getInitialSession() {
            try {
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('AuthProvider: Error getting initial session:', error.message);
                    throw error;
                }
                if (mounted) {
                    setSession(initialSession);
                    setUser(initialSession?.user ?? null);
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

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            console.log('AuthProvider: Auth state changed', _event, !!currentSession);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (isLoading && mounted) setIsLoading(false);
        });

        return () => {
            mounted = false;
            authSubscription?.unsubscribe();
        };
    }, [supabase, isLoading]);

    useEffect(() => {
        let messageChannel: RealtimeChannel | null = null;

        if (supabase && user) {
            console.log(`[AuthProvider] Subscribing to messages for user: ${user.id}`);
            messageChannel = supabase
                .channel('public:messages')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages' },
                    (payload) => {
                        console.log('[AuthProvider] New message received:', payload);
                        const newMessage = payload.new as { sender_user_id?: string };

                        if (newMessage.sender_user_id && newMessage.sender_user_id !== user.id) {
                            console.log(`[AuthProvider] Message from other user. Setting global flag TRUE & triggering refetch.`);
                            setHasGloballyUnread(true);
                            queryClient.invalidateQueries({ queryKey: ['myConversations'] });
                            queryClient.refetchQueries({
                                queryKey: ['myConversations'], 
                                exact: true,
                                type: 'all'
                            });
                            console.log(`[AuthProvider] Refetch triggered for myConversations (type: all).`);
                        }
                    }
                )
                .subscribe();
                
             console.log("[AuthProvider] Subscribed to message channel.");
        }

        return () => {
            if (messageChannel) {
                console.log("[AuthProvider] Unsubscribing from message channel.");
                supabase.removeChannel(messageChannel).catch(error => {
                   console.error("[AuthProvider] Error removing message channel:", error);
                });
            }
        };
    }, [supabase, user, queryClient]);

    useEffect(() => {
        checkAndUpdateUnreadStatus();
        
        const intervalId = setInterval(checkAndUpdateUnreadStatus, 1000 * 60 * 2);

        return () => clearInterval(intervalId);
    }, [checkAndUpdateUnreadStatus]);

    const value: AuthContextType = {
        supabase,
        session,
        user,
        isLoading,
        hasGloballyUnread,
        triggerGlobalUnreadCheck: checkAndUpdateUnreadStatus,
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