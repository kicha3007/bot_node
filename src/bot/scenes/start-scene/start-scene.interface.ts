import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IContactsRepository } from '../../../domains/contacts/contacts.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';

export interface IStartSceneControllerConstructor {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	markupController: IMarkupController;
	contactsRepository: IContactsRepository;
	usersRepository: IUsersRepository;
	cartRepository: ICartRepository;
	markup: IMarkupSteps;
}
