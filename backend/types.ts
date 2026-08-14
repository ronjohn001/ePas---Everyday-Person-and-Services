/* eslint-disable */
// AUTO-GENERATED — DO NOT EDIT
// Run migrations to regenerate.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adverts: {
        Row: {
          active: boolean
          background_image: string | null
          background_type: string
          background_video: string | null
          cta_text: string | null
          gradient: string[]
          icon: string
          id: string
          link_route: string | null
          overlay_opacity: number
          slot: number
          sort_order: number
          subtitle: string | null
          text_position: string
          title: string
        }
        Insert: {
          active?: boolean
          background_image?: string | null
          background_type?: string
          background_video?: string | null
          cta_text?: string | null
          gradient?: string[]
          icon?: string
          id: string
          link_route?: string | null
          overlay_opacity?: number
          slot?: number
          sort_order?: number
          subtitle?: string | null
          text_position?: string
          title: string
        }
        Update: {
          active?: boolean
          background_image?: string | null
          background_type?: string
          background_video?: string | null
          cta_text?: string | null
          gradient?: string[]
          icon?: string
          id?: string
          link_route?: string | null
          overlay_opacity?: number
          slot?: number
          sort_order?: number
          subtitle?: string | null
          text_position?: string
          title?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          after_photo: string | null
          area: string | null
          before_photo: string | null
          booking_type: string
          completed_at: string | null
          created_at: string
          customer_id: string
          customer_name: string | null
          customer_photo: string | null
          customer_rating: number | null
          dispute_id: string | null
          final_price: number
          has_review: boolean
          id: string
          notes: string | null
          payment_method: string
          payment_status: string
          platform_commission: number
          provider_id: string
          provider_name: string | null
          provider_payout: number
          provider_photo: string | null
          quoted_price: number | null
          scheduled_date: string | null
          service_fee: number
          service_job_color: string | null
          service_job_icon: string | null
          service_job_id: string
          service_job_name: string | null
          status: string
        }
        Insert: {
          address?: string | null
          after_photo?: string | null
          area?: string | null
          before_photo?: string | null
          booking_type?: string
          completed_at?: string | null
          created_at?: string
          customer_id: string
          customer_name?: string | null
          customer_photo?: string | null
          customer_rating?: number | null
          dispute_id?: string | null
          final_price?: number
          has_review?: boolean
          id: string
          notes?: string | null
          payment_method?: string
          payment_status?: string
          platform_commission?: number
          provider_id: string
          provider_name?: string | null
          provider_payout?: number
          provider_photo?: string | null
          quoted_price?: number | null
          scheduled_date?: string | null
          service_fee?: number
          service_job_color?: string | null
          service_job_icon?: string | null
          service_job_id: string
          service_job_name?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          after_photo?: string | null
          area?: string | null
          before_photo?: string | null
          booking_type?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          customer_name?: string | null
          customer_photo?: string | null
          customer_rating?: number | null
          dispute_id?: string | null
          final_price?: number
          has_review?: boolean
          id?: string
          notes?: string | null
          payment_method?: string
          payment_status?: string
          platform_commission?: number
          provider_id?: string
          provider_name?: string | null
          provider_payout?: number
          provider_photo?: string | null
          quoted_price?: number | null
          scheduled_date?: string | null
          service_fee?: number
          service_job_color?: string | null
          service_job_icon?: string | null
          service_job_id?: string
          service_job_name?: string | null
          status?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          booking_id: string
          created_at: string
          description: string | null
          evidence_photos: string[]
          id: string
          raised_by: string
          reason: string | null
          refund_amount: number
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          description?: string | null
          evidence_photos?: string[]
          id: string
          raised_by: string
          reason?: string | null
          refund_amount?: number
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          description?: string | null
          evidence_photos?: string[]
          id?: string
          raised_by?: string
          reason?: string | null
          refund_amount?: number
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id: string
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          sender_name: string | null
          sender_role: string
          text: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id: string
          is_read?: boolean
          sender_id: string
          sender_name?: string | null
          sender_role: string
          text: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          sender_name?: string | null
          sender_role?: string
          text?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id: string
          is_read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          address: string | null
          approval_status: string
          area: string | null
          business_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          profile_photo: string | null
          role: string
        }
        Insert: {
          account_type?: string
          address?: string | null
          approval_status?: string
          area?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          profile_photo?: string | null
          role?: string
        }
        Update: {
          account_type?: string
          address?: string | null
          approval_status?: string
          area?: string | null
          business_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          profile_photo?: string | null
          role?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          day_of_week: number
          end_hour: number
          id: string
          is_available: boolean
          provider_id: string
          start_hour: number
        }
        Insert: {
          day_of_week: number
          end_hour?: number
          id: string
          is_available?: boolean
          provider_id: string
          start_hour?: number
        }
        Update: {
          day_of_week?: number
          end_hour?: number
          id?: string
          is_available?: boolean
          provider_id?: string
          start_hour?: number
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          approval_status: string
          badge_level: string
          bio: string | null
          certifications: string[]
          completed_jobs: number
          created_at: string
          experience_years: number
          id: string
          name: string
          on_time_rate: number
          overall_rating: number
          portfolio_photos: string[]
          profile_completeness: number
          profile_photo: string | null
          provider_tier: string
          response_rate: number
          response_time: string | null
          service_areas: string[]
          service_category_ids: string[]
          service_radius_km: number
          total_reviews: number
          user_id: string
          verified: boolean
        }
        Insert: {
          approval_status?: string
          badge_level?: string
          bio?: string | null
          certifications?: string[]
          completed_jobs?: number
          created_at?: string
          experience_years?: number
          id: string
          name: string
          on_time_rate?: number
          overall_rating?: number
          portfolio_photos?: string[]
          profile_completeness?: number
          profile_photo?: string | null
          provider_tier?: string
          response_rate?: number
          response_time?: string | null
          service_areas?: string[]
          service_category_ids?: string[]
          service_radius_km?: number
          total_reviews?: number
          user_id: string
          verified?: boolean
        }
        Update: {
          approval_status?: string
          badge_level?: string
          bio?: string | null
          certifications?: string[]
          completed_jobs?: number
          created_at?: string
          experience_years?: number
          id?: string
          name?: string
          on_time_rate?: number
          overall_rating?: number
          portfolio_photos?: string[]
          profile_completeness?: number
          profile_photo?: string | null
          provider_tier?: string
          response_rate?: number
          response_time?: string | null
          service_areas?: string[]
          service_category_ids?: string[]
          service_radius_km?: number
          total_reviews?: number
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      provider_suggestions: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          service_category: string | null
          status: string
          suggested_by: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          notes?: string | null
          phone?: string | null
          service_category?: string | null
          status?: string
          suggested_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          service_category?: string | null
          status?: string
          suggested_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appeal_reason: string | null
          appeal_status: string | null
          booking_id: string
          comment: string | null
          communication: number
          created_at: string
          customer_id: string
          customer_name: string | null
          customer_photo: string | null
          id: string
          overall: number
          professionalism: number
          provider_id: string
          provider_reply: string | null
          provider_reply_at: string | null
          quality: number
          status: string
          timeliness: number
        }
        Insert: {
          appeal_reason?: string | null
          appeal_status?: string | null
          booking_id: string
          comment?: string | null
          communication?: number
          created_at?: string
          customer_id: string
          customer_name?: string | null
          customer_photo?: string | null
          id: string
          overall?: number
          professionalism?: number
          provider_id: string
          provider_reply?: string | null
          provider_reply_at?: string | null
          quality?: number
          status?: string
          timeliness?: number
        }
        Update: {
          appeal_reason?: string | null
          appeal_status?: string | null
          booking_id?: string
          comment?: string | null
          communication?: number
          created_at?: string
          customer_id?: string
          customer_name?: string | null
          customer_photo?: string | null
          id?: string
          overall?: number
          professionalism?: number
          provider_id?: string
          provider_reply?: string | null
          provider_reply_at?: string | null
          quality?: number
          status?: string
          timeliness?: number
        }
        Relationships: []
      }
      saved_providers: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          color: string
          description: string | null
          featured: boolean
          icon: string
          id: string
          name: string
          service_count: number
          sort_order: number
        }
        Insert: {
          color?: string
          description?: string | null
          featured?: boolean
          icon?: string
          id: string
          name: string
          service_count?: number
          sort_order?: number
        }
        Update: {
          color?: string
          description?: string | null
          featured?: boolean
          icon?: string
          id?: string
          name?: string
          service_count?: number
          sort_order?: number
        }
        Relationships: []
      }
      service_jobs: {
        Row: {
          assessment_fee: number
          base_price: number
          category_id: string
          color: string
          description: string | null
          estimated_duration: string | null
          featured: boolean
          icon: string
          id: string
          min_price: number | null
          name: string
          provider_ids: string[]
          surge_multiplier: number
        }
        Insert: {
          assessment_fee?: number
          base_price?: number
          category_id: string
          color?: string
          description?: string | null
          estimated_duration?: string | null
          featured?: boolean
          icon?: string
          id: string
          min_price?: number | null
          name: string
          provider_ids?: string[]
          surge_multiplier?: number
        }
        Update: {
          assessment_fee?: number
          base_price?: number
          category_id?: string
          color?: string
          description?: string | null
          estimated_duration?: string | null
          featured?: boolean
          icon?: string
          id?: string
          min_price?: number | null
          name?: string
          provider_ids?: string[]
          surge_multiplier?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          benefits: string[]
          end_date: string | null
          id: string
          is_active: boolean
          monthly_fee: number
          start_date: string
          tier: string
          user_id: string
        }
        Insert: {
          benefits?: string[]
          end_date?: string | null
          id: string
          is_active?: boolean
          monthly_fee?: number
          start_date?: string
          tier?: string
          user_id: string
        }
        Update: {
          benefits?: string[]
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_fee?: number
          start_date?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string | null
          id: string
          payment_method: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id: string
          payment_method?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_phones: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          label: string | null
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          label?: string | null
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          label?: string | null
          phone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_phones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
