import { IButtons, IGetProductInfoParams, IInlineButton } from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../../constants';

export class CatalogSceneTemplate {
	static getInlineButtons({ countMessage = '' } = {}): IInlineButton[][] {
		return [
			[
				{
					message: MESSAGES.DETAIL_DESCRIPTION,
					callback: MESSAGES.DETAIL_DESCRIPTION,
				},
			],
			[
				{
					message: MESSAGES.PREV,
					callback: MESSAGES.PREV,
				},
				{ message: countMessage, callback: MESSAGES.COUNT_PRODUCT_IN_LIST },
				{ message: MESSAGES.NEXT, callback: MESSAGES.NEXT },
			],
			[{ message: MESSAGES.ADD_TO_CART, callback: MESSAGES.ADD_TO_CART }],
		];
	}

	static getButtons(): IButtons {
		return {
			title: MESSAGES.NAVIGATION_TITLE,
			items: [[MESSAGES.MY_ORDERS, MESSAGES.CATALOG]],
		};
	}

	static getProductInfo({ product }: IGetProductInfoParams): string {
		return `<b>${product.title}</b>\n\nЦена: <i>${product.price}</i>`;
	}
}
