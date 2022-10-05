import { IGetProductInfoParams, IInlineButton } from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../../constants';

export class DetailSceneTemplate {
	static getInlineButtons(): IInlineButton[][] {
		return [
			[
				{
					message: MESSAGES.BACK_TO_CATALOG,
					callback: MESSAGES.BACK_TO_CATALOG,
				},
			],
		];
	}

	static getDetailProductInfo({ product }: IGetProductInfoParams): string {
		return `<b>${product.title}</b>\n\nЦена:<i>${product.price}</i>\n\n${product.description}`;
	}
}
