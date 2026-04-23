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
      value: stats.total.toLocaleString(),
      sub: `${stats.valid} processados`,
      icon: BarChart2,
      color: 'blue',
      progress: 100,
    },
    {
      label: 'Tempo Médio',
      value: formatDuration(stats.avgDurationMinutes),
      sub: stats.avgDurationMinutes > 240 ? 'Crítico' : stats.avgDurationMinutes > 60 ? 'Alerta' : 'Excelente',
      icon: Clock,
      color: stats.avgDurationMinutes > 240 ? 'red' : stats.avgDurationMinutes > 60 ? 'amber' : 'green',
      progress: Math.max(0, 100 - (stats.avgDurationMinutes / 480) * 100),
    },
    {
      label: 'SLA OK',
      value: `${stats.slaPercent}%`,
      sub: `${stats.withinSLA} dentro do prazo`,
      icon: CheckCircle,
      color: 'green',
      progress: stats.slaPercent,
    },
    {
      label: 'SLA Estourado',
      value: `${100 - stats.slaPercent}%`,
      sub: `${stats.outsideSLA} fora do prazo`,
      icon: AlertTriangle,
      color: 'red',
      progress: 100 - stats.slaPercent,
    },
    {
      label: 'Técnicos Ativos',
      value: stats.techniciansCount.toString(),
      sub: 'na seleção atual',
      icon: Users,
      color: 'blue',
      progress: 100,
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string; border: string; bar: string }> = {
    blue: { bg: 'bg-brand-blue/10', icon: 'text-brand-blue', text: 'text-brand-blue', border: 'border-brand-blue/20', bar: 'bg-brand-blue' },
    green: { bg: 'bg-brand-green/10', icon: 'text-brand-green', text: 'text-brand-green', border: 'border-brand-green/20', bar: 'bg-brand-green' },
    red: { bg: 'bg-brand-red/10', icon: 'text-brand-red', text: 'text-brand-red', border: 'border-brand-red/20', bar: 'bg-brand-red' },
    amber: { bg: 'bg-brand-amber/10', icon: 'text-brand-amber', text: 'text-brand-amber', border: 'border-brand-amber/20', bar: 'bg-brand-amber' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(card => {
        const c = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`card-premium p-4 flex flex-col justify-between group hover:border-brand-blue/30`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="kpi-label mb-1">{card.label}</p>
                <p className={`kpi-value ${c.text}`}>{card.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${c.icon}`} />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 truncate">{card.sub}</span>
                {card.progress !== undefined && (
                  <span className="text-[9px] font-black text-slate-400">{Math.round(card.progress)}%</span>
                )}
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${c.bar} transition-all duration-1000 ease-out`} 
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
