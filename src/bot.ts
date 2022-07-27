import 'dotenv/config';
import { Telegraf, Scenes } from 'telegraf';
import { StartSceneController } from './start-scene/start-scene.controller';
import LocalSession from 'telegraf-session-local';
import { IMyContext } from './common/common.interface';
import { ILogger } from './logger/logger.interface';
import { IPrismaService } from './database/prisma.service.interface';
import { SCENES_NAMES } from './constants';

interface IBotProps {
	bot: Telegraf<IMyContext>;
	logger: ILogger;
	startScene: StartSceneController;
	stage: Scenes.Stage<IMyContext>;
	databaseService: IPrismaService;
}

export class Bot {
	bot: Telegraf<IMyContext>;
	logger: ILogger;
	// TODO Временно any, пока не разберусь
	startScene: any;
	stage: Scenes.Stage<IMyContext>;
	databaseService: IPrismaService;

	constructor({ bot, logger, startScene, stage, databaseService }: IBotProps) {
		this.bot = bot;
		this.logger = logger;
		this.startScene = startScene;
		this.stage = stage;
		this.databaseService = databaseService;
	}

	reply(res: string): void {
		this.bot.on('text', (ctx) => {
			ctx.reply(res);
		});
	}

	public async init(): Promise<void> {
		this.bot.use(new LocalSession({ database: 'session.json' }).middleware());
		this.bot.use(this.stage.middleware());
		this.startScene.enter();
		this.bot.command('start', (ctx) => ctx.scene.enter(SCENES_NAMES.START));
		this.reply('Привет');

		await this.databaseService.connect();

		this.bot.launch();
		this.logger.log('Бот инициализирован');
	}
}
