import { Context, Scenes } from 'telegraf';

interface IMySessionScene extends Scenes.SceneSessionData {
	myProps: string;
}

interface IMySession extends Scenes.SceneSession<IMySessionScene> {
	currentStepName: string | null;
}

export interface IMyContext extends Context {
	props: string;
	session: IMySession;
	scene: Scenes.SceneContextScene<IMyContext, IMySessionScene>;
}
