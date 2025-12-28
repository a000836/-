import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Phone, Briefcase, Clock, Send, CheckCircle2, Plus, Trash2, Battery, AlertCircle } from 'lucide-react';
import { Booking, DroneId } from '../types';
import { DRONES, TIME_SLOTS, BATTERY_CONFIG } from '../constants';

interface BookingFormProps {
  existingBookings: Booking[];
  onSubmit: (bookings: Omit<Booking, 'id' | 'createdAt'>[]) => void;
  onCancel: () => void;
}

interface SlotSelection {
  id: string;
  date: string;
  timeSlot: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ existingBookings, onSubmit, onCancel }) => {
  const [basicInfo, setBasicInfo] = useState({
    unit: '',
    applicant: '',
    phone: '',
  });

  const [selectedDroneId, setSelectedDroneId] = useState<DroneId>(DRONES[0].id as DroneId);
  
  // Slots state
  const [selectedSlots, setSelectedSlots] = useState<SlotSelection[]>([
    { id: '1', date: new Date().toISOString().split('T')[0], timeSlot: TIME_SLOTS[0] }
  ]);
  
  // Battery state
  const [batteryCount, setBatteryCount] = useState<number>(0);
  const [availableBatteries, setAvailableBatteries] = useState<number>(BATTERY_CONFIG.TOTAL_BATTERIES);
  
  // Error states
  const [batteryError, setBatteryError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedDrone = DRONES.find(d => d.id === selectedDroneId) || DRONES[0];
  const isBatteryDrone = BATTERY_CONFIG.SHARED_POOL_IDS.includes(selectedDroneId);

  // Overlap Helper
  const checkTimeOverlap = (slot1: string, slot2: string) => {
    const isFull1 = slot1.includes("全日");
    const isMorn1 = slot1.includes("上午");
    const isAft1 = slot1.includes("下午");
    
    const isFull2 = slot2.includes("全日");
    const isMorn2 = slot2.includes("上午");
    const isAft2 = slot2.includes("下午");

    return (isFull1 || isFull2) || (isMorn1 && isMorn2) || (isAft1 && isAft2);
  };

  // Validation Effect
  useEffect(() => {
    // 1. Check for 5-day limit (Unique dates selected in this form)
    const uniqueDates = new Set(selectedSlots.map(s => s.date));
    if (uniqueDates.size > 5) {
      setValidationError("每人單次最多借用5日");
      return;
    }

    // 2. Check for drone availability (against existing bookings)
    for (const slot of selectedSlots) {
      const conflict = existingBookings.find(b => 
        b.droneId === selectedDroneId && 
        b.date === slot.date && 
        checkTimeOverlap(b.timeSlot, slot.timeSlot)
      );
      
      if (conflict) {
        setValidationError(`該時段該機型已被預約：${slot.date} ${slot.timeSlot}`);
        return;
      }

      // Also check overlap within current selection (if user adds same time twice)
      const internalConflict = selectedSlots.find(s => 
        s.id !== slot.id && 
        s.date === slot.date && 
        checkTimeOverlap(s.timeSlot, slot.timeSlot)
      );

      if (internalConflict) {
        setValidationError(`選擇的時段中存在重複衝突：${slot.date} ${slot.timeSlot}`);
        return;
      }
    }

    setValidationError(null);

    // 3. Battery Calculation Logic
    if (isBatteryDrone) {
      let minAvailable = BATTERY_CONFIG.TOTAL_BATTERIES;
      for (const slot of selectedSlots) {
        const usedBatteries = existingBookings.reduce((total, b) => {
          if (!BATTERY_CONFIG.SHARED_POOL_IDS.includes(b.droneId)) return total;
          if (b.date !== slot.date) return total;
          if (checkTimeOverlap(b.timeSlot, slot.timeSlot)) {
            return total + (b.batteryCount || 0);
          }
          return total;
        }, 0);

        const available = Math.max(0, BATTERY_CONFIG.TOTAL_BATTERIES - usedBatteries);
        if (available < minAvailable) minAvailable = available;
      }
      setAvailableBatteries(minAvailable);
      if (batteryCount > minAvailable) {
        setBatteryError(`所選時段中，電池最大可借用數量為 ${minAvailable} 顆`);
      } else {
        setBatteryError(null);
      }
    } else {
      setBatteryError(null);
    }

  }, [selectedSlots, selectedDroneId, existingBookings, batteryCount, isBatteryDrone]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSlotChange = (id: string, field: 'date' | 'timeSlot', value: string) => {
    setSelectedSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const addSlot = () => {
    const lastSlot = selectedSlots[selectedSlots.length - 1];
    setSelectedSlots(prev => [
      ...prev, 
      { 
        id: Math.random().toString(36).substr(2, 9), 
        date: lastSlot ? lastSlot.date : new Date().toISOString().split('T')[0], 
        timeSlot: TIME_SLOTS[0] 
      }
    ]);
  };

  const removeSlot = (id: string) => {
    if (selectedSlots.length > 1) {
      setSelectedSlots(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || batteryError) return;
    if (isBatteryDrone && batteryCount <= 0) {
      setBatteryError("請輸入借用電池數量");
      return;
    }

    const newBookings = selectedSlots.map(slot => ({
      ...basicInfo,
      date: slot.date,
      timeSlot: slot.timeSlot,
      droneId: selectedDroneId,
      batteryCount: isBatteryDrone ? batteryCount : undefined
    }));

    onSubmit(newBookings);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">新增借用登記</h2>
            <p className="text-slate-400">請填寫完整的借用資訊以確保設備調度順暢。</p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-5">
            <Send size={150} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* 1. Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Briefcase size={16} />
                單位名稱
              </label>
              <input
                type="text"
                name="unit"
                required
                value={basicInfo.unit}
                onChange={handleBasicChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="例如：災害搶救科"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={16} />
                借用人姓名
              </label>
              <input
                type="text"
                name="applicant"
                required
                value={basicInfo.applicant}
                onChange={handleBasicChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="例如：王小明"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone size={16} />
                聯絡電話
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={basicInfo.phone}
                onChange={handleBasicChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="例如：0912-345-678"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 2. Drone Selection */}
          <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Send size={16} />
              選擇機型
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DRONES.map(drone => (
                <label 
                  key={drone.id}
                  className={`
                    flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedDroneId === drone.id 
                      ? `${drone.borderClass} ${drone.colorClass} bg-opacity-40` 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="droneId"
                    value={drone.id}
                    checked={selectedDroneId === drone.id}
                    onChange={(e) => setSelectedDroneId(e.target.value as DroneId)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${selectedDroneId === drone.id ? drone.textClass : 'text-slate-800'}`}>
                        {drone.name}
                      </span>
                      {selectedDroneId === drone.id && (
                        <CheckCircle2 size={18} className={drone.textClass} />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {drone.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 3. Time Slots & Battery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} />
                    借用時段
                  </label>
                  <button 
                    type="button" 
                    onClick={addSlot}
                    className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Plus size={14} /> 新增時段
                  </button>
               </div>
               
               <div className="space-y-3">
                 {selectedSlots.map((slot, index) => (
                   <div key={slot.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 items-start sm:items-center animate-fade-in">
                     <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full text-xs font-bold">
                          {index + 1}
                        </span>
                        <input
                          type="date"
                          required
                          value={slot.date}
                          onChange={(e) => handleSlotChange(slot.id, 'date', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                        />
                     </div>
                     <div className="flex-1 w-full sm:w-auto grid grid-cols-3 gap-2">
                       {TIME_SLOTS.map(time => (
                         <button
                           key={time}
                           type="button"
                           onClick={() => handleSlotChange(slot.id, 'timeSlot', time)}
                           className={`
                             text-xs py-2 px-1 rounded-lg border transition-all truncate
                             ${slot.timeSlot === time
                               ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                               : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                             }
                           `}
                         >
                           {time.split(' ')[0]}
                         </button>
                       ))}
                     </div>
                     {selectedSlots.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeSlot(slot.id)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
            </div>

            <div className="lg:col-span-1">
               <div className={`
                 p-5 rounded-2xl border h-full transition-all
                 ${isBatteryDrone ? 'bg-blue-50 border-blue-100 opacity-100' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'}
               `}>
                 <div className="flex items-start gap-3 mb-4">
                   <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                     <Battery size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800">電池狀態</h3>
                     <p className="text-xs text-slate-500">
                       {isBatteryDrone ? '此機型需登記電池數量' : '此機型無需登記電池'}
                     </p>
                   </div>
                 </div>

                 {isBatteryDrone && (
                   <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600">共用池總數</span>
                       <span className="font-bold text-slate-800">{BATTERY_CONFIG.TOTAL_BATTERIES} 顆</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">所選時段可用</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${availableBatteries === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {availableBatteries} 顆
                        </span>
                     </div>

                     <div className="pt-2 border-t border-blue-100/50">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                           借用數量
                        </label>
                        <div className="flex items-center gap-3">
                           <input 
                             type="number"
                             min="1"
                             max={availableBatteries}
                             value={batteryCount}
                             onChange={(e) => setBatteryCount(parseInt(e.target.value) || 0)}
                             className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                             placeholder="0"
                           />
                           <span className="text-sm text-slate-500 whitespace-nowrap">顆</span>
                        </div>
                        {batteryError && (
                          <div className="flex items-start gap-1.5 mt-2 text-xs text-red-500 font-medium">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            {batteryError}
                          </div>
                        )}
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-4 space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-6 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!!validationError || !!batteryError}
                className="flex-1 py-3 px-6 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認登記 ({selectedSlots.length} 筆)
              </button>
            </div>
            
            {/* Validation Error moved here */}
            {validationError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 text-red-700 animate-fade-in shadow-sm">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="font-bold text-sm leading-relaxed">{validationError}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};