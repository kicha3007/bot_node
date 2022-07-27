import { Scenes } from 'telegraf';
import { IMyContext } from './common.interface';

export abstract class BaseController {
	protected readonly scene: Scenes.BaseScene<IMyContext>;

	protected constructor(scene: Scenes.BaseScene<IMyContext>) {
		this.scene = scene;
	}
}
