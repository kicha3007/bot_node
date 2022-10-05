import { ISceneReplItem } from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../../constants';

export abstract class StartSceneTemplate {
	static getWelcomeGreeting(): ISceneReplItem[] {
		return [
			{
				message: MESSAGES.WELCOME,
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
