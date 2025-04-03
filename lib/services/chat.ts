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
  hasUnread: boolean; // Flag for unread messages
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

  // 6. Fetch Profiles data (first_name, last_name, username)
  const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      // Select first_name and last_name instead of full_name
      .select('id, first_name, last_name, username') 
      .in('id', uniqueParticipantIds);
  
  if (profilesError) {
      console.error("Error fetching profiles data:", JSON.stringify(profilesError, null, 2)); 
  }
  // --> Log fetched profiles data
  console.log("[getMyConversations] Fetched profilesData:", JSON.stringify(profilesData, null, 2));

  const profilesMap = new Map(
      profilesData?.map(p => [
          p.id, 
          { 
              firstName: p.first_name, 
              lastName: p.last_name, 
              username: p.username 
          }
      ]) ?? []
  );
  // --> Log the created profilesMap
  console.log("[getMyConversations] Created profilesMap:", profilesMap);

  // --> ADDED STEP: Fetch last read status for current user
  const { data: readStatuses, error: readStatusError } = await supabase
      .from('participant_read_status')
      .select('conversation_id, last_read_at')
      .eq('user_id', currentUserId)
      .in('conversation_id', conversationIds);

  if (readStatusError) console.error("Error fetching read statuses:", readStatusError);
  const readStatusMap = new Map(readStatuses?.map(rs => [rs.conversation_id, rs.last_read_at]) ?? []);
  console.log("[getMyConversations] Read status map:", readStatusMap);

  // --> ADDED STEP: Fetch last message timestamp for each conversation (sent by others)
  const { data: lastMessages, error: lastMessagesError } = await supabase
      .from('messages')
      .select('conversation_id, created_at')
      .in('conversation_id', conversationIds)
      .neq('sender_user_id', currentUserId) // Only messages sent by others
      .order('created_at', { ascending: false }); // Order to easily get the latest
      // Note: This fetches potentially many messages, we only need the latest per convo.
      // A more optimized query might use window functions or subqueries if performance becomes an issue.

  if (lastMessagesError) console.error("Error fetching last messages:", lastMessagesError);
  // Create a map of the latest message timestamp per conversation
  const lastMessageTimestampMap = new Map<string, string>();
  lastMessages?.forEach(msg => {
      if (!lastMessageTimestampMap.has(msg.conversation_id)) { // Only store the first (latest) encountered
          lastMessageTimestampMap.set(msg.conversation_id, msg.created_at);
      }
  });
  console.log("[getMyConversations] Last message timestamp map:", lastMessageTimestampMap);

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
      // --> Log the retrieved other participant profile
      console.log(`[getMyConversations] Convo ${convo.id} - Other User ${otherParticipantEntry.user_id} - Profile from Map:`, JSON.stringify(otherParticipantProfile, null, 2));
      
      let constructedName = 'Usuario Desconocido';
      if (otherParticipantProfile?.firstName) {
          constructedName = `${otherParticipantProfile.firstName}${otherParticipantProfile.lastName ? ' ' + otherParticipantProfile.lastName : ''}`;
      } else if (otherParticipantProfile?.username) {
          constructedName = otherParticipantProfile.username; // Fallback to username if no first name
      }
      const otherParticipantName = constructedName;
      // --> Log the constructed name
      console.log(`[getMyConversations] Convo ${convo.id} - Constructed Name:`, otherParticipantName);
      
      // --> ADDED: Determine unread status
      const lastReadTimestamp = readStatusMap.get(convo.id);
      const lastMessageTimestamp = lastMessageTimestampMap.get(convo.id);
      let hasUnread = false;
      if (lastMessageTimestamp) { // If there is a message from the other user
          if (!lastReadTimestamp || new Date(lastMessageTimestamp) > new Date(lastReadTimestamp)) {
              // If user hasn't read this convo before OR last message is newer than last read
              hasUnread = true;
          }
      }
      console.log(`[getMyConversations] Convo ${convo.id} - LastRead: ${lastReadTimestamp}, LastMsg: ${lastMessageTimestamp}, HasUnread: ${hasUnread}`);

      // Create the object matching ConversationPreview type exactly
      const preview: ConversationPreview = {
          conversationId: convo.id,
          petId: convo.pet_id,
          petName: petInfo?.name ?? null, // Ensure null is handled explicitly
          petImageUrl: petImageUrl,
          otherParticipantId: otherParticipantEntry.user_id,
          otherParticipantName: otherParticipantName,
          hasUnread: hasUnread, // Add the flag
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