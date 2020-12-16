/**
 * @function setPage
 * @param {String} key
 * @param {String} value
 * @param {String} title
 * @description Updates search-params in a url - Sets a `virtual page`.
*/
export function setPage(key, value = '', title = document.title) {
	const params = new URLSearchParams(location.search);
	const url = new URL(location.href);

	history.scrollRestoration = 'manual';

	if (value) {
		params.append(key, value);
		url.search = params.toString();
		history.pushState({page: value}, title, url);
	}
	else {
		params.delete(key);
		url.search = params.toString();
		history.replaceState({page: ''}, title, url);
	}
}