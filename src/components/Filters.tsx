import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterState, TicketRow } from '../types';
import TechnicianFilter from './TechnicianFilter';

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  technicians: string[];
  ticketCounts: Record<string, number>;
  onReset: () => void;
}

const SORT_OPTIONS: { value: keyof TicketRow; label: string }[] = [
  { value: 'openedAt', label: 'Data de Abertura' },
  { value: 'responsible', label: 'Responsável' },
  { value: 'entryDate', label: 'Data de Entrada' },
  { value: 'durationMinutes', label: 'Tempo de Atendimento' },
];

export default function Filters({ filters, onChange, technicians, ticketCounts, onReset }: Props) {
  const hasActiveFilters = 
    filters.responsible.length > 0 || 
    filters.subjectSearch || 
    filters.subjectGroupFilter ||
    filters.customerNameSearch || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.statusFilter;

  function set(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="card-premium p-4 !overflow-visible">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-3.5 h-3.5 text-brand-blue" />
        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Painel de Filtros</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1.5 text-[9px] font-black text-brand-red hover:text-red-700 transition-colors bg-brand-red/5 px-2.5 py-1 rounded-full border border-brand-red/10"
          >
            <X className="w-3 h-3" />
            LIMPAR TUDO
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Subject Search */}
        <div className="lg:col-span-1">
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Assunto</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Ex: Instalação..."
              value={filters.subjectSearch}
              onChange={e => set({ subjectSearch: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all font-medium"
            />
          </div>
        </div>

        {/* Customer Search */}
        <div className="lg:col-span-1">
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Cliente</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={filters.customerNameSearch}
              onChange={e => set({ customerNameSearch: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all font-medium"
            />
          </div>
        </div>

        {/* Technician Multi-Select */}
        <div className="lg:col-span-1">
          <TechnicianFilter 
            technicians={technicians}
            selected={filters.responsible}
            onChange={(selected) => set({ responsible: selected })}
            ticketCounts={ticketCounts}
          />
        </div>

        {/* Date from */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Início</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => set({ dateFrom: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all font-medium"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Fim</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => set({ dateTo: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all font-medium"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Ordenação</label>
          <div className="flex gap-2">
            <select
              value={filters.sortField}
              onChange={e => set({ sortField: e.target.value as keyof TicketRow })}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all font-medium appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => set({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-600 hover:bg-slate-100 transition-all font-mono font-black"
            >
              {filters.sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(filters.statusFilter || filters.subjectGroupFilter) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filtros Ativos:</span>
          
          {filters.statusFilter && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[9px] font-black shadow-sm">
              <span>Status: {filters.statusFilter}</span>
              <button onClick={() => set({ statusFilter: '' })} className="hover:text-brand-red transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.subjectGroupFilter && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[9px] font-black shadow-sm">
              <span>Assunto: {filters.subjectGroupFilter}</span>
              <button onClick={() => set({ subjectGroupFilter: '' })} className="hover:text-brand-red transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
