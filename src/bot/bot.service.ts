import 'dotenv/config';
import { Telegraf, Scenes } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { IMyContext } from './common/common.interface';
import { ILogger } from '../infrastructure/logger/logger.interface';
import { ENV_NAMES, SCENES_NAMES } from '../constants';
import { IConfigService } from '../infrastructure/config/config.service.interface';
import { CatalogSceneController } from './scenes/catalog-scene/catalog-scene.controller';
import { DetailSceneController } from './scenes/detail-scene/detail-scene.controller';
import { StartSceneController } from './scenes/start-scene/start-scene.controller';
import { IPrismaService } from '../infrastructure/database/prisma.service.interface';
import { ContactsRepository } from '../domains/contacts/contacts.repository';
import { ProductsRepository } from '../domains/products/products.repository';
import { UsersRepository } from '../domains/users/users.repository';
import { CartRepository } from '../domains/cart/cart.repository';
import { CartProductRepository } from '../domains/cart/cartProduct/cartProduct.repository';
import type { ScenesInfoListType } from './bot.service.interface';
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

		const usersRepository = new UsersRepository(prismaService);
		const contactsRepository = new ContactsRepository(prismaService);
		const cartRepository = new CartRepository(prismaService);
		const productsRepository = new ProductsRepository(prismaService);
		const cartProductRepository = new CartProductRepository(prismaService);

		if (!token) {
			throw new Error('Не задан token');
		}

		this.bot = new Telegraf<IMyContext>(token);
		this.logger = logger;

		const baseRepositories = { usersRepository };

		const scenesInfoList = [
			{
				[SCENES_NAMES.START]: {
					SceneController: StartSceneController,
					repository: {
						contactsRepository,
						cartRepository,
						...baseRepositories,
					},
				},
			},
			{
				[SCENES_NAMES.CATALOG]: {
					SceneController: CatalogSceneController,
					repository: {
						productsRepository,
						cartProductRepository,
						cartRepository,
						...baseRepositories,
					},
				},
			},

			{
				[SCENES_NAMES.DETAIL]: {
					SceneController: DetailSceneController,
					repository: { productsRepository },
					...baseRepositories,
				},
			},
			{
				[SCENES_NAMES.CART]: {
					SceneController: CartSceneController,
					repository: {
						cartProductRepository,
						cartRepository,
						productsRepository,
					},
					...baseRepositories,
				},
			},
		] as ScenesInfoListType;

		const scenes = this.createScenes({ scenesInfoList, logger });
		this.stage = new Scenes.Stage<IMyContext>(scenes);
	}

	createScenes({ scenesInfoList, logger }: ICreateScenesProps): Scenes.BaseScene<IMyContext>[] {
		return scenesInfoList.map((sceneInfo) => {
			const [currentSceneInfo] = Object.values(sceneInfo);

			const currentController = new currentSceneInfo.SceneController({
				logger,
				...currentSceneInfo.repository,
			});

			return currentController.getScene();
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
