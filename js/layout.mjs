/**
 * Layout module.
 * @module /assets/js/layout
 * @requires /assets/js/common
 * @version 1.1.22
 * @summary 07-11-2020
 * @description Helper-functions for Layout Block
 */

import { h } from './common/h.mjs';
import { addDocumentScroll } from './common/addDocumentScroll.mjs';
import { isTouch } from './const/isTouch.mjs';
import { setModal } from './common/setModal.mjs';
import { setPage } from './common/setPage.mjs';
import { stringToType } from './common/stringToType.mjs';
import KeyHandler from './keyhandler.mjs';

export default class Layout {
	constructor(settings) {
		this.settings = Object.assign({
			clsInnerPage: 'c-lay__inner--page',
			clsItemPage: 'c-lay__item--page'
		}, stringToType(settings));
		this.init();
	}

	/**
	 * @function ebook
	 * @param {NodeList} selector
	 * @description Swipe an article like an ebook, recalculates "pages" based on columns, see: `data-item-type="ebook"`.
	*/
	ebook(selector) {
		selector.forEach(section => {
			const ebook = section.querySelector('.c-lay__item')
			const inner = ebook.parentNode;
			const wrapper = h('div', { 'data-ebook': 'wrapper' });

			ebook.dataset.ebook = "item";
			inner.dataset.ebook = "inner";
			inner.tabIndex = "0";
			inner.appendChild(wrapper);

			const ebookRecalc = () => {
				const pages = Math.ceil(ebook.scrollWidth / ebook.offsetWidth);
				wrapper.innerHTML = '';
				for (let index = 0; index < pages; index++) {
					const page = h('div', { 'data-ebook': 'page' }, [`${index+1} / ${pages}`]);
					wrapper.appendChild(page);
				}
			}

			/* Listen for controlPanelUpdate-event on same section */
			section.addEventListener("controlPanelUpdate", (event) => { 
				switch(event.detail.element.dataset.key) {
					case 'cp-align':
					case 'cp-ff':
					case 'cp-fz':
					case 'cp-lh':
					case 'cp-w': 
						ebookRecalc();
					break;
					default: break;
				}
			});

			const resizeObserver = new ResizeObserver(() => {
				ebookRecalc();
			});
			resizeObserver.observe(ebook);
		})
	}

	/**
	 * @function expandCollapse
	 * @param {NodeList} selector
	 * @description Expands/collapses a section, see: `data-collapsed-height` and `data-expanded`.
	*/
	expandCollapse(selector) {
		function toggleFunc(toggle, section, outer, label) {
			const expanded = section.dataset.expanded === 'true';
			const height = outer.scrollHeight;
			const rect = section.getBoundingClientRect();
			const scrollPosition = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
			window.setTimeout( () => {
				window.scrollTo({ top: parseInt(rect.top + scrollPosition, 10), behavior: 'smooth'});
			}, 250);

			if (expanded) {
				outer.removeAttribute('style');
				section.dataset.expanded = 'false';
				section.setAttribute('aria-expanded', 'false');
			}
			else {
				outer.style.height = `${height}px`;
				section.dataset.expanded = 'true';
				section.setAttribute('aria-expanded', 'true');
			}

			toggle.dataset.expanded = expanded ? 'false' : 'true';
			label.innerText = expanded ? toggle.dataset.toggleCollapsed : toggle.dataset.toggleExpanded;
		}

		selector.forEach(toggle => {
			const label = toggle.querySelector('[data-toggle-label');
			const section = toggle.closest('[data-section-type]');
			const outer = section.querySelector('[data-outer]');
			toggle.addEventListener('click', () => {
				toggleFunc(toggle, section, outer, label);
			})
		});
	}

	/**
	 * @function init
	 * @description Init Layout Block
	*/
	init() {
		this.backToTop = document.querySelector(`[data-back-to-top]`);
		this.ebook(document.querySelectorAll(`[data-item-type="ebook"]`));
		this.expandCollapse(document.querySelectorAll(`[data-toggle-expanded]`));
		this.itemPagePopup(document.querySelectorAll(`[data-item-type*='page'] .c-lay__item`));
		this.observeIntersections(document.querySelectorAll('[data-animation],[data-animation-items],[data-set-props]'), '[data-inner]');
		this.toggleLayout(document.querySelectorAll(`[data-layout-label]`));

		addDocumentScroll (() => {
			if (this.backToTop) {
				this.backToTop.classList.toggle('c-lay__btt', window.scrollY > window.screen.height * 4);
			}
		});

		this.loadPopupPage();
		window.addEventListener('popstate', () => {
			this.loadPopupPage();
		})
	}

	/**
	 * @function itemHandleKeys
	 * @param {Object} obj
	 * @description Key-handler for item-popup	
	*/
	itemHandleKeys(obj) {
		const data = obj.element.firstElementChild.dataset;
		const hasPopup = obj.element.dataset.pageOpen;

		if (obj.event.code === 'Space') {
			if (!hasPopup) {
				obj.event.preventDefault();
				setModal(true);
				setPage('pageid', data.pageId, data.title);
				obj.element.dataset.pageOpen = 'true';
				obj.element.__scroll = obj.element.parentNode.scrollLeft;
				obj.element.firstElementChild.scrollTo({ top: 0, behavior: 'auto' });
			}
		}
		if (obj.key === 'Escape') {
			setModal(false);
			setPage('pageid');
			obj.element.focus();
			obj.element.removeAttribute('data-page-open');
			obj.element.parentNode.scrollTo({ left: obj.element.__scroll, behavior: 'auto' });
		}
		if (obj.key === 'Tab') {
			if (hasPopup) {
				obj.event.preventDefault()
				if (obj.rows.length) {
					let row = obj.row;
					obj.rows[row].focus();
					row++;
					if (row >= obj.rows.length) { row = 0; }
					obj.element.keyHandler.row = row;
				}
			}
		}
	}

	/**
	 * @function itemPagePopup
	 * @param {NodeList} selector
	 * @description Adds listener to popup-items (open items in full screen), see: `data-item-type="page"`.
	*/
	itemPagePopup(selector) {
		selector.forEach(item => {
			item.keyHandler = new KeyHandler(item, { callBack: this.itemHandleKeys, callBackScope: this, preventDefaultKeys: '' });
			item.firstElementChild.setAttribute('aria-modal', true);
			item.firstElementChild.setAttribute('role', 'dialog');
			item.setAttribute('tabindex', 0);
			item.addEventListener('click', (event) => {
				if (item.dataset.pageOpen) {
					if (event.target === item) {
						setModal(false);
						item.removeAttribute('data-page-open');
						item.parentNode.scrollTo({ left: item.__scroll, behavior: 'auto' });
						if (isTouch) { item.parentNode.classList.remove(this.settings.clsInnerPage); }
						setPage('pageid');
					}
				} else {
					setModal(true);
					item.dataset.pageOpen = 'true';
					item.__scroll = item.parentNode.scrollLeft;
					const section = item.closest('[data-section-type]')
					if (isTouch && section.dataset.sectionType !== 'stack') {
						item.parentNode.classList.add(this.settings.clsInnerPage);
					}
					const data = item.firstElementChild.dataset;
					setPage('pageid', data.pageId, data.title);
					item.firstElementChild.scrollTo({ top: 0, behavior: 'auto' });
				}
			});
		});
	}

	/**
	 * @function loadPopupPage
	 * @description If URL contains `pageid`, show that `page` (popup) 
	*/
	loadPopupPage() {
		const params = new URLSearchParams(document.location.search);
		if (params.has('pageid')) {
			const page = document.querySelector(`[data-page-id="${params.get('pageid')}"]`);
			if (page) {
				page.parentNode.dataset.pageOpen = 'true';
				const section = page.closest('[data-section-type]')
				if (isTouch && section.dataset.sectionType !== 'stack') {
					page.closest('[data-inner]').classList.add(this.settings.clsInnerPage);
				}
				setModal(true);
			}
		}
		else {
			const page = document.querySelector('[data-page-open]');
			if (page) {
				page.removeAttribute('data-page-open');
				const inner = page.closest('[data-inner]');
				inner.classList.remove(this.settings.clsInnerPage);
				setModal(false);
			}
		}
	}

	/**
	 * @function observeIntersections
	 * @param {NodeList} selector
	 * @description Observes InterSection, triggers animations, sets CSS properties
	*/
	observeIntersections(selector, itemSelector) {
		const IO = new IntersectionObserver((entries) => {	
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const section = entry.target;
					const remove = section.hasAttribute('data-animation-remove');

					if (section.dataset.setProps) {
						section.style.setProperty('--ratio', entry.intersectionRatio);
					}

					/* Use custom intersectionRatio from dataset, or use fallback: 0 */
					const ratio = parseInt(section.dataset.animationIntersection || 0, 10) / 100;

					if (entry.intersectionRatio >= ratio) {
						/* Unobserve section, unless `setProps` is enabled */
						if (!section.dataset.setProps) {
							IO.unobserve(entry.target);
						}

						if (!section.dataset.animationDone) {
							if (section.dataset.animation) {
								if (remove) {
									if (section.dataset.animationRemove) {
										section.classList.add(section.dataset.animationRemove);
									}
									window.setTimeout( () => {
										section.classList.remove(section.dataset.animation);
									}, 2000);
								}
								else {
									section.classList.add(section.dataset.animation);
								}
							}

							if (section.dataset.animationItems && section.__items) {
								section.__items.forEach(item => {
									item.classList.add(section.dataset.animationItems)
								});
								delete section.__items;
							}
							/* Prevent animations from running again, if `setProps` is enabled */
							section.dataset.animationDone = 'true';
						}
					}
				}
			})
			},
			{
				threshold: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0]
			}
		);
		selector.forEach(section => {
			const remove = section.hasAttribute('data-animation-remove');
			if (remove) {
				/* Add animation now, remove when intersecting */
				section.classList.add(section.dataset.animation);
			}
			if (section.dataset.animationItems && itemSelector) {
				const items = section.querySelector(itemSelector);
				if (remove && items) {
					items.forEach(item => { item.classList.add(section.dataset.animation); })
				}
				section.__items = items ? [...items.children] : [];
			}
			IO.observe(section);
		});
	}

	/**
	 * @function toggleLayout
	 * @param {NodeList} selector
	 * @description Toggles between `stack` and `slider`
 */
	toggleLayout(selector) {
		selector.forEach(toggle => {
			toggle.addEventListener('click', () => {
				const section = toggle.closest('[data-section-type]');
				const currentLayout = section.dataset.sectionType;
				const newLayout = section.dataset.toggleLayout;
				const header = toggle.innerText === toggle.dataset.layoutLabel ? toggle.dataset.layoutLabelToggle : toggle.dataset.layoutLabel;
				section.dataset.toggleLayout = currentLayout;
				section.dataset.sectionType = newLayout;
				toggle.innerText = header;
			});
		});
	}
}