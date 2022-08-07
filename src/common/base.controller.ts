import { Scenes } from 'telegraf';
import { IMyContext } from './common.interface';
import { IHandler, IHandlerCommand } from './handlers.interface';
import { ILogger } from '../logger/logger.interface';
import { STEPS_NAMES } from '../constants';
import { checkHasData, instanceOfType } from '../utils';

interface IBaseControllerProps {
	scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	sceneNames: string[];
}

interface IGetNextSiblingStep {
	currentStepName: string;
	stepsNames: string[] | object;
	ctx: IMyContext;
}

interface IMoveNextScene {
	ctx: IMyContext;
	nextSceneName: string;
}

interface ISavePropertyToStorage {
	ctx: IMyContext;
	property: {
		[key: string]: string;
	};
}

interface IGetPropertyFromStorage {
	ctx: IMyContext;
	property: string;
}

export abstract class BaseController {
	protected readonly scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	sceneNames: string[];

	protected constructor({ scene, logger, sceneNames }: IBaseControllerProps) {
		this.scene = scene;
		this.logger = logger;
		this.sceneNames = sceneNames;
	}

	sendErrorCode(err: Error): void {
		throw err;
	}

	protected getPropertyFromStorage = ({
		ctx,
		property,
	}: IGetPropertyFromStorage): string | undefined => {
		// TODO подумать как улучшить типизацию
		if (property === 'city' || property === 'address') {
			const currentProperty = ctx.session[property];
			//TODO перепроверить правильность отлова ошибок
			try {
				checkHasData({
					data: currentProperty,
					message: `[getPropertyFromStorage] Ошибка получения свойства ${property}`,
				});

				return ctx.session[property];
			} catch (err) {
				if (err instanceof Error) {
					this.logger.error(err);
				}
			}
		}
	};

	protected savePropertyToStorage = ({ ctx, property }: ISavePropertyToStorage): void => {
		const [[key, value]] = Object.entries(property);

		// TODO подумать как улучшить типизацию
		if (key === 'city' || key === 'address') {
			ctx.session[key] = value;
		}
	};

	protected setBaseStep = (ctx: IMyContext, name: string = STEPS_NAMES.BASE_STEP): void => {
		ctx.session.currentStepName = name;
	};

	protected getCurrentStepName(ctx: IMyContext): string {
		return ctx.session.currentStepName;
	}

	protected getCurrentStepNameOrSetBaseName(ctx: IMyContext, name: string): string {
		if (!this.getCurrentStepName(ctx)) {
			this.setBaseStep(ctx, name);
		}

		return this.getCurrentStepName(ctx);
	}

	protected setNextStep(ctx: IMyContext, nextStep: string): void {
		if (ctx.session.currentStepName) {
			ctx.session.currentStepName = nextStep;
		}
	}

	protected async moveNextScene({ ctx, nextSceneName }: IMoveNextScene): Promise<void> {
		ctx.scene.leave();
		await ctx.scene.enter(nextSceneName);
	}

	getNextSceneName = async (ctx: IMyContext): Promise<string | void> => {
		return this.getNextSiblingStep({
			ctx,
			currentStepName: this.scene.id,
			stepsNames: this.sceneNames,
		});
	};

	protected async getNextSiblingStep({
		currentStepName,
		stepsNames,
	}: IGetNextSiblingStep): Promise<string | void> {
		try {
			let stepNamesList: string[] = [];

			if (Array.isArray(stepsNames)) {
				stepNamesList = stepsNames;
			} else {
				stepNamesList = Object.keys(stepsNames);
			}

			const currentStepIndex = stepNamesList.findIndex((stepName) => stepName === currentStepName);

			const countForNextStep = 1;
			const nextStepName = stepNamesList[currentStepIndex + countForNextStep];

			return nextStepName;
		} catch (err) {
			this.logger.error(`[getNextSiblingStep] Произошла ошибка ${err}`);
			throw new Error();
		}
	}

	protected getCurrentUserInfo(ctx: IMyContext): { id: number; username: string } {
		return ctx.from as { id: number; username: string };
	}

	protected bindActions(actions: Array<IHandler | IHandlerCommand>): void {
		for (const action of actions) {
			const handler = action.func.bind(this);

			if (instanceOfType<IHandlerCommand>(action, 'command')) {
				this.scene[action.method](action.command, handler);
			} else {
				this.scene[action.method](handler);
			}
		}
	}
}
