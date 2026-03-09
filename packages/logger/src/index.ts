import { nanoid } from "nanoid";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogFormat = "json" | "pretty";
export type LogPayload = Record<string, unknown> | Error | undefined;

export interface LogRecord extends Record<string, unknown> {
  level: LogLevel;
  message: string;
  requestId: string;
  time: string;
}

export interface CreateLoggerOptions {
  base?: Record<string, unknown>;
  format?: LogFormat | ((record: LogRecord) => string);
  idFactory?: () => string;
  level?: LogLevel;
  now?: () => string;
  redact?: string[];
  request?: Headers | Request;
  requestId?: string;
  sink?: (line: string, record: LogRecord) => void;
}

export interface Logger {
  child(bindings?: Record<string, unknown>): Logger;
  debug(message: string, payload?: LogPayload): void;
  error(message: string, payload?: LogPayload): void;
  info(message: string, payload?: LogPayload): void;
  requestId: string;
  warn(message: string, payload?: LogPayload): void;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const REDACTION_PLACEHOLDER = "[REDACTED]";
const REQUEST_ID_HEADERS = ["x-request-id", "cf-ray", "x-correlation-id"] as const;

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const level = options.level ?? "info";
  const redact = options.redact ?? [];
  const now = options.now ?? (() => new Date().toISOString());
  const requestId =
    options.requestId ?? getRequestIdFromHeaders(options.request) ?? options.idFactory?.() ?? nanoid();
  const formatter =
    typeof options.format === "function"
      ? options.format
      : options.format === "pretty"
        ? formatPrettyLog
        : formatJsonLog;
  const sink =
    options.sink ??
    ((line: string) => {
      console.log(line);
    });

  const write =
    (entryLevel: LogLevel) =>
    (message: string, payload?: LogPayload): void => {
      if (LEVEL_WEIGHT[entryLevel] < LEVEL_WEIGHT[level]) {
        return;
      }

      const record = redactPayload(
        {
          level: entryLevel,
          message,
          requestId,
          time: now(),
          ...options.base,
          ...normalizePayload(payload),
        } satisfies LogRecord,
        redact,
      );

      sink(formatter(record), record);
    };

  return {
    requestId,
    child(bindings = {}) {
      return createLogger({
        ...options,
        base: { ...options.base, ...bindings },
        idFactory: () => requestId,
        requestId,
      });
    },
    debug: write("debug"),
    error: write("error"),
    info: write("info"),
    warn: write("warn"),
  };
}

export function formatJsonLog(record: LogRecord): string {
  return JSON.stringify(record);
}

export function formatPrettyLog(record: LogRecord): string {
  const { level, message, requestId, time, ...extra } = record;
  const details = Object.entries(extra)
    .map(([key, value]) => `${key}=${formatPrettyValue(value)}`)
    .join(" ");

  return `${time} [${level}] ${message} requestId=${requestId}${details ? ` ${details}` : ""}`;
}

export function redactPayload<T>(payload: T, redactPaths: string[]): T {
  if (redactPaths.length === 0) {
    return cloneValue(payload) as T;
  }

  const cloned = cloneValue(payload);

  for (const path of redactPaths) {
    const segments = path.split(".").filter(Boolean);

    if (segments.length === 0) {
      continue;
    }

    applyRedaction(cloned, segments);
  }

  return cloned as T;
}

function applyRedaction(target: unknown, segments: string[]): void {
  if (!target || typeof target !== "object") {
    return;
  }

  const [segment, ...rest] = segments;

  if (Array.isArray(target)) {
    const index = Number(segment);
    if (Number.isNaN(index) || !(index in target)) {
      return;
    }

    if (rest.length === 0) {
      target[index] = REDACTION_PLACEHOLDER;
      return;
    }

    applyRedaction(target[index], rest);
    return;
  }

  const record = target as Record<string, unknown>;

  if (!(segment in record)) {
    return;
  }

  if (rest.length === 0) {
    record[segment] = REDACTION_PLACEHOLDER;
    return;
  }

  applyRedaction(record[segment], rest);
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const entries = Object.entries(value);
  return Object.fromEntries(entries.map(([key, entry]) => [key, cloneValue(entry)]));
}

function formatPrettyValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function getRequestIdFromHeaders(requestOrHeaders?: Headers | Request): string | null {
  if (!requestOrHeaders) {
    return null;
  }

  const headers = requestOrHeaders instanceof Request ? requestOrHeaders.headers : requestOrHeaders;

  for (const headerName of REQUEST_ID_HEADERS) {
    const value = headers.get(headerName);
    if (value) {
      return value;
    }
  }

  return null;
}

function normalizePayload(payload: LogPayload): Record<string, unknown> {
  if (!payload) {
    return {};
  }

  if (payload instanceof Error) {
    return {
      error: {
        message: payload.message,
        name: payload.name,
        stack: payload.stack,
      },
    };
  }

  return payload;
}
