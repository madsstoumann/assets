/**
 * @function fetchContent
 * @param {NodeList} selector
 * @description Grabs async content from `data-fetch-from`-attributes, inserts innerHTML from matching `data-fetch-content`-attributes
*/
export function fetchContent(selector) {
	selector.forEach(item => {
		fetch(item.dataset.fetchFrom).then(response => {
			return response.text();
		}).then(html => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const content = doc.querySelector('[data-fetch-content]');
			if (content) {
				item.innerHTML = content.innerHTML;
			}
		}).catch(function (err) {
			console.warn('Could not fetch content: ', err);
		});
	})
}