import {
	ICartGetInlineButtonsParam,
	IGetProductInfoParams,
	IInlineButton,
	ISceneReplItem,
} from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../../constants';

export class CartSceneTemplate {
	static getInlineButtons({
		countMessage = '',
		messagePay,
		productCount,
		productSum,
	}: ICartGetInlineButtonsParam): IInlineButton[][] {
		return [
			[
				{
					message: productSum,
					callback: MESSAGES.PRODUCT_SUM,
				},
			],
			[
				{
					message: MESSAGES.REMOVE_PRODUCT,
					callback: MESSAGES.REMOVE_PRODUCT,
				},
				{
					message: MESSAGES.DECREMENT_PRODUCT_COUNT,
					callback: MESSAGES.DECREMENT_PRODUCT_COUNT,
				},
				{
					message: productCount,
					callback: MESSAGES.CURRENT_PRODUCT_COUNT,
				},
				{
					message: MESSAGES.INCREMENT_PRODUCT_COUNT,
					callback: MESSAGES.INCREMENT_PRODUCT_COUNT,
				},
			],
			[
				{
					message: MESSAGES.PREV,
					callback: MESSAGES.PREV,
				},
				{ message: countMessage, callback: MESSAGES.AMOUNT_TITLES },
				{ message: MESSAGES.NEXT, callback: MESSAGES.NEXT },
			],
			[{ message: messagePay, callback: MESSAGES.TO_PAY }],
		];
	}

	static getEmptyCart(): ISceneReplItem[] {
		return [
			{
				message: MESSAGES.EMPTY_CART,
			},
		];
	}

	static getCartProductInfo({ product }: IGetProductInfoParams): string {
		return `<b>${product.title}</b>\n\nЦена: <i>${product.price}</i>`;
	}
}
