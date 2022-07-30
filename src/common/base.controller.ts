import { Scenes } from 'telegraf';
import { IMyContext } from './common.interface';
import { IHandlers } from './handlers.interface';
import { ILogger } from '../logger/logger.interface';
import { keyboard } from 'telegraf/typings/markup';

interface IBaseControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
}

export abstract class BaseController {
	protected readonly scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;

	protected constructor({ scene, logger }: IBaseControllerProps) {
		this.scene = scene;
		this.logger = logger;
	}

	/*	get getScene() {
		return this.scene;
	}*/

	protected bindActions(actions: IHandlers[]): void {
		for (const action of actions) {
			const handler = action.func.bind(this);
			if (action.command) {
				this.scene[action.method](action.command, handler);
			} else {
				// @ts-ignore
				this.scene[action.method](handler);
			}
		}

		/*	this.scene.enter(async (ctx): Promise<void> => {
			await ctx.reply('Привет из стартовой сцены');
		});*/
	}
}
