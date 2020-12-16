/**
 * ToggleTip module.
 * @module /assets/js/toggletip
 * @requires /assets/js/common
 * @requires /assets/js/keyhandler
 * @version 1.0.10
 * @summary 03-01-2020
 * @description Adds keyboard-navigation etc. to ToggleTip
 * @example
 * <details data-js="toggletip">
 */

import { debounced, stringToType } from './common.mjs';

export default class ToggleTip {
	constructor(element, settings) {
		this.settings = Object.assign({
			addClose: true,
			clsClose : 'c-tgt__dialog-close c-btn c-btn--circle c-btn--ui',
			lblClose: '✕'
		}, stringToType(settings));

		this.bindOutsideClick = this.clickOutside.bind(this);
		this.element = element;
		this.summary = this.element.firstElementChild;
		this.dialog = this.summary.nextElementSibling;
		this.dialogWidth = parseInt(window.getComputedStyle(this.dialog).width.replace('px',''), 10);
		this.element.addEventListener('keydown', (event) => { if (event.key === 'Escape') { this.closeTip(); } });
		this.element.addEventListener('toggle', () => { this.handleToggle(); });
		this.summary.addEventListener('blur', () => { this.closeTip(); });
	
		if (this.settings.addClose) {
			/* Insert `fake` close-button, as panel already closes onBlur */
			this.dialog.insertAdjacentHTML('afterbegin', `<div class="${this.settings.clsClose}">${this.settings.lblClose}</div>`)
		}

		window.addEventListener('resize', debounced(200, this.calcPositions.bind(this)) );
		this.calcPositions();
	}

	/**
	 * @function calcPositions
	 * @description Find position of `summary`-label, and re-position `dialog`, if there's not enough room.
	 */
	calcPositions() {
		this.dialog.removeAttribute('style');
		const rect = this.summary.getBoundingClientRect();
		this.viewportWidth = (window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName("body")[0].clientWidth || 0);
		if ((rect.x + this.dialogWidth) > this.viewportWidth) {
			this.dialog.style.left = `${(this.viewportWidth - this.dialogWidth) - rect.x}px`;
		}
	}

	/**
	 * @function clickOutside
	 * @param {Event} event
	 * @description Run closeTip when clicked outside
	 */
	clickOutside(event) {
		if (!this.element.contains(event.target)) {
			this.closeTip();
		}
	}

	/**
	 * @function closeTip
	 * @description Close the ToggleTip
	 */
	closeTip() {
		this.element.open = false;
	}

	/**
	 * @function handleToggle
	 * @description Add or remove eventListeners onToggle, scrolls to bottom of panel
	 */
	handleToggle() {
		if (this.element.open) {
			const rect = this.dialog.getBoundingClientRect();
			window.scrollBy({ 
				top: rect.bottom,
				behavior: 'smooth'
			});
			document.addEventListener('click', this.bindOutsideClick);
		}
		else {
			document.removeEventListener('click', this.bindOutsideClick);
		}
	}
}