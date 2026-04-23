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
  const hasActiveFilters = filters.responsible || filters.dateFrom || filters.dateTo;

  function set(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Filtros e Ordenação</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Technician filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Técnico</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.responsible}
              onChange={e => set({ responsible: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none cursor-pointer"
            >
              <option value="">Todos os técnicos</option>
              {technicians.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date from */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Data inicial</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => set({ dateFrom: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Data final</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => set({ dateTo: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Ordenar por</label>
          <div className="flex gap-2">
            <select
              value={filters.sortField}
              onChange={e => set({ sortField: e.target.value as keyof TicketRow })}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => set({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors font-mono"
              title={filters.sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              {filters.sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
