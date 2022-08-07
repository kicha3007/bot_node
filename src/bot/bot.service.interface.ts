import { ILogger } from '../logger/logger.interface';
import { Scenes } from 'telegraf';
import { IMyContext } from '../common/common.interface';

export interface ICreateScenesProps {
	// TODO временно any, надо разобраться как типизировать
	scenes: {
		[key: string]: any;
	}[];
	logger: ILogger;
}

export interface IBotService {
	createScenes: (scenes: ICreateScenesProps) => Scenes.BaseScene<IMyContext>[];
	init: () => Promise<void>;
}
