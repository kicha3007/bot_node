import { ILogger } from '../infrastructure/logger/logger.interface';
import { Scenes } from 'telegraf';
import { IMyContext } from './common/common.interface';
import { IContactsRepository } from '../domains/contacts/contacts.repository.interface';
import { ICartRepository } from '../domains/cart/cart.repository.interface';
import { IProductsRepository } from '../domains/products/products.repository.interface';
import { IUsersRepository } from '../domains/users/users.repository.interface';
import { ICartProductRepository } from '../domains/cart/cartProduct/cartProduct.repository.interface';
import { SCENES_NAMES } from './constants';
import { IConfigService } from '../infrastructure/config/config.service.interface';
import { StartSceneController } from './scenes/start-scene/start-scene.controller';
import { CatalogSceneController } from './scenes/catalog-scene/catalog-scene.controller';
import { DetailSceneController } from './scenes/detail-scene/detail-scene.controller';
import { CartSceneController } from './scenes/cart-scene/cart-scene.controller';
import { AddressSceneController } from './scenes/address-scene/address-scene.controller';

type IRepositories = Record<
	string,
	| IContactsRepository
	| ICartRepository
	| IProductsRepository
	| IUsersRepository
	| ICartProductRepository
>;

export interface IBotServiceParams {
	logger: ILogger;
	configService: IConfigService;
	repositories: IRepositories;
}

interface ISceneInfoItemBase {
	repository: IRepositories;
}

interface ISceneInfoItemStart extends ISceneInfoItemBase {
	sceneController: typeof StartSceneController;
}

interface ISceneInfoItemCatalog extends ISceneInfoItemBase {
	sceneController: typeof CatalogSceneController;
}

interface ISceneInfoItemDetail extends ISceneInfoItemBase {
	sceneController: typeof DetailSceneController;
}

interface ISceneInfoItemCart extends ISceneInfoItemBase {
	sceneController: typeof CartSceneController;
}

interface ISceneInfoItemAddress extends ISceneInfoItemBase {
	sceneController: typeof AddressSceneController;
}

export type ScenesInfoListType = [
	{ [SCENES_NAMES.START]: ISceneInfoItemStart },
	{ [SCENES_NAMES.CATALOG]: ISceneInfoItemCatalog },
	{ [SCENES_NAMES.DETAIL]: ISceneInfoItemDetail },
	{ [SCENES_NAMES.CART]: ISceneInfoItemCart },
	{ [SCENES_NAMES.ADDRESS]: ISceneInfoItemAddress },
];

export interface ICreateScenesParams {
	scenesInfoList: ScenesInfoListType;
}

export interface IBotService {
	createScenes: (scenes: ICreateScenesParams) => Scenes.BaseScene<IMyContext>[];
	init: () => Promise<void>;
}
