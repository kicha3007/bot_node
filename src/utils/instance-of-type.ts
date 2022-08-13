export const instanceOfType = <T>(object: any, property: string): object is T => {
	console.log('property', property);
	console.log('object', object);
	console.log('property in object', property in object);
	return property in object;
};
