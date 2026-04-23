import { TicketRow } from '../types';
import {
  parseBrazilianDateTime,
  extractDate,
  extractTime,
  diffMinutes,
  formatDuration,
} from './dateUtils';

function detectDelimiter(firstLine: string): string {
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

function parseCSVWithDelimiter(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export function parseCSV(content: string): TicketRow[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines
    .map((line, index): TicketRow => {
      const cols = parseCSVWithDelimiter(line, delimiter);

      // Column indices (0-based): A=0, C=2, D=3, E=4, H=7, S=18, T=19
      const openedAt = cols[0] ?? '';
      const ticketNumber = cols[2] ?? '';
      const rawCustomer = cols[3] ?? '';
      const subject = cols[4] ?? '';
      const responsible = cols[7] ?? '';
      const rawEntry = cols[18] ?? '';
      const rawExit = cols[19] ?? '';

      // Clean customer name: extract content after the last "»"
      const customerName = rawCustomer.includes('»')
        ? rawCustomer.split('»').pop()?.trim() || rawCustomer
        : rawCustomer;

      const entryDate = extractDate(rawEntry);
      const entryTime = extractTime(rawEntry);
      const exitDate = extractDate(rawExit);
      const exitTime = extractTime(rawExit);

      let durationMinutes: number | null = null;
      let durationFormatted = '—';
      let hasError = false;
      let errorMessage: string | undefined;

      if (!rawEntry && !rawExit) {
        hasError = false;
        durationFormatted = '—';
      } else if (!rawEntry) {
        hasError = true;
        errorMessage = 'Data de entrada ausente';
      } else if (!rawExit) {
        hasError = true;
        errorMessage = 'Data de saída ausente';
      } else {
        const startDate = parseBrazilianDateTime(rawEntry);
        const endDate = parseBrazilianDateTime(rawExit);

        if (!startDate) {
          hasError = true;
          errorMessage = 'Data de entrada inválida';
        } else if (!endDate) {
          hasError = true;
          errorMessage = 'Data de saída inválida';
        } else {
          const minutes = diffMinutes(startDate, endDate);
          if (minutes < 0) {
            hasError = true;
            errorMessage = 'Saída anterior à entrada';
          } else {
            durationMinutes = minutes;
            durationFormatted = formatDuration(minutes);
          }
        }
      }

      return {
        id: `row-${index}`,
        ticketNumber,
        openedAt,
        customerName,
        subject,
        responsible,
        entryDate,
        entryTime,
        exitDate,
        exitTime,
        durationMinutes,
        durationFormatted,
        hasError,
        errorMessage,
      };
    })
    .filter(row => row.responsible || row.openedAt || row.entryDate || row.ticketNumber);
}

export function exportToCSV(rows: TicketRow[]): string {
  const headers = [
    'Número Ticket',
    'Data de Abertura',
    'Cliente',
    'Assunto',
    'Responsável',
    'Data de Entrada',
    'Hora de Entrada',
    'Data de Saída',
    'Hora de Saída',
    'Tempo de Atendimento',
    'Observação',
  ];

  const lines = [
    headers.join(';'),
    ...rows.map(r =>
      [
        r.ticketNumber,
        r.openedAt,
        r.customerName,
        r.subject,
        r.responsible,
        r.entryDate,
        r.entryTime,
        r.exitDate,
        r.exitTime,
        r.durationFormatted,
        r.errorMessage ?? '',
      ]
        .map(v => `"${v}"`)
        .join(';')
    ),
  ];

  return lines.join('\n');
}

