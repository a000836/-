import React from 'react';
import { Plane, CalendarCheck, PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentView: 'calendar' | 'form';
  onNavigate: (view: 'calendar' | 'form') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white">
              <Plane size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">SkyGuard</h1>
              <p className="text-xs text-slate-500 font-medium">無人機資源管理中心</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentView === 'calendar'
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck size={18} />
              <span>借用月曆</span>
            </button>
            <button
              onClick={() => onNavigate('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentView === 'form'
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PlusCircle size={18} />
              <span>新增登記</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
