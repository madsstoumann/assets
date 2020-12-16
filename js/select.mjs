/**
 * Select module.
 * @module /assets/js/select
 * @requires /assets/js/common
 * @requires /assets/js/keyhandler
 * @version 1.5.0
 * @summary 15-12-2019
 * @description Creates a custom <select> using <details>
 * @example
 * <select data-js="select">
 */

import { h, stringToType, uuid } from './common.mjs';
import KeyHandler from './keyhandler.mjs';

export default class Select {
	constructor(element, settings) {
		this.settings = Object.assign({
			clsList: 'c-lst',
			clsListItem: 'c-lst__item',
			clsListItemText: 'c-lst__item-text',
			clsListItemValue: 'u-visually-hidden',
			clsWrapper: 'p-sel',
			syncWithOriginal: true,
			template: (option, select, instance, index = -1) => {
				if (index === 0 && !select.multiple) {
					instance.summaryLabel =  option.text;
					/* TODO: innerHTML? */
				}
				return `
				<label class="${instance.settings.clsListItem}">
					<input type="${instance.multiple ? 'checkbox' : 'radio'}" id="${uuid()}" name="${select.name}" class="${instance.settings.clsListItemValue}" value="${option.value}" ${index === 0 && !instance.multiple ? ` checked` : ''} />
					<span class="${instance.settings.clsListItemText}">${option.text}</span>
				</label>`} 
		}, stringToType(settings));

		this.multiple = element.multiple;
		this.details = h('details', { class: this.settings.clsWrapper });
		this.list = h('fieldset', { class: this.settings.clsList });
		this.list.innerHTML = Array.from(element.querySelectorAll('option')).map((option, index) => { return this.settings.template(option, element, this, index) }).join('');
		this.summary = h('summary', { class: element.classList });
		this.summary.innerHTML = this.summaryLabel;
		this.details.appendChild(this.summary);
		this.details.appendChild(this.list);
		element.parentNode.insertBefore(this.details, element);

		if (this.settings.syncWithOriginal) {
			element.hidden = true;
		}
		else {
			element.parentNode.removeChild(element);
		}

		/* Add eventListeners */
		document.addEventListener('click', event => {
			if (!this.details.contains(event.target)) {
				this.details.open = false;
			}
		});
		this.list.keyHandler = new KeyHandler(this.list, {
			callBack: this.handleKeys,
			callBackScope: this
		});
		this.summary.keyHandler = new KeyHandler(this.summary, {
			callBack: this.handleKeys,
			callBackScope: this
		});

		// console.log(this);
	}

	/**
	 * @function handleKeys
	 * @param {Object} obj
	 * @description Handles keyboard-navigation
	 * TODO: type letter to go to item, arrow down cycles options
	 */
	handleKeys(obj) {
		const handler = obj.element.keyHandler;
		let index = obj.end ? obj.last : obj.row || 0;

		switch(obj.key) {
			case ' ': /* Space */
				if (obj.element === this.summary) {
					/* Overwrite keyHandler, use default Space-bar behaviour */
					obj.event.preventDefault();
				}
			break;
			case 'ArrowDown':
			case 'ArrowUp':
				/* If dropdown is collapsed, keep it collapsed while moving up/down in options */
				if (obj.element === this.summary && !this.details.open) {
					// obj.open = false;
				}
				break;
			default:
				break;
		}

		this.details.open = obj.open;

		// if (!obj.open) {
			// this.summary.focus();
			/* TODO: Reset row, detect if summary has focus */
		// }

		if (obj.element === this.summary) {
			this.list.keyHandler.rows[index].focus();
		}
		else {
			/* Focus is on list */
			obj.rows[obj.row].focus();
			// obj.rows[index].focus();
			if (!this.multiple)  {
				obj.rows[obj.row].checked = true;
			}
		}
		// eslint-disable-next-line
		console.log(obj, index)
		// handler.row = index;
		// 
	}
}