import React from 'react';
import { DRONES } from '../constants';

export const DroneLegend: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {DRONES.map((drone) => (
        <div 
          key={drone.id} 
          className={`flex flex-col p-3 rounded-xl border ${drone.colorClass} ${drone.borderClass} bg-opacity-40 transition-transform hover:scale-105 cursor-default`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full shadow-sm`} style={{ backgroundColor: drone.dotColor }}></div>
            <span className={`font-bold text-sm ${drone.textClass}`}>{drone.name}</span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-1">{drone.description}</p>
        </div>
      ))}
    </div>
  );
};
