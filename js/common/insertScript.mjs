/**
 * @function insertScript
 * @param {String} src
 * @param {Boolean} [async]
 * @description Adds script-block
 */
export function insertScript(src, async = true) {
	const script = document.createElement('script');
	script.async = async;
	script.src = src;
	document.head.appendChild(script);
}