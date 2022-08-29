import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IMarkupController, InlineButtonsMode } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';
import { ProductModel } from '@prisma/client';
import { ICartProductRepository } from '../../../domains/cartProduct/cartProduct.repository.interface';
import { ICartRepository } from '../../../domains/cart/cart.repository.interface';
import { IUsersRepository } from '../../../domains/users/users.repository.interface';

export interface ICatalogSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	sceneNames: string[];
	cartProductRepository: ICartProductRepository;
	cartRepository: ICartRepository;
	usersRepository: IUsersRepository;
}

export interface IGenerateProductTemplate {
	product: ProductModel;
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
	mode?: InlineButtonsMode;
	messageId?: string;
}

export interface IGeneratePositionMessageParams {
	currentPosition: number;
	itemsLength: number;
}
