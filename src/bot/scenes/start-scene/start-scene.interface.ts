import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IContactsRepository } from '../../../domains/contacts/contacts.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';

export interface IStartSceneControllerConstructor {
	logger: ILogger;
	contactsRepository: IContactsRepository;
	usersRepository: IUsersRepository;
	cartRepository: ICartRepository;
}
