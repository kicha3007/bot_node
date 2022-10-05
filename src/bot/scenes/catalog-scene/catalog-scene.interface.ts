import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { ICartProductRepository } from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { ShowProductModeType } from '../base-scene/base-scene.interface';

export interface ICatalogSceneControllerProps {
	logger: ILogger;
	productsRepository: IProductsRepository;
	sceneNames: string[];
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	usersRepository: IUsersRepository;
}

export interface IShowProductWithNavigation {
	ctx: IMyContext;
	countMessage?: string;
	caption: string;
	image: string;
	messageId?: string;
	mode?: ShowProductModeType;
}

export interface IGeneratePositionMessageParams {
	currentPosition: number;
	itemsLength: number;
}
