export const SLA_WARN_MINUTES = 60;
export const SLA_BREACH_MINUTES = 240;

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
  responsible: string[];
  subjectSearch: string;
  subjectGroupFilter: string;
  customerNameSearch: string;
  statusFilter: 'Normal' | 'Atenção' | 'SLA Estourado' | '';
  dateFrom: string;
  dateTo: string;
  sortField: keyof TicketRow;
  sortDirection: 'asc' | 'desc';
}

export interface TechnicianScore {
  name: string;
  ticketCount: number;
  avgDurationMinutes: number;
  score: number;
  classification: 'Excellent' | 'Medium' | 'Critical';
}

export interface Insight {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  description?: string;
}

export interface Stats {
  total: number;
  valid: number;
  errors: number;
  pending: number; // Em atendimento
  withinSLA: number;
  outsideSLA: number;
  avgDurationMinutes: number;
  maxDurationMinutes: number;
  techniciansCount: number;
  slaPercent: number;
  ranking: TechnicianScore[];
  insights: Insight[];
}
