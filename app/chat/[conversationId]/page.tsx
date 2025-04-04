'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatScroll } from '@/hooks/use-chat-scroll';

// Importar los componentes y hooks del chat que instalamos
import { RealtimeChat } from '@/components/ui/realtime-chat';
import { type ChatMessage } from '@/hooks/use-realtime-chat'; 

// --- Importar hooks de carga y guardado --- 
import { useMessagesQuery } from '@/lib/hooks/useChatQueries'; 
import { useSaveMessageMutation, type SaveMessageInput } from '@/lib/hooks/useChatMutations';
import { useRealtimeChat } from '@/hooks/use-realtime-chat'; // --- UNCOMMENTED
// -------------------------------------------

export default function ChatPage() {
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const { supabase, user, isLoading: isAuthLoading, triggerGlobalUnreadCheck } = useAuth();
  const queryClient = useQueryClient();
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set<string>());
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Query para obtener mensajes existentes ---
  const { data: initialMessages, isLoading: isLoadingMessages, error: messagesError } = useMessagesQuery(conversationId);

  // --- Mutación para guardar mensajes ---
  const { mutate: saveMessage } = useSaveMessageMutation(supabase);

  // --- Hook para la conexión realtime (UNCOMMENTED) ---
  const { messages: realtimeMessages, sendMessage, isConnected } = useRealtimeChat({
    roomName: `chat:${conversationId}`,
    username: user?.email || 'Anon',
    userId: user?.id,
  });

  // --- Effect to mark conversation as read ---
  useEffect(() => {
    if (supabase && conversationId) {
      const markAsRead = async () => {
        try {
          const { error } = await supabase.rpc('update_last_read_timestamp', {
            p_conversation_id: conversationId 
          });
          if (error) {
            console.error('Error marking conversation as read:', error);
          } else {
            console.log('Successfully marked conversation as read, invalidating/refetching queries and triggering global check...');
            // Invalidate and refetch list/count
            queryClient.invalidateQueries({ queryKey: ['myConversations'] });
            queryClient.refetchQueries({ queryKey: ['myConversations'], exact: true });
            queryClient.invalidateQueries({ queryKey: ['hasUnreadChats'] }); 
            queryClient.refetchQueries({ queryKey: ['hasUnreadChats'], exact: true });
            // --- Trigger the global check in AuthProvider --- 
            triggerGlobalUnreadCheck();
            // ---------------------------------------------
          }
        } catch (err) {
          console.error('Client-side error calling mark as read RPC:', err);
        }
      };
      
      markAsRead();
    }
  }, [supabase, conversationId, queryClient, triggerGlobalUnreadCheck]);

  // --- UNCOMMENTED: Combined messages logic ---
  const combinedMessages = useMemo(() => {
      const messageMap = new Map<string, ChatMessage>();
      (initialMessages || []).forEach(msg => messageMap.set(msg.id, msg));
      realtimeMessages.forEach(msg => messageMap.set(msg.id, msg)); // Include realtime again
      return Array.from(messageMap.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [initialMessages, realtimeMessages]); // Add realtimeMessages dependency back

  // Hook for automatic scrolling (Adjust call based on hook definition)
  // Assuming it might just need the ref, or perhaps nothing if it finds it via context?
  // Let's try passing just the ref for now.
  // useChatScroll({ chatRef: scrollRef, bottomRef: null, count: combinedMessages.length });
  // If the hook doesn't take arguments, remove this or adjust according to its definition.
  // For now, let's assume it needs the ref directly.
  // const chatRef = useChatScroll(scrollRef); // Example if it returns the ref
  useEffect(() => {
    // Basic scroll to bottom - replace if useChatScroll is different
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combinedMessages]);

  const handleSaveMessage = useCallback((lastMessage: ChatMessage | null) => {
    // Only save if:
    // 1. lastMessage exists
    // 2. current user ID exists
    // 3. The message senderId MATCHES the current user ID
    // 4. The message ID hasn't been processed yet
    if (lastMessage && user?.id && lastMessage.senderId === user.id && !processedMessageIds.has(lastMessage.id)) {
      console.log('Guardando mi propio mensaje con ID:', lastMessage.id, 'Sender:', lastMessage.senderId);
      setProcessedMessageIds(prev => new Set(prev).add(lastMessage.id));
      
      const messageInput: SaveMessageInput = {
        content: lastMessage.content,
        conversation_id: conversationId,
        sender_user_id: user.id // Correct: Save with my ID because I am the sender
      };

      saveMessage(messageInput, { 
        onError: (err) => {
          console.error('Error detallado al guardar mensaje:', err);
        }
      });
    } else if (lastMessage && user?.id && lastMessage.senderId !== user.id && !processedMessageIds.has(lastMessage.id)) {
      // Message received from another user: Do nothing (don't save to DB from the receiver's side)
      console.log('Mensaje recibido de otro usuario, no guardando:', lastMessage.id, 'Sender:', lastMessage.senderId);
      // Optionally mark as processed to prevent any potential future processing if needed
       setProcessedMessageIds(prev => new Set(prev).add(lastMessage.id));
    }
  }, [conversationId, saveMessage, user?.id, processedMessageIds]);


  // --- UNCOMMENTED: useEffect for saving realtime messages ---
   useEffect(() => {
     if (realtimeMessages.length > 0) {
       handleSaveMessage(realtimeMessages[realtimeMessages.length - 1]);
     }
   }, [realtimeMessages, handleSaveMessage]);

  
  // --- Input Handlers --- 
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Function to handle sending the message via the realtime hook
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !isConnected) return;
    try {
      await sendMessage(inputValue); // Use the sendMessage from useRealtimeChat
      setInputValue('');
    } catch (error) {
      console.error("Error sending message via realtime hook:", error);
      // Optional: Show error toast to user
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };
  // ---------------------

  // Handle loading and error states
  // Consider both auth loading and message loading
  const isStillLoading = isAuthLoading || isLoadingMessages;

  if (!conversationId) {
    notFound();
  }
  
  if (messagesError) {
      return <div className="p-4 text-red-600">Error cargando mensajes: {messagesError.message}</div>;
  }
  
  //const currentUsername = user?.email?.split('@')[0] || 'Tú';

  return (
    // Main container: flex-col, inherits bg-background from layout, ensure font-body
    <div className="flex flex-col h-full font-body"> 
      {/* Messages Area: Transparent background, scrolls internally */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6"> {/* Added padding here */}
        {/* Conditionally render RealtimeChat only when user ID is available */}
        {isStillLoading ? (
          <div className="flex justify-center items-center h-full">
            {/* Loading spinner uses primary color */}
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : user?.id ? (
          // RealtimeChat component assumed to handle internal message styling
          <RealtimeChat
            messages={combinedMessages}
            isLoading={false} 
            currentUserId={user.id} 
          />
        ) : (
          // Error text uses destructive color
          <div className="p-4 text-center text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            Error: No se pudo identificar al usuario.
          </div>
        )}
      </div>

      {/* Input Area: Uses bg-card, theme border */}
      <div className="border-t border-border p-4 bg-card flex-shrink-0"> 
        <div className="flex items-center gap-2">
          {/* Input uses theme styles and font-body */}
          <Input
            type="text"
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 font-body"
            disabled={!isConnected} 
          />
          {/* Button uses default variant (primary) and font-body/medium */}
          <Button 
            onClick={handleSendMessage} 
            disabled={!isConnected || inputValue.trim() === ''} 
            className="font-body font-medium"
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
} 