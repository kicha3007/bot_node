import { BotService } from './bot/bot.service';
import { LoggerService } from './infrastructure/logger/logger.service';
import { ConfigService } from './infrastructure/config/config.service';
import { PrismaService } from './infrastructure/database/prisma.service';

const bootstrap = async (): Promise<void> => {
	const loggerService = new LoggerService();

	const prismaService = new PrismaService({ logger: loggerService });
	await prismaService.connect();

	const bot = new BotService({
		logger: loggerService,
		configService: new ConfigService({ logger: loggerService }),
		prismaService,
	});
	bot.init();
};

bootstrap();
