import { Telegraf, Scenes } from 'telegraf';
import { Bot } from './bot';
import { LoggerService } from './logger/logger.service';
import { StartSceneController } from './start-scene/start-scene.controller';
import { IMyContext } from './common/common.interface';
import { ConfigService } from './config/config.service';
import { ENV_NAMES, SCENES_NAMES } from './constants';
import { PrismaService } from './database/prisma.service';

async function bootstrap(): Promise<void> {
	const loggerService = new LoggerService();
	const configService = new ConfigService({ logger: loggerService });

	const token = configService.get(ENV_NAMES.TOKEN);
	if (!token) {
		throw new Error('Не задан token');
	}

	const prismaService = new PrismaService({ logger: loggerService });

	const startScene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.START);
	const stage = new Scenes.Stage<IMyContext>([startScene]);

	const bot = new Bot({
		bot: new Telegraf<IMyContext>(token as string),
		logger: loggerService,
		startScene: new StartSceneController(startScene),
		stage,
		databaseService: prismaService,
	});
	bot.init();
}

bootstrap();
