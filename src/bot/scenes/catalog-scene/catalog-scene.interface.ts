import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { IMarkupController } from '../../markup/markup.controller.interface';
import { IMarkupSteps } from '../../markup/markup.service.inteface';
import { IProductsRepository } from '../../../domains/products/products.repository.interface';

export interface ICatalogSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	markupController: IMarkupController;
	markup: IMarkupSteps;
	productsRepository: IProductsRepository;
	sceneNames: string[];
}
