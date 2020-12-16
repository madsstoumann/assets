/**
 * @function h
 * @param {String} type
 * @param {Array | Object} attributes
 * @param {Array} [children]
 * @description DOM-factory
 * @returns Node
 */
export function h(type, attributes, children = []) {
	const element = document.createElement(type);
	for (let key in attributes) {
		element.setAttribute(key, attributes[key]);
	}
	if (children.length) {
		children.forEach(child => {
			if (typeof child === 'string') {
				element.appendChild(document.createTextNode(child));
			} else {
				element.appendChild(child);
			}
		});
	}
	return element;
}