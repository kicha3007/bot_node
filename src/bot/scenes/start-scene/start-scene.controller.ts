import { Scenes } from 'telegraf';
import { BaseController } from '../../../common/base.controller';
import { IMyContext } from '../../../common/common.interface';
import { ILogger } from '../../../logger/logger.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IContactsRepository } from '../../../contacts/contacts.repository.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IUsersRepository } from '../../../users/users.repository.interface';
import { STEPS_NAMES, CONTACTS_PROPS } from '../../../constants';
import { Contact } from '../../../contacts/contact.entity';
import { IBotService } from '../../bot.service.interface';

interface IStartSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	markupController: IMarkupController;
	contactsRepository: IContactsRepository;
	usersRepository: IUsersRepository;
	markup: IMarkupSteps;
	sceneNames: string[];
	bot: IBotService;
}

export class StartSceneController extends BaseController {
	markupController: IMarkupController;
	contactsRepository: IContactsRepository;
	markup: IMarkupSteps;
	sceneNames: string[];
	usersRepository: IUsersRepository;
	bot: IBotService;

	constructor({
		scene,
		logger,
		markupController,
		contactsRepository,
		usersRepository,
		markup,
		sceneNames,
		bot,
	}: IStartSceneControllerProps) {
		super({ scene, logger, sceneNames });
		this.bot = bot;
		this.markupController = markupController;
		this.markup = markup;
		this.contactsRepository = contactsRepository;
		this.usersRepository = usersRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', command: 'text', func: this.onAnswer },
		]);
	}

	private async createUserIfNotCreate(ctx: IMyContext): Promise<void> {
		const { id, username } = this.getCurrentUserInfo(ctx);

		const hasUser = Boolean(await this.usersRepository.find({ id }));

		if (!hasUser) {
			await this.usersRepository.create({ id, name: username });
		}
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			const currentStepName = this.getCurrentStepNameOrSetBaseName(ctx, STEPS_NAMES.SET_CITY);

			this.markupController.createMarkup(ctx, this.markup[currentStepName]());
		} catch (err) {
			this.logger.error(`[StartSceneController] ${err}`);
		}
	}

	private async setOrRewriteContacts(ctx: IMyContext): Promise<void> {
		await this.createUserIfNotCreate(ctx);
		const city = this.getPropertyFromStorage({ ctx, property: CONTACTS_PROPS.CITY });
		const address = this.getPropertyFromStorage({ ctx, property: CONTACTS_PROPS.ADDRESS });

		const { id } = this.getCurrentUserInfo(ctx);
		const userFromDatabase = await this.usersRepository.find({ id });

		try {
			if (city && address && userFromDatabase) {
				const { id: userId } = userFromDatabase;

				const hasContactAlready = Boolean(await this.contactsRepository.find({ userId }));

				if (hasContactAlready) {
					await this.contactsRepository.delete({ userId });
				}

				const contact = new Contact(city, address, userId);
				await this.contactsRepository.create(contact);
			}
		} catch (err) {
			this.logger.error(`[setContacts] ${err}`);
		}
	}

	private saveContactsToStorage(ctx: IMyContext): void {
		if (ctx.message) {
			// TODO Разобраться в проблеме типизации text

			// @ts-ignore
			const message = ctx.message.text;

			const currentStepName = this.getCurrentStepName(ctx);

			if (currentStepName === STEPS_NAMES.SET_CITY) {
				this.savePropertyToStorage({ ctx, property: { [CONTACTS_PROPS.CITY]: message } });
			}

			if (currentStepName === STEPS_NAMES.SET_ADDRESS) {
				this.savePropertyToStorage({ ctx, property: { [CONTACTS_PROPS.ADDRESS]: message } });
			}
		}
	}

	private async onAnswer(ctx: IMyContext): Promise<void> {
		this.saveContactsToStorage(ctx);

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
}
