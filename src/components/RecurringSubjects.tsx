import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import { TicketRow } from '../types';
import { normalizeText } from '../utils/textNormalization';

interface GroupDefinition {
  name: string;
  keywords: string[];
}

const GROUPS: GroupDefinition[] = [
  { name: 'Cancelamento', keywords: ['cancelamento', 'cancelar', 'cancelado'] },
  { name: 'Emissão', keywords: ['emissao', 'emitir', 'emitindo'] },
  { name: 'Nota Fiscal', keywords: ['nfe', 'nf-e', 'nfce', 'nfc-e'] },
  { name: 'Relatórios', keywords: ['relatorio', 'relatorios'] },
  { name: 'LBCPOS', keywords: ['lbcpos', 'lbc pos', 'pos lbc'] },
];

interface RecurringSubjectsProps {
  rows: TicketRow[];
  onSelectGroup: (groupName: string) => void;
  selectedGroup: string;
}

const RecurringSubjects: React.FC<RecurringSubjectsProps> = ({ rows, onSelectGroup, selectedGroup }) => {
  const analysis = useMemo(() => {
    const counts: Record<string, number> = {};
    const otherSubjects: Record<string, number> = {};
    const total = rows.length;

    // Initialize counts
    GROUPS.forEach(g => { counts[g.name] = 0; });
    counts['Outros'] = 0;

    rows.forEach(row => {
      const normalizedSubject = normalizeText(row.subject);
      let found = false;

      for (const group of GROUPS) {
        if (group.keywords.some(keyword => normalizedSubject.includes(normalizeText(keyword)))) {
          counts[group.name]++;
          found = true;
          break;
        }
      }

      if (!found) {
        counts['Outros']++;
        const subject = normalizedSubject || 'sem assunto';
        otherSubjects[subject] = (otherSubjects[subject] || 0) + 1;
      }
    });

    const groupResults = Object.entries(counts)
      .filter(([name, count]) => count > 0 && name !== 'Outros')
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        isGroup: true
      }));

    // Top subjects from the "Outros" category
    const topOthers = Object.entries(otherSubjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        isGroup: false
      }));

    let finalResults = [...groupResults, ...topOthers];
    
    // If we still have space, add "Outros" summary if not empty
    if (counts['Outros'] > 0 && finalResults.length < 10) {
      const alreadyInTop = topOthers.some(o => o.name === 'Outros');
      if (!alreadyInTop) {
        finalResults.push({
          name: 'Outros (Geral)',
          count: counts['Outros'],
          percentage: total > 0 ? Math.round((counts['Outros'] / total) * 100) : 0,
          isGroup: true
        });
      }
    }

    finalResults.sort((a, b) => b.count - a.count);
    const results = finalResults.slice(0, 10);

    const topSubject = results[0];

    return {
      results,
      total,
      topSubject,
    };
  }, [rows]);

  if (analysis.total === 0) return null;

  return (
    <div className="card-premium p-6 bg-white shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Assuntos Recorrentes</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Top 10 Temas Identificados</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase">Análise Automática</span>
        </div>
      </div>

      {analysis.topSubject && analysis.topSubject.count > 0 && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-700">Destaque do Momento</p>
            <p className="text-[11px] text-slate-500 mt-1">
              O tema <span className="font-bold text-indigo-600">"{analysis.topSubject.name}"</span> representa 
              <span className="font-bold text-slate-700"> {analysis.topSubject.percentage}%</span> dos chamados filtrados.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {analysis.results.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectGroup(item.name === selectedGroup ? '' : item.name)}
            className={`w-full text-left group transition-all ${
              selectedGroup === item.name ? 'opacity-100 scale-[1.02]' : selectedGroup ? 'opacity-40 hover:opacity-60' : 'hover:scale-[1.01]'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className={`text-xs font-bold ${selectedGroup === item.name ? 'text-indigo-600' : 'text-slate-600'}`}>
                {item.name}
                {!item.isGroup && <span className="ml-2 text-[8px] text-slate-400 font-normal uppercase tracking-tighter">(individual)</span>}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {item.count} tickets
                </span>
                <span className="text-[10px] font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  selectedGroup === item.name ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'bg-slate-300 group-hover:bg-indigo-400'
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
          Clique em um grupo para filtrar a base de dados
        </p>
      </div>
    </div>
  );
};

export default RecurringSubjects;
export { GROUPS };
