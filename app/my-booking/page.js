'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Clock, Calendar, CheckCircle2, PhoneCall } from 'lucide-react';

const SAMPLE_BOOKINGS = [
  {
    id: 'b1',
    created_at: new Date().toLocaleDateString(),
    status: 'Confirmed',
    farmer_name: 'Alex Farmer',
    farmer_phone: '+91 98765 43210',
    resource: {
      title: 'John Deere 5050D Tractor (50 HP)',
      category: 'Equipment',
      price: '850',
      price_unit: 'hour',
    }
  },
  {
    id: 'b2',
    created_at: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
    status: 'Pending',
    farmer_name: 'Alex Farmer',
    farmer_phone: '+91 98765 43210',
    resource: {
      title: 'Skilled Paddy Harvester Labor (Team of 4)',
      category: 'Workers',
      price: '2400',
      price_unit: 'day',
    }
  }
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);

  useEffect(() => {
    async function loadBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, resources(*)');
        if (!error && data && data.length > 0) {
          setBookings(data);
        }
      } catch {
        // Fallback to sample data
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-emerald-800 text-white border-b border-emerald-700 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1 rounded-lg hover:bg-emerald-700 transition">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <span className="font-bold text-lg tracking-tight">My Bookings</span>
          </div>

          <Link href="/" className="text-xs bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition">
            Browse More
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your Requested Resources</h1>
          <p className="text-xs text-slate-500">Track equipment, seeds, and worker requests.</p>
        </div>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {b.created_at}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{b.resource?.title || 'Resource Booking'}</h3>
                <p className="text-xs text-slate-500">
                  ₹{b.resource?.price} / {b.resource?.price_unit}
                </p>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2 sm:self-center">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contact: {b.farmer_phone}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}