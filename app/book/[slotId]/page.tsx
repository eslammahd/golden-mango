'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Slot } from '@/lib/supabase';

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

export default function BookPage() {
  const { slotId } = useParams<{ slotId: string }>();
  const router = useRouter();

  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchSlot() {
      const { data, error } = await supabase
        .from('available_slots')
        .select('*')
        .eq('id', slotId)
        .eq('is_available', true)
        .single();
      if (error || !data) {
        setError('This slot is no longer available.');
      } else {
        setSlot(data as Slot);
      }
      setLoading(false);
    }
    fetchSlot();
  }, [slotId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and phone number.');
      return;
    }
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, name: name.trim(), phone: phone.trim(), notes: notes.trim() }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    router.push(`/booking/${json.bookingId}/payment`);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="font-semibold text-slate-700">Slot unavailable</p>
        <p className="text-sm text-slate-500 mt-1">{error || 'This slot is no longer available.'}</p>
        <a href="/" className="mt-6 inline-block text-sm text-brand-600 underline">Browse other slots</a>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <a href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All slots
      </a>

      {/* Slot info */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-6">
        <p className="text-xs text-brand-500 font-medium uppercase tracking-wide mb-1">Your selected slot</p>
        <p className="text-lg font-bold text-brand-700">{formatTime(slot.slot_time)}</p>
        <p className="text-sm text-brand-600">{formatDate(slot.slot_date)}</p>
        <p className="text-xs text-brand-400 mt-1">{slot.duration_minutes} minutes · Google Meet</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-800">Your details</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ahmed Mohamed"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 01XXXXXXXXX"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Session notes <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Briefly describe what you'd like to discuss…"
            rows={3}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {submitting ? 'Booking…' : 'Confirm booking →'}
        </button>

        <p className="text-xs text-center text-slate-400">Payment instructions will be shown after booking.</p>
      </form>
    </div>
  );
}
