import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { type ChatMessage } from '@/hooks/use-realtime-chat';
import { toast } from 'sonner';

// Tipo para la entrada de la mutación saveMessage
// Corrected to match database insertion needs
export interface SaveMessageInput {
  content: string;
  conversation_id: string;
  sender_user_id?: string | null; 
}

// --- Hook de Mutación para Guardar Mensajes ---
// Hook now accepts supabase client
export const useSaveMessageMutation = (supabase: SupabaseClient<Database> | null) => {
  const queryClient = useQueryClient();

  // Restore original mutation function
  const mutationFn = async (newMessage: SaveMessageInput): Promise<ChatMessage> => {
    if (!supabase || !newMessage.sender_user_id) {
        throw new Error('Supabase client not available or user not logged in.');
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        content: newMessage.content,
        conversation_id: newMessage.conversation_id,
        sender_user_id: newMessage.sender_user_id, 
      }])
      .select()
      .single(); // Assuming you want the inserted message back

    if (error) {
      console.error('Error inserting message:', error);
      throw new Error(error.message || 'Failed to send message');
    }

    if (!data) {
      throw new Error('No data returned after insert');
    }
    
    // Map the DB result to the ChatMessage type
    // Note: You might need to fetch profile info separately if needed for display
    return {
        id: data.id,
        content: data.content ?? '', // Handle potential null content
        createdAt: data.created_at ?? new Date().toISOString(), // Handle potential null timestamp
        senderId: data.sender_user_id ?? undefined,
        conversationId: data.conversation_id,
        user: { name: 'You' }, // Placeholder, ideally fetch profile
    } as ChatMessage;
  };

  // Restore the call to useMutation using the object syntax
  return useMutation<ChatMessage, Error, SaveMessageInput>({
    mutationFn, // Pass the mutation function using the key
    onSuccess: (savedMessage: ChatMessage) => { 
      // Comment out the cache update to prevent duplication with realtime feed
      /*
      queryClient.setQueryData<ChatMessage[]>(['messages', savedMessage.conversationId], (oldData) => {
         console.log('Optimistic update attempted for conversation:', savedMessage.conversationId);
         const currentData = oldData ?? [];
         // Check if message already exists by ID to prevent duplicates
         if (!currentData.some(msg => msg.id === savedMessage.id)) {
             return [...currentData, savedMessage];
         }
         return currentData; 
      });
      */
      console.log('Message saved successfully via mutation hook (cache update skipped)');
    },
    onError: (error: Error) => {
      console.error('Mutation error saving message:', error);
      toast.error(error.message || 'Error al guardar mensaje');
    },
  });
};