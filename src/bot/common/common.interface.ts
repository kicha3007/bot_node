import { Context, Scenes } from 'telegraf';

interface IMySessionScene extends Scenes.SceneSessionData {
	myParams: Record<string, string | undefined>;
}

interface IMySession extends Scenes.SceneSession<IMySessionScene> {
	mySession: Record<string, string | undefined>;
}

export interface IMyContext extends Context {
	props: string;
	session: IMySession;
	scene: Scenes.SceneContextScene<IMyContext, IMySessionScene>;
}
