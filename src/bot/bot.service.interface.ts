import { ILogger } from '../infrastructure/logger/logger.interface';
import { Scenes } from 'telegraf';
import { IMyContext } from './common/common.interface';
import { IContactsRepository } from '../domains/contacts/contacts.repository.interface';
import { ICartRepository } from '../domains/cart/cart.repository.interface';
import { IProductsRepository } from '../domains/products/products.repository.interface';
import { IUsersRepository } from '../domains/users/users.repository.interface';

export interface ICreateScenesProps {
	// TODO временно any, надо разобраться как типизировать
	scenesInfoList: {
		[key: string]: {
			SceneController: any;
			repository: {
				[key: string]:
					| IContactsRepository
					| ICartRepository
					| IProductsRepository
					| IUsersRepository;
			};
		};
	}[];
	logger: ILogger;
}

export interface IBotService {
	createScenes: (scenes: ICreateScenesProps) => Scenes.BaseScene<IMyContext>[];
	init: () => Promise<void>;
}
