import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Saad El Mahdy — Online Therapy',
  description: 'Book an online therapy session with Dr. Saad El Mahdy. Secure, private, and convenient.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-slate-50 font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-brand-600">Dr. Saad El Mahdy</h1>
              <p className="text-xs text-slate-500">MD · Online Therapy</p>
            </div>
            <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-3 py-1 font-medium">Book a Session</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        <footer className="max-w-3xl mx-auto px-4 pb-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Dr. Saad El Mahdy · All sessions via Google Meet
        </footer>
      </body>
    </html>
  );
}
