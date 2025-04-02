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
  const { supabase, user, isLoading: isAuthLoading } = useAuth();
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
    // Logic remains the same
    if (lastMessage && user?.id && !processedMessageIds.has(lastMessage.id)) {
      console.log('Intentando guardar mensaje con ID:', lastMessage.id);
      setProcessedMessageIds(prev => new Set(prev).add(lastMessage.id));
      
      const messageInput: SaveMessageInput = {
        content: lastMessage.content,
        conversation_id: conversationId,
        sender_user_id: user.id 
      };

      saveMessage(messageInput, { 
        onError: (err) => {
          // Log the actual error object
          console.error('Error detallado al guardar mensaje:', err);
          // --- NO eliminar el ID en caso de error para evitar el bucle ---
          // setProcessedMessageIds(prev => {
          //   const newSet = new Set(prev);
          //   newSet.delete(lastMessage.id);
          //   return newSet;
          // });
          // --------------------------------------------------------------
        }
      });
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
  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!conversationId) {
    notFound();
  }
  
  if (messagesError) {
      return <div className="p-4 text-red-600">Error cargando mensajes: {messagesError.message}</div>;
  }
  
  //const currentUsername = user?.email?.split('@')[0] || 'Tú';

  return (
    // Main container: flex-col, height defined by parent (main with flex-1)
    <div className="flex flex-col h-full bg-gray-100"> 
      {/* Messages Area: Takes available space, scrolls internally */}
      {/* Removed p-4/md:p-6, add padding inside RealtimeChat if needed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0"> 
        <RealtimeChat
          messages={combinedMessages}
          isLoading={isLoadingMessages} 
          currentUserId={user?.id} 
          // Pass ref if useChatScroll needs it (check hook definition)
          // scrollRef={scrollRef} 
        />
      </div>

      {/* Input Area: Fixed height, does not shrink */}
      <div className="border-t p-4 bg-white flex-shrink-0"> 
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={!isConnected} 
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!isConnected || inputValue.trim() === ''} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
} 