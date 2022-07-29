import { PrismaClient } from '@prisma/client';
import { IPrismaService } from './prisma.service.interface';
import { ILogger } from '../logger/logger.interface';

interface IPrismaServiceProps {
	logger: ILogger;
}

export class PrismaService implements IPrismaService {
	client: PrismaClient;
	logger: ILogger;

	constructor({ logger }: IPrismaServiceProps) {
		this.logger = logger;
		this.client = new PrismaClient();
	}

	async connect(): Promise<void> {
		try {
			await this.client.$connect();
			this.logger.log('[PrismaService] Успешо подключились к базе данных');
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(`[PrismaService] Ошибка подключения к базе данных ${err.message}`);
			}
		}
	}

	async disconnect(): Promise<void> {
		await this.client.$disconnect();
	}
}
