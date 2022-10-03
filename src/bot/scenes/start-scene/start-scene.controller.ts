import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IContactsRepository } from '../../../domains/contacts/contacts.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { MESSAGES, SCENES_NAMES } from '../../../constants';
import { Contact } from '../../../domains/contacts/contact.entity';
import { Cart } from '../../../domains/cart/cart.entity';
import { IStartSceneControllerConstructor } from './start-scene.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { Scenes } from 'telegraf';
import { StartSceneTemplate } from './start-scene.template';

export class StartSceneController extends BaseController {
	contactsRepository: IContactsRepository;
	usersRepository: IUsersRepository;
	cartRepository: ICartRepository;
	city: string;
	address: string;
	previousMessage: string | boolean;
	currentStepNumber = 0;

	constructor({
		logger,
		contactsRepository,
		usersRepository,
		cartRepository,
	}: IStartSceneControllerConstructor) {
		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.START);
		super({ logger, usersRepository, scene });
		this.contactsRepository = contactsRepository;
		this.usersRepository = usersRepository;
		this.cartRepository = cartRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', action: 'text', func: this.onAnswer },
		]);
	}

	async goToNextStep(ctx: IMyContext): Promise<void> {
		enum startSceneStepsNames {
			welcomeAndSetCity,
			setAddress,
			saveContactsAndGoNextStep,
		}

		switch (this.currentStepNumber) {
			case startSceneStepsNames.welcomeAndSetCity: {
				await this.showRepliesMarkup({ ctx, replies: StartSceneTemplate.getWelcomeGreeting() });
				await this.showRepliesMarkup({ ctx, replies: StartSceneTemplate.getCityRequest() });
				break;
			}
			case startSceneStepsNames.setAddress: {
				await this.showRepliesMarkup({ ctx, replies: StartSceneTemplate.getAddressRequest() });
				break;
			}
			case startSceneStepsNames.saveContactsAndGoNextStep: {
				await this.setOrRewriteContacts(ctx);
				await this.moveNextScene({ ctx, nextSceneName: SCENES_NAMES.CATALOG });
				break;
			}
		}

		this.currentStepNumber++;
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			await this.init(ctx);

			await this.goToNextStep(ctx);
		} catch (err) {
			this.logger.error(`[StartSceneController] ${err}`);
		}
	}

	private async setOrRewriteContacts(ctx: IMyContext): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		try {
			if (this.city && this.address && user) {
				const { id: userId } = user;

				const hasContactAlready = Boolean(await this.contactsRepository.find({ userId }));

				if (hasContactAlready) {
					await this.contactsRepository.delete({ userId });
				}

				const contact = new Contact(this.city, this.address, userId);
				await this.contactsRepository.create(contact);
			}
		} catch (err) {
			this.logger.error(`[setContacts] ${err}`);
		}
	}

	private saveContactsTemporary(ctx: IMyContext): void {
		if (ctx.message) {
			const message = 'text' in ctx.message && ctx.message.text;

			if (message) {
				if (this.previousMessage === MESSAGES.SET_YOUR_CITY) {
					this.city = message;
				}
				if (this.previousMessage === MESSAGES.SET_YOUR_ADDRESS) {
					this.address = message;
				}
			}
		}
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

	setPreviousMessage(ctx: IMyContext): void {
		if (ctx.message) {
			this.previousMessage = 'text' in ctx.message && ctx.message.text;
		}
	}

	async onAnswer(ctx: IMyContext): Promise<void> {
		await this.saveContactsTemporary(ctx);

		this.setPreviousMessage(ctx);
		await ctx.scene.reenter();
	}

	async init(ctx: IMyContext): Promise<void> {
		await this.createUserIfNotCreated(ctx);
		await this.createCartIfNotCreated(ctx);
	}
}
