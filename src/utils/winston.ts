import winston, { format } from 'winston';

const {
  combine, timestamp, label, printf,
} = format;

const levels = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const logFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, message, label, timestamp,
}) => `${timestamp} [${label}] ${level}: ${message}`);

const logger = (details: string) => winston.createLogger({
  format: combine(
    label({ label: `${details}` }),
    timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    winston.format.colorize(),
    logFormat,
  ),
  levels,
  transports: [new winston.transports.Console()],
});

winston.addColors({
  error: 'bold white redBG',
  info: 'italic cyan',
  notice: 'red',
});

export default logger;
