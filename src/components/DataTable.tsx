import { AlertCircle, Clock, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { TicketRow } from '../types';

const SLA_WARN_MINUTES = 60;
const SLA_BREACH_MINUTES = 240;

interface Props {
  rows: TicketRow[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function DurationBadge({ minutes, formatted }: { minutes: number | null; formatted: string }) {
  if (minutes === null) return <span className="text-slate-400 text-xs">—</span>;

  if (minutes >= SLA_BREACH_MINUTES) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <Clock className="w-3 h-3" />
        {formatted}
      </span>
    );
  }
  if (minutes >= SLA_WARN_MINUTES) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        {formatted}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <Clock className="w-3 h-3" />
      {formatted}
    </span>
  );
}

export default function DataTable({ rows, page, pageSize, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Nenhum registro encontrado</p>
        <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Legend */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Normal (&lt; 1h)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Atenção (1h–4h)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          SLA Estourado (&gt; 4h)
        </span>
        <span className="ml-auto text-slate-400">
          {rows.length} registro{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {[
                'Ticket',
                'Data Abertura',
                'Responsável',
                'Data Entrada',
                'Hora Entrada',
                'Data Saída',
                'Hora Saída',
                'Tempo Atendimento',
                '',
              ].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.map((row, i) => (
              <tr
                key={row.id}
                className={`
                  transition-colors duration-100
                  ${row.hasError ? 'bg-red-50/30' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  hover:bg-blue-50/30
                `}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-blue-600 font-bold font-mono text-xs">{row.ticketNumber || '—'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-slate-700">{row.openedAt || '—'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-slate-800 font-medium truncate max-w-[160px]">
                      {row.responsible || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {row.entryDate || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.entryTime ? (
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                      {row.entryTime}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {row.exitDate || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.exitTime ? (
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                      {row.exitTime}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DurationBadge minutes={row.durationMinutes} formatted={row.durationFormatted} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.hasError && (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-red-600"
                      title={row.errorMessage}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{row.errorMessage}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages}
            <span className="ml-2 text-slate-400">
              (exibindo {start + 1}–{Math.min(start + pageSize, rows.length)} de {rows.length})
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
