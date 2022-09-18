import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IContactsRepository } from '../../../domains/contacts/contacts.repository.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { STEPS_NAMES } from '../../../constants';
import { Contact } from '../../../domains/contacts/contact.entity';
import { Cart } from '../../../domains/cart/cart.entity';
import { IStartSceneControllerProps } from './start-scene.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';

export class StartSceneController extends BaseController {
	markupController: IMarkupController;
	contactsRepository: IContactsRepository;
	markup: IMarkupSteps;
	usersRepository: IUsersRepository;
	cartRepository: ICartRepository;
	city: string;
	address: string;

	constructor({
		scene,
		logger,
		markupController,
		contactsRepository,
		usersRepository,
		cartRepository,
		markup,
	}: IStartSceneControllerProps) {
		super({ scene, logger, usersRepository });
		this.markupController = markupController;
		this.markup = markup;
		this.contactsRepository = contactsRepository;
		this.usersRepository = usersRepository;
		this.cartRepository = cartRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', action: 'text', func: this.onAnswer },
		]);
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			await this.init(ctx);

			const currentStepName = this.getCurrentStepNameOrSetBaseName(ctx, STEPS_NAMES.SET_CITY);

			await this.markupController.createMarkup(ctx, this.markup[currentStepName]());
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
			// TODO Пока так решил проблему с типизацией text в message
			const message = 'text' in ctx.message && ctx.message.text;

			if (message) {
				const currentStepName = this.getCurrentStepName(ctx);

				if (currentStepName === STEPS_NAMES.SET_CITY) {
					this.city = message;
				}

				if (currentStepName === STEPS_NAMES.SET_ADDRESS) {
					this.address = message;
				}
			}
		}
	}

	private async createCartIfNotCreated(ctx: IMyContext): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		// TODO добавить проверку на ошибки
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

	async onAnswer(ctx: IMyContext): Promise<void> {
		this.saveContactsTemporary(ctx);

		const currentStepName = this.getCurrentStepName(ctx);

		const nextStepName = await this.getNextSiblingStep({
			ctx,
			currentStepName,
			stepsNames: this.markup,
		});

		if (this.getCurrentStepName(ctx) === STEPS_NAMES.SET_ADDRESS) {
			await this.setOrRewriteContacts(ctx);
		}

		if (nextStepName) {
			this.setNextStep(ctx, nextStepName);

			await ctx.scene.reenter();
		} else {
			const nextSceneName = await this.getNextSceneName(ctx);

			if (nextSceneName) {
				this.setBaseStep(ctx);
				await this.moveNextScene({ ctx, nextSceneName });
			}
		}
	}

	async init(ctx: IMyContext): Promise<void> {
		await this.createUserIfNotCreated(ctx);
		await this.createCartIfNotCreated(ctx);
	}
}
