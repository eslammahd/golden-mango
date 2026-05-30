import { supabase } from '@/lib/supabase';
import type { Booking, Slot } from '@/lib/supabase';
import Link from 'next/link';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

async function getBookingWithSlot(bookingId: string): Promise<{ booking: Booking; slot: Slot } | null> {
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bErr || !booking) return null;

  const { data: slot, error: sErr } = await supabase
    .from('available_slots')
    .select('*')
    .eq('id', booking.slot_id)
    .single();

  if (sErr || !slot) return null;

  return { booking: booking as Booking, slot: slot as Slot };
}

export const revalidate = 30;

export default async function StatusPage({ params }: { params: { bookingId: string } }) {
  const result = await getBookingWithSlot(params.bookingId);

  if (!result) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-semibold text-slate-700">Booking not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-brand-600 underline">Go back home</Link>
      </div>
    );
  }

  const { booking, slot } = result;

  const statusConfig = {
    pending: { emoji: '⏳', label: 'Awaiting Confirmation', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
    confirmed: { emoji: '✅', label: 'Confirmed', color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    cancelled: { emoji: '❌', label: 'Cancelled', color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  }[booking.status];

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-3xl mb-4">
          {statusConfig.emoji}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Booking Status</h2>
        <p className="text-slate-500 mt-1">Hello, {booking.patient_name}</p>
      </div>

      <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-2xl p-4 mb-6 text-center`}>
        <span className={`font-semibold text-sm ${statusConfig.text}`}>{statusConfig.label}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Session details</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Date</span>
            <span className="font-medium">{formatDate(slot.slot_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Time</span>
            <span className="font-medium">{formatTime(slot.slot_time)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Duration</span>
            <span className="font-medium">{slot.duration_minutes} minutes</span>
          </div>
        </div>
      </div>

      {booking.status === 'confirmed' && booking.meet_link && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="font-semibold text-green-800 mb-2">💚 Your Google Meet link</p>
          <a
            href={booking.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Join Google Meet →
          </a>
        </div>
      )}

      {booking.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⏳ Waiting for confirmation</p>
          <p>The doctor will review your booking shortly. Make sure you&apos;ve completed the payment.</p>
        </div>
      )}

      {booking.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">❌ Booking cancelled</p>
          <p>This booking was cancelled. Please book a new slot if you&apos;d like to reschedule.</p>
          <Link href="/" className="mt-2 inline-block text-red-700 underline">Browse available slots</Link>
        </div>
      )}

      <div className="text-center mt-6">
        <p className="text-xs text-slate-400">Ref: <span className="font-mono">{booking.id.slice(0, 8).toUpperCase()}</span></p>
      </div>
    </div>
  );
}
