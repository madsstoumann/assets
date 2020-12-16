/**
 * @function stringToType
 * @param {Object} obj
 * @description Convert data-attribute value to type-specific value
 */
export function stringToType(obj) {
	const object = Object.assign({}, obj);
	Object.keys(object).forEach(key => {
		if (typeof object[key] === 'string' && object[key].charAt(0) === ':') {
			object[key] = JSON.parse(object[key].slice(1));
		}
	});
	return object;
}