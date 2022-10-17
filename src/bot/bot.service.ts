import 'dotenv/config';
import { Telegraf, Scenes } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { IMyContext } from './common/common.interface';
import { ILogger } from '../infrastructure/logger/logger.interface';
import { SCENES_NAMES } from './constants';
import { CatalogSceneController } from './scenes/catalog-scene/catalog-scene.controller';
import { DetailSceneController } from './scenes/detail-scene/detail-scene.controller';
import { StartSceneController } from './scenes/start-scene/start-scene.controller';
import type { ScenesInfoListType, IBotServiceParams } from './bot.service.interface';
import { IBotService, ICreateScenesParams } from './bot.service.interface';
import { CartSceneController } from './scenes/cart-scene/cart-scene.controller';
import { ENV_NAMES } from '../constants';
import { AddressSceneController } from './scenes/address-scene/address-scene.controller';

export class BotService implements IBotService {
	private bot: Telegraf<IMyContext>;
	private readonly logger: ILogger;
	private stage: Scenes.Stage<IMyContext>;

	constructor({ logger, configService, repositories }: IBotServiceParams) {
		const token = configService.get(ENV_NAMES.TOKEN);

		if (!token) {
			throw new Error('Не задан token');
		}

		const {
			contactsRepository,
			cartRepository,
			usersRepository,
			productsRepository,
			cartProductRepository,
		} = repositories;

		this.bot = new Telegraf<IMyContext>(token);
		this.logger = logger;

		const scenesInfoList: ScenesInfoListType = [
			{
				[SCENES_NAMES.START]: {
					sceneController: StartSceneController,
					repository: {
						contactsRepository,
						cartRepository,
						usersRepository,
					},
				},
			},
			{
				[SCENES_NAMES.CATALOG]: {
					sceneController: CatalogSceneController,
					repository: {
						productsRepository,
						cartProductRepository,
						cartRepository,
						usersRepository,
					},
				},
			},

			{
				[SCENES_NAMES.DETAIL]: {
					sceneController: DetailSceneController,
					repository: { productsRepository },
				},
			},
			{
				[SCENES_NAMES.CART]: {
					sceneController: CartSceneController,
					repository: {
						cartProductRepository,
						cartRepository,
						productsRepository,
					},
				},
			},
			{
				[SCENES_NAMES.ADDRESS]: {
					sceneController: AddressSceneController,
					repository: {
						contactsRepository,
						usersRepository,
					},
				},
			},
		];

		const scenes = this.createScenes({ scenesInfoList });
		this.stage = new Scenes.Stage<IMyContext>(scenes);
	}

	// TODO Разобраться с модификатормаи доступа
	createScenes({ scenesInfoList }: ICreateScenesParams): Scenes.BaseScene<IMyContext>[] {
		return scenesInfoList.map((sceneInfo) => {
			const [currentSceneInfo] = Object.values(sceneInfo);

			const currentController = new currentSceneInfo.sceneController({
				logger: this.logger,
				...currentSceneInfo.repository,
			});

			return currentController.getScene();
		});
	}

	public async init(): Promise<void> {
		this.bot.use(new LocalSession({ database: 'session.json' }).middleware());
		this.bot.use(this.stage.middleware());

		this.bot.command('start', (ctx) => {
			ctx.session.mySession = {};
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
