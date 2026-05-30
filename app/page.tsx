import { supabase, Slot } from '@/lib/supabase';
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

async function getSlots(): Promise<Record<string, Slot[]>> {
  const { data, error } = await supabase
    .from('available_slots')
    .select('*')
    .eq('is_available', true)
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true });

  if (error || !data) return {};

  return data.reduce((acc: Record<string, Slot[]>, slot: Slot) => {
    if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
    acc[slot.slot_date].push(slot);
    return acc;
  }, {});
}

export const revalidate = 60;

export default async function HomePage() {
  const slotsByDate = await getSlots();
  const dates = Object.keys(slotsByDate);

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-50 border-2 border-brand-100 mb-4 text-3xl">
          🩺
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Book a Therapy Session</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Choose an available time slot below. Sessions are 50 minutes and take place via Google Meet.
          Payment is made offline via Instapay or Vodafone Cash after booking.
        </p>
      </div>

      {/* Slot listing */}
      {dates.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">No available slots right now.</p>
          <p className="text-sm mt-1">Please check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-brand-50 px-5 py-3 border-b border-brand-100">
                <h3 className="font-semibold text-brand-700 text-sm">{formatDate(date)}</h3>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotsByDate[date].map((slot) => (
                  <Link
                    key={slot.id}
                    href={`/book/${slot.id}`}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all text-center group"
                  >
                    <span className="text-base font-semibold">{formatTime(slot.slot_time)}</span>
                    <span className="text-xs text-slate-400 mt-0.5 group-hover:text-brand-500">{slot.duration_minutes} min</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment info teaser */}
      <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <p className="font-semibold mb-1">💳 Payment is offline</p>
        <p>After you book, you'll receive Instapay and Vodafone Cash details to complete your payment. Your session is confirmed once the doctor reviews your booking.</p>
      </div>
    </div>
  );
}
