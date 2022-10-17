import { BaseController } from '../base-scene/base-scene.controller';
import { IMyContext } from '../../common/common.interface';
import { IContactsRepository } from '../../../domains/contacts/contacts.repository.interface';
import { SCENES_NAMES } from '../../constants';
import { Contact } from '../../../domains/contacts/contact.entity';
import { Scenes } from 'telegraf';
import { AddressSceneTemplate } from './address-scene.template';
import { IAddressSceneControllerConstructor } from './address-scene.interface';

export class AddressSceneController extends BaseController {
	private contactsRepository: IContactsRepository;

	constructor(params: IAddressSceneControllerConstructor) {
		const { logger, contactsRepository, usersRepository } = params;

		const scene = new Scenes.BaseScene<IMyContext>(SCENES_NAMES.ADDRESS);
		super({ logger, scene, usersRepository });
		this.contactsRepository = contactsRepository;

		this.bindActions([
			{ method: 'enter', func: this.start },
			{ method: 'on', action: 'text', func: this.onAnswer },
		]);
	}

	private async start(ctx: IMyContext): Promise<void> {
		try {
			await this.showRepliesMarkup({ ctx, replies: AddressSceneTemplate.getAddressRequest() });
		} catch (err) {
			this.logger.error(`[StartSceneController] ${err}`);
		}
	}

	private async setOrRewriteContacts(ctx: IMyContext, address: string): Promise<void> {
		const user = await this.getCurrentUser(ctx);

		try {
			if (!(address && user)) {
				return;
			}

			const { id: userId } = user;

			const hasContactAlready = Boolean(await this.contactsRepository.find({ userId: user.id }));

			if (hasContactAlready) {
				await this.contactsRepository.delete({ userId });
			}

			const contact = new Contact(address, userId);
			await this.contactsRepository.create(contact);
		} catch (err) {
			this.logger.error(`[setContacts] ${err}`);
		}
	}

	protected async onAnswer(ctx: IMyContext): Promise<void> {
		const address = this.getTextMessage(ctx);
		await this.setOrRewriteContacts(ctx, address);

		await this.moveNextScene({ ctx, nextSceneName: SCENES_NAMES.CATALOG });
	}
}
