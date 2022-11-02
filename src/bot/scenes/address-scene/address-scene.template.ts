import { ISceneReplItem } from '../base-scene/base-scene.interface';
import { MESSAGES } from '../../constants';

export abstract class AddressSceneTemplate {
	static getAddressRequest(): ISceneReplItem[] {
		return [
			{
				message: MESSAGES.SET_YOUR_ADDRESS,
			},
		];
	}
}
