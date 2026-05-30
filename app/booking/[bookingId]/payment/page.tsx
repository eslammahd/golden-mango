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

export default async function PaymentPage({ params }: { params: { bookingId: string } }) {
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

  return (
    <div>
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-3xl mb-4">
          ✅
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Booking Received!</h2>
        <p className="text-slate-500 mt-2">Thank you, {booking.patient_name}. Complete your payment to secure the session.</p>
      </div>

      {/* Session summary */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-6">
        <p className="text-xs text-brand-500 font-medium uppercase tracking-wide mb-2">Session details</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-700">{formatDate(slot.slot_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Time</span>
            <span className="font-medium text-slate-700">{formatTime(slot.slot_time)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Duration</span>
            <span className="font-medium text-slate-700">{slot.duration_minutes} minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Format</span>
            <span className="font-medium text-slate-700">Google Meet (link sent after confirmation)</span>
          </div>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="space-y-4 mb-6">
        <h3 className="font-bold text-slate-800 text-lg">💳 Complete your payment</h3>
        <p className="text-sm text-slate-500">Send the session fee using either of the methods below, then wait for the doctor to confirm your booking.</p>

        {/* Instapay */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl mr-3">🏦</div>
            <div>
              <p className="font-semibold text-slate-800">Instapay</p>
              <p className="text-xs text-slate-400">Bank transfer via Instapay app</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-sm font-mono text-slate-700 select-all">
            drsaadelmahdy@instapay
          </div>
          <p className="text-xs text-slate-400 mt-2">Use your name as the transfer reference.</p>
        </div>

        {/* Vodafone Cash */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl mr-3">📱</div>
            <div>
              <p className="font-semibold text-slate-800">Vodafone Cash</p>
              <p className="text-xs text-slate-400">Mobile wallet transfer</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-sm font-mono text-slate-700 select-all">
            010XXXXXXXX
          </div>
          <p className="text-xs text-slate-400 mt-2">Use your name as the transfer reference.</p>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800 mb-6">
        <p className="font-semibold mb-1">⏳ What happens next?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Send the payment using one of the methods above.</li>
          <li>The doctor reviews and confirms your booking.</li>
          <li>You&apos;ll receive a Google Meet link for your session.</li>
        </ol>
      </div>

      {/* Booking reference */}
      <div className="text-center">
        <p className="text-xs text-slate-400">Booking reference: <span className="font-mono text-slate-600">{booking.id.slice(0, 8).toUpperCase()}</span></p>
        <Link href="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">Back to home</Link>
      </div>
    </div>
  );
}
