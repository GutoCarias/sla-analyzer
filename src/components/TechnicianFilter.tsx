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
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Técnicos</label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 py-1.5 text-sm border rounded-lg bg-slate-50 text-slate-700 transition-all
          ${isOpen ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">
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
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden min-w-[240px]">
            {/* Search */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar técnico..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-100 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <button 
                onClick={selectAll}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tight"
              >
                Selecionar Todos
              </button>
              <button 
                onClick={clearAll}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-tight"
              >
                Limpar
              </button>
            </div>

            {/* List */}
            <div className="max-h-[250px] overflow-y-auto py-1">
              {filteredTechs.length === 0 ? (
                <div className="px-3 py-4 text-center text-slate-400 text-xs italic">
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
                        w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                        ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-all
                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${isSelected ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                          {tech}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Chips for selected */}
            {selected.length > 0 && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/30 flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                {selected.map(tech => (
                  <span 
                    key={tech} 
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-blue-100 rounded-md text-[9px] font-bold text-blue-600 shadow-sm"
                  >
                    {tech}
                    <X 
                      className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" 
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
