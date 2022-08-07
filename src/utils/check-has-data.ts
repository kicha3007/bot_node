interface ICheckHasData {
	data: unknown;
	message: string;
}

const DEFAULT_MESSAGE = 'данные не найдены';
export const checkHasData = ({ data, message = DEFAULT_MESSAGE }: ICheckHasData): void => {
	if (!data) {
		throw new Error(message);
	}
};