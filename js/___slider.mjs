/**
 * Slider module.
 * @module /assets/js/slider
 * @requires /assets/js/common
 * @version 1.0.16
 * @summary 16-02-2020
 * @description Content-slider
 * @example
 * <section data-js="slider">
 */

import { debounced, h, stringToType } from './common.mjs';

export default class Slider {
	constructor(element, settings) {
		this.settings = Object.assign({
			align: '',
			breakpoints: [],
			clsBtnNext: 'c-lay__nav-btn',
			clsBtnPrev: 'c-lay__nav-btn',
			clsDot: 'c-lay__dot',
			clsDotCur: 'c-lay__dot--current',
			clsDotWrap: 'c-lay__dots',
			clsItemLeft: 'c-lay__item--left',
			clsItemRight: 'c-lay__item--right',
			clsNav: 'c-lay__nav',
			clsNavInner: 'c-lay__nav-inner',
			clsOverflow: 'c-lay__inner--overflow',
			itemsPerPage: 1,
			lblItemRole: 'slide',
			lblNext: 'Next',
			lblPrev: 'Prev',
			lblRole: 'carousel',
			loop: false,
			scrollBehavior: 'smooth',
			varGap: '--lay-gap'
		}, stringToType(settings));

		this.slider = element;
		this.initSlider();
	}

	/**
 * @function initSlider
 * @description Creates elements, adds eventListeners
 */
	initSlider() {
		/* Get text-direction */
		this.dir = this.slider.dir || document.dir || 'ltr';
		this.isChrome = window.navigator.userAgent.indexOf("Chrome") > -1;
		this.isTouch = ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);


		/* TODO */
		try {
		this.itemsPerPage = this.settings.layoutDesktop.split(':').length;
		console.log(this.itemsPerPage);
	}
	catch(err) {}

		/* Create elements */
		this.elements = {
			dots: h('nav', { class: this.settings.clsDotWrap }),
			inner: this.slider.querySelector('[data-inner]'),
			nav: h('nav', { class: this.settings.clsNav }, [h('div', { class: this.settings.clsNavInner })]),
			next: h('button', { class: this.settings.clsBtnNext, rel: 'next' }, [this.settings.lblNext]),
			outer: this.slider.querySelector('[data-outer]'),
			prev: h('button', { class: this.settings.clsBtnPrev, rel: 'prev' }, [this.settings.lblPrev])
		}
console.log(this.elements)
		/* Add eventListeners */
		this.elements.next.addEventListener('click', () => {
			this.state.page++;
			if (this.state.page > this.state.pages) { 
				this.state.page = this.settings.loop ? 1 : this.state.pages;
			}
			this.scrollToPage();
		});

		this.elements.prev.addEventListener('click', () => {
			this.state.page--;
			if (this.state.page < 1) { 
				this.state.page = this.settings.loop ? this.state.pages : 1;				
			}
			this.scrollToPage();
		});

		this.elements.inner.addEventListener('scroll', debounced(200, () => { this.handleScroll()}));

		this.elements.nav.firstElementChild.appendChild(this.elements.prev);
		this.elements.nav.firstElementChild.appendChild(this.elements.next);
		this.elements.outer.insertBefore(this.elements.nav, this.elements.inner);
		this.slider.appendChild(this.elements.dots);
		this.slider.refreshSlider = this.refreshSlider.bind(this);

		if (!this.isTouch) {
			this.elements.inner.classList.add(this.settings.clsOverflow);
			/* TODO: Hide dots/arrows settings */
		}

		this.refreshSlider();

		/* Set aria-attributes */
		this.elements.inner.setAttribute('aria-live', 'polite');
		this.slider.setAttribute('aria-roledescription', this.settings.lblRole);
		this.state.items.forEach((slide, index) => {
			slide.setAttribute('aria-label', `${index+1}/${this.state.itemLen}`);
			slide.setAttribute('aria-roledescription', this.settings.lblItemRole);
			slide.setAttribute('role', 'group');
		});

		/* Intersection Observer */
		// let IO = new IntersectionObserver((entries) => { 
		// 	entries.forEach(entry => {
		// 		if (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.5) {
		// 			console.log(entry.target)
		// 		}
		// 		if (entry.intersectionRatio >= 0.8) {
		// 			const page = Math.ceil(parseInt(entry.target.dataset.item, 10) / this.settings.itemsPerPage);
		// 			if (page !== this.state.page) {
		// 				this.state.page = page;
		// 				this.slider.dataset.page = this.state.page;

						
					
		// 				this.dots.forEach((dot, index) => {
		// 					dot.classList.toggle(this.settings.clsDotCur, index + 1 === this.state.page);
		// 				});
		// 				console.log(this.state.page);
		// 			}
		// 		}
		// 	});
		// }, {
		// 	root: this.elements.inner,
		// 	rootMargin: '0px',
		// 	threshold: 0.8
		// });

		// this.state.items.forEach((item, index) => {
		// 	item.dataset.item = index + 1;
		// 	IO.observe(item);
		// });

		/* Breakpoints */
		// const len = this.settings.breakpoints.length;
		// if (len) {
		// 	this.breakpoints = [];
		// 	this.settings.breakpoints.forEach((item, index) => {
		// 		const [breakpoint, itemsPerPage] = item.toString().split('.');
		// 		const max = index === len-1 ? screen.width : Math.floor(this.settings.breakpoints[index + 1]) - 1;
		// 		const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px) and (max-width: ${max}px)`);
		// 		mediaQuery.addListener(this.updateItemsPerPage.bind(this, itemsPerPage-0))
		// 		this.breakpoints.push(mediaQuery);
		// 		this.updateItemsPerPage(itemsPerPage-0);
		// 	});
		// }
	}

	handleScroll() {
		// const page = this.elements.inner.scrollLeft;
		// TODO : Multiply itemWidth with itemsPerPage!
		console.log(Math.round(this.elements.inner.scrollLeft / Math.floor(this.state.itemWidth)) + 1)
		// console.log(Math.round(this.elements.inner.scrollLeft / this.elements.inner.offsetWidth )+1);
	}
	/**
	 * @function refreshSlider
	 * @description Run this method if/after slide-items are updated dynamically, to re-calculate state/dots etc.
	 */
	refreshSlider() {
		this.setState();
		this.setNavigationDots();
		this.setVisibility();
		this.scrollToPage();
	}

	/**
 * @function scrollToPage
 * @description Scrolls to `this.state.page`
 */
	scrollToPage() {
		let xPos;

		/* Scroll to center of page, calculate scroll using itemWidth */
		if (this.settings.align === 'center') {
			if (this.dir === 'ltr') {
				if (this.settings.itemsPerPage === 1) {
					xPos = (this.state.page - 1) * (this.state.itemWidth * this.settings.itemsPerPage);
					console.log('fix in safari');
				}
				else {
					xPos = (this.state.page - 1) * (this.state.itemWidth * this.settings.itemsPerPage) - (this.state.gap * this.settings.itemsPerPage);
				}
			}
			else {
				/* Firefox and Safari handles scrollLeft with negative values, when using `dir="rtl"` */
				if (this.isChrome) {
					xPos = this.elements.inner.scrollWidth - (this.state.page * (this.state.itemWidth * this.settings.itemsPerPage));
				}
				else {
					xPos = 0 - (this.state.page - 1) * (this.state.itemWidth * this.settings.itemsPerPage);
				} 
			}

			/* Iterate scrollItems - toggle classes for partial viewable slides */
			this.state.items.forEach((item, index) => {
				const lastPageIem = (this.state.page * this.settings.itemsPerPage);
				const partlyRight = index === lastPageIem;
				const partlyLeft = (lastPageIem > this.state.itemLen) ?
					index === this.state.itemLen - (this.settings.itemsPerPage + 1) :
					index === lastPageIem - (this.settings.itemsPerPage + 1);
				item.classList.toggle(this.settings.clsItemLeft, partlyLeft);
				item.classList.toggle(this.settings.clsItemRight, partlyRight);
			});
		}

		/* Scroll to page, use page-based widths */
		else {
			if (this.dir === 'ltr') {
				xPos = (this.state.page - 1) * (this.elements.inner.offsetWidth + this.state.gap);
			} else {
				if (this.isChrome) {
					xPos = this.elements.inner.scrollWidth - (this.state.page) * this.elements.inner.offsetWidth;
				}
				else {
					xPos = 0 - (this.state.page - 1) * this.elements.inner.offsetWidth;

				}
			}
		}

		this.elements.inner.scrollTo({ left: xPos, behavior: this.settings.scrollBehavior });
// console.log({ left: xPos, behavior: this.settings.scrollBehavior })
		if (!this.settings.loop) {
			/* Set navigation buttons to disabled, if beginning or end */
			this.elements.next.toggleAttribute('disabled', this.state.page === this.state.pages);
			this.elements.prev.toggleAttribute('disabled', this.state.page === 1);
		}

		this.slider.dataset.page = this.state.page;

		/* Iterate navigation dots, set current */
		// this.dots.forEach((dot, index) => {
		// 	dot.classList.toggle(this.settings.clsDotCur, index + 1 === this.state.page);
		// });
	}

	/**
 * @function setNavigationDots
 * @description Creates navigation dots
 */
	setNavigationDots() {
		this.dots = [];
		this.elements.dots.innerHTML = '';
		for (let page = 1; page <= this.state.pages; page++) {
			const dot = h('button', { class: this.settings.clsDot, type: 'button', 'data-page': page});
			dot.addEventListener('click', () => {
				this.state.page = parseInt(dot.dataset.page, 10);
				this.scrollToPage();
			})
			this.dots.push(dot);
			this.elements.dots.appendChild(dot);
		}
	}

	/**
 * @function setState
 * @description Creates/updates a state-object
 */
	setState() {
		/*TODO: Create getGap-method */
		this.state = {
			gap: getComputedStyle(this.slider).getPropertyValue(this.settings.varGap).match(/(\d+)/)[0] - 0,
			items: [...this.elements.inner.children],
			itemLen: this.elements.inner.childElementCount,
			itemWidth: this.elements.inner.scrollWidth / this.elements.inner.childElementCount,
			page: 1,
			pages: Math.ceil(this.elements.inner.childElementCount / this.settings.itemsPerPage) || 1
		}
		this.slider.dataset.itemsPerPage = `:${this.settings.itemsPerPage}`;
	}

	/**
 * @function setVisibility
 * @description Hides navigation and dots if itemLen < itemsPerPage
 */
	setVisibility() {
		const hide = this.state.itemLen <= this.settings.itemsPerPage;
		this.elements.dots.hidden = hide;
		this.elements.nav.hidden = hide;
	}

/**
	 * @function updateItemsPerPage
	 * @description Updates items per page on matchMedia-match
	 */
	updateItemsPerPage(itemsPerPage) {
		this.breakpoints.forEach((breakpoint) => {
			if (breakpoint.matches) {
				this.settings.itemsPerPage = itemsPerPage;
				this.refreshSlider();
				// eslint-disable-next-line
				console.log(itemsPerPage);
			}
		});
	}
}