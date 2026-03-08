import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type LogLevel = 'error' | 'warn' | 'info';
export type LogSource = 'server' | 'client' | 'admin';

export interface LogEntry {
  level: LogLevel;
  message: string;
  action: string;
  source: LogSource;
  userId?: string;
  userEmail?: string | null;
  metadata?: Record<string, unknown>;
  error?: string;
}

interface LogContext {
  action: string;
  source: LogSource;
  userId?: string;
  userEmail?: string | null;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

function serializeError(err: unknown): string | undefined {
  if (!err) return undefined;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

async function persistLog(entry: LogEntry) {
  try {
    await addDoc(collection(db, 'logs'), {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Firestore write failure should not break the app
  }
}

function log(level: LogLevel, message: string, context: LogContext) {
  const entry: LogEntry = {
    level,
    message,
    action: context.action,
    source: context.source,
    userId: context.userId,
    userEmail: context.userEmail,
    metadata: context.metadata,
    error: serializeError(context.error),
  };

  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
  consoleFn(`[${level.toUpperCase()}] ${message}`, {
    action: entry.action,
    source: entry.source,
    ...(entry.error && { error: entry.error }),
    ...(entry.metadata && { metadata: entry.metadata }),
  });

  // Persist to Firestore (error + info only, skip warn to reduce writes)
  if (level !== 'warn') {
    persistLog(entry);
  }
}

export const logger = {
  error: (message: string, context: LogContext) => log('error', message, context),
  warn: (message: string, context: LogContext) => log('warn', message, context),
  info: (message: string, context: LogContext) => log('info', message, context),
};
