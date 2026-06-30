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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          department: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          department: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          department?: string
          created_at?: string
        }
      }
      cctv_cameras: {
        Row: {
          id: string
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          location?: string | null
          created_at?: string
        }
      }
      complaints: {
        Row: {
          id: string
          ticket_id: string
          title: string
          status: 'submitted' | 'open' | 'in_progress' | 'resolved'
          severity: 'low' | 'medium' | 'high' | 'critical'
          city: string | null
          created_at: string
          resolved_at: string | null
          citizen_id: string | null
          assigned_officer_id: string | null
          category_id: string | null
          cctv_camera_id: string | null
        }
        Insert: {
          id?: string
          ticket_id: string
          title: string
          status?: 'submitted' | 'open' | 'in_progress' | 'resolved'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          city?: string | null
          created_at?: string
          resolved_at?: string | null
          citizen_id?: string | null
          assigned_officer_id?: string | null
          category_id?: string | null
          cctv_camera_id?: string | null
        }
        Update: {
          id?: string
          ticket_id?: string
          title?: string
          status?: 'submitted' | 'open' | 'in_progress' | 'resolved'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          city?: string | null
          created_at?: string
          resolved_at?: string | null
          citizen_id?: string | null
          assigned_officer_id?: string | null
          category_id?: string | null
          cctv_camera_id?: string | null
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
