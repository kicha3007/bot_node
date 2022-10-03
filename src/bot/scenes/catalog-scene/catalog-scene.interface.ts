import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { ProductModel } from '@prisma/client';
import { ICartProductRepository } from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';

export interface ICatalogSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	productsRepository: IProductsRepository;
	sceneNames: string[];
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	usersRepository: IUsersRepository;
}

export interface IActionController {
	ctx: IMyContext;
	message: string;
}

export interface IShowProductWithNavigation {
	ctx: IMyContext;
	countMessage?: string;
	caption: string;
	image: string;
	messageId?: string;
	mode?: string;
}

export interface IGeneratePositionMessageParams {
	currentPosition: number;
	itemsLength: number;
}
