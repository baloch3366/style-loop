type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const logLevels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return logLevels[level] <= logLevels[currentLevel];
}

function formatMessage(level: LogLevel, message: any, ...args: any[]): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (typeof message === 'string') {
    return `${prefix}: ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
  } else {
    return `${prefix}: ${JSON.stringify(message)} ${args.length > 0 ? JSON.stringify(args) : ''}`;
  }
}

export const logger = {
  error: (message: any, ...args: any[]) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, ...args));
    }
  },
  
  warn: (message: any, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, ...args));
    }
  },
  
  info: (message: any, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, ...args));
    }
  },
  
  debug: (message: any, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, ...args));
    }
  },
  
  // For HTTP requests
  http: (message: any, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', `HTTP: ${message}`, ...args));
    }
  },
};