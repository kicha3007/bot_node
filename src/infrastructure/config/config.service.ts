import { IConfigService } from './config.service.interface';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { ILogger } from '../logger/logger.interface';

interface IConfigServiceParams {
	logger: ILogger;
}

export class ConfigService implements IConfigService {
	private logger: ILogger;
	private readonly config: DotenvParseOutput;

	constructor({ logger }: IConfigServiceParams) {
		this.logger = logger;
		const result: DotenvConfigOutput = config();
		if (result.error) {
			this.logger.error('[ConfigService] Не удалось прочитать файл .env или он отсутсвует');
		} else {
			this.logger.log('[ConfigService] Конфигурация .env загружена');
			this.config = result.parsed as DotenvParseOutput;
		}
	}

	public get(key: string): string {
		return this.config[key];
	}
}
