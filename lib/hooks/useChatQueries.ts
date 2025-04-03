import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabaseClient'; // Usar nuestro cliente existente
import { type ChatMessage } from '@/hooks/use-realtime-chat'; // Tipo esperado por el componente
import { ConversationPreview, getMyConversations } from '../services/chat'; // Corregido: Sin extensión .ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types'; // Añadido: Importar Database

// --- Interfaz para el tipo de dato que devuelve la DB --- 
interface DbMessage {
  id: string;
  content: string;
  created_at: string;
  sender_user_id: string | null; // Sender puede ser null si el usuario se borró
}

// --- Función para obtener los mensajes --- 
async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = createClient();

  // --- Consulta Simplificada: Solo tabla messages --- 
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_user_id
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  // ------------------------------------------------

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error(error.message || 'Failed to fetch messages');
  }

  // Mapear los datos al formato ChatMessage esperado por el componente
  const formattedMessages: ChatMessage[] = ((data as DbMessage[]) || []).map((msg: DbMessage) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.created_at,
    senderId: msg.sender_user_id ?? undefined,
    conversationId: conversationId,
    user: {
      name: msg.sender_user_id ? `User ${msg.sender_user_id.substring(0, 6)}...` : 'Usuario Eliminado',
    },
  }));

  return formattedMessages;
}

// --- Hook useMessagesQuery --- 
export function useMessagesQuery(conversationId: string | null | undefined) {
  return useQuery<ChatMessage[], Error>({
    // La query key debe incluir el conversationId para que sea única por chat
    queryKey: ['messages', conversationId],
    // La función que se ejecutará para obtener los datos
    queryFn: () => fetchMessages(conversationId!),
    // Opciones adicionales:
    enabled: !!conversationId, // Solo ejecutar la query si conversationId tiene un valor
    staleTime: 1000 * 60 * 5, // Considerar los datos frescos por 5 minutos
    // Podríamos añadir refetchInterval si quisiéramos recargar periódicamente,
    // pero la suscripción realtime debería manejar los nuevos mensajes.
  });
}

// --- Hook useMyConversationsQuery ---
/**
 * Hook to fetch the list of conversations for the current user.
 */
export const useMyConversationsQuery = (
  supabase: SupabaseClient<Database> | null // Necesita el cliente Supabase
) => {
  return useQuery<ConversationPreview[], Error>({
    queryKey: ['myConversations'], // Clave única para esta query
    queryFn: async () => {
      if (!supabase) {
        throw new Error("Supabase client is not available.");
      }
      return getMyConversations(supabase); // Llama a la función del servicio
    },
    enabled: !!supabase, // Solo ejecutar si supabase está disponible
    // staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    staleTime: 0, // <-- Considerar datos obsoletos inmediatamente al montar
  });
};

// --- Hook useHasUnreadChats ---
/**
 * Hook to efficiently check if the current user has any unread chat messages.
 */
export const useHasUnreadChats = (
  supabase: SupabaseClient<Database> | null
) => {
  return useQuery<boolean, Error>({ // Returns a boolean
    queryKey: ['hasUnreadChats'], // Unique query key
    queryFn: async () => {
      console.log("[useHasUnreadChats] queryFn executing...");
      if (!supabase) {
        console.warn("useHasUnreadChats: Supabase client not available.");
        return false; 
      }
      const conversations = await getMyConversations(supabase);
      console.log("[useHasUnreadChats] Fetched conversations:", conversations);
      const hasAnyUnread = conversations.some(convo => convo.hasUnread);
      console.log("[useHasUnreadChats] Result (hasAnyUnread):", hasAnyUnread);
      return hasAnyUnread;
    },
    enabled: !!supabase, // Only run if supabase is available
    staleTime: 1000 * 60 * 1, // Check for unread status more frequently, e.g., every 1 minute
    refetchInterval: 1000 * 60 * 2, // Optional: Refetch periodically in background (e.g., every 2 mins)
  });
};

// --- Hooks de Mutación (Ejemplo: useSaveMessageMutation si lo tienes aquí) ---
// (Asegúrate de que los otros hooks como useSaveMessageMutation están presentes si pertenecen a este archivo) 