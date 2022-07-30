import { Telegraf } from 'telegraf';
import { BotService } from './bot/bot.service';
import { LoggerService } from './logger/logger.service';
import { IMyContext } from './common/common.interface';
import { ConfigService } from './config/config.service';
import { ENV_NAMES } from './constants';
import { PrismaService } from './database/prisma.service';

const bootstrap = async (): Promise<void> => {
	const loggerService = new LoggerService();
	const configService = new ConfigService({ logger: loggerService });

	const token = configService.get(ENV_NAMES.TOKEN);
	if (!token) {
		throw new Error('Не задан token');
	}

	const prismaService = new PrismaService({ logger: loggerService });
	await prismaService.connect();

	const bot = new BotService({
		bot: new Telegraf<IMyContext>(token as string),
		logger: loggerService,
	});
	bot.init();
};

bootstrap();
