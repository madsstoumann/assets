/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/**
 * A11y Menu.
 * @module a11ymenu.mjs
 * @version 0.0.06
 * @summary 29-05-2020
 * @author Mads Stoumann
 * @description a11y Menu. 
 */
import { stringToType } from './common.mjs';
import KeyHandler from './keyhandler.mjs';
export class a11yMenu {
	constructor(wrapper, settings) {
		this.settings = Object.assign(
			{
				chars: 'abcdefghijklmnopqrstuvwxyzæøå0123456789',
				clsMenuItem: 'c-mnu__item',
				clsMenuItemLink: 'c-mnu__item-link',
				clsMenuItemName: 'c-mnu__item-name',
				clsMenuItemNameOpen: 'c-mnu__item--open',
				clsMenuPanel: 'c-mnu__panel',
				clsMenuPanelOpen: 'c-mnu__panel--open',
				megaMenu: true,
				megaMenuBreakpoint: 800,
				outerWrapper: '.c-mnu',
				overlay: ''
			},
			stringToType(settings)
		);
		this.init(wrapper);
	}

	/**
	 * @function init
	 * @description Create menu from data, add eventListeners etc.
	 */
	async init(wrapper) {
		if (this.settings.menuData) {
			try {
				const data = await (await fetch(this.settings.menuData)).json();
				wrapper.innerHTML = this.renderMenu(data, 1);
			}
			catch(err) {}
		}

		if (this.settings.megaMenu) {
			this.showMegaMenu = null;
			// this.overlay = document.querySelector(`${this.settings.overlay}`);
			this.panels = [...document.querySelectorAll(`.${this.settings.clsMenuItem}--1`)];
			this.panels.forEach(panel => {
				panel.keyHandler = new KeyHandler(panel, { callBack: this.handleKeys, callBackScope: this, preventDefaultKeys: '' });
			});

			/* Add outside-click listener, if panels exists */
			if (this.panels) {
				this.handleClickEvent = this.togglePanels.bind(this);
				document.addEventListener('click', event => {
					if (!wrapper.contains(event.target)) {
						this.togglePanels();
					}
				});

				/* Use ResizeObserver to collapse/expand all sub-groups based on screen-resolution, add and remove eventListeners based on viewPort */
				const RO = new ResizeObserver(entries => {
					return entries.forEach(entry => {
						const showMegaMenu = entry.contentRect.width > this.settings.megaMenuBreakpoint;
						if (this.showMegaMenu !== showMegaMenu) {
							this.showMegaMenu = showMegaMenu;
							this.togglePanels(); /* Collapse open panels when resize occurs */
							const subpanels = entry.target.querySelectorAll(`.${this.settings.clsMenuItem}--2`);
							subpanels.forEach(subpanel => {
								subpanel.open = showMegaMenu; /* Expand sub-panels if mega-menu is active */
							});
							/* For First Level, add or remove keyHandler-eventListener if desktop/mobile */
							this.panels.forEach(panel => {
								panel.keyHandler.toggleKeyEvent(showMegaMenu);
								this.toggleClickEvent(panel.firstElementChild, showMegaMenu);
							})
						}
					})
				});
				RO.observe(this.settings.outerWrapper ? document.querySelector(this.settings.outerWrapper) : wrapper);
			}
		}

		/* Use MutationObserver to detect <details [open]> changes */
		const MO = new MutationObserver(mutations => {return mutations.forEach(mutation => {
			const elm = mutation.target;
			if (elm.tagName.toLowerCase() === 'details') {
				const summary = elm.firstElementChild;
				summary.setAttribute('aria-expanded', elm.open);
				summary.classList.toggle(this.settings.clsMenuItemNameOpen, elm.open);
				const panel = summary.nextElementSibling;
				panel.classList.toggle(this.settings.clsMenuPanelOpen, elm.open);
				if (this.overlay && this.panels.includes(elm)) {
					this.overlay.style.display = elm.open ? 'block' : 'none';
				}
			}
		})});
		MO.observe(wrapper, {
			attributes: true,
			subtree: true
		});
		console.log(this)
	}

	/**
	 * @function handleKeys
	 * @param {Object} obj
	 * @description Handle key-navigation from keyhandler-obj
	 */
	handleKeys(obj) {
		if (!obj) { return; }
		const firstPanel = this.panels[0].firstElementChild;
		const handler = obj.element.keyHandler;
		const isPanel = obj.active.tagName === 'SUMMARY';
		const lastPanel = this.panels[this.panels.length - 1].firstElementChild;
		let index = obj.end ? obj.last : obj.row || 0;

		switch(obj.key) {
			/* Space Key: Toggle panel (default) or go to link */
			case ' ':
				if (obj.active.tagName === 'A') {
					location.href = obj.active;
				}
				else {
					obj.event.preventDefault();
				}
				break;
			case 'ArrowDown':
				if (isPanel) {
					index = 0;
				}
				if (obj.end) {
					index = 0;
				}
				break;
			case 'ArrowLeft': {
				const prevPanel = obj.element.previousElementSibling;
					if (prevPanel && prevPanel.tagName === 'DETAILS') {
						prevPanel.firstElementChild.focus()
						if (!isPanel) {
							prevPanel.open = true;
							obj.element.open = false;
						}
					}
					else {
						/* Go to last panel */
						lastPanel.focus();
					}
				}
				break;
			case 'ArrowRight': {
				const nextPanel = obj.element.nextElementSibling;
					if (nextPanel && nextPanel.tagName === 'DETAILS') {
						nextPanel.firstElementChild.focus()
						if (!isPanel) {
							nextPanel.open = true;
							obj.element.open = false;
						}
					}
					else {
						/* Go to first panel */
						firstPanel.focus();
					}
				}
				break;
			case 'End':
				if (isPanel) {
					lastPanel.focus();
				}
				else {
					index = obj.last; 
				}
				break;
			case 'Enter':
				if (isPanel) {
					obj.open = true;
				}
				else {
					if (obj.active.tagName === 'A') {
						location.href = obj.active;
					}
				}
				break;
			case 'Escape':
					index = 0;
					obj.element.open = false;
					obj.element.firstElementChild.focus();
				break;
			case 'Home':
				if (isPanel) {
					firstPanel.focus();
				}
				else {
					index = 0;
				}
				break;
			case 'Tab':
				if (!isPanel) {
					obj.event.preventDefault();
				}
				break;
			default:
				/* keyChar Search */
				if (this.settings.chars.includes(obj.key.toLowerCase())) {
					if (isPanel) {
						/* Create array of indexes for panel headers starting with obj.key */
						const indexes = Array.from(this.panels).reduce((arr, item, row) => {
							if (item.firstElementChild.innerText.toLowerCase().startsWith(obj.key)) { arr.push(row); }
							return arr;
						}, []);

						/* Get index of panel which has focus */
						const panelIndex = Array.from(this.panels).findIndex(item => {
							return item.firstElementChild === document.activeElement;
							}
						)

						/* Get colIndex for next panel with an index larger than currently selected item */
						let colIndex = indexes.find(item => { return item > panelIndex });
						if (!colIndex && indexes.length > 0) { colIndex = indexes[0]; }
						if (colIndex > -1) {
							this.panels[colIndex].firstElementChild.focus();
						}

					/* Subpanel */
					} else {
						/* Create array of indexes for items starting with obj.key */
						const indexes = obj.rows.reduce((arr, item, row) => {
							if (item.innerText.toLowerCase().startsWith(obj.key)) { arr.push(row); }
							return arr;
						}, []);

						/* Get rowIndex for next item with an index larger than currently selected item */
						let rowIndex = indexes.find(item => { return item > index });
						if (!rowIndex && indexes.length > 0) { rowIndex = indexes[0]; }
						if (rowIndex > -1) {
							index = rowIndex;
						}
					}
				}
				break;
		}

		if (isPanel) {
			obj.element.open = obj.open;
		}

		handler.row = index;
		if (obj && obj.rows[index]) {
			obj.rows[index].focus();
		}
	}

	/**
	 * @function renderMenu
	 * @param {Object} data
	 * @description Render menu from (json) object, recursive nested levels from `children`.
	 */
	renderMenu(data, level) {
		return data.map(item => {return item.children ? 
			`<details class="${this.settings.clsMenuItem}--${level}"${level > 1 ? ` open`: ''}>
				<summary class="${this.settings.clsMenuItemName}--${level}" role="button" aria-expanded="${level > 1 ? `true`: `false`}" data-level="${level}">${item.name}</summary>
				<div class="${this.settings.clsMenuPanel}--${level}" role="menu">${this.renderMenu(item.children, level + 1)}</div>
			</details>`
			:
			`<a class="${this.settings.clsMenuItemLink}--${level}"${level > 1 ? ` role="menuitem"`: ''} href="${item.url}">${item.name}</a>`}
		).join('');
	}

	/**
	 * @function toggleClickEvent
	 * @param {Boolean} bool
	 * @description Adds or removes click-listener
	 */
	toggleClickEvent(panel, bool = true) {
		if (bool) {
			panel.addEventListener('click', this.handleClickEvent);
		}
		else {
			panel.removeEventListener('click', this.handleClickEvent);
		}
	}

	/**
	 * @function togglePanels
	 * @param {Node} panel
	 * @description Collapses all panels except `event.target`(if specified and matches a panel)
	 */
	togglePanels(event) {
		let elm = event && event.target;
		if (elm && elm.parentNode) { elm = elm.parentNode; }
		this.panels.forEach(panel => {
			panel.open = elm === panel ? panel.open : false;
		});
	}
}