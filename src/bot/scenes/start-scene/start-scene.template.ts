import { ISceneReplItem } from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../../constants';

export abstract class StartSceneTemplate {
	static getWelcomeGreeting(): ISceneReplItem[] {
		return [
			{
				message:
					'Приветсвую в магазине гелевых шаров <b>GreenSharik </b>\n\n' +
					'Все самое лучшее у нас, покупай, поторапливайся!',
			},
		];
	}

	static getCityRequest(): ISceneReplItem[] {
		return [
			{
				message: MESSAGES.SET_YOUR_CITY,
			},
		];
	}

	static getAddressRequest(): ISceneReplItem[] {
		return [
			{
				message: MESSAGES.SET_YOUR_ADDRESS,
			},
		];
	}
}
