import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TicketRow, TechnicianScore, SLA_BREACH_MINUTES, SLA_WARN_MINUTES } from '../types';

interface Props {
  rows: TicketRow[];
  onFilterTechnician: (tech: string) => void;
  onFilterStatus: (status: string) => void;
  ranking: TechnicianScore[];
  sortMode: 'tickets' | 'score';
}

const COLORS = {
  green: '#16A34A',
  amber: '#F59E0B',
  red: '#DC2626',
  blue: '#2563EB',
  slate: '#64748B',
};

export default function DashboardCharts({ rows, onFilterTechnician, onFilterStatus, ranking, sortMode }: Props) {
  const slaData = useMemo(() => {
    const valid = rows.filter(r => r.durationMinutes !== null);
    const within = valid.filter(r => (r.durationMinutes as number) < SLA_BREACH_MINUTES).length;
    const outside = valid.filter(r => (r.durationMinutes as number) >= SLA_BREACH_MINUTES).length;
    
    return [
      { name: 'Dentro do SLA', value: within, color: COLORS.green },
      { name: 'Fora do SLA', value: outside, color: COLORS.red },
    ];
  }, [rows]);

  const techPerformanceData = useMemo(() => {
    return ranking.slice(0, 10).map(t => ({
      name: t.name,
      value: sortMode === 'score' ? t.score : t.ticketCount,
      avg: t.avgDurationMinutes,
      tickets: t.ticketCount,
      score: t.score
    }));
  }, [ranking, sortMode]);

  const statusData = useMemo(() => {
    const normal = rows.filter(r => r.durationMinutes !== null && r.durationMinutes < SLA_WARN_MINUTES).length;
    const warning = rows.filter(r => r.durationMinutes !== null && r.durationMinutes >= SLA_WARN_MINUTES && r.durationMinutes < SLA_BREACH_MINUTES).length;
    const breached = rows.filter(r => r.durationMinutes !== null && r.durationMinutes >= SLA_BREACH_MINUTES).length;
    
    return [
      { name: 'Normal', value: normal, color: COLORS.green },
      { name: 'Atenção', value: warning, color: COLORS.amber },
      { name: 'Crítico', value: breached, color: COLORS.red },
    ];
  }, [rows]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-black text-brand-blue">
              {sortMode === 'score' ? `Score: ${data.score}` : `Tickets: ${data.tickets}`}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">
              Tickets: {data.tickets}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">
              Média: {data.avg} min
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* SLA Distribution */}
      <div className="card-premium p-4 flex flex-col h-[320px]">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Distribuição de SLA</h3>
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
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tech Performance */}
      <div className="card-premium p-4 h-[320px] flex flex-col">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Performance por {sortMode === 'score' ? 'Score' : 'Tickets'}
        </h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={techPerformanceData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                width={80}
              />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
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
      <div className="card-premium p-4 h-[320px] flex flex-col">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Gargalos por Status</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
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
