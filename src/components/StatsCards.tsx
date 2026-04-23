import { Users, Clock, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';
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
      label: 'Técnicos',
      value: stats.technicians.toString(),
      sub: 'responsáveis únicos',
      icon: Users,
      color: 'teal',
    },
    {
      label: 'Tempo Médio',
      value: formatDuration(stats.avgDurationMinutes),
      sub: 'por atendimento',
      icon: Clock,
      color: 'sky',
    },
    {
      label: 'Maior Atendimento',
      value: formatDuration(stats.maxDurationMinutes),
      sub: 'tempo máximo',
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      label: 'Com Erros',
      value: stats.errors.toString(),
      sub: 'registros com problema',
      icon: AlertTriangle,
      color: 'amber',
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600', badge: 'bg-sky-100 text-sky-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(card => {
        const c = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${c.icon}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
