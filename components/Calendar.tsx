import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Battery } from 'lucide-react';
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
  
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    const days: CalendarDay[] = [];
    
    // Previous month padding
    const firstDayIndex = firstDay.getDay(); // 0-6
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    // Current month days
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
    
    // Next month padding (to fill grid to 35 or 42 cells)
    const remainingCells = 42 - days.length; // Ensure 6 rows
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

  return (
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
              className={`min-h-[140px] bg-white p-2 transition-colors relative group
                ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'text-slate-800'}
                ${day.isToday ? 'bg-blue-50/30' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span 
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
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

              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] pr-1 custom-scrollbar">
                {dayBookings.map(booking => {
                  const drone = getDroneDetails(booking.droneId);
                  if (!drone) return null;
                  
                  return (
                    <div 
                      key={booking.id}
                      className={`
                        text-[11px] p-1.5 rounded-lg border shadow-sm
                        ${drone.colorClass} ${drone.textClass} ${drone.borderClass}
                        hover:brightness-95 transition-all
                      `}
                    >
                      <div className="font-bold flex items-center justify-between gap-1 mb-0.5">
                         <div className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></div>
                           {drone.name}
                         </div>
                      </div>
                      <div className="opacity-90 flex items-center gap-1 leading-tight mb-0.5">
                        <Clock size={10} />
                        {booking.timeSlot.split(' ')[0]}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="opacity-90 flex items-center gap-1 leading-tight truncate max-w-[60%]">
                          <User size={10} />
                          {booking.applicant}
                        </div>
                        {booking.batteryCount && booking.batteryCount > 0 && (
                          <div className="flex items-center gap-0.5 opacity-80" title={`${booking.batteryCount} 顆電池`}>
                            <Battery size={10} />
                            <span className="font-mono">{booking.batteryCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
