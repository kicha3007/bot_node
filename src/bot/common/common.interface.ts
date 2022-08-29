import { Context, Scenes } from 'telegraf';

interface IMySessionScene extends Scenes.SceneSessionData {
	myProps: string;
}

interface IMySession<T = string> extends Scenes.SceneSession<IMySessionScene> {
	[key: string]: T | number | object;
}

export interface IMyContext extends Context {
	props: string;
	session: IMySession;
	scene: Scenes.SceneContextScene<IMyContext, IMySessionScene>;
}
