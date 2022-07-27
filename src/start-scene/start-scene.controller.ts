import { Scenes } from 'telegraf';
import { BaseController } from '../common/base.controller';
import { IMyContext } from '../common/common.interface';

export class StartSceneController extends BaseController {
	constructor(scene: Scenes.BaseScene<IMyContext>) {
		super(scene);
	}

	public enter(): void {
		console.log('enter');
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
