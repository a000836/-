import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { BookingForm } from './components/BookingForm';
import { DroneLegend } from './components/DroneLegend';
import { Booking } from './types';

// Dummy initial data to make the calendar look alive
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: '1',
    unit: '資工系',
    applicant: '張大明',
    phone: '0912-345-678',
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: '上午 (08:00 - 12:00)',
    droneId: 'm490',
    batteryCount: 4,
    createdAt: Date.now()
  },
  {
    id: '2',
    unit: '電機系',
    applicant: '李小華',
    phone: '0922-333-444',
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: '下午 (13:00 - 17:00)',
    droneId: 'm210',
    createdAt: Date.now()
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'form'>('calendar');
  const [bookings, setBookings] = useState<Booking[]>(() => {
    // Try to load from local storage
    const saved = localStorage.getItem('drone_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  // Save to local storage whenever bookings change
  useEffect(() => {
    localStorage.setItem('drone_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleBookingSubmit = (newBookingsData: Omit<Booking, 'id' | 'createdAt'>[]) => {
    const newBookings: Booking[] = newBookingsData.map(data => ({
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    }));
    
    setBookings(prev => [...prev, ...newBookings]);
    setView('calendar'); // Switch back to calendar to see result
    
    // Optional: Update current date to the first booked date
    if (newBookings.length > 0) {
      const bookedDate = new Date(newBookings[0].date);
      if (bookedDate.getMonth() !== currentDate.getMonth() || bookedDate.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(new Date(bookedDate.getFullYear(), bookedDate.getMonth(), 1));
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen pb-20">
      <Header currentView={view} onNavigate={setView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'calendar' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">儀表板</h2>
                  <p className="text-slate-500">查看所有設備的預約狀態</p>
               </div>
               <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                 目前共有 <span className="font-bold text-slate-900">{bookings.length}</span> 筆預約
               </div>
            </div>
            
            <DroneLegend />
            
            <Calendar 
              bookings={bookings} 
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <BookingForm 
              existingBookings={bookings}
              onSubmit={handleBookingSubmit}
              onCancel={() => setView('calendar')}
            />
          </div>
        )}
      </main>

      {/* Global CSS for animations that Tailwind doesn't have out of the box */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;
