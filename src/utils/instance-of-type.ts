export const instanceOfType = <T>(object: Object, property: string): object is T => {
	return property in object;
};
