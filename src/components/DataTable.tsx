import { AlertCircle, Clock, User, Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { TicketRow } from '../types';
import TruncatedCell from './TruncatedCell';

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
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {[
                'Ticket',
                'Abertura',
                'Cliente',
                'Assunto',
                'Responsável',
                'Entrada',
                'Saída',
                'Tempo',
                '',
              ].map(h => (
                <th
                  key={h}
                  className="px-2 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap"
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
                  hover:bg-blue-50/40
                `}
              >
                <td className="px-2 py-2 whitespace-nowrap">
                  {row.ticketNumber ? (
                    <a
                      href={`https://lbc.movidesk.com/Ticket/Edit/${row.ticketNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold font-mono text-[11px] hover:underline transition-all"
                    >
                      {row.ticketNumber}
                    </a>
                  ) : (
                    <span className="text-slate-300 font-mono text-[11px]">—</span>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-slate-500 text-[11px]">{row.openedAt.split(' ')[0]}</span>
                </td>
                <td className="px-2 py-2">
                  <TruncatedCell
                    text={row.customerName || '—'}
                    limit={15}
                    className="text-slate-700 font-medium text-[11px] max-w-[100px]"
                  />
                </td>
                <td className="px-2 py-2">
                  <TruncatedCell
                    text={row.subject || '—'}
                    limit={25}
                    className="text-slate-500 text-[11px] max-w-[160px]"
                  />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-slate-600 text-[11px] font-medium truncate max-w-[100px] block">
                    {row.responsible || '—'}
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex flex-col leading-tight">
                    <span className="text-slate-500 text-[10px]">{row.entryDate}</span>
                    <span className="text-slate-700 font-mono text-[10px] font-bold">{row.entryTime}</span>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex flex-col leading-tight opacity-60">
                    <span className="text-slate-400 text-[10px]">{row.exitDate}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{row.exitTime}</span>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <DurationBadge minutes={row.durationMinutes} formatted={row.durationFormatted} />
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-right">
                  {row.hasError && (
                    <span
                      className="inline-block text-red-500"
                      title={row.errorMessage}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
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
