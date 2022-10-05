import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';

export interface IDetailSceneProps {
	logger: ILogger;
	productsRepository: IProductsRepository;
	usersRepository: IUsersRepository;
	sceneNames: string[];
}

export interface IShowDetailProduct {
	ctx: IMyContext;
	countMessage?: string;
	caption: string;
	image: string;
	messageId?: string;
	mode?: string;
}
