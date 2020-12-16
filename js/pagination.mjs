/**
 * Pagination module.
 * @module /assets/js/pagination
 * @version 1.3.0
 * @summary 23-11-2019
 * @description Adds pagination to a component
 */
import { h } from './common.mjs';
export default class Pagination {
	constructor(element, settings) {
		this.settings = Object.assign({
			clsFirst: 'c-pg__button--first',
			clsLast: 'c-pg__button--last',
			clsNext: 'c-pg__button--next',
			clsPrev: 'c-pg__button--prev',
			clsWrapper: 'c-pg__wrapper',
			labelFirst: '⇤ First page',
			labelLast: 'Last page ⇥',
			labelNext: 'Next →',
			labelPrev: '← Previous',
			maxPages: 100,
			numPages: 1,
			showFirst: true,
			showLast: true,
			showPrev: true,
			showNext: true
		}, settings);

		this.current = 1;
		this.pages = this.settings.numPages;
		this.wrapper = element;

		if (this.settings.showFirst) {
			this.first = h('button', { class: this.settings.clsFirst, type: 'button' }, [this.settings.labelFirst] );
			this.first.addEventListener('click', () => {return this.setPage(0)});
			this.wrapper.appendChild(this.first);
		}

		if (this.settings.showPrev) {
			this.prev = h('button', { class: this.settings.clsPrev, type: 'button' }, [this.settings.labelPrev] );
			this.prev.addEventListener('click', () => {return this.setPage(this.current - 1)});
			this.wrapper.appendChild(this.prev);
		}

		const inputWrapper = h('label', { class: this.settings.clsWrapper })
		this.input = h('input', { max: this.pages, min: 1, type: 'number', value: this.current });
		this.input.addEventListener('change', (event) => {return this.setPage(event.target.value)});
		this.label = h('output', { }, [this.pages.toString()]);
		inputWrapper.appendChild(this.input);
		inputWrapper.appendChild(h('span', {}, [' / ']));
		inputWrapper.appendChild(this.label);
		this.wrapper.appendChild(inputWrapper);

		if (this.settings.showNext) {
			this.next = h('button', { class: this.settings.clsNext, type: 'button' }, [this.settings.labelNext] );
			this.next.addEventListener('click', () => {return this.setPage(this.current + 1)});
			this.wrapper.appendChild(this.next);
		}

		if (this.settings.showLast) {
			this.last = h('button', { class: this.settings.clsLast, type: 'button' }, [this.settings.labelLast] );
			this.last.addEventListener('click', () => {return this.setPage(this.pages)});
			this.wrapper.appendChild(this.last);
		}
	}

	/**
 * @function setPage
 * @param {Number} page
 * @description Go to a specific page
 */
	setPage(page) {
		if (isNaN(page) || page < 1 || page > this.pages) {
			this.current = 1;
		}
		else {
			this.current = page-0;
		}

		this.input.value = this.current;

		this.wrapper.dispatchEvent(
			new CustomEvent('setPage', { detail: this.current })
		);
	}
}
