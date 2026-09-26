'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, PhoneCall, CheckCircle } from 'lucide-react';

export default function MyBookings() {
  const bookings = [
    {
      id: 'b1',
      title: 'John Deere 5050D Tractor (50 HP)',
      category: 'Equipment',
      rate: '₹850 / hour',
      status: 'Confirmed',
      date: 'Today',
      contact: '+91 98765 43210'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-emerald-800 text-white px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 hover:bg-emerald-700 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <span className="font-bold text-lg">My Bookings</span>
      </header>

      <main className="max-w-3xl mx-auto w-full p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Active Bookings</h1>
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {b.status}
              </span>
              <h2 className="font-bold text-slate-900 mt-1">{b.title}</h2>
              <p className="text-xs text-slate-500">{b.rate}</p>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> {b.contact}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}