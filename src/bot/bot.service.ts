import 'dotenv/config';
import { Telegraf, Scenes } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { IMyContext } from '../common/common.interface';
import { ILogger } from '../logger/logger.interface';
import { ENV_NAMES, SCENES_NAMES } from '../constants';
import { IConfigService } from '../config/config.service.interface';
import { MarkupController } from './markup/markup.controller';
import { CatalogSceneController } from './scenes/catalog-scene/catalog-scene.controller';
import { StartSceneController } from './scenes/start-scene/start-scene.controller';
import { IPrismaService } from '../database/prisma.service.interface';
import { MarkupService } from './markup/markup.service';
import { ContactsRepository } from '../contacts/contacts.repository';
import { ProductsRepository } from '../products/products.repository';
import { UsersRepository } from '../users/users.repository';
import { IBotService, ICreateScenesProps } from './bot.service.interface';

interface IBotServiceProps {
	logger: ILogger;
	configService: IConfigService;
	prismaService: IPrismaService;
}

export class BotService implements IBotService {
	bot: Telegraf<IMyContext>;
	logger: ILogger;
	stage: Scenes.Stage<IMyContext>;

	constructor({ logger, configService, prismaService }: IBotServiceProps) {
		const token = configService.get(ENV_NAMES.TOKEN);

		if (!token) {
			throw new Error('Не задан token');
		}

		this.bot = new Telegraf<IMyContext>(token);
		this.logger = logger;

		const scenesInfo = [
			{
				[SCENES_NAMES.START]: {
					SceneController: StartSceneController,
					repository: {
						contactsRepository: new ContactsRepository(prismaService),
						usersRepository: new UsersRepository(prismaService),
					},
				},
			},
			{
				[SCENES_NAMES.CATALOG]: {
					SceneController: CatalogSceneController,
					repository: { productsRepository: new ProductsRepository(prismaService) },
				},
			},
		];

		const scenes = this.createScenes({ scenes: scenesInfo, logger });

		this.stage = new Scenes.Stage<IMyContext>([...scenes]);
	}

	createScenes({ scenes, logger }: ICreateScenesProps): Scenes.BaseScene<IMyContext>[] {
		const markupController = new MarkupController();
		const markupService = new MarkupService();
		const sceneNames = markupService.getSceneNames();

		return scenes.map((sceneInfo) => {
			const [[sceneName, sceneValue]] = Object.entries(sceneInfo);
			const scene = new Scenes.BaseScene<IMyContext>(sceneName);
			new sceneValue.SceneController({
				logger,
				markupController: markupController,
				markup: markupService.getCurrentMarkup(sceneName),
				scene,
				sceneNames,
				bot: this.bot,
				...sceneValue.repository,
			});

			return scene;
		});
	}

	public async init(): Promise<void> {
		this.bot.use(new LocalSession({ database: 'session.json' }).middleware());
		this.bot.use(this.stage.middleware());

		this.bot.command('start', (ctx) => {
			ctx.scene.enter(SCENES_NAMES.START);
		});

		try {
			await this.bot.launch();
			this.logger.log('Бот инициализирован');
		} catch (err) {
			this.logger.error(`[init] Ошибка запуска бота: ${err}`);
		}
	}
}
