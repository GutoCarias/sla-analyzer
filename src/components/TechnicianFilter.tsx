import { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Users } from 'lucide-react';

interface Props {
  technicians: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  ticketCounts: Record<string, number>;
}

export default function TechnicianFilter({ technicians, selected, onChange, ticketCounts }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTechs = useMemo(() => {
    return technicians
      .filter(t => t.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (ticketCounts[b] || 0) - (ticketCounts[a] || 0));
  }, [technicians, search, ticketCounts]);

  const toggleTech = (tech: string) => {
    if (selected.includes(tech)) {
      onChange(selected.filter(t => t !== tech));
    } else {
      onChange([...selected, tech]);
    }
  };

  const selectAll = () => onChange(technicians);
  const clearAll = () => onChange([]);

  return (
    <div className="relative w-full">
      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Técnicos</label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-xs border rounded-xl bg-slate-50/50 text-slate-700 transition-all font-medium
          ${isOpen ? 'border-brand-blue/40 ring-2 ring-brand-blue/10 shadow-sm' : 'border-slate-200 hover:border-slate-300'}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          <Users className={`w-3.5 h-3.5 ${selected.length > 0 ? 'text-brand-blue' : 'text-slate-400'}`} />
          <span className={`truncate ${selected.length > 0 ? 'font-bold' : ''}`}>
            {selected.length === 0 
              ? 'Todos os técnicos' 
              : selected.length === 1 
                ? selected[0] 
                : `${selected.length} técnicos selecionados`}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[101] overflow-hidden min-w-[280px] animate-in zoom-in-95 duration-200">
            {/* Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="🔍 Buscar técnico..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-100">
              <button 
                onClick={selectAll}
                className="text-[9px] font-black text-brand-blue hover:text-blue-700 uppercase tracking-widest transition-colors"
              >
                Selecionar Todos
              </button>
              <button 
                onClick={clearAll}
                className="text-[9px] font-black text-slate-400 hover:text-brand-red uppercase tracking-widest transition-colors"
              >
                Limpar Seleção
              </button>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto py-2 px-1">
              {filteredTechs.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-xs italic">
                  Nenhum técnico encontrado
                </div>
              ) : (
                filteredTechs.map(tech => {
                  const isSelected = selected.includes(tech);
                  const count = ticketCounts[tech] || 0;
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                        ${isSelected ? 'bg-brand-blue/5' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className={`
                        w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all
                        ${isSelected ? 'bg-brand-blue border-brand-blue shadow-md shadow-brand-blue/20' : 'border-slate-200 bg-white'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${isSelected ? 'font-black text-slate-800' : 'text-slate-600 font-medium'}`}>
                          {tech}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Chips for selected */}
            {selected.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
                {selected.map(tech => (
                  <span 
                    key={tech} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600 shadow-sm"
                  >
                    {tech}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-brand-red transition-colors" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTech(tech);
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
