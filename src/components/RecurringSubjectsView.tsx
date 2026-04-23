import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, BarChart3, TrendingUp, Users, Calendar, Search, 
  ChevronRight, ExternalLink, Info, Filter, X, ChevronDown, ChevronUp,
  FileText, ArrowUpRight, MousePointer2
} from 'lucide-react';
import { TicketRow, FilterState } from '../types';
import { normalizeText } from '../utils/textNormalization';
import { toInputDate } from '../utils/dateUtils';
import { GROUPS } from './RecurringSubjects';
import Filters from './Filters';
import DataTable from './DataTable';

interface Props {
  rows: TicketRow[];
  initialFilters: FilterState;
  onBack: () => void;
}

export default function RecurringSubjectsView({ rows, initialFilters, onBack }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);

  const technicians = useMemo(
    () => Array.from(new Set(rows.map(r => r.responsible).filter(Boolean))).sort(),
    [rows]
  );

  const ticketCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      if (r.responsible) {
        counts[r.responsible] = (counts[r.responsible] || 0) + 1;
      }
    });
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (filters.responsible.length > 0) {
      result = result.filter(r => filters.responsible.includes(r.responsible));
    }

    if (filters.subjectSearch) {
      const search = normalizeText(filters.subjectSearch);
      result = result.filter(r => normalizeText(r.subject).includes(search));
    }

    if (filters.customerNameSearch) {
      const search = filters.customerNameSearch.toLowerCase();
      result = result.filter(r => r.customerName.toLowerCase().includes(search));
    }

    if (filters.dateFrom) {
      result = result.filter(r => toInputDate(r.openedAt) >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter(r => toInputDate(r.openedAt) <= filters.dateTo);
    }

    return result;
  }, [rows, filters]);

  const analysis = useMemo(() => {
    const counts: Record<string, number> = {};
    const otherSubjects: Record<string, number> = {};
    const groupTickets: Record<string, TicketRow[]> = {};
    const total = filteredRows.length;

    GROUPS.forEach(g => { 
      counts[g.name] = 0; 
      groupTickets[g.name] = [];
    });
    counts['Outros'] = 0;
    groupTickets['Outros'] = [];

    filteredRows.forEach(row => {
      const normalizedSubject = normalizeText(row.subject);
      let found = false;

      for (const group of GROUPS) {
        if (group.keywords.some(keyword => normalizedSubject.includes(normalizeText(keyword)))) {
          counts[group.name]++;
          groupTickets[group.name].push(row);
          found = true;
          break;
        }
      }

      if (!found) {
        counts['Outros']++;
        groupTickets['Outros'].push(row);
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
        isGroup: true,
        tickets: groupTickets[name]
      }));

    const topOthers = Object.entries(otherSubjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        isGroup: false,
        tickets: groupTickets['Outros'].filter(t => normalizeText(t.subject) === name)
      }));

    let results = [...groupResults, ...topOthers].sort((a, b) => b.count - a.count).slice(0, 10);

    const topSubject = results[0];
    const totalGroups = results.length;

    return { results, total, topSubject, totalGroups };
  }, [filteredRows]);

  const selectedGroupData = useMemo(() => {
    if (!showModal) return null;
    return analysis.results.find(r => r.name === showModal);
  }, [showModal, analysis]);

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tickets Analisados', value: analysis.total, icon: BarChart3, color: 'blue' },
          { label: 'Grupos Identificados', value: analysis.totalGroups, icon: Filter, color: 'indigo' },
          { label: 'Assunto Principal', value: analysis.topSubject?.name || '-', icon: TrendingUp, color: 'emerald' },
          { label: 'Representatividade Top 1', value: `${analysis.topSubject?.percentage || 0}%`, icon: Info, color: 'amber' },
        ].map((kpi, i) => (
          <div key={i} className="card-premium p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-${kpi.color}-50 flex items-center justify-center shadow-sm border border-${kpi.color}-100`}>
              <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{kpi.label}</p>
              <p className="text-xl font-black text-slate-800 leading-tight">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters and Chart */}
        <div className="lg:col-span-8 space-y-6">
          <Filters 
            filters={filters} 
            onChange={setFilters} 
            technicians={technicians} 
            ticketCounts={ticketCounts} 
            onReset={() => setFilters(initialFilters)} 
          />

          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Ranking de Recorrência</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Distribuição de Volume por Categoria</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <MousePointer2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase">Clique para ver tickets</span>
              </div>
            </div>

            <div className="space-y-8">
              {analysis.results.map((item) => (
                <div key={item.name} className="group relative">
                  <button 
                    onClick={() => setShowModal(item.name)}
                    className="w-full text-left transition-all"
                  >
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-black text-slate-700 group-hover:text-brand-blue transition-colors">{item.name}</span>
                        {!item.isGroup && <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md font-black uppercase tracking-tighter">Automático</span>}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-800 leading-none">{item.count}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">tickets</p>
                        </div>
                        <div className="w-12 text-right">
                          <p className="text-xs font-black text-brand-blue leading-none">{item.percentage}%</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden border border-slate-100 relative shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-blue to-blue-400 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </button>
                  
                  {/* Hover Preview - Professional Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -left-2 -top-24 z-40 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl w-72 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Exemplos reais</p>
                    </div>
                    <div className="space-y-2.5">
                      {item.tickets.slice(0, 3).map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <p className="text-[11px] leading-tight font-medium text-slate-200 line-clamp-2">"{t.subject}"</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[8px] font-black text-slate-500 uppercase">
                      <span>Total: {item.count}</span>
                      <span className="text-blue-400">Clique para expandir</span>
                    </div>
                    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-slate-700/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Card / Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-premium p-6 bg-gradient-to-br from-indigo-600 to-brand-blue text-white shadow-xl shadow-indigo-600/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight">Insights de Operação</h3>
            </div>
            
            <p className="text-xs text-indigo-50 leading-relaxed font-medium mb-6">
              O sistema identificou que <span className="font-bold text-white underline decoration-white/30 underline-offset-4">"{analysis.topSubject?.name}"</span> é o maior gargalo atual, representando quase <span className="text-lg font-black">{analysis.topSubject?.percentage}%</span> de toda a demanda filtrada.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Ação Sugerida</p>
                <p className="text-[11px] font-bold leading-normal">Revise os processos de "{analysis.topSubject?.name}" para reduzir o volume de chamados.</p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Informações</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <MousePointer2 className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Utilize o <span className="font-bold text-slate-700">drill-down</span> clicando em qualquer linha do ranking para visualizar todos os tickets daquela categoria.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Os filtros aplicados no topo impactam diretamente o volume e as proporções identificadas na análise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Listing Modal (Drill-down) */}
      {showModal && selectedGroupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">{selectedGroupData.name}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Listagem de {selectedGroupData.count} tickets identificados
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(null)}
                className="p-2.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <DataTable 
                rows={selectedGroupData.tickets} 
                page={1} 
                pageSize={50} 
                onPageChange={() => {}} 
                isCompact={true}
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Filtros ativos aplicados na listagem
              </p>
              <button 
                onClick={() => setShowModal(null)}
                className="px-6 py-2 bg-slate-800 text-white text-xs font-black rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-800/20 uppercase tracking-widest"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
