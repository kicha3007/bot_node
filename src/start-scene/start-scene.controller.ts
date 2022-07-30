import { Scenes } from 'telegraf';
import { BaseController } from '../common/base.controller';
import { IMyContext } from '../common/common.interface';

interface IStartSceneControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
}

export class StartSceneController extends BaseController {
	constructor({ scene }: IStartSceneControllerProps) {
		super(scene);
	}

	public enter(): void {
		this.scene.enter(async (ctx): Promise<void> => {
			await ctx.reply('Привет из стартовой сцены');
		});
	}

	public reply(res: string): void {
		this.scene.on('text', async (ctx) => {
			await ctx.reply(res);
		});
	}
}
