import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IContactsRepository } from '../../../domains/contacts/contacts.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';

export interface IAddressSceneControllerConstructor {
	logger: ILogger;
	contactsRepository: IContactsRepository;
	usersRepository: IUsersRepository;
}
