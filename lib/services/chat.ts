import { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '../database.types';

// Tipo para representar una conversación en la lista
export interface ConversationPreview {
  conversationId: string;
  petId: number;
  petName: string | null;
  petImageUrl: string | null;
  otherParticipantId: string;
  otherParticipantName: string | null;
}

/**
 * Fetches a preview of all conversations for the current user.
 * Includes the pet's name and the other participant's name.
 * Refactored to avoid complex direct joins causing 400 errors.
 */
export const getMyConversations = async (
  supabase: SupabaseClient<Database>
): Promise<ConversationPreview[]> => {
  console.log('[getMyConversations] Fetching...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication error fetching conversations:', authError);
    throw authError || new Error('User not authenticated');
  }
  const currentUserId = user.id;
  console.log('[getMyConversations] Current User ID:', currentUserId);

  // 1. Get all conversation IDs the current user is part of
  const { data: participantEntries, error: participantError } = await supabase
    .from('participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (participantError) throw participantError;
  if (!participantEntries || participantEntries.length === 0) return [];

  const conversationIds = participantEntries.map(p => p.conversation_id);

  // 2. Fetch basic conversation data (just IDs and pet_id)
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('id, pet_id')
    .in('id', conversationIds);
  
  if (conversationsError) throw conversationsError;
  if (!conversations || conversations.length === 0) return [];

  const petIds = conversations.map(c => c.pet_id).filter(id => id !== null) as number[];
  const uniquePetIds = [...new Set(petIds)];

  // 3. Fetch all participants for these conversations
  const { data: allParticipants, error: allParticipantsError } = await supabase
      .from('participants')
      .select('conversation_id, user_id')
      .in('conversation_id', conversationIds);
  
  if (allParticipantsError) throw allParticipantsError;
  if (!allParticipants) return [];

  const participantIds = allParticipants.map(p => p.user_id);
  const uniqueParticipantIds = [...new Set(participantIds)];

  // 4. Fetch Pet names (only name)
  const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('id, name') // Select only id and name
      .in('id', uniquePetIds);

  if (petsError) {
      console.error("Error fetching pets data:", petsError);
      // Handle error, maybe return without pet data or throw
  }
  const petsMap = new Map(petsData?.map(p => [p.id, { name: p.name }]) ?? []);

  // 5. Fetch Pet Images (assuming primary or first)
  const { data: petImagesData, error: petImagesError } = await supabase
      .from('pet_images')
      .select('pet_id, image_url')
      .in('pet_id', uniquePetIds)
      // Optional: Order to get primary first if that column exists and is reliable
      // .order('is_primary', { ascending: false }); 
  
  if (petImagesError) console.error("Error fetching pet images:", petImagesError);
  // Create a map, taking the first image found for each pet
  const petImageMap = new Map<number, string>();
  petImagesData?.forEach(img => {
      if (!petImageMap.has(img.pet_id)) { // Take the first one encountered
          petImageMap.set(img.pet_id, img.image_url);
      }
  });

  // 6. Fetch Profiles data (full_name, username)
  const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, username') // Select full_name and username
      .in('id', uniqueParticipantIds);
  
  if (profilesError) {
      console.error("Error fetching profiles data:", profilesError);
      // Handle error, maybe return without names or throw
  }
  const profilesMap = new Map(profilesData?.map(p => [p.id, { fullName: p.full_name, username: p.username }]) ?? []);

  // 7. Combine everything
  // Map conversations to potential previews (including nulls)
  const potentialPreviews = conversations.map((convo): ConversationPreview | null => {
      const participantsInConvo = allParticipants.filter(p => p.conversation_id === convo.id);
      const otherParticipantEntry = participantsInConvo.find(p => p.user_id !== currentUserId);
      
      if (!otherParticipantEntry || !convo.pet_id) {
          return null; // Explicitly return null
      }
      
      const petInfo = petsMap.get(convo.pet_id);
      const petImageUrl = petImageMap.get(convo.pet_id) ?? null;
      const otherParticipantProfile = profilesMap.get(otherParticipantEntry.user_id);
      
      const otherParticipantName = otherParticipantProfile?.fullName || otherParticipantProfile?.username || 'Usuario Desconocido';
      
      // Create the object matching ConversationPreview type exactly
      const preview: ConversationPreview = {
          conversationId: convo.id,
          petId: convo.pet_id,
          petName: petInfo?.name ?? null, // Ensure null is handled explicitly
          petImageUrl: petImageUrl,
          otherParticipantId: otherParticipantEntry.user_id,
          otherParticipantName: otherParticipantName,
      };
      return preview;
  });

  // Filter out the nulls explicitly
  const previews: ConversationPreview[] = potentialPreviews.filter(
      (p): p is ConversationPreview => p !== null
  );

  console.log('[getMyConversations] Final Previews (Corrected Queries & Types):', previews);
  return previews;
}; 