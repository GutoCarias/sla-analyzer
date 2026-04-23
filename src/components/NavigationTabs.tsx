import React from 'react';
import { LayoutDashboard, BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

export type TabId = 'dashboard' | 'recurring_subjects' | 'technicians' | 'sla' | 'reports';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recurring_subjects', label: 'Assuntos Recorrentes', icon: BarChart3 },
  { id: 'technicians', label: 'Técnicos', icon: Users, disabled: true },
  { id: 'sla', label: 'SLA', icon: TrendingUp, disabled: true },
  { id: 'reports', label: 'Relatórios', icon: FileText, disabled: true },
];

interface NavigationTabsProps {
  activeTab: TabId;
  onChange: (id: TabId) => void;
}

export default function NavigationTabs({ activeTab, onChange }: NavigationTabsProps) {
  return (
    <div className="bg-white border-b border-slate-200 z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap
                  ${tab.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  ${isActive 
                    ? 'text-brand-blue' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-blue' : 'text-slate-400'}`} />
                {tab.label}
                
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full shadow-[0_-2px_6px_rgba(37,99,235,0.3)] animate-in slide-in-from-bottom-1 duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
