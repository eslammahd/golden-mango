import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { slotId, name, phone, notes } = await req.json();

    if (!slotId || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Atomically check + claim the slot
    const { data: slot, error: slotError } = await supabase
      .from('available_slots')
      .select('id, is_available')
      .eq('id', slotId)
      .eq('is_available', true)
      .single();

    if (slotError || !slot) {
      return NextResponse.json({ error: 'This slot is no longer available.' }, { status: 409 });
    }

    // Mark slot as unavailable
    const { error: updateError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId)
      .eq('is_available', true);

    if (updateError) {
      return NextResponse.json({ error: 'Could not reserve slot. Please try again.' }, { status: 500 });
    }

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({ slot_id: slotId, patient_name: name, patient_phone: phone, notes: notes || null })
      .select('id')
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Could not save booking. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ bookingId: booking.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
