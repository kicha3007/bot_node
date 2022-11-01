import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { ICartProductRepository } from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { IMyContext } from '../../common/common.interface';

export interface ICatalogSceneControllerParams {
	logger: ILogger;
	productsRepository: IProductsRepository;
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	usersRepository: IUsersRepository;
}

export interface IShowEditedCatalogProduct {
	ctx: IMyContext;
	countMessage: string;
	caption: string;
	image: string;
	messageId: string;
}

export interface IShowCreatedCatalogProduct {
	ctx: IMyContext;
	image: string;
	caption: string;
	countMessage: string;
}
