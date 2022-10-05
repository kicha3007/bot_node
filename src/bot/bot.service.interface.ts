import { ILogger } from '../infrastructure/logger/logger.interface';
import { Scenes } from 'telegraf';
import { IMyContext } from './common/common.interface';
import { IContactsRepository } from '../domains/contacts/contacts.repository.interface';
import { ICartRepository } from '../domains/cart/cart.repository.interface';
import { IProductsRepository } from '../domains/products/products.repository.interface';
import { IUsersRepository } from '../domains/users/users.repository.interface';
import { ICartProductRepository } from '../domains/cart/cartProduct/cartProduct.repository.interface';
import { SCENES_NAMES } from '../constants';

interface ISceneInfoItem {
	// TODO временно any, надо разобраться как типизировать
	SceneController: any;
	repository: {
		[key: string]:
			| IContactsRepository
			| ICartRepository
			| IProductsRepository
			| IUsersRepository
			| ICartProductRepository;
	};
}

export type ScenesInfoListType = [
	{ [SCENES_NAMES.START]: ISceneInfoItem },
	{ [SCENES_NAMES.CATALOG]: ISceneInfoItem },
	{ [SCENES_NAMES.DETAIL]: ISceneInfoItem },
	{ [SCENES_NAMES.CART]: ISceneInfoItem },
];

export interface ICreateScenesProps {
	scenesInfoList: ScenesInfoListType;
	logger: ILogger;
}

export interface IBotService {
	createScenes: (scenes: ICreateScenesProps) => Scenes.BaseScene<IMyContext>[];
	init: () => Promise<void>;
}
