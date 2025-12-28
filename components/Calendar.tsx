import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Battery, X, Phone, Briefcase, Info } from 'lucide-react';
import { Booking, CalendarDay } from '../types';
import { DRONES } from '../constants';

interface CalendarProps {
  bookings: Booking[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

export const Calendar: React.FC<CalendarProps> = ({ bookings, currentDate, onPrevMonth, onNextMonth }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: CalendarDay[] = [];
    
    const firstDayIndex = firstDay.getDay(); 
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        dateString
      });
    }
    
    const remainingCells = 42 - days.length; 
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    return days;
  }, [currentDate]);

  const getDayBookings = (dateString: string) => {
    return bookings.filter(b => b.date === dateString);
  };

  const getDroneDetails = (id: string) => DRONES.find(d => d.id === id);

  const selectedDayBookings = selectedDate ? getDayBookings(selectedDate) : [];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-bold text-slate-800">
            {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={onPrevMonth}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={onNextMonth}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b border-slate-100">
          {calendarDays.map((day, idx) => {
            const dayBookings = getDayBookings(day.dateString);
            
            return (
              <div 
                key={idx}
                onClick={() => setSelectedDate(day.dateString)}
                className={`min-h-[140px] bg-white p-2 transition-all relative group cursor-pointer hover:bg-slate-50/80
                  ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'text-slate-800'}
                  ${day.isToday ? 'bg-blue-50/30' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-transform group-hover:scale-110
                      ${day.isToday ? 'bg-blue-600 text-white shadow-md' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </span>
                  {dayBookings.length > 0 && (
                     <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded-md">
                       {dayBookings.length}
                     </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 overflow-hidden max-h-[100px] pr-1">
                  {dayBookings.slice(0, 3).map(booking => {
                    const drone = getDroneDetails(booking.droneId);
                    if (!drone) return null;
                    
                    return (
                      <div 
                        key={booking.id}
                        className={`text-[10px] p-1.5 rounded-lg border shadow-sm truncate ${drone.colorClass} ${drone.textClass} ${drone.borderClass}`}
                      >
                        <span className="font-bold">{drone.name}</span>
                        <div className="opacity-80 flex items-center gap-1">
                           <Clock size={8} /> {booking.timeSlot.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] text-slate-400 text-center font-medium">
                      + {dayBookings.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setSelectedDate(null)}
          ></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedDate} 借用明細</h3>
                  <p className="text-sm text-slate-500">當日共有 {selectedDayBookings.length} 筆借用預約</p>
               </div>
               <button 
                 onClick={() => setSelectedDate(null)}
                 className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
               >
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50">
               {selectedDayBookings.length > 0 ? (
                 <div className="space-y-4">
                   {selectedDayBookings.map((booking) => {
                     const drone = getDroneDetails(booking.droneId);
                     return (
                       <div key={booking.id} className={`bg-white rounded-xl border-l-4 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:translate-x-1 ${drone?.borderClass.replace('border-', 'border-l-')}`}>
                         <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-3">
                             <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${drone?.colorClass} ${drone?.textClass}`}>
                               {drone?.name}
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                               <Clock size={16} className="text-slate-400" />
                               {booking.timeSlot}
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Briefcase size={14} className="text-slate-400" />
                                <span className="font-medium">單位：</span>{booking.unit}
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <User size={14} className="text-slate-400" />
                                <span className="font-medium">借用人：</span>{booking.applicant}
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone size={14} className="text-slate-400" />
                                <span className="font-medium">電話：</span>{booking.phone}
                              </div>
                              {booking.batteryCount && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Battery size={14} className="text-slate-400" />
                                  <span className="font-medium">電池：</span>{booking.batteryCount} 顆
                                </div>
                              )}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="text-center py-12 space-y-3">
                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-300">
                     <Info size={32} />
                   </div>
                   <p className="text-slate-500 font-medium">當日尚無借用預約</p>
                 </div>
               )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 text-center">
               <button 
                 onClick={() => setSelectedDate(null)}
                 className="px-6 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
               >
                 關閉
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scaleUp 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};
