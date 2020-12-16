 /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

/**
 * Key Handler
 * @module keyHandler.mjs
 * @version 0.4.14
 * @summary 28-09-2020
 * @author Mads Stoumann
 * @description Navigate list/table with keyboard. Returns an object with: { col, row, end (first or last row), open (parentOpenState) }. If editCallBack-function exists, this is returned with active (element), editMode state, optional undoMode state.
 */
import { focusable } from './common/focusable.mjs';
export default class KeyHandler {
	constructor(element, settings) {
		this.settings = Object.assign(
			{
				callBack: undefined,
				callBackScope: undefined,
				editAllowedTags: '',
				editCallBack: null,
				preventDefaultKeys: 'ArrowDown, ArrowUp, PageDown, PageUp',
				useArrowNav: false
			},
			settings
		);

		this.element = element;
		this.isTable = this.element.tagName.toLowerCase() === 'table';
		this.handleKeyEvent = this.keyEvent.bind(this);
		this.rows = this.isTable ? this.element.rows : focusable(this.element);
		this.toggleKeyEvent();
	}

		/**
	 * @function toggleKeyEvent
	 * @param {Boolean} bool
	 * @description Adds or removes keydown-eventListener
	 */
	toggleKeyEvent(bool = true) {
		if (bool) {
			this.element.addEventListener('keydown', this.handleKeyEvent);
		}
		else {
			this.element.removeEventListener('keydown', this.handleKeyEvent);
		}
	}

	/**
	 * @function getColFromRow
	 * @description Fetches the amount of cells in a given row, checks if nextCol is greater than that.
	 */
	getColFromRow() {
		const nextCol = this.isTable
			? this.rows[this.row].cells.length - 1
			: this.col;
		if (this.col > nextCol) {
			this.col = nextCol;
		}
	}

	/**
	 * @function keyEvent
	 * @description Main function, triggers on keyEvents, updates state.
	 */
	keyEvent(event) {
		if (this.settings.preventDefaultKeys && this.settings.preventDefaultKeys.includes(event.key)) {
			event.preventDefault();
		}
		if (this.isTable && !this.first) {
			this.setFirstLast();
		}
		this.active = document.activeElement;
		this.col = this.isTable ? this.active.cellIndex : 0;
		this.ctrl = event.getModifierState('Control');
		this.editMode = this.active.hasAttribute('contenteditable')
			? /true/i.test(this.active.getAttribute('contenteditable'))
			: false;
		this.end = false;
		this.meta = event.getModifierState('Meta');
		this.open = this.isTable
			? false
			: this.active.hasAttribute('open') ||
				this.active.parentElement.hasAttribute('open');
		this.row = this.isTable ? this.active.parentNode.rowIndex : this.row || 0;
		this.cols = this.isTable ? this.rows[this.row].cells.length - 1 : 0;

		if (this.settings.editCallBack && this.editMode) {
			switch (event.key) {
				case 'Escape':
					this.settings.editCallBack(this.active, false, true);
					break;
				case 'F2':
					this.settings.editCallBack(this.active, false);
					break;
				case 'Tab':
					event.preventDefault();
					this.settings.editCallBack(this.active, false);
					this.col++;
					if (this.col > this.cols) {
						this.col = this.cols;
					}
					break;
				default:
					break;
			}
		} else {
			switch (event.key) {
				case 'ArrowDown':
					// event.preventDefault();
					this.row++;
					if (this.row >= this.rows.length) {
						this.row = this.rows.length - 1;
						this.end = true;
					}
					this.getColFromRow();
					this.open = true;
					break;
				case 'ArrowLeft':
					if (this.isTable) {
						event.preventDefault();
						this.col--;
						if (this.col < 0) {
							this.col = 0;
							if (this.settings.useArrowNav) {
								this.col = this.cols;
								this.row--;
							}
						}
					}
					break;
				case 'ArrowRight':
					if (this.isTable) {
						event.preventDefault();
						this.col++;
						if (this.col > this.cols) {
							this.col = this.cols;
							if (this.settings.useArrowNav) {
								this.col = 0;
								this.row++;
							}
						}
					}
					break;
				case 'ArrowUp':
					// event.preventDefault();
					this.row--;
					if (this.row <= 0) {
						this.row = 0;
						this.end = true;
					}
					this.getColFromRow();
					this.open = true;

					break;
				case 'End':
					event.preventDefault();
					if (this.isTable) {
						this.col = this.cols;
					}
					if (this.ctrl) {
						this.row = this.rows.length-1;
					}
					this.getColFromRow();
					break;
				case 'Enter':
					event.preventDefault();
					this.open = !open;
					break;
				case 'Escape':
					this.open = false;
					break;
				case 'F2':
					if (
						this.settings.editCallBack &&
						this.settings.editAllowedTags.includes(this.active.tagName)
					) {
						this.settings.editCallBack(this.active, true);
					}
					break;
				case 'Home':
					this.col = 0;
					if (this.ctrl) {
						this.row = 0;
					}
					break;
				case 'PageDown':
					// event.preventDefault();
					break;
				case 'PageUp':
					// event.preventDefault();
					break;
				case ' ':
				case 'Space':
					if (this.isTable) {
						event.preventDefault();
					}
					this.open = !this.open;
					break;
				case 'Tab':
					this.open = false;
					break;
				case 'z':
					if (this.ctrl || this.meta) {
						event.preventDefault();
						this.settings.editCallBack(this.active, false, true);
					}
					break;
				default:
					break;
			}
		}

		if (this.settings.callBack && this.settings.callBackScope) {
			this.settings.callBack.call(this.settings.callBackScope, {
				active: this.active,
				col: this.col,
				element: this.element,
				end: this.end,
				event: event,
				key: event.key,
				last: this.rows.length - 1,
				open: this.open,
				row: this.row,
				rows: this.rows
			});
		} else {
			this.setFocus();
		}
	}

	/**
	 * @function setCurrent
	 * @description Sets aria-current, handles tabIndex. If using a custom callBack-method, call this method afterwards.
	 */
	setCurrent() {
		if (this.active) {
			this.active.removeAttribute('aria-current');
			this.active.setAttribute('tabindex', '-1');
		}
		document.activeElement.setAttribute('aria-current', 'true');
		document.activeElement.setAttribute('tabindex', '0');
	}

	/**
	 * @function setFirstLast
	 * @description Fetches first and last focusable table-cells. If changing table-data dynamically, call this method afterwards.
	 */
	setFirstLast() {
		let tabelm = [...this.element.querySelectorAll('[tabindex]')];
		if (tabelm.length) {
			this.first = tabelm.shift();
			this.first.tabIndex = 0;
			this.last = tabelm.pop();
		}
	}

	/**
	 * @function setFocus
	 * @description Sets focus on a table cell or row-item from current state.
	 */
	setFocus() {
		if (this.isTable) {
			this.element.rows[this.row].cells[this.col].focus();
		} else {
			this.rows[this.row].focus();
		}
		this.setCurrent();
	}
}
