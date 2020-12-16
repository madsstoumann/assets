/**
 * @function addDocumentScroll
 * @param {Function} callback
 * @description Adds a scroll-listener to documentElement, adding three custom CSS-props while scrolling: 
 * --scroll-d Boolean indicating scroll direction: 1 (down), 0 (up). To simulate `not`, use: --top: calc(1 - var(--scroll-d));
 * --scroll-p Current vertical scroll position in percent (deducting innerHeight from scrollHeight)
 * --scroll-y Current vertical scroll position in absolute unit (pixels)
 */
export function addDocumentScroll(callback) {
	let ticking = false;
	let scrollYcur = 0;
	let scrollY = 0;
	window.addEventListener('scroll', () => {
		scrollY = window.scrollY;
		/* Prevent a negative scroll-value (on iOS):  */
		if (scrollY < 0) { scrollY = 0; }

		if (!ticking) {
			window.requestAnimationFrame(() => {
				document.documentElement.style.setProperty('--scroll-d', scrollYcur < scrollY ? 1 : 0);
				document.documentElement.style.setProperty('--scroll-y', scrollY);
				document.documentElement.style.setProperty('--scroll-p', `${(scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%`);
				if (typeof callback === 'function') {
					callback();
				}
				scrollYcur = scrollY;
				ticking = false;
			});
			ticking = true;
		}
	})
}