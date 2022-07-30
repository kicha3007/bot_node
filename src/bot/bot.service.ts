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
		this.startScene = new StartSceneController({ scene: baseScene });
		this.stage = new Scenes.Stage<IMyContext>([baseScene]);
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

		this.bot.launch();
		this.logger.log('Бот инициализирован');
	}
}
