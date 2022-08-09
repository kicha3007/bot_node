import { IConfigService } from './config.service.interface';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { ILogger } from '../logger/logger.interface';

interface IConfigServiceProps {
	logger: ILogger;
}

export class ConfigService implements IConfigService {
	private logger: ILogger;
	private config: DotenvParseOutput;

	constructor({ logger }: IConfigServiceProps) {
		this.logger = logger;
		const result: DotenvConfigOutput = config();
		if (result.error) {
			this.logger.error('[ConfigService] Не удалось прочитать файл .env или он отсутсвует');
		} else {
			this.logger.log('[ConfigService] Конфигурация .env загружена');
			this.config = result.parsed as DotenvParseOutput;
		}
	}

	get(key: string): string {
		return this.config[key];
	}
}
