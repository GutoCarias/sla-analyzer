export interface TicketRow {
  id: string;
  ticketNumber: string;
  openedAt: string;
  customerName: string;
  subject: string;
  responsible: string;
  entryDate: string;
  entryTime: string;
  exitDate: string;
  exitTime: string;
  durationMinutes: number | null;
  durationFormatted: string;
  hasError: boolean;
  errorMessage?: string;
}

export interface FilterState {
  responsible: string;
  subjectSearch: string;
  dateFrom: string;
  dateTo: string;
  sortField: keyof TicketRow;
  sortDirection: 'asc' | 'desc';
}

export interface Stats {
  total: number;
  valid: number;
  errors: number;
  avgDurationMinutes: number;
  maxDurationMinutes: number;
  technicians: number;
}
