import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { ICartProductRepository } from '../../../domains/cart/cartProduct/cartProduct.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';
import { ShowProductModeType } from '../base-scene/base-scene.interface';

export interface ICatalogSceneControllerParams {
	logger: ILogger;
	productsRepository: IProductsRepository;
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	usersRepository: IUsersRepository;
}

export interface IGetProductAmountMessage {
	count: number;
	price: number;
}

export interface IShowProductInsideCartParams {
	ctx: IMyContext;
	nextPosition?: number;
	mode?: ShowProductModeType;
}

export interface IGenerateTotalAmountMessage {
	totalAmount: number;
}

export interface IShowEditedCartProduct {
	ctx: IMyContext;
	countMessage: string;
	caption: string;
	image: string;
	messageId: string;
	productSum: string;
	messagePay: string;
	productCount: number;
}

export interface IShowCreatedCartProductAndGetMessageId {
	ctx: IMyContext;
	image: string;
	caption: string;
	countMessage: string;
	messageId: string;
	productSum: string;
	productCount: number;
	messagePay: string;
}
