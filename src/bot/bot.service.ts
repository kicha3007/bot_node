import 'dotenv/config';
import { Telegraf, Scenes } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { IMyContext } from './common/common.interface';
import { ILogger } from '../infrastructure/logger/logger.interface';
import { ENV_NAMES, SCENES_NAMES } from '../constants';
import { IConfigService } from '../infrastructure/config/config.service.interface';
import { MarkupController } from './markup/markup.controller';
import { CatalogSceneController } from './scenes/catalog-scene/catalog-scene.controller';
import { DetailSceneController } from './scenes/detail-scene/detail-scene.controller';
import { StartSceneController } from './scenes/start-scene/start-scene.controller';
import { IPrismaService } from '../infrastructure/database/prisma.service.interface';
import { MarkupService } from './markup/markup.service';
import { ContactsRepository } from '../domains/contacts/contacts.repository';
import { ProductsRepository } from '../domains/products/products.repository';
import { UsersRepository } from '../domains/users/users.repository';
import { CartRepository } from '../domains/cart/cart.repository';
import { CartProductRepository } from '../domains/cartProduct/cartProduct.repository';
import { IBotService, ICreateScenesProps } from './bot.service.interface';
import { CartSceneController } from './scenes/cart-scene/cart-scene.controller';

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

		const baseRepositories = { usersRepository: new UsersRepository(prismaService) };

		const scenesInfoList = [
			{
				[SCENES_NAMES.START]: {
					SceneController: StartSceneController,
					repository: {
						contactsRepository: new ContactsRepository(prismaService),
						cartRepository: new CartRepository(prismaService),
						...baseRepositories,
					},
				},
			},
			{
				[SCENES_NAMES.CATALOG]: {
					SceneController: CatalogSceneController,
					repository: {
						productsRepository: new ProductsRepository(prismaService),
						cartProductRepository: new CartProductRepository(prismaService),
						cartRepository: new CartRepository(prismaService),
						...baseRepositories,
					},
				},
			},
			{
				[SCENES_NAMES.DETAIL]: {
					SceneController: DetailSceneController,
					repository: { productsRepository: new ProductsRepository(prismaService) },
					...baseRepositories,
				},
			},
			{
				[SCENES_NAMES.CART]: {
					SceneController: CartSceneController,
					repository: {
						cartProductRepository: new CartProductRepository(prismaService),
						cartRepository: new CartRepository(prismaService),
						productsRepository: new ProductsRepository(prismaService),
					},
					...baseRepositories,
				},
			},
		];

		const scenes = this.createScenes({ scenes: scenesInfoList, logger });

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
