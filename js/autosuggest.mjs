/**
 * AutoSuggest module.
 * @module /assets/js/autosuggest.mjs
 * @requires /assets/js/common.mjs
 * @requires /assets/js/keyhandler.mjs
 * @version 0.3.1
 * @summary 30-03-2020
 * @description AutoSuggest
 * @example
 * <input data-js="autosuggest" minlength="3" maxlength="30">
 */

import { debounced, h, mark, stringToType } from "./common.mjs";
import KeyHandler from "./keyhandler.mjs";

export default class AutoSuggest {
	constructor(input, settings) {
		this.settings = Object.assign(
			{
				api: '',
				data: [],
				eventSelect: 'autoSuggestSelect',
				listClass: 'c-inp__list',
				listTag: 'ul',
				listItemClass: 'c-inp__list-item',
				searchKeys: [],
				searchObject: false,
				searchObjectKey: '',
				searchTemplate: (result) => {
					return result.map(item => {
						return `<li class="${this.settings.listItemClass}" tabindex="-1">${mark(
							item[this.settings.searchKeys],
							this.input.value
						)}</li>`;
					})
					.join('');
				},
				searchType: 1,
				setInputOnKeyNav: true,
				txtNoResult: 'No items match your search'
			},
			stringToType(settings)
		);

		this.input = input;
		this.initAutoSuggest();
	}

	/**
	 * @function clickOutside
	 * @param {Event} event
	 * @description Detects click outside input or list
	 */
	clickOutside(event) {
		if (!this.input.parentNode.contains(event.target)) {
			this.hideList(true);
		}
	}

	/**
	 * @function filterData
	 * @description Filter object
	 */
	filterData(data, value) {
		return data.filter(item => {
			return this.searchObj(item, value.split(' '), this.settings.searchKeys, this.settings.searchType)
		})
	}

	/**
	 * @function searchObj
	 * @param {Object} obj
	 * @param {Array} values
	 * @param {Array} keys
	 * @param {Number} searchTypeInt
	 * @returns {Boolean}
	 * @description Search object by array of values, for specific keys
	*/
	searchObj(obj, values, keys = [], searchTypeInt = 0) {
		const arrKeys = Array.isArray(keys) && keys.length ? keys : Object.keys(obj);
		return arrKeys.some(key => {
			return values.some(value => {
				const prop = obj[key].toString().toLowerCase();
				const str = value.toLowerCase();
				switch(searchTypeInt) {
					default: return prop.includes(str)
					case 1: return prop.startsWith(str)
					case 2: return prop.endsWith(str)
					case 3: return prop === str
				}
			})
		})
	}

	/**
	 * @function handleInput
	 * @description Execute AutoSuggest when input changes
	 */
	async handleInput() {
		if (
			this.input.value.length >= this.input.minLength &&
			this.input.value.length <= this.input.maxLength
		) {
			const value = this.input.value.toLowerCase();
			let data = this.data.length
				? this.filterData(this.data, value)
				: await (
						await fetch(
							this.settings.api + encodeURIComponent(value)
						)
					).json();
			this.result = data && data.length ? data : this.settings.noResult;
			this.list.innerHTML = this.settings.searchTemplate(this.result);
			this.list.keyHandler.row = 0;
			this.list.keyHandler.rows = [...this.list.children];
			this.list.firstChild.tabIndex = 0;
			this.hideList(false);
		}
	}

	/**
	 * @function hideList
	 * @param {Boolean} bool
	 * @description Adds or removes eventListeners, sets aria-live.
	 */
	hideList(bool) {
		if (bool) {
			this.result = [];
			document.removeEventListener('click', this.bindings.outsideClick);
		} else {
			document.addEventListener('click', this.bindings.outsideClick);
		}
		this.list.hidden = bool;
		this.list.setAttribute('aria-live', bool ? 'off' : 'polite');
	}

		/**
	 * @function initAutoSuggest
	 * @description Init
	 */
	async initAutoSuggest() {
		this.bindings = {};
		this.bindings.handleInput = this.handleInput.bind(this);
		this.bindings.outsideClick = this.clickOutside.bind(this);

		/* TODO */
		this.data = this.settings.searchObject ? await (
			await fetch(this.settings.api)).json() : this.settings.data;
		
		if (this.settings.searchObjectKey && Object.prototype.hasOwnProperty.call(this.data, this.settings.searchObjectKey)) {
			this.data = this.data[this.settings.searchObjectKey];
		}

		this.settings.noResult = [
			{ [this.settings.searchKeys]: this.settings.txtNoResult }
		];

		/* Create and insert list */
		this.list = h(this.settings.listTag, { class: this.settings.listClass });
		this.list.keyHandler = new KeyHandler(this.list, {
			callBack: this.setFocus,
			callBackScope: this
		});
		this.input.parentNode.insertBefore(this.list, this.input.nextSibling);

		/* Add eventListeners */
		this.input.addEventListener('input', debounced(200, this.bindings.handleInput)
		);

		/* Only react to ArowDown, since Escape and Enter already works as expected for type="search" */
		this.input.addEventListener('keydown', event => {
			if (
				event.key === 'ArrowDown' &&
				this.list.keyHandler.rows &&
				this.list.keyHandler.rows.length
			) {
				this.setFocus({ row: 0 });
			}
		});

		this.input.addEventListener('search', () => { this.hideList(true); });

		this.list.addEventListener('click', () => {
			this.setInput(document.activeElement.textContent, true, true, true);
		});

		this.hideList(true);
		// eslint-disable-next-line
		console.log(this)
	}

	/**
	 * @function sendEvent
	 * @description Dispatch event upon selection
	 */
	sendEvent() {
		const selected = this.result.find(item => {
			return item[this.settings.searchKeys] === this.input.value;
		});
		if (selected) {
			this.input.dispatchEvent(
				new CustomEvent(this.settings.eventSelect, { detail: selected })
			);
		}
	}

	/**
	 * @function setFocus
	 * @param {Object} obj
	 * @description Keyboard navigation, depending on key: show/hide list, set selection
	 */
	setFocus(obj) {
		if (obj) {
			if (obj.key === 'Escape') {
				this.setInput('', true, false, true);
				return;
			}
			if (obj.key === 'Enter') {
				this.setInput(document.activeElement.textContent, true, true, true);
				return;
			}

			if (obj.row > -1) {
				this.list.keyHandler.setFocus();
			}

			if (this.settings.setInputOnKeyNav) {
				this.setInput(document.activeElement.textContent);
			}
		}
	}

	/**
	 * @function setInput
	 * @param {String} value Set value of this.input
	 * @param {Boolean} [focus] Focus on this.input
	 * @param {Boolean} [event] Send event
	 * @param {Boolean} [hide] Hide/Show list
	 * @description Set input value, optionally set focus, send event and show/hide list
	 */
	setInput(value, focus = false, event = false, hide = false) {
		if (value) {
			this.input.value = value;
		} else {
			this.input.value = '';
		}
		if (focus) {
			this.input.focus();
		}
		if (event) {
			this.sendEvent();
		}
		if (hide) {
			this.hideList(true);
		}
	}
}
