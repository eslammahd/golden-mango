"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Slot = {
  id: string;
  slot_label: string;
  slot_date: string;
  slot_time: string;
};

export default function Home() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("available_slots")
      .select("*")
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true })
      .then(({ data }) => {
        setSlots(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-teal-700 text-white py-10 px-4 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">&#129658;</span>
        </div>
        <h1 className="text-2xl font-bold">Dr. Saad El Mahdy</h1>
        <p className="text-teal-200 mt-1">MD Therapy &mdash; Online Sessions via Google Meet</p>
      </header>

      <section className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Available Sessions</h2>
        {loading ? (
          <p className="text-slate-400 text-center py-16">Loading available slots&hellip;</p>
        ) : slots.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">&#128197;</p>
            <p>No available slots at the moment. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => router.push(`/book/${slot.id}`)}
                className="bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md rounded-xl p-4 text-left transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{slot.slot_label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{slot.slot_date} &bull; {slot.slot_time}</p>
                  </div>
                  <span className="text-teal-600 group-hover:translate-x-1 transition-transform text-xl">&#8594;</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
