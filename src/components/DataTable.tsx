import { AlertCircle, Clock, Calendar, ChevronLeft, ChevronRight, ExternalLink, User } from 'lucide-react';
import { TicketRow, SLA_WARN_MINUTES, SLA_BREACH_MINUTES } from '../types';
import TruncatedCell from './TruncatedCell';

interface Props {
  rows: TicketRow[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isCompact?: boolean;
}

function DurationBadge({ minutes, formatted }: { minutes: number | null; formatted: string }) {
  if (minutes === null) return <span className="text-slate-300 text-[10px]">—</span>;

  const isBreached = minutes >= SLA_BREACH_MINUTES;
  const isWarning = minutes >= SLA_WARN_MINUTES && minutes < SLA_BREACH_MINUTES;

  let styles = 'bg-brand-green/10 text-brand-green border-brand-green/20';
  if (isBreached) styles = 'bg-brand-red/10 text-brand-red border-brand-red/20';
  else if (isWarning) styles = 'bg-brand-amber/10 text-brand-amber border-brand-amber/20';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${styles} shadow-sm transition-all duration-300`}>
      <Clock className="w-2.5 h-2.5 opacity-70" />
      {formatted}
    </span>
  );
}

export default function DataTable({ rows, page, pageSize, onPageChange, isCompact = false }: Props) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  if (rows.length === 0) {
    return (
      <div className="card-premium p-12 text-center bg-slate-50/50">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Calendar className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-600 font-bold">Nenhum registro encontrado</p>
        <p className="text-slate-400 text-[11px] mt-1 uppercase tracking-widest font-semibold">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="card-premium">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-green inline-block" />
          Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-amber inline-block" />
          Atenção
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-red inline-block" />
          Estourado
        </span>
        <span className="ml-auto text-slate-300">
          Mostrando {pageRows.length} de {rows.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              {[
                'Ticket',
                'Cliente',
                'Assunto',
                'Responsável',
                'Entrada/Saída',
                'Tempo de SLA',
                '',
              ].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pageRows.map((row) => {
              const isBreached = row.durationMinutes !== null && row.durationMinutes >= SLA_BREACH_MINUTES;
              const isWarning = row.durationMinutes !== null && row.durationMinutes >= SLA_WARN_MINUTES && row.durationMinutes < SLA_BREACH_MINUTES;
              
              return (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`https://lbc.movidesk.com/Ticket/Edit/${row.ticketNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-blue hover:text-blue-800 font-black font-mono text-[11px] bg-brand-blue/5 px-2 py-0.5 rounded-md hover:bg-brand-blue/10 transition-all"
                    >
                      #{row.ticketNumber || '—'}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <TruncatedCell
                      text={row.customerName || '—'}
                      limit={25}
                      className="text-slate-700 font-bold text-[11px] block"
                      style={{ maxWidth: '180px' }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <TruncatedCell
                      text={row.subject || '—'}
                      limit={40}
                      className="text-slate-500 text-[11px] block italic"
                      style={{ maxWidth: '250px' }}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-slate-600 text-[11px] font-bold">
                        {row.responsible || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-mono text-[10px] font-bold">{row.entryTime}</span>
                      <span className="text-slate-400 font-mono text-[9px]">{row.exitTime || 'Processando...'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DurationBadge minutes={row.durationMinutes} formatted={row.durationFormatted} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {row.hasError && (
                      <AlertCircle className="w-3.5 h-3.5 text-brand-red" title={row.errorMessage} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (page > 3) p = page - 2 + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                    p === page
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20 scale-110'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
