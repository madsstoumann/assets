/**
 * @function setModal
 * @param {Boolean} open
 * @description Prevents overflow/bounce on iOS devices when opening a modal. Requires custom prop `--scroll-y` set on root-element (html)
*/
export function setModal(open) {
	const body = document.body;
	const root = document.documentElement;
	const scrollY = open ? root.style.getPropertyValue('--scroll-y') || 0 : body.style.top;
	if (open) { root.style.scrollBehavior = 'auto'; }
	body.style.position = open ? 'fixed' : '';
	body.style.top = open ? `-${scrollY}px` : '';
	if (!open) {	
		window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
		root.style.scrollBehavior = 'smooth';
	}
}