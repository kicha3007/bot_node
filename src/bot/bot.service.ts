import 'dotenv/config';
import { Telegraf, Scenes } from 'telegraf';
import { StartSceneController } from '../start-scene/start-scene.controller';
import LocalSession from 'telegraf-session-local';
import { IMyContext } from '../common/common.interface';
import { ILogger } from '../logger/logger.interface';
import { SCENES_NAMES } from '../constants';

interface IBotProps {
	bot: Telegraf<IMyContext>;
	logger: ILogger;
}

export class BotService {
	bot: Telegraf<IMyContext>;
	logger: ILogger;
	// TODO Временно any, пока не разберусь
	startScene: any;
	stage: Scenes.Stage<IMyContext>;

	constructor({ bot, logger }: IBotProps) {
		this.bot = bot;
		this.logger = logger;

		const baseScene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.START);
		this.startScene = new StartSceneController({ scene: baseScene, logger });
		this.stage = new Scenes.Stage<IMyContext>([baseScene]);
	}

	public async init(): Promise<void> {
		this.bot.use(new LocalSession({ database: 'session.json' }).middleware());
		this.bot.use(this.stage.middleware());

		this.bot.command('start', (ctx) => {
			ctx.scene.enter(SCENES_NAMES.START);
		});

		/*		this.bot.start(async (ctx) => {
			await ctx.reply('Начать', Markup.keyboard(['test']).oneTime().resize());

			// ctx.scene.enter(SCENES_NAMES.START);
		});*/

		try {
			await this.bot.launch();
			this.logger.log('Бот инициализирован');
		} catch (err) {
			this.logger.error(`[init] Ошибка запуска бота: ${err}`);
		}
	}
}
