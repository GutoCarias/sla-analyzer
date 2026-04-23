import { useState, useMemo } from 'react';
import { FileSpreadsheet, Download, Upload, RefreshCw, Layout, List } from 'lucide-react';
import FileUpload from './components/FileUpload';
import StatsCards from './components/StatsCards';
import DashboardCharts from './components/DashboardCharts';
import Filters from './components/Filters';
import DataTable from './components/DataTable';
import InsightsBlock from './components/InsightsBlock';
import TechnicianRanking from './components/TechnicianRanking';
import { parseCSV, exportToCSV } from './utils/csvParser';
import { toInputDate } from './utils/dateUtils';
import { normalizeText } from './utils/textNormalization';
import RecurringSubjects, { GROUPS } from './components/RecurringSubjects';
import RecurringSubjectsView from './components/RecurringSubjectsView';
import NavigationTabs, { TabId } from './components/NavigationTabs';
import { FilterState, Stats, TicketRow, SLA_BREACH_MINUTES, SLA_WARN_MINUTES, Insight, TechnicianScore } from './types';
import { BarChart3, LayoutDashboard } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  responsible: [],
  subjectSearch: '',
  subjectGroupFilter: '',
  customerNameSearch: '',
  statusFilter: '',
  dateFrom: '',
  dateTo: '',
  sortField: 'openedAt',
  sortDirection: 'asc',
};

const PAGE_SIZE = 25;

export default function App() {
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [rankingSortMode, setRankingSortMode] = useState<'tickets' | 'score'>('score');


  function handleFile(content: string, name: string) {
    const parsed = parseCSV(content);
    setRows(parsed);
    setFileName(name);
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setLoaded(true);
  }

  function handleReset() {
    setRows([]);
    setFileName('');
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setLoaded(false);
  }

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

    if (filters.subjectGroupFilter) {
      const group = GROUPS.find(g => g.name === filters.subjectGroupFilter);
      if (group) {
        result = result.filter(r => {
          const norm = normalizeText(r.subject);
          return group.keywords.some(k => norm.includes(normalizeText(k)));
        });
      } else if (filters.subjectGroupFilter === 'Outros' || filters.subjectGroupFilter === 'Outros (Geral)') {
        result = result.filter(r => {
          const norm = normalizeText(r.subject);
          return !GROUPS.some(g => g.keywords.some(k => norm.includes(normalizeText(k))));
        });
      } else {
        // Individual subject discovered by analysis
        const target = normalizeText(filters.subjectGroupFilter);
        result = result.filter(r => normalizeText(r.subject) === target);
      }
    }

    if (filters.customerNameSearch) {
      const search = filters.customerNameSearch.toLowerCase();
      result = result.filter(r => r.customerName.toLowerCase().includes(search));
    }

    if (filters.statusFilter) {
      result = result.filter(r => {
        if (r.durationMinutes === null) return false;
        if (filters.statusFilter === 'Normal') return r.durationMinutes < SLA_WARN_MINUTES;
        if (filters.statusFilter === 'Atenção') return r.durationMinutes >= SLA_WARN_MINUTES && r.durationMinutes < SLA_BREACH_MINUTES;
        if (filters.statusFilter === 'SLA Estourado') return r.durationMinutes >= SLA_BREACH_MINUTES;
        return true;
      });
    }

    if (filters.dateFrom) {
      result = result.filter(r => {
        const d = toInputDate(r.openedAt);
        return d >= filters.dateFrom;
      });
    }

    if (filters.dateTo) {
      result = result.filter(r => {
        const d = toInputDate(r.openedAt);
        return d <= filters.dateTo;
      });
    }

    result.sort((a, b) => {
      const field = filters.sortField;
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';

      let cmp = 0;
      if (field === 'durationMinutes') {
        const aNum = typeof aVal === 'number' ? aVal : -1;
        const bNum = typeof bVal === 'number' ? bVal : -1;
        cmp = aNum - bNum;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'pt-BR');
      }

      return filters.sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [rows, filters]);

  const stats = useMemo((): Stats => {
    const data = filteredRows;
    const total = data.length;
    const errors = data.filter(r => r.hasError).length;
    const valid = data.filter(r => r.durationMinutes !== null);
    const pending = data.filter(r => r.durationMinutes === null && !r.hasError).length;
    
    const durations = valid.map(r => r.durationMinutes as number);
    const withinSLA = valid.filter(r => (r.durationMinutes as number) < SLA_BREACH_MINUTES).length;
    const outsideSLA = valid.filter(r => (r.durationMinutes as number) >= SLA_BREACH_MINUTES).length;
    
    const avg = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const max = durations.length ? Math.max(...durations) : 0;

    const filteredTechnicians = Array.from(new Set(data.map(r => r.responsible).filter(Boolean))).length;
    const slaPercent = valid.length ? Math.round((withinSLA / valid.length) * 100) : 0;

    // Ranking de Técnicos
    const techGroups: Record<string, number[]> = {};
    valid.forEach(r => {
      if (r.responsible) {
        if (!techGroups[r.responsible]) techGroups[r.responsible] = [];
        techGroups[r.responsible].push(r.durationMinutes as number);
      }
    });

    const ranking: TechnicianScore[] = Object.entries(techGroups).map(([name, durs]) => {
      const count = durs.length;
      const tAvg = Math.round(durs.reduce((a, b) => a + b, 0) / count);
      // Score = tickets / (tempo médio em horas)
      const score = tAvg > 0 ? Number((count / (tAvg / 60)).toFixed(2)) : count;
      
      let classification: 'Excellent' | 'Medium' | 'Critical' = 'Medium';
      if (tAvg < SLA_WARN_MINUTES && count > 5) classification = 'Excellent';
      else if (tAvg >= SLA_BREACH_MINUTES) classification = 'Critical';

      return { name, ticketCount: count, avgDurationMinutes: tAvg, score, classification };
    }).sort((a, b) => {
      if (rankingSortMode === 'score') return b.score - a.score;
      return b.ticketCount - a.ticketCount;
    });

    // Insights Automáticos
    const insights: Insight[] = [];
    if (slaPercent < 70 && valid.length > 0) {
      insights.push({ 
        type: 'error', 
        message: 'Alto volume de tickets fora do SLA', 
        description: `${100 - slaPercent}% dos tickets estão estourados. Risco crítico de operação.` 
      });
    }

    if (ranking.length > 0) {
      const top = ranking[0];
      const avgScore = ranking.reduce((acc, r) => acc + r.score, 0) / ranking.length;
      const diff = Math.round(((top.score - avgScore) / avgScore) * 100);
      
      if (diff > 15) {
        insights.push({
          type: 'success',
          message: `${top.name.split(' ')[0]} entrega performance acima da média`,
          description: `Resolve tickets ${diff}% mais rápido que o padrão da equipe.`
        });
      }
    }

    const highVolumeSLA = ranking.find(r => r.classification === 'Critical');
    if (highVolumeSLA) {
      insights.push({
        type: 'warning',
        message: `Gargalo identificado: ${highVolumeSLA.name.split(' ')[0]}`,
        description: 'Volume de tickets atrasados acima do limite de segurança.'
      });
    }

    return {
      total,
      valid: valid.length,
      errors,
      pending,
      withinSLA,
      outsideSLA,
      avgDurationMinutes: avg,
      maxDurationMinutes: max,
      techniciansCount: filteredTechnicians,
      slaPercent,
      ranking,
      insights
    };
  }, [filteredRows, rankingSortMode]);

  function handleExport() {
    const csv = exportToCSV(filteredRows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atendimentos_processados_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFiltersChange(f: FilterState) {
    setFilters(f);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30">
      {/* Unified Header & Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <header className="h-11">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-blue rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-xs">SLA Analyzer Pro</span>
              </div>
            </div>

            {loaded && (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-[10px] text-slate-400 truncate max-w-[150px] mr-2">{fileName}</span>
                
                <button
                  onClick={() => setIsCompact(!isCompact)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                    isCompact ? 'bg-brand-blue text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={isCompact ? 'Modo Normal' : 'Modo Compacto'}
                >
                  {isCompact ? <Layout className="w-3 h-3" /> : <List className="w-3 h-3" />}
                  <span className="hidden sm:inline uppercase">{isCompact ? 'NORMAL' : 'COMPACTO'}</span>
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-green hover:bg-green-700 text-white text-[10px] font-bold rounded-md transition-colors shadow-sm"
                  title="Exportar"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline uppercase">EXPORTAR</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md transition-colors"
                  title="Novo Relatório"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline uppercase">NOVO</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {loaded && (
          <NavigationTabs activeTab={activeTab} onChange={setActiveTab} />
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {!loaded ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-8">
            <div className="text-center space-y-4 max-w-xl">
              <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-brand-blue/20 mb-6">
                <FileSpreadsheet className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">SLA Analyzer Pro</h1>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                Sua central de inteligência para gestão de suporte. 
                Analise performance, identifique gargalos e otimize seu SLA.
              </p>
            </div>

            <div className="w-full max-w-md">
              <FileUpload onFileParsed={handleFile} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mt-8">
              {[
                { label: 'Visão Geral', desc: 'KPIs em tempo real com status de SLA' },
                { label: 'Ranking', desc: 'Performance de técnicos baseada em volume e tempo' },
                { label: 'BI Insights', desc: 'Análise automática de tendências e problemas' },
              ].map(c => (
                <div key={c.label} className="card-premium p-6 text-center bg-white/50 backdrop-blur-sm">
                  <span className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">
                    {c.label}
                  </span>
                  <p className="text-sm text-slate-600 font-semibold">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="animate-in fade-in duration-500">
            {/* KPI Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visão Estratégica</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{fileName}</span>
                </div>
              </div>
              <StatsCards stats={stats} />
            </div>

            {/* Insights Banner */}
            <div className="mb-8">
              <InsightsBlock insights={stats.insights} />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Charts and Ranking Row */}
              <div className="lg:col-span-8 space-y-6">
                <DashboardCharts 
                  rows={filteredRows} 
                  onFilterTechnician={(tech) => onFiltersChange({ ...filters, responsible: [tech] })}
                  onFilterStatus={(status) => onFiltersChange({ ...filters, statusFilter: status as any })}
                  ranking={stats.ranking}
                  sortMode={rankingSortMode}
                />
                
                <Filters
                  filters={filters}
                  onChange={onFiltersChange}
                  technicians={technicians}
                  ticketCounts={ticketCounts}
                  onReset={() => onFiltersChange(DEFAULT_FILTERS)}
                />
              </div>

              <div className="lg:col-span-4">
                <TechnicianRanking 
                  ranking={stats.ranking} 
                  onSelect={(tech) => onFiltersChange({ ...filters, responsible: [tech] })}
                  sortMode={rankingSortMode}
                  onSortModeChange={setRankingSortMode}
                />
              </div>
            </div>

            {/* Data Table Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Base de Dados</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Exibindo {filteredRows.length} atendimentos filtrados
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue hover:bg-blue-700 text-white text-[10px] font-black rounded-lg transition-all shadow-md shadow-brand-blue/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    EXPORTAR DATASET
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    REINICIAR
                  </button>
                </div>
              </div>

              <DataTable
                rows={filteredRows}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                isCompact={isCompact}
              />
            </div>

            <div className="flex items-center justify-center pt-12 pb-8 border-t border-slate-100 mt-12">
              <button
                onClick={handleReset}
                className="flex items-center gap-3 text-xs font-black text-slate-400 hover:text-brand-blue transition-all uppercase tracking-[0.2em]"
              >
                <Upload className="w-4 h-4" />
                Upload de Novo Relatório
              </button>
            </div>
          </div>
        ) : (
          <RecurringSubjectsView 
            rows={rows} 
            initialFilters={filters}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
