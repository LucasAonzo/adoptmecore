'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getMyConversations, type ConversationPreview } from '@/lib/services/chat';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dog } from 'lucide-react';

export default function MyChatsPage() {
  const { supabase } = useAuth();

  const { data: conversations, isLoading, error } = useQuery<ConversationPreview[], Error>({
    queryKey: ['myConversations'],
    queryFn: () => {
      if (!supabase) throw new Error("Supabase client is not available.");
      return getMyConversations(supabase);
    },
    enabled: !!supabase,
    staleTime: 5 * 60 * 1000,
  });

  console.log('[MyChatsPage] isLoading:', isLoading);
  console.log('[MyChatsPage] error:', error);
  console.log('[MyChatsPage] conversations:', conversations);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center font-body">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center font-body text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
        Error al cargar conversaciones: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 font-body">
      <h1 className="text-3xl font-heading font-bold mb-6 text-foreground">Mis Chats</h1>
      
      {conversations && conversations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((convo) => (
            <Link href={`/chat/${convo.conversationId}`} key={convo.conversationId} className="block hover:no-underline h-full">
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col p-4">
                <CardHeader className="flex flex-row items-center gap-4 p-0">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={convo.petImageUrl ?? undefined} alt={convo.petName ?? 'Mascota'} />
                    <AvatarFallback><Dog className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-heading font-semibold leading-tight text-foreground truncate">
                      Chat sobre: {convo.petName ?? 'Mascota Desconocida'}
                    </CardTitle>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-muted-foreground font-body truncate">
                        Con: {convo.otherParticipantName}
                      </p>
                      {convo.hasUnread && (
                        <div className="ml-2 h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" title="Mensajes no leídos"></div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-10 font-body">No tienes conversaciones activas.</p>
      )}
    </div>
  );
}

