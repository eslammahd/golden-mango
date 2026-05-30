"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  patient_name: string;
  phone: string;
  notes: string | null;
  slot_label: string;
  status: string;
  meet_link: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("pending");

  async function fetchBookings() {
    const res = await fetch("/api/admin/bookings");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  useEffect(() => { fetchBookings(); }, []);

  async function handleAction(id: string, action: "confirm" | "cancel") {
    setActionLoading(id + action);
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await fetchBookings();
    setActionLoading(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Dr. Saad El Mahdy — Admin</h1>
          <p className="text-teal-200 text-sm">Booking Management</p>
        </div>
        <button onClick={handleLogout} className="text-sm bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg transition">
          Logout
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "confirmed", "cancelled", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
                filter === f ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-teal-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No {filter === "all" ? "" : filter} bookings.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-800">{b.patient_name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[b.status] || "bg-slate-100 text-slate-600"}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">📞 {b.phone}</p>
                    <p className="text-sm text-teal-700 font-medium">🗓 {b.slot_label}</p>
                    {b.notes && <p className="text-sm text-slate-600 bg-slate-50 rounded p-2 mt-1">📝 {b.notes}</p>}
                    {b.meet_link && (
                      <a href={b.meet_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
                        🎥 {b.meet_link}
                      </a>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Booked: {new Date(b.created_at).toLocaleString("en-EG")}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(b.id, "confirm")}
                          disabled={!!actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                        >
                          {actionLoading === b.id + "confirm" ? "…" : "✓ Confirm"}
                        </button>
                        <button
                          onClick={() => handleAction(b.id, "cancel")}
                          disabled={!!actionLoading}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                        >
                          {actionLoading === b.id + "cancel" ? "…" : "✕ Cancel"}
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleAction(b.id, "cancel")}
                        disabled={!!actionLoading}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                      >
                        {actionLoading === b.id + "cancel" ? "…" : "✕ Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
