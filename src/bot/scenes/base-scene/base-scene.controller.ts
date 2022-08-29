import { Scenes } from 'telegraf';
import { IMyContext } from '../../common/common.interface';
import { ILogger } from '../../../infrastructure/logger/logger.interface';
import { MESSAGES, SCENES_NAMES, STEPS_NAMES } from '../../../constants';
import { checkHasData, instanceOfType } from '../../../utils';
import {
	IGetPropertyFromStorage,
	ISavePropertyToStorage,
	IMoveNextScene,
	IGetNextSiblingStep,
	IBaseControllerProps,
	IHandlerBase,
	IHandlerAction,
	IHandlerCustomAction,
} from './base-scene.interface';
import {
	IUsersRepository,
	UserFindReturn,
} from '../../../domains/users/users.repository.interface';
import { IActionController } from '../catalog-scene/catalog-scene.interface';

export abstract class BaseController {
	protected readonly scene: Scenes.BaseScene<IMyContext>;
	logger: ILogger;
	sceneNames: string[];
	usersRepository: IUsersRepository;

	protected constructor({ scene, logger, sceneNames, usersRepository }: IBaseControllerProps) {
		this.scene = scene;
		this.logger = logger;
		this.sceneNames = sceneNames;
		this.usersRepository = usersRepository;

		this.bindActions([{ method: 'on', action: 'text', func: this.onAnswer }]);
	}

	async goToCart(ctx: IMyContext): Promise<void> {
		console.log('goToCart');
		await this.moveNextScene({
			ctx,
			nextSceneName: SCENES_NAMES.CART,
		});
	}

	protected getPropertyFromStorage = ({
		ctx,
		property,
	}: IGetPropertyFromStorage): string | undefined => {
		try {
			const currentProperty = ctx.session[property];

			checkHasData({
				data: currentProperty,
				message: `[getPropertyFromStorage] Ошибка получения свойства ${property}`,
			});

			return currentProperty as string;
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error(err);
			}
		}
	};

	protected savePropertyToStorage = <T extends string | number | object>({
		ctx,
		property,
	}: ISavePropertyToStorage<T>): void => {
		const [[key, value]] = Object.entries(property);

		if (<string>key) {
			ctx.session[key] = value as T;
		}
	};

	protected setBaseStep = (ctx: IMyContext, name: string = STEPS_NAMES.BASE_STEP): void => {
		ctx.session.currentStepName = name;
	};

	protected getCurrentStepName(ctx: IMyContext): string {
		return (ctx.session?.currentStepName as string) || '';
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

	protected getNextSceneName = async (ctx: IMyContext): Promise<string | void> => {
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

	protected async getCurrentUser(ctx: IMyContext): UserFindReturn {
		const { id } = this.getCurrentUserInfo(ctx);
		return this.usersRepository.find({ id });
	}

	async actionsController({ ctx, message }: IActionController): Promise<void> {
		switch (message) {
			case MESSAGES.MY_ORDERS: {
				/*await ctx.deleteMessage();*/
				await this.goToCart(ctx);
				break;
			}
			case MESSAGES.CATALOG: {
				await ctx.scene.reenter();
				break;
			}
			default:
				await ctx.reply('Нам пока не нужны эти данные. Спасибо.');
		}
	}

	protected async onAnswer(ctx: IMyContext): Promise<void> {
		console.log('baseSceneAnswer');
		if (ctx.message) {
			// TODO Пока так решил проблему с типизацией text в message
			const message = 'text' in ctx.message && ctx.message.text;
			if (message) {
				await this.actionsController({ ctx, message });
			}
		}
	}

	protected bindActions(
		actions: Array<IHandlerBase | IHandlerAction | IHandlerCustomAction>,
	): void {
		for (const action of actions) {
			const handler = action.func.bind(this);

			if (instanceOfType<IHandlerAction>(action, 'action')) {
				this.scene[action.method](action.action, handler);
			} else if (instanceOfType<IHandlerCustomAction>(action, 'customAction')) {
				this.scene[action.method](action.customAction, handler);
			} else {
				this.scene[action.method](handler);
			}
		}
	}
}
