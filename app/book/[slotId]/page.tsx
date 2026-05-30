"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const slotId = params.slotId as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: slot } = await supabase
      .from("available_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (!slot) {
      setError("This slot is no longer available.");
      setLoading(false);
      return;
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        slot_id: slotId,
        slot_label: slot.slot_label,
        patient_name: name,
        phone,
        notes,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      setError("Failed to create booking. Please try again.");
      setLoading(false);
      return;
    }

    await supabase.from("available_slots").delete().eq("id", slotId);
    router.push(`/payment/${booking.id}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">Book Your Session</h1>
          <p className="text-slate-500 text-sm mt-1">Dr. Saad El Mahdy &mdash; MD Therapy</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Anything you'd like the doctor to know before the session&hellip;"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Booking&hellip;" : "Confirm Booking"}
          </button>
        </form>
      </div>
    </main>
  );
}
