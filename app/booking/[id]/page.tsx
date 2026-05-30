import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BookingStatus({ params }: { params: { id: string } }) {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">Booking not found.</p>
          <Link href="/" className="text-teal-600 underline mt-2 inline-block">Go back home</Link>
        </div>
      </main>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: "Pending Confirmation", color: "text-amber-600 bg-amber-50 border-amber-200", icon: "⏳" },
    confirmed: { label: "Confirmed ✔️", color: "text-green-700 bg-green-50 border-green-200", icon: "✅" },
    cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: "❌" },
  };

  const st = statusConfig[booking.status] || statusConfig.pending;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🩺</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Booking Status</h1>
          <p className="text-slate-500 text-sm mt-1">Dr. Saad El Mahdy</p>
        </div>

        {/* Status badge */}
        <div className={`border rounded-xl p-4 text-center mb-6 ${st.color}`}>
          <p className="text-lg font-semibold">{st.icon} {st.label}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient</span>
            <span className="font-medium text-slate-800">{booking.patient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-800">{booking.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Session</span>
            <span className="font-medium text-teal-700">{booking.slot_label}</span>
          </div>
          {booking.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-500 mb-1">Notes</p>
              <p className="text-slate-700 bg-slate-50 rounded-lg p-3">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Google Meet link — only when confirmed */}
        {booking.status === "confirmed" && booking.meet_link && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-blue-800 font-semibold mb-2">🎥 Your session is ready!</p>
            <a
              href={booking.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
            >
              Join Google Meet
            </a>
            <p className="text-blue-600 text-xs mt-2 break-all">{booking.meet_link}</p>
          </div>
        )}

        {/* Pending nudge */}
        {booking.status === "pending" && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-center">
            <p>Your booking is under review. You\'ll receive confirmation soon.</p>
            <p className="mt-1 text-xs">Please make sure payment has been sent.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-teal-600 hover:underline text-sm">← Book another session</Link>
        </div>
      </div>
    </main>
  );
}
