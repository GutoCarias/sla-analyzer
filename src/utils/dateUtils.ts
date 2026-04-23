export function parseBrazilianDateTime(value: string): Date | null {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();
  // dd/mm/yyyy hh:mm:ss or dd/mm/yyyy hh:mm
  const match = trimmed.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) return null;

  const [, day, month, year, hours, minutes, seconds = '0'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  );

  if (isNaN(date.getTime())) return null;
  return date;
}

export function parseBrazilianDate(value: string): Date | null {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(date.getTime())) return null;
  return date;
}

export function extractDate(value: string): string {
  if (!value || value.trim() === '') return '';
  const match = value.trim().match(/^(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : '';
}

export function extractTime(value: string): string {
  if (!value || value.trim() === '') return '';
  const match = value.trim().match(/\s+(\d{2}:\d{2}(?::\d{2})?)/);
  return match ? match[1] : '';
}

export function diffMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export function formatDuration(minutes: number): string {
  if (minutes < 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function toInputDate(brazilianDate: string): string {
  const match = brazilianDate.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}
