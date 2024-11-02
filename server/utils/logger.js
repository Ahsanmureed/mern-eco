import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import moment from 'moment'; // For date formatting

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom format to log as structured objects
const customFormat = format.printf(({ timestamp, level, message, data }) => {
  const dataString = data ? `, data:${JSON.stringify(data)}` : ''; 
  return `{level:"${level}", message:"${message}"${dataString}, timestamp:"${timestamp}"}`;
});

// Get today's date for the log file name
const today = moment().format('YYYY-MM-DD');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    customFormat
  ),
  transports: [
    new transports.File({ 
      filename: join(__dirname, `../logs/error-${today}.log`),
      level: 'error',
      format: customFormat
    }),
    new transports.File({ 
      filename: join(__dirname, `../logs/success-${today}.log`),
      level: 'info',
      format: customFormat
    }),
    new transports.File({ 
      filename: join(__dirname, `../logs/warn-${today}.log`),
      level: 'warn',
      format: customFormat
    }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.timestamp(),
      format.simple()
    ),
  }));
}

export default logger;
