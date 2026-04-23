import { useState, useMemo } from 'react';
import { FileSpreadsheet, Download, Upload, RefreshCw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import StatsCards from './components/StatsCards';
import Filters from './components/Filters';
import DataTable from './components/DataTable';
import { parseCSV, exportToCSV } from './utils/csvParser';
import { toInputDate } from './utils/dateUtils';
import { FilterState, Stats, TicketRow } from './types';

const DEFAULT_FILTERS: FilterState = {
  responsible: '',
  subjectSearch: '',
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

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (filters.responsible) {
      result = result.filter(r => r.responsible === filters.responsible);
    }

    if (filters.subjectSearch) {
      const search = filters.subjectSearch.toLowerCase();
      result = result.filter(r => r.subject.toLowerCase().includes(search));
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
    const valid = rows.filter(r => r.durationMinutes !== null);
    const durations = valid.map(r => r.durationMinutes as number);
    const avg = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const max = durations.length ? Math.max(...durations) : 0;

    return {
      total: rows.length,
      valid: valid.length,
      errors: rows.filter(r => r.hasError).length,
      avgDurationMinutes: avg,
      maxDurationMinutes: max,
      technicians: technicians.length,
    };
  }, [rows, technicians]);

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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs">SLA Analyzer</span>
            </div>
          </div>

          {loaded && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] text-slate-400 truncate max-w-[150px]">{fileName}</span>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md transition-colors shadow-sm"
              >
                <Download className="w-3 h-3" />
                EXPORTAR
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                NOVO
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {!loaded ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-8">
            <div className="text-center space-y-2 max-w-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Analisador de SLA</h1>
              <p className="text-slate-500 text-base leading-relaxed">
                Importe seu arquivo CSV para visualizar e analisar os dados de atendimento,
                calcular tempos de SLA e identificar gargalos por técnico.
              </p>
            </div>

            <FileUpload onFileParsed={handleFile} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
              {[
                { label: 'Coluna A', desc: 'Data de abertura' },
                { label: 'Coluna C', desc: 'Número do ticket' },
                { label: 'Coluna D', desc: 'Nome do cliente' },
                { label: 'Coluna E', desc: 'Assunto do ticket' },
                { label: 'Coluna H', desc: 'Técnico responsável' },
                { label: 'Colunas S e T', desc: 'Entrada/Saída SLA N2' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md mb-2">
                    {c.label}
                  </span>
                  <p className="text-sm text-slate-600">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <StatsCards stats={stats} />

            <Filters
              filters={filters}
              onChange={onFiltersChange}
              technicians={technicians}
              onReset={() => onFiltersChange(DEFAULT_FILTERS)}
            />

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Registros</h2>
                <p className="text-[10px] text-slate-400">
                  {filteredRows.length} de {rows.length}
                  {filters.responsible && ` — ${filters.responsible}`}
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md transition-colors shadow-sm"
              >
                <Download className="w-3 h-3" />
                EXPORTAR FILTRADO
              </button>
            </div>

            <DataTable
              rows={filteredRows}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />

            <div className="flex items-center justify-center pt-4 pb-8">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar outro arquivo
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
