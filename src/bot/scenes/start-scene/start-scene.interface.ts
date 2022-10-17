import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';

export interface IStartSceneControllerConstructor {
	logger: ILogger;
	usersRepository: IUsersRepository;
	cartRepository: ICartRepository;
}
