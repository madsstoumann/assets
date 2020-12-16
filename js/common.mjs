/**
 * Common
 * @module common.mjs
 * @version 1.0.30
 * @summary 18-05-2020
 * @author Mads Stoumann
 * @description Generic, small helper-functions
 */

/**
 * @function arraySelector
 * @param {Array|NodeList|String} selector Array, NodeList or QuerySelector
 * @description returns an array from a Nodelist or QuerySelector
 * @reurns Array
 */
export function arraySelector(selector) {
	let array = selector;
	if (!Array.isArray(array)) {
		array =
			typeof selector === 'object'
				? selector.nodeName
					? [selector]
					: [...selector]
				: Array.from(document.querySelectorAll(selector));
	}
	return array;
}

/**
 * @function clickOutside
 * @param {Function} fn
 * @param {Node} element
 * @description Adds "outside element click handler"
 */
export function clickOutside(fn, element) {
	document.addEventListener('click', event => {
		fn(element.contains(event.target));
	});
}

export function debounced(delay, fn) {
	let timerId;
	return function(...args) {
		if (timerId) {
			clearTimeout(timerId);
		}
		timerId = setTimeout(() => {
			fn(...args);
			timerId = null;
		}, delay);
	};
}

/**
 * @function deSelect
 * @description Clears a selection
 */
export function deSelect() {
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	} else if (document.selection) {
		document.selection.empty();
	}
}

/**
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

/**
 * @function getCustomProp
 * @param {Node} element
 * @param {String} prop
 * @param {String} castAs
 * @description Returns a CSS Custom property
 * @returns String
 */
export function getCustomProp(element = document.documentElement, prop, castAs = 'string') {
	let response = getComputedStyle(element).getPropertyValue(prop);
	switch (castAs) {
		case 'number':
			return parseInt(response, 10);
		case 'float':
			return parseFloat(response, 10);
		case 'boolean':
			return response === 'true' || response === '1';
		default: break;
	}
	return response.trim();
}

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

/**
 * @function isIOS
 * @description Detects iOS
 * @returns Boolean
 */
export function isIOS() {
	return navigator.userAgent.match(/ipad|iphone/i);
}

/**
 * @function lazyLoad
 * @description Handle lazy loading of images and frames
 */
export function lazyLoad(selector = '[loading="lazy"]') {
	const medialist = Array.from(document.querySelectorAll(selector));
	const setMedia = media => {
		media.src = media.dataset.src;
		if (media.dataset.srcset) {
			media.srcset = media.dataset.srcset;
		}
	};
	if ('loading' in HTMLImageElement.prototype) {
		medialist.forEach(media => {return setMedia(media)});
	} else if ('IntersectionObserver' in window) {
		const loadLazy = target => {
			const io = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						setMedia(entry.target);
						observer.disconnect();
					}
				});
			});
			io.observe(target);
		};
		medialist.forEach(loadLazy);
	}
}

/**
 * @function loadScript
 * @param {String} src
 * @param {Boolean} [async]
 * @description Adds script-block
 */
export function loadScript(src, async = true) {
	const script = document.createElement('script');
	script.async = async;
	script.src = src;
	document.body.appendChild(script);
}

/**
 * @function mark
 * @param {string} item String with result
 * @param {string} term Selected search-term
 * @description Highlights instances of [term] within [item]
 * @return {String}
 */
export function mark(item, term) {
	const regExpEscape = str => {return str.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')};
	return term.trim() === ''
		? item
		: item.replace(RegExp(regExpEscape(term.trim()), 'gi'), '<mark>$&</mark>');
}

/**
 * @function mergeArrayOfObjects
 * @param {Array} arr1
 * @param {Array} arr2
 * @param {String} key
 * @description Creates a selection-range
 */
export function mergeArrayOfObjects(arr1, arr2, key) {
	return Object.values(arr1.concat(arr2).reduce((r,o) => {
		r[o[key]] = o;
		return r;
	},{}));
}

/**
 * @function replaceTagInString
 * @param {String} str
 * @param {String} oldTag
 * @param {String} newTag
 * @description Creates a selection-range
 */
export function replaceTagInString(str, oldTag, newTag) {
	const start = new RegExp(`<${oldTag}`, "gi");
	const end = new RegExp(`</${oldTag}`, "gi");
	return str.replace(start, `<${newTag}`).replace(end, `</${newTag}`);
}

	/**
	* @function scrollPosition
	* @description Returns the current scrollPosition
	* @return {number}
	*/
	export function scrollPosition() {
		return (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
	}

/**
 * @function selectAll
 * @param {Node} element
 * @description Creates a selection-range
 */
export function selectAll(element) {
	const range = document.createRange();
	range.selectNodeContents(element);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	element.setSelectionRange(0, 999999);
}

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

/**
 * @function syntaxHighlight
 * @param {String} str pre-formatted JSON-string
 * @description Adds wrapper-classes to individual parts in a JSON (object)
 * @returns String
 */
export function syntaxHighlight(str) {
	let json = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		let cls = 'code--number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'code--key';
			} else {
				cls = 'code--string';
			}
		} else if (/true|false/.test(match)) {
			cls = 'code--boolean';
		} else if (/null/.test(match)) {
			cls = 'code--null';
		}
		return `<span class="${cls}">${match}</span>`;
	});
}

/**
 * @function uuid
 * @description DOM-factory
 * @returns String
 */
export function uuid() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
		{return (
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16)}
	);
}
