import { Users, Clock, CheckCircle, AlertTriangle, BarChart2, Activity } from 'lucide-react';
import { Stats } from '../types';
import { formatDuration } from '../utils/dateUtils';

interface Props {
  stats: Stats;
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total de Tickets',
      value: stats.total.toString(),
      sub: `${stats.valid} processados`,
      icon: BarChart2,
      color: 'blue',
    },
    {
      label: 'Em Atendimento',
      value: stats.pending.toString(),
      sub: 'tickets abertos',
      icon: Activity,
      color: 'slate',
    },
    {
      label: 'Dentro do SLA',
      value: stats.withinSLA.toString(),
      sub: `${stats.slaPercent}% do total`,
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      label: 'Fora do SLA',
      value: stats.outsideSLA.toString(),
      sub: `${100 - stats.slaPercent}% do total`,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      label: 'Tempo Médio',
      value: formatDuration(stats.avgDurationMinutes),
      sub: 'média geral',
      icon: Clock,
      color: stats.avgDurationMinutes > 120 ? 'red' : stats.avgDurationMinutes > 60 ? 'amber' : 'emerald',
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700', border: 'border-blue-100' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', text: 'text-slate-700', border: 'border-slate-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-700', border: 'border-emerald-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-700', border: 'border-red-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700', border: 'border-amber-100' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(card => {
        const c = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-white rounded-xl border ${c.border} p-3 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xl font-black ${c.text} leading-tight`}>{card.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{card.label}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shadow-sm`}>
                <Icon className={`w-4 h-4 ${c.icon}`} />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${c.bg.replace('50', '500')} transition-all duration-500`} 
                  style={{ width: card.label.includes('SLA') ? `${card.sub.split('%')[0]}%` : '100%' }}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
