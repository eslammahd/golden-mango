import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  duration_minutes: number;
  is_available: boolean;
};

export type Booking = {
  id: string;
  slot_id: string;
  patient_name: string;
  patient_phone: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  meet_link: string | null;
  created_at: string;
};
