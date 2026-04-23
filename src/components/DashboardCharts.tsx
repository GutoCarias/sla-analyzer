import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps
} from 'recharts';
import { TicketRow, SLA_BREACH_MINUTES, SLA_WARN_MINUTES } from '../types';

interface Props {
  rows: TicketRow[];
  onFilterTechnician: (tech: string) => void;
  onFilterStatus: (status: string) => void;
}

const COLORS = {
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  slate: '#64748b',
};

export default function DashboardCharts({ rows, onFilterTechnician, onFilterStatus }: Props) {
  const slaData = useMemo(() => {
    const valid = rows.filter(r => r.durationMinutes !== null);
    const within = valid.filter(r => (r.durationMinutes as number) < SLA_BREACH_MINUTES).length;
    const outside = valid.filter(r => (r.durationMinutes as number) >= SLA_BREACH_MINUTES).length;
    
    return [
      { name: 'Dentro do SLA', value: within, color: COLORS.emerald },
      { name: 'Fora do SLA', value: outside, color: COLORS.red },
    ];
  }, [rows]);

  const productivityData = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      if (r.responsible) {
        counts[r.responsible] = (counts[r.responsible] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Show top 10
  }, [rows]);

  const statusData = useMemo(() => {
    const normal = rows.filter(r => r.durationMinutes !== null && r.durationMinutes < SLA_WARN_MINUTES).length;
    const warning = rows.filter(r => r.durationMinutes !== null && r.durationMinutes >= SLA_WARN_MINUTES && r.durationMinutes < SLA_BREACH_MINUTES).length;
    const breached = rows.filter(r => r.durationMinutes !== null && r.durationMinutes >= SLA_BREACH_MINUTES).length;
    
    return [
      { name: 'Normal', value: normal, color: COLORS.emerald },
      { name: 'Atenção', value: warning, color: COLORS.amber },
      { name: 'Crítico', value: breached, color: COLORS.red },
    ];
  }, [rows]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* SLA Distribution */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Distribuição de SLA</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slaData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onClick={(data) => onFilterStatus(data.name)}
                className="cursor-pointer"
              >
                {slaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productivity by Tech */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 h-[300px] flex flex-col">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Top 10 Produtividade</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                width={80}
              />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill={COLORS.blue} 
                radius={[0, 4, 4, 0]} 
                onClick={(data) => onFilterTechnician(data.name)}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[300px] flex flex-col">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Gargalos por Status</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
