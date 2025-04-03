import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

// Define the Profile type based on your table schema
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Type for update payload
export type UpdateProfilePayload = Pick<Profile, 'username' | 'avatar_url' | 'first_name' | 'last_name' | 'phone_number' | 'city' | 'province' | 'bio' >;

/**
 * Fetches a user profile by their ID.
 */
export const getProfileById = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    // Reverting back to select('*') as the 406 error was due to missing row, not column selection.
    .select('*') 
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found, which is ok
    console.error("Error fetching profile:", error);
    throw error;
  }

  return data;
};

/**
 * Updates a user profile.
 */
export const updateProfile = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: UpdateProfilePayload
): Promise<Profile | null> => {
    
  // Prevent updating the id field
  const { id, ...updateData } = updates as Partial<Profile>;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data;
}; 