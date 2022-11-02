import { ISceneReplItem } from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../constants';

export abstract class StartSceneTemplate {
	static getWelcomeGreeting(): ISceneReplItem[] {
		return [
			{
				message: MESSAGES.WELCOME,
			},
		];
	}
}
