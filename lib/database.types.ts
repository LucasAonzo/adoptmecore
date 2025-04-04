export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      adoption_requests: {
        Row: {
          id: number
          notes: string | null
          pet_id: number
          request_date: string
          shelter_id: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: never
          notes?: string | null
          pet_id: number
          request_date?: string
          shelter_id?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: never
          notes?: string | null
          pet_id?: number
          request_date?: string
          shelter_id?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adoption_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_requests_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          pet_id: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          pet_id?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          pet_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_pet_id"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_read_status: {
        Row: {
          conversation_id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_read_status_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          conversation_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_images: {
        Row: {
          created_at: string
          id: number
          image_url: string
          is_primary: boolean | null
          pet_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          image_url: string
          is_primary?: boolean | null
          pet_id: number
        }
        Update: {
          created_at?: string
          id?: never
          image_url?: string
          is_primary?: boolean | null
          pet_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "pet_images_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          added_by_user_id: string | null
          age: number | null
          age_months: number | null
          age_years: number | null
          breed: string | null
          created_at: string
          description: string | null
          gender: string | null
          id: number
          name: string
          shelter_id: number | null
          size: string | null
          species: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          added_by_user_id?: string | null
          age?: number | null
          age_months?: number | null
          age_years?: number | null
          breed?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: never
          name: string
          shelter_id?: number | null
          size?: string | null
          species?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          added_by_user_id?: string | null
          age?: number | null
          age_months?: number | null
          age_years?: number | null
          breed?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: never
          name?: string
          shelter_id?: number | null
          size?: string | null
          species?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          province: string | null
          role: string
          shelter_id: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number?: string | null
          province?: string | null
          role?: string
          shelter_id?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          province?: string | null
          role?: string
          shelter_id?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_shelter_id_fkey"
            columns: ["shelter_id"]
            isOneToOne: false
            referencedRelation: "shelters"
            referencedColumns: ["id"]
          },
        ]
      }
      report_history: {
        Row: {
          changed_at: string
          changed_by_user_id: string | null
          id: number
          new_status: Database["public"]["Enums"]["report_status"]
          previous_status: Database["public"]["Enums"]["report_status"]
          report_id: string
        }
        Insert: {
          changed_at?: string
          changed_by_user_id?: string | null
          id?: number
          new_status: Database["public"]["Enums"]["report_status"]
          previous_status: Database["public"]["Enums"]["report_status"]
          report_id: string
        }
        Update: {
          changed_at?: string
          changed_by_user_id?: string | null
          id?: number
          new_status?: Database["public"]["Enums"]["report_status"]
          previous_status?: Database["public"]["Enums"]["report_status"]
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          contact_info: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          location_description: string | null
          location_lat: number
          location_lon: number
          pet_breed: string | null
          pet_name: string | null
          pet_type: string
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by_user_id: string
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          contact_info: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          location_description?: string | null
          location_lat: number
          location_lon: number
          pet_breed?: string | null
          pet_name?: string | null
          pet_type: string
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by_user_id: string
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          contact_info?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          location_description?: string | null
          location_lat?: number
          location_lon?: number
          pet_breed?: string | null
          pet_name?: string | null
          pet_type?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          reported_by_user_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: []
      }
      shelters: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: number
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: never
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: never
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      adoption_requests_with_details: {
        Row: {
          id: number | null
          notes: string | null
          pet_id: number | null
          pets: Json | null
          profiles: Json | null
          request_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_or_get_pet_conversation: {
        Args: {
          p_pet_id: number
        }
        Returns: string
      }
      create_user_profile: {
        Args: {
          user_id: string
          first_name: string
          last_name: string
          email: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_participant: {
        Args: {
          p_conversation_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      is_report_owner: {
        Args: {
          p_report_id: string
        }
        Returns: boolean
      }
      mark_report_as_resolved: {
        Args: {
          p_report_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      update_last_read_timestamp: {
        Args: {
          p_conversation_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      report_status: "ACTIVE" | "RESOLVED" | "CLOSED"
      report_type: "LOST" | "FOUND" | "EMERGENCY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
