/*
* @function focusable
* @param {Node} element
* @description Returns an array of focusable elements from a parent-element
* @returns Array
*/
export function focusable(element) {
	return Array.from(
		element.querySelectorAll(
			'button, [href], select, textarea, input:not([type="hidden"]), [tabindex]:not([tabindex="-1"])'
		)
	);
}