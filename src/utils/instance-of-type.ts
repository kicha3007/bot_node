export const instanceOfType = <T extends Object>(object: Object, property: string): object is T => {
	return property in object;
};
