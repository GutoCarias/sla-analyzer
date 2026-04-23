import { Trophy, Clock, Info, Hash, Zap } from 'lucide-react';
import { TechnicianScore } from '../types';
import { formatDuration } from '../utils/dateUtils';

interface Props {
  ranking: TechnicianScore[];
  onSelect: (name: string) => void;
  sortMode: 'tickets' | 'score';
  onSortModeChange: (mode: 'tickets' | 'score') => void;
}

export default function TechnicianRanking({ ranking, onSelect, sortMode, onSortModeChange }: Props) {
  if (ranking.length === 0) return null;

  return (
    <div className="card-premium h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-amber" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Ranking de Performance</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
            TOP {ranking.length}
          </span>
        </div>

        {/* Sort Toggle */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl">
          <button
            onClick={() => onSortModeChange('score')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              sortMode === 'score' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Zap className="w-3 h-3" />
            Por Score
          </button>
          <button
            onClick={() => onSortModeChange('tickets')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              sortMode === 'tickets' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Hash className="w-3 h-3" />
            Por Tickets
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="border-b border-slate-100">
              <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Técnico</th>
              <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase text-center">Tickets</th>
              <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase text-center">Média</th>
              <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase text-right relative group/header">
                <div className="flex items-center justify-end gap-1">
                  Score
                  <Info className="w-2.5 h-2.5 text-slate-300 cursor-help" />
                </div>
                
                {/* Score Tooltip */}
                <div className="absolute right-4 top-full mt-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 invisible group-hover/header:opacity-100 group-hover/header:visible transition-all z-[110] shadow-xl normal-case font-medium text-left">
                  <p className="font-bold border-b border-slate-700 pb-1 mb-2">Cálculo do Score</p>
                  <p className="mb-2">Relação entre volume e velocidade:</p>
                  <div className="bg-slate-700/50 p-2 rounded-lg font-mono mb-2">
                    Score = Tickets ÷ Tempo (horas)
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li className="flex items-center gap-1.5">• Maior volume de atendimentos</li>
                    <li className="flex items-center gap-1.5">• Menor tempo médio de SLA</li>
                  </ul>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ranking.map((tech, idx) => (
              <tr 
                key={tech.name} 
                onClick={() => onSelect(tech.name)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black
                      ${idx === 0 ? 'bg-brand-amber/20 text-brand-amber' : 
                        idx === 1 ? 'bg-slate-200 text-slate-600' : 
                        idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-brand-blue transition-colors">
                        {tech.name}
                      </p>

                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-center">
                  <span className={`text-xs font-bold transition-colors ${sortMode === 'tickets' ? 'text-brand-blue' : 'text-slate-600'}`}>
                    {tech.ticketCount}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500">{formatDuration(tech.avgDurationMinutes)}</span>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full ${tech.classification === 'Excellent' ? 'bg-brand-green' : tech.classification === 'Medium' ? 'bg-brand-amber' : 'bg-brand-red'}`} 
                        style={{ width: `${Math.min(100, (tech.avgDurationMinutes / 240) * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-black transition-colors ${sortMode === 'score' ? 'text-brand-blue' : 'text-slate-500'}`}>
                      {tech.score}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">pts/hr</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-slate-50 border-t border-slate-100 mt-auto">
        <p className="text-[9px] text-slate-400 text-center leading-tight italic">
          Clique no técnico para detalhar atendimentos individuais.
        </p>
      </div>
    </div>
  );
}
