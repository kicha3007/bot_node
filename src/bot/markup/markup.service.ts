import { SCENES_NAMES, MESSAGES, STEPS_NAMES } from '../../constants';
import { IMarkupService, IMarkup, IMarkupSteps } from './markup.service.inteface';
import { ISceneInfo } from './markup.controller.interface';
import { MARKUP_TYPES } from '../../constants';

export class MarkupService implements IMarkupService {
	markup(): IMarkup {
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
				[STEPS_NAMES.BASE_STEP]: (): ISceneInfo => {
					return {
						inlineButtons: {
							title: 'каталог',
							items: [
								[
									{
										message: 'PREV',
										callback: 'prev',
									},
									{ message: 'count', callback: 'count' },
									{ message: 'NEXT', callback: 'f' },
								],
								[
									{
										message: 'Назад',
										callback: 'back',
									},
									{ message: 'В корзину', callback: 'inCart' },
								],
							],
						},
						buttons: {
							title: 'Навигация',
							items: [
								['Мои заказы', 'Каталог товаров'],
								['Доставка', 'FAQ'],
							],
						},
					};
				},
			},
		};
	}

	getCurrentMarkup(currentSceneName: string): IMarkupSteps {
		const markup: IMarkup = this.markup();
		return markup[currentSceneName];
	}

	getSceneNames(): string[] {
		const markup: IMarkup = this.markup();
		return Object.keys(markup);
	}
}
