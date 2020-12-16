/**
 * TableEdit module.
 * @module /assets/js/tableedit
 * @requires /assets/js/common
 * @requires /assets/js/keyhandler
 * @version 1.2.6
 * @summary 27-11-2019
 * @description Adds keyboard-navigation, editor, searchable options etc. to <table>
 * @example
 * <table data-js="editTable" data-api-get="/api/table">
 */

import { debounced, deSelect, h, replaceTagInString, selectAll, stringToType } from './common.mjs';
import KeyHandler from './keyhandler.mjs';
import Pagination from './pagination.mjs';

export default class TableEdit {
	constructor(table, settings) {
		this.settings = Object.assign({
			addWrapper: true,
			clsPagination: 'c-pg',
			clsSearchInput: 'c-table__search-input',
			clsSearchLabel: 'c-table__search-label',
			clsTable: 'c-table',
			clsTopWrapper: 'c-table__search-wrapper',
			clsInnerWrapper: 'c-table__inner',
			apiGet: '',
			edit: false,
			firstRowHeaders: true,
			hideCols: [],
			itemsPerPage: 0,
			itemsPerPageLabel: 'Items per page:',
			itemsPerPageOptions: [5, 10, 25],
			searchable: false,
			searchLabel: 'Filter table',
			searchMinChars: 3,
			searchPlaceholder: 'Search terms',
			sortable: true,
			sortIcon: `<svg viewBox="0 0 16 28" class="sortable">
				<path data-ascending d="M16 11c0 0.547-0.453 1-1 1h-14c-0.547 0-1-0.453-1-1 0-0.266 0.109-0.516 0.297-0.703l7-7c0.187-0.187 0.438-0.297 0.703-0.297s0.516 0.109 0.703 0.297l7 7c0.187 0.187 0.297 0.438 0.297 0.703z"></path>
				<path data-descending d="M16 17c0 0.266-0.109 0.516-0.297 0.703l-7 7c-0.187 0.187-0.438 0.297-0.703 0.297s-0.516-0.109-0.703-0.297l-7-7c-0.187-0.187-0.297-0.438-0.297-0.703 0-0.547 0.453-1 1-1h14c0.547 0 1 0.453 1 1z"></path>
			</svg>`,
		}, stringToType(settings));

		this.active = undefined;
		this.bindFilter = this.searchTable.bind(this);
		this.bindSortable = this.sortTable.bind(this);
		this.dataIsArray = true;
		this.pagination = { pages: 1 };
		this.sortAscending = true;
		this.sortColumn = 0;
		this.table = table;

		/* Create elements */
		let topWrapper = [];

		/* Add items-per-page selector */
		if (this.settings.itemsPerPage) {
			this.selectItemsPerPage = h('select', { class: this.settings.clsSearchInput});
			this.selectItemsPerPage.innerHTML = this.settings.itemsPerPageOptions.map(option => { 
				return `<option value="${option}"${option === this.settings.itemsPerPage ? ` selected`:  ''}>${option}</option>`
			}).join('');
			this.selectItemsPerPage.addEventListener('change', this.setItemsPerPage.bind(this));
			topWrapper.push(h('label', { class: this.settings.clsSearchLabel}, [this.settings.itemsPerPageLabel, this.selectItemsPerPage]));

			/* Add pagination */
			this.pagination.element = h('nav', { class: this.settings.clsPagination });
			this.pagination.element.addEventListener('setPage', (event) => { this.gotoPage(event.detail) })
		}

		/* Add search */
		if (this.settings.searchable) {
			this.searchInput = h('input', { class: this.settings.clsSearchInput, placeholder: this.settings.searchPlaceholder, type: 'search' });
			this.searchInput.addEventListener('input', debounced(200, this.bindFilter));
			this.searchInput.addEventListener('search', () => { this.sortHeaders(); this.resetTable(); });
			topWrapper.push(h('label', { class: this.settings.clsSearchLabel}, [this.settings.searchLabel, this.searchInput]));
		}

		if (this.settings.addWrapper) {
			/* Add inner wrapper and move caption outside of table */
			if (this.table.caption) {
				let caption = this.table.caption.outerHTML.toString();
				caption = replaceTagInString(caption, 'caption', 'div');
				this.table.insertAdjacentHTML('beforebegin', caption);
				this.table.caption.hidden = true;
			}
			this.wrapper = h('div', { class: this.settings.clsInnerWrapper });
			this.table.parentNode.replaceChild(this.wrapper, this.table);
			this.wrapper.appendChild(this.table);
		}

		/* Add topWrapper, if either itemsPerPage or Search is enabled */
		if (this.settings.itemsPerPage || this.settings.searchable) {
			if (this.settings.addWrapper) {
				this.wrapper.parentNode.insertBefore(h('div', { class: this.settings.clsTopWrapper }, topWrapper), this.wrapper);
				this.wrapper.parentNode.insertBefore(this.pagination.element, this.wrapper.nextSibling);
			}
			else { 
				this.table.parentNode.insertBefore(h('div', { class: this.settings.clsTopWrapper }, topWrapper), this.table);
				this.table.parentNode.insertBefore(this.pagination.element, this.table.nextSibling);
			}
		}

		this.tbody = this.table.tBodies[0] || this.table.appendChild(document.createElement('tbody'));
		this.thead = this.table.tHead || this.table.appendChild(document.createElement('thead'));

		/* Fetch locale, for localeSorting, default to: en-US */
		[this.locale, this.region] = (
			this.table.getAttribute('lang') ||
			document.documentElement.getAttribute('lang') ||
			'en-US'
		).split('-');

		/* If data-table-data contains data, create table from them */
		if (this.settings.tableData) {
			this.displayData = [...this.settings.tableData];
			this.createTableFromData();
		} else {
			/* Otherwise, build data from hardcoded table */
			this.settings.tableData = this.buildDataFromTable(this.table);
			this.displayData = [...this.settings.tableData];
		}

		/* If apiGet exists, try to fetch data - otherwise, initialize table */
		if (this.settings.apiGet) {
			this.fetchTableData();
		} else {
			this.initTable();
		}
	}

	/**
	 * @function ariaTable
	 * @param {Node} table
	 * @description Adss aria-rowindex and colindex, columnheader etc. to a table
	 */
	ariaTable(table, isFocusable = false) {
		[...table.rows].forEach((row, rowindex) => {
			row.setAttribute('aria-rowindex', rowindex);
			row.setAttribute('role', 'row');
			[...row.cells].forEach((col, colindex) => {
				const header = col.tagName.toLowerCase() === 'th';
				col.setAttribute('aria-colindex', colindex);
				col.setAttribute('role', header ? 'columnheader' : 'gridcell');
				if (isFocusable) {
					col.tabIndex = (colindex === 0 && rowindex === 0) ? 0 : -1;
				}
			});
		});
	}

	/**
	 * @function buildDataFromTable
	 * @param {Node} table Table to extract data from
	 * @description Create array of arrays from existing table
	 */
	buildDataFromTable(table) {
		let data = [];
		for (let tbody of table.tBodies) {
			for (let row of tbody.rows) {
				data.push(Array.from(row.cells).map(cell => {return cell.innerText}));
			}
		}
		return data;
	}

	/**
	 * @function buildTableFromData
	 * @param {Array} data Array of arrays
	 * @param {String} [tag] Tagname to use for cells: td or th
	 * @description Build table-markup from data
	 * TODO allow custom function from this.settings.fnTD
	 */
	buildTableFromData(data, tag = 'td') {
		return `
		${data.map(row => {
			let result;
			if (this.dataIsArray) {
				result = `<tr>${row.map(cell => {
					return tag === 'td' ? 
					`<td>${cell}</td>` : 
					`<th><span><strong>${cell}</strong></span></th>`
				}).join('')}</tr>`
			}
			else {
				result = `<tr>${Object.keys(row).map(cell => {
					let event = '';
					let value = row[cell];
					if (typeof row[cell] !== 'string') {
						event = row[cell].event ? ` data-event="${row[cell].event}"` : '';
						value = row[cell].value; 
					}
					return tag === 'td' ? 
					`<td ${event}>${value}</td>` :
					`<th data-obj-key="${cell}"><span><strong>${cell}</strong></span></th>`
				}).join('')}</tr>`
			}
			return result;
		}).join('')}`;
	}

	/**
	 * @function createTableFromData
	 * @description Create a table from data
	 */
	createTableFromData() {
		const headers = this.settings.firstRowHeaders ? this.dataIsArray ? (this.settings.tableData.shift(), this.displayData.shift()) : this.settings.tableData[0] : [];
		const rows = this.getRows(this.displayData, 0, this.settings.itemsPerPage);
		const colgroup = `<colgroup>${headers.map((col, index) => { return `<col data-index="${index}" />`}).join('')}</colgroup>`;
		this.table.insertAdjacentHTML('afterbegin', colgroup);
		this.tbody.innerHTML = this.buildTableFromData(rows);
		this.thead.innerHTML = this.buildTableFromData([headers], 'th');
	}

	/**
	 * @function fetchTableData
	 * @description Fetch table-data from api
	 */
	async fetchTableData() {
		const data = await (await fetch(this.settings.apiGet)).json();
		if (data && data.length) {
			this.dataIsArray = Array.isArray(data[0]);
			this.settings.tableData = data;
			this.displayData = [...this.settings.tableData];
			this.createTableFromData();
			this.initTable();
		}
	}

	/**
	 * @function getRows
	 * @param {Array} data
	 * @param {Number} page
	 * @param {Number} items
	 * @description Get subset of array
	 */
	getRows(data, page, items) {
		return items ? data.slice(page * items, page * items + items) : data;
	}

	/**
	 * @function gotoPage
	 * @param {Number} page
	 * @description Go to a specific page in a multi-page table
	 */
	gotoPage(page) {
		const rows = this.getRows(this.displayData, page - 1, this.settings.itemsPerPage);
		this.tbody.innerHTML = this.buildTableFromData(rows);
		this.ariaTable(this.table, true);
	}

	/**
	 * @function initTable
	 * @description Run after table has been created. Set aria-roles, add KeyHandler and events etc.
	 */
	initTable() {
		this.ariaTable(this.table, true);

		if (this.settings.sortable) {
			this.makeSortable();
		}

		/* Add pagination */
		this.setNumOfPages(false);
		if (this.settings.itemsPerPage) {
			this.pagination.handler = new Pagination(this.pagination.element, { numPages: this.pagination.pages });
		}

		/* Add keyboard navigation */
		this.keyHandler = new KeyHandler(this.table, {
			editAllowedTags: 'TD',
			editCallBack: this.settings.edit ? this.toggleEditMode.bind(this) : null
		});

		/* TODO  */
		this.table.addEventListener('click', (event) => {
			const element = event.target;
			if (element.tagName === 'TD' && element.dataset.event) {
				const object = this.objectFromRow(element.parentNode);
				this.table.dispatchEvent(new CustomEvent(element.dataset.event, { detail: object }));
			}
		});

		/* Add additional eventListeners, if able should be editable */
		if (this.settings.edit) {
			this.table.addEventListener('dblclick', event => {
				this.toggleEditMode(event.target, true);
			});

			this.table.addEventListener('click', () => {
				this.toggleEditMode(null, false);
				this.keyHandler.setCurrent();
			});
		}
	}

	/**
	 * @function makeSortable
	 * @description Add ascending/descending graphics and functionality
	 */
	makeSortable() {
		this.table.querySelectorAll('th').forEach(col => {
			col.setAttribute('aria-sort', 'none');
			col.addEventListener('click', event => { return this.bindSortable(event.target); });
			col.addEventListener('keydown', event => {
				if (event.key === ' ') {
					this.bindSortable(event.target);
				}
			});
			col.firstElementChild.insertAdjacentHTML('beforeend', this.settings.sortIcon);
		});
	}

	/**
	 * @function objectFromRow
	 * @param {Node} row
	 * @description Create an object from a table row
	 */
	objectFromRow(row) {
		let obj = {};
		[...row.children].forEach((cell, index) => {
			const key = this.thead.firstElementChild.children[index].innerText;
			obj[key] = cell.innerText;
		})
		return obj;
	}

	/**
	 * @function resetTable
	 * @description Refreshes (search) or restores table (default data)
	 */
	resetTable(result = null) {
		this.displayData = result ? result : [...this.settings.tableData];
		this.setNumOfPages(true);
		this.gotoPage(1);
	}

	/**
	 * @function searchTable
	 * @description Filter data and build new table from search term
	 */
	searchTable() {
		const term = this.searchInput.value.toLowerCase();
		if (term.length >= this.settings.searchMinChars) {
			const result = this.settings.tableData.filter(data => {
				const row = this.dataIsArray ? data : Object.values(data);
				return row.some(cell => {
					return typeof cell === 'string' && cell.toLowerCase().includes(term)
				})
			});
			if (result && result.length) {
				this.sortHeaders();
				this.resetTable(result);
			}
		}
	}

	/**
	 * @function setItemsPerPage
	 * @param {Event} event
	 * @description Updates items per page
	 */
	setItemsPerPage(event) {
		this.settings.itemsPerPage = event.target.value - 0;
		this.setNumOfPages(true);
		this.gotoPage(1);
	}

	/**
	 * @function setNumOfPage
	 * @param {Boolean} updatePageHandler Refresh pagination-element with current data
	 * @description Updates pagination.pages with number of pages, based on this.data
	 */
	setNumOfPages(updatePageHandler) {
		this.pagination.pages = this.settings.itemsPerPage ? Math.ceil(this.displayData.length / this.settings.itemsPerPage) : 1;
		if (updatePageHandler && this.pagination.handler) {
			this.pagination.handler.input.value = 1;
			this.pagination.handler.label.innerText = this.pagination.pages;
			this.pagination.handler.pages = this.pagination.pages;
		}
	}

	/**
	 * @function sortHeaders
	 * @param {Node} th Column clicked/selected
	 * @description Set aria-sort attribute on <th>s
	 */
	sortHeaders(th) {
		const sortValue = this.sortAscending ? 'ascending' : 'descending';
		Array.from(this.thead.firstElementChild.children).forEach(col => {
			col.setAttribute('aria-sort', th && th === col ? sortValue : 'none');
		})
	}

	/**
	 * @function sortTable
	 * @param {Node} th Column clicked/selected
	 * @description Sort
	 */
	sortTable(th) {
		const colIndex = th.getAttribute('aria-colindex') - 0;
		if (colIndex !== this.sortColumn) {
			this.sortColumn = colIndex;
		} else {
			this.sortAscending = !this.sortAscending;
		}
		this.sortHeaders(th);
		let data = this.displayData.sort((a, b) => {
			const index = this.dataIsArray ? this.sortColumn : th.dataset.objKey;
			return typeof a[index] === 'string' && a[index].localeCompare(b[index], this.locale, {
				sensitivity: 'variant'
			});
		});

		if (!this.sortAscending) {
			data = data.reverse();
		}
		this.resetTable(data);
	}

	/**
	 * @function toggleEditMode
	 * @param {Node} element Active element
	 * @param {Boolean} editMode
	 * @param {Boolean} [undoMode]
	 * @description Toggles editMode and optionally undoMode
	 */
	toggleEditMode(element, editMode, undoMode = false) {
		if (element) {
			this.active = element;
		}

		if (!this.active) {
			return;
		}
		this.active.contentEditable = editMode;

		if (editMode) {
			selectAll(this.active);
			this.active.dataset.value = this.active.textContent.trim();
		} else {
			deSelect();

			if (undoMode && this.active.dataset.value) {
				this.active.textContent = this.active.dataset.value;
				delete this.active.dataset.value;
			}
/* TODO: dispatchEvent instead: Send object or row */
			const cellInfo = {
				col: this.active.cellIndex,
				row: this.active.parentNode.rowIndex,
				old: this.active.dataset.value,
				value: this.active.textContent
			};

			/* Push changes to API */
			if (this.settings.api) {
				fetch(this.action, {
					credentials: 'include',
					method: 'post',
					body: JSON.stringify(cellInfo)
				});
			}
			this.active = undefined;
		}
	}
}
