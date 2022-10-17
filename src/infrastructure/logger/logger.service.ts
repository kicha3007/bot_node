import { Logger } from 'tslog';
import { ILogger } from './logger.interface';

export class LoggerService implements ILogger {
	readonly logger: Logger;

	constructor() {
		this.logger = new Logger({
			displayInstanceName: false,
			displayLoggerName: false,
			displayFilePath: 'hidden',
		});
	}

	public log(...args: unknown[]): void {
		this.logger.info(...args);
	}

	public error(...args: unknown[]): void {
		this.logger.error(...args);
	}

	public warn(...args: unknown[]): void {
		this.logger.warn(...args);
	}
}
