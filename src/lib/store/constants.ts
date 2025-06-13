export const SIDEBAR_WIDTH = 240;
export const SESSION_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

export enum TaskStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REWORK = 'rework',
  REOPENED = 'reopened',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}
