import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { SCENES_NAMES } from '../../constants';
import { Cart } from '../../../domains/cart/cart.entity';
import { IStartSceneControllerConstructor } from './start-scene.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { Scenes } from 'telegraf';
import { StartSceneTemplate } from './start-scene.template';

export class StartSceneController extends BaseController {
	private cartRepository: ICartRepository;

	constructor(params: IStartSceneControllerConstructor) {
		const { logger, usersRepository, cartRepository } = params;

		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.START);
		super({ logger, usersRepository, scene });
		this.cartRepository = cartRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', action: 'text', func: this.onAnswer },
		]);
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			await this.init(ctx);
			await this.showGreetingAndGoNext(ctx);
		} catch (err) {
			this.logger.error(`[StartSceneController] ${err}`);
		}
	}

	private async showGreetingAndGoNext(ctx: IMyContext): Promise<void> {
		await this.showRepliesMarkup({ ctx, replies: StartSceneTemplate.getWelcomeGreeting() });
		await this.moveNextScene({ ctx, nextSceneName: SCENES_NAMES.ADDRESS });
	}

	private async createCartIfNotCreated(ctx: IMyContext): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		if (user) {
			const cart = new Cart(user.id);

			await this.cartRepository.create(cart);
		}
	}

	private async createUserIfNotCreated(ctx: IMyContext): Promise<void> {
		const { id, username } = this.getCurrentUserInfo(ctx);

		const hasUser = Boolean(await this.usersRepository.find({ id }));

		if (!hasUser) {
			await this.usersRepository.create({ id, name: username });
		}
	}

	private async init(ctx: IMyContext): Promise<void> {
		await this.createUserIfNotCreated(ctx);
		await this.createCartIfNotCreated(ctx);
	}
}
