import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterState, TicketRow } from '../types';

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  technicians: string[];
  onReset: () => void;
}

const SORT_OPTIONS: { value: keyof TicketRow; label: string }[] = [
  { value: 'openedAt', label: 'Data de Abertura' },
  { value: 'responsible', label: 'Responsável' },
  { value: 'entryDate', label: 'Data de Entrada' },
  { value: 'durationMinutes', label: 'Tempo de Atendimento' },
];

export default function Filters({ filters, onChange, technicians, onReset }: Props) {
  const hasActiveFilters = filters.responsible || filters.subjectSearch || filters.dateFrom || filters.dateTo;

  function set(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Filtros</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-2 py-0.5 rounded-md"
          >
            <X className="w-3 h-3" />
            LIMPAR
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Subject Search */}
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assunto</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Assunto..."
              value={filters.subjectSearch}
              onChange={e => set({ subjectSearch: e.target.value })}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Customer Search */}
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cliente</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar cliente..."
              value={filters.customerNameSearch}
              onChange={e => set({ customerNameSearch: e.target.value })}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Status Indicator (if active via chart) */}
        {filters.statusFilter && (
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Ativo</label>
            <div className="flex items-center justify-between px-2 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-bold">
              <span>{filters.statusFilter}</span>
              <button onClick={() => set({ statusFilter: '' })} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Technician filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Técnico</label>
          <select
            value={filters.responsible}
            onChange={e => set({ responsible: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none cursor-pointer"
          >
            <option value="">Todos</option>
            {technicians.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Início</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => set({ dateFrom: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fim</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => set({ dateTo: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ordenar</label>
          <div className="flex gap-1.5">
            <select
              value={filters.sortField}
              onChange={e => set({ sortField: e.target.value as keyof TicketRow })}
              className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => set({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors font-mono"
            >
              {filters.sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
