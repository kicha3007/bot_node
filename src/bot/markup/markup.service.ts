import { MARKUP_TYPES, MESSAGES, SCENES_NAMES, STEPS_NAMES } from '../../constants';
import { IMarkupService, IMarkupSteps, type Markup } from './markup.service.inteface';
import { InlineButtonsMode, ISceneInfo } from './markup.controller.interface';

export class MarkupService implements IMarkupService {
	markup(): Markup {
		return {
			[SCENES_NAMES.START]: {
				// TODO сделано функциями, так как возможно сюда буду
				//  передавать информацио для отрисовки, на надо ещё подумать как лушче сделать
				[STEPS_NAMES.SET_CITY]: (): ISceneInfo => {
					return {
						replies: [
							{
								type: MARKUP_TYPES.HTML,
								message:
									'Приветсвую в магазине гелевых шаров <b>GreenSharik </b>\n\n' +
									'Все самое лучшее у нас, покупай, поторапливайся!',
							},
							{ type: MARKUP_TYPES.TEXT, message: MESSAGES.SET_YOUR_CITY },
						],
					};
				},
				[STEPS_NAMES.SET_ADDRESS]: (): ISceneInfo => {
					return {
						replies: [{ type: MARKUP_TYPES.TEXT, message: MESSAGES.SET_YOUR_ADDRESS }],
					};
				},
			},
			[SCENES_NAMES.CATALOG]: {
				[STEPS_NAMES.BASE_STEP]: ({
					countMessage = '',
					caption = '',
					image = '',
					mode = 'create',
					messageId,
				} = {}): ISceneInfo => {
					return {
						inlineButtons: {
							type: 'photo',
							mode: mode as InlineButtonsMode,
							info: { caption, image },
							messageId,
							items: [
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
									{ message: countMessage, callback: 'count' },
									{ message: MESSAGES.NEXT, callback: MESSAGES.NEXT },
								],
								[
									{
										message: 'Назад',
										callback: 'back',
									},
									{ message: MESSAGES.ADD_TO_CART, callback: MESSAGES.ADD_TO_CART },
								],
							],
						},
					};
				},
				[STEPS_NAMES.SET_BUTTONS]: (): ISceneInfo => {
					return {
						buttons: {
							title: 'Навигация',
							items: [
								[MESSAGES.MY_ORDERS, MESSAGES.CATALOG],
								// TODO позже добавить текстовые сцены
								['Доставка', 'FAQ'],
							],
						},
					};
				},
			},
			[SCENES_NAMES.DETAIL]: {
				[STEPS_NAMES.BASE_STEP]: ({
					caption = '',
					image = '',
					mode = 'edit',
					messageId,
				} = {}): ISceneInfo => {
					return {
						inlineButtons: {
							type: 'photo',
							mode: mode as InlineButtonsMode,
							info: { caption, image },
							messageId,
							items: [
								[
									{
										message: MESSAGES.BACK_TO_CATALOG,
										callback: MESSAGES.BACK_TO_CATALOG,
									},
								],
							],
						},
					};
				},
			},
			[SCENES_NAMES.CART]: {
				[STEPS_NAMES.BASE_STEP]: ({
					countMessage = '',
					caption = '',
					image = '',
					mode = 'create',
					messageId,
					productSum,
					productCount,
					messagePay,
				} = {}): ISceneInfo => {
					return {
						inlineButtons: {
							type: 'photo',
							mode: mode as InlineButtonsMode,
							info: { caption, image },
							messageId,
							items: [
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
							],
						},
					};
				},
			},
		};
	}

	getCurrentMarkup(currentSceneName: string): IMarkupSteps {
		const markup: Markup = this.markup();
		return markup[currentSceneName];
	}

	getSceneNames(): string[] {
		const markup: Markup = this.markup();
		return Object.keys(markup);
	}
}
