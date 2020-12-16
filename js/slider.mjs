/**
 * Slider
 * @requires /assets/js/common
 * @version 1.1.25
 * @summary 13-11-2020
 * @description Slider- and Tabs-functionality for Layout Block
 * @example
 * <section data-section-type="slider">
 */
import { h } from './common/h.mjs';
import { stringToType } from './common/stringToType.mjs';
export default class Slider {
	constructor(element, settings) {
		this.settings = Object.assign({
			autoPlay: 'false',
			clsBtnNext: 'c-lay__nav-btn',
			clsBtnPrev: 'c-lay__nav-btn',
			clsDot: 'c-lay__dot',
			clsDotCur: 'c-lay__dot--current',
			clsDotWrap: 'c-lay__dots',
			clsNav: 'c-lay__nav',
			clsNavInner: 'c-lay__nav-inner',
			clsTab: 'c-lay__tab',
			clsTabCur: 'c-lay__tab--current',
			clsTabsInner: 'c-lay__tabs-inner',
			clsTabsNav: 'c-lay__tabs-nav',
			clsTabsWrap: 'c-lay__tabs',
			lblGoToSlide: 'Go to slide',
			lblItemRole: 'slide',
			lblNext: 'Next',
			lblPrev: 'Prev',
			nav: '',
			scrollBehavior: 'smooth',
			varGap: '--lay-item-gap',
			varItemsPerPage: '--lay-items-per-page'
		}, stringToType(settings));

		this.slider = element;
		this.init();
	}

	/**
	 * @function addClsRemDelay
	 * @param {String} element
	 * @param {String} cls
	 * @param {Number} delay in milliseconds
	 * @description Adds a class to an element, removes it after a delay.
	 */
	addClsRemDelay(element, cls, delay) {
		element.classList.add(cls);
		window.setTimeout( () => {
			element.classList.remove(cls);
		}, delay);
	}

	/**
	 * @function getGap
	 * @description Return current gap-value
	 */
	getGap() {
		return getComputedStyle(this.slider).getPropertyValue(this.settings.varGap) || `20px`;
	}

	/**
	 * @function getItemsPerPage
	 * @description Return current items per page
	 */
	getItemsPerPage() {
		return getComputedStyle(this.slider).getPropertyValue(this.settings.varItemsPerPage) - 0 || 0;
	}

	/**
	 * @function handleScroll
	 * @description Updates pagination etc., when scroll-position change, either by next/prev-buttons or manual pointer-event.
	 */
	handleScroll() {
		const gap = this.slider.dataset.preview === 'next' ? this.state.gap : 0;
		const page = Math.round(this.elements.inner.scrollLeft / Math.floor((this.itemsPerPage * (this.state.itemWidth + gap))));
		this.state.page = (page + 1);

		if (!this.state.loop && this.hasArrows) {
			/* Set navigation buttons to disabled, if first or last */
			this.elements.next.toggleAttribute('disabled', this.state.page === this.state.pages);
			this.elements.prev.toggleAttribute('disabled', this.state.page === 1);
		}
		if (this.itemsPerPage === 1) {
			this.updateDots(page);
		}
	}

	/**
	 * @function init
	 * @description Creates elements, adds eventListeners
	 */
	init() {
		/* Get text-direction */
		this.dir = this.slider.dir || document.dir || 'ltr';
		this.isChrome = window.navigator.userAgent.indexOf("Chrome") > -1;
		
		this.hasArrows = this.settings.nav.includes('arrows');
		this.hasDots = this.settings.nav.includes('dots');
		this.hasScroll = this.settings.nav.includes('scroll');
		this.hasTabs = this.settings.nav.includes('tabs');

		/* Create elements */
		this.elements = {
			inner: this.slider.querySelector('[data-inner]'),
			nav: h('div', { class: this.settings.clsNav }, [h('div', { class: this.settings.clsNavInner })]),
			outer: this.slider.querySelector('[data-outer]')
		}

		this.elements.outer.insertBefore(this.elements.nav, this.elements.inner);

		/* Add navigation arrows */
		if (this.hasArrows) {
			this.elements.next = h('button', { class: this.settings.clsBtnNext, rel: 'next', 'aria-label': this.settings.lblNext }, [h('i')]);
			this.elements.prev = h('button', { class: this.settings.clsBtnPrev, rel: 'prev', 'aria-label': this.settings.lblPrev, disabled: 'disabled' }, [h('i')]);

			this.elements.nav.firstElementChild.appendChild(this.elements.prev);
			this.elements.nav.firstElementChild.appendChild(this.elements.next);

			this.elements.next.addEventListener('click', () => {
				this.state.page++;
				let scrollBehavior = 'smooth';
				if (this.state.page > this.state.pages) { 
					this.state.page = this.state.loop ? 1 : this.state.pages;
					if (this.state.loop) {
						scrollBehavior = 'auto';
						this.addClsRemDelay(this.elements.inner, 'a-fade-in-right', 500);
					}
				}
				this.scrollToPage(scrollBehavior);
			});
	
			this.elements.prev.addEventListener('click', () => {
				this.state.page--;
				let scrollBehavior = 'smooth';
				if (this.state.page < 1) { 
					this.state.page = this.state.loop ? this.state.pages : 1;
					if (this.state.loop) {
						scrollBehavior = 'auto';
						this.addClsRemDelay(this.elements.inner, 'a-fade-in-left', 500);
					}
				}
				this.scrollToPage(scrollBehavior);
			});
		}
		
		/* Add navigation dots */
		if (this.hasDots) {
			if (this.hasTabs) {
				const tabs = h('div', { class: this.settings.clsTabsWrap });
				this.elements.dots = h('div', { class: this.settings.clsTabsNav });
				tabs.appendChild(h('div', {class: this.settings.clsTabsInner}, [this.elements.dots]));
				this.elements.outer.insertBefore(tabs, this.elements.outer.firstElementChild);
			}
			else {
				this.elements.dots = h('div', { class: this.settings.clsDotWrap });
				this.elements.outer.appendChild(this.elements.dots);
			}
		}

		/* Detect resize: Add/remove dots and arrows */
		const resizeObserver = new ResizeObserver(() => {
			this.refreshSlider()
		});

		resizeObserver.observe(this.slider);

		/* Add eventListeners */
		let timeout = '';
		this.elements.inner.addEventListener('scroll', () => {
			if (timeout) {
				window.cancelAnimationFrame(timeout);
			}
			timeout = window.requestAnimationFrame(() => {
				this.handleScroll();
			});
		});
		this.slider.__refreshSlider = this.refreshSlider.bind(this);
		this.refreshSlider();

		/* Set aria-attributes */
		this.state.items.forEach((slide, index) => {
			slide.setAttribute('aria-label', `${this.settings.lblGoToSlide} ${index+1} / ${this.state.items.length}`);
			slide.setAttribute('aria-roledescription', this.settings.lblItemRole);
			slide.setAttribute('role', 'group');
		});

		/* Autoplay */
		if (this.settings.autoPlay && this.settings.autoPlay !== 'false' ) {
			this.elements.inner.setAttribute('aria-live', 'polite');
			window.setInterval( () => {
				this.state.page++;
				if (this.state.page > this.state.pages) { 
					this.state.page = 1;
				}
				this.scrollToPage();
			}, parseInt(this.settings.autoPlay, 10) || 3000);
		}
	}

	/**
	 * @function refreshSlider
	 * @description Run this method if/after slide-items are updated dynamically, to re-calculate state/dots etc.
	 */
	refreshSlider() {
		this.elements.nav.hidden = !(this.elements.inner.scrollWidth > this.elements.inner.clientWidth);
		this.itemsPerPage = this.getItemsPerPage();
		this.setState();
		if (this.hasDots) {
			if (this.itemsPerPage === 1) {
				this.renderNavigationDots();
			}
			this.updateDots(this.state.page-1);
		}
		if (this.state.loop) {
			this.elements.prev.removeAttribute('disabled');
		}
		this.scrollToPage();
	}

	/**
	 * @function renderNavigationDots
	 * @description Creates navigation dots
	 */
	renderNavigationDots() {
		this.dots = [];
		this.elements.dots.innerHTML = '';
		const headers = this.hasTabs ? [...this.elements.inner.querySelectorAll('[data-tab-header], h1, h2, h3, h4, h5, h6')] : [];
		for (let page = 0; page < this.state.pages; page++) {
			const label = this.hasTabs ? headers[page].dataset?.tabHeader || headers[page].innerText : '';
			const dot = h('button', { class: (this.hasTabs ? this.settings.clsTab : this.settings.clsDot), type: 'button', 'aria-label': `${this.settings.lblGoToSlide} ${page + 1}`, 'data-page': page + 1}, [label]);
			dot.addEventListener('click', () => {
				this.state.page = parseInt(dot.dataset.page, 10);
				this.scrollToPage();
			})
			this.dots.push(dot);
			this.elements.dots.appendChild(dot);
		}
	}

	/**
	 * @function scrollToPage
	 * @description Scrolls to `this.state.page`
	 */
	scrollToPage(scrollBehavior = this.settings.scrollBehavior) {
		let xPos;
		/* Scroll to center of page, calculate scroll using itemWidth */
		if (this.slider.dataset.preview === 'both') {
			xPos = (this.state.page - 1) * ((this.state.itemWidth - this.state.gap) * this.itemsPerPage);
		}
		/* Scroll to page, use page-based widths */
		else {
			xPos = (this.state.page - 1) * (this.itemsPerPage * (this.state.itemWidth + this.state.gap));
		}
		this.elements.inner.scrollTo({ left: xPos, behavior: scrollBehavior });
	}

	/**
	 * @function setState
	 * @description Creates/updates a state-object
	 */
	setState() {
		this.state = {
			gap: this.getGap().match(/(\d+)/)[0] - 0,
			items: [...this.elements.inner.children],
			itemWidth: this.elements.inner.firstElementChild?.offsetWidth || 0,
			loop: this.slider.dataset?.loop === 'true',
			page: 1,
			pages: Math.ceil(this.elements.inner.childElementCount / this.itemsPerPage) || 1
		}
	}

	/**
	 * @function updateDots
	 * @description Set current dot
	 */
	updateDots(page) {
		if (this.dots?.length) {
			this.dots.forEach((dot, index) => {
				dot.classList.remove(this.hasTabs ? this.settings.clsTabCur : this.settings.clsDotCur);
				if (index === page) {
					dot.classList.add(this.hasTabs ? this.settings.clsTabCur : this.settings.clsDotCur);
				}
			});
		}
	}
}