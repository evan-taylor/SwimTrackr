export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      facilities: {
        Row: {
          id: string
          name: string
          contact_email: string
          phone: string | null
          address: string | null
          subscription_tier: string
          stripe_customer_id: string | null
          created_at: string | null
          updated_at: string | null
          is_public: boolean | null
          program_package_id: string | null
        }
        Insert: {
          id?: string
          name: string
          contact_email: string
          phone?: string | null
          address?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_public?: boolean | null
          program_package_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_email?: string
          phone?: string | null
          address?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_public?: boolean | null
          program_package_id?: string | null
        }
      }
      levels: {
        Row: {
          id: string
          program_package_id: string | null
          name: string
          description: string | null
          order_index: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          program_package_id?: string | null
          name: string
          description?: string | null
          order_index: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          program_package_id?: string | null
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          facility_id: string | null
          subscription_tier: string
          subscription_status: string
          stripe_customer_id: string | null
          created_at: string | null
          updated_at: string | null
          invitation_status: string | null
          invited_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: string
          facility_id?: string | null
          subscription_tier?: string
          subscription_status?: string
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          invitation_status?: string | null
          invited_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          facility_id?: string | null
          subscription_tier?: string
          subscription_status?: string
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          invitation_status?: string | null
          invited_at?: string | null
        }
      }
      program_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
          facility_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          facility_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          facility_id?: string | null
        }
      }
      session_students: {
        Row: {
          session_id: string
          student_id: string
          created_at: string | null
        }
        Insert: {
          session_id: string
          student_id: string
          created_at?: string | null
        }
        Update: {
          session_id?: string
          student_id?: string
          created_at?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          name: string
          facility_id: string | null
          instructor_id: string | null
          start_time: string | null
          end_time: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          is_public: boolean | null
          level: string | null
          max_students: number
          program_package_id: string | null
        }
        Insert: {
          id?: string
          name: string
          facility_id?: string | null
          instructor_id?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_public?: boolean | null
          level?: string | null
          max_students?: number
          program_package_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          facility_id?: string | null
          instructor_id?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_public?: boolean | null
          level?: string | null
          max_students?: number
          program_package_id?: string | null
        }
      }
      student_progress: {
        Row: {
          id: string
          student_id: string | null
          task_id: string | null
          status: string
          notes: string | null
          evaluated_by: string | null
          evaluated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          task_id?: string | null
          status: string
          notes?: string | null
          evaluated_by?: string | null
          evaluated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          task_id?: string | null
          status?: string
          notes?: string | null
          evaluated_by?: string | null
          evaluated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          level: number
          facility_id: string | null
          parent_id: string | null
          created_at: string | null
          updated_at: string | null
          current_level_id: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          level: number
          facility_id?: string | null
          parent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          current_level_id?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          level?: number
          facility_id?: string | null
          parent_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          current_level_id?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          level_id: string | null
          name: string
          description: string | null
          order_index: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          level_id?: string | null
          name: string
          description?: string | null
          order_index: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          level_id?: string | null
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_facilities: {
        Row: {
          id: string
          profile_id: string | null
          facility_id: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          facility_id?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          facility_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type UserRole = 'admin' | 'manager' | 'instructor' | 'facility_parent' | 'parent';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T] 