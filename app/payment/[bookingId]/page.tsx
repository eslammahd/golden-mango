"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PaymentPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Booking Received!</h1>
          <p className="text-slate-500 text-sm mt-1">Please complete your payment to confirm your session.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h2 className="font-semibold text-purple-800 mb-1">&#128179; Instapay</h2>
            <p className="text-sm text-purple-700">Send payment to:</p>
            <p className="font-mono font-bold text-purple-900 mt-1">drsaadelmahdy@instapay</p>
            <p className="text-xs text-purple-600 mt-2">* Replace with your real Instapay address</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h2 className="font-semibold text-red-800 mb-1">&#128242; Vodafone Cash</h2>
            <p className="text-sm text-red-700">Send payment to:</p>
            <p className="font-mono font-bold text-red-900 mt-1">010XXXXXXXX</p>
            <p className="text-xs text-red-600 mt-2">* Replace with your real Vodafone Cash number</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-1">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Send payment using one of the methods above</li>
              <li>Dr. Saad will confirm your session after payment verification</li>
              <li>You will receive a Google Meet link for your session</li>
            </ol>
          </div>
        </div>

        <Link
          href={`/booking/${bookingId}`}
          className="mt-6 block text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition"
        >
          View Booking Status
        </Link>
      </div>
    </main>
  );
}
