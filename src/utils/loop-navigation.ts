interface ILoopNavigation {
	nextPosition: number;
	itemsLength: number;
}

export const loopNavigation = ({ nextPosition, itemsLength }: ILoopNavigation): number => {
	let currentPosition: number;

	if (nextPosition <= 0) {
		currentPosition = itemsLength;
	} else if (nextPosition > itemsLength) {
		currentPosition = 1;
	} else {
		currentPosition = nextPosition;
	}

	return currentPosition;
};
