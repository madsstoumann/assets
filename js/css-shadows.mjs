/**
 * CSS Shadows module.
 * @module /assets/js/shadowmaker
 * @requires /assets/js/css-app
 * @requires /assets/colorpicker
 * @requires /assets/js/common
 * @version 0.1.4
 * @summary 15-12-2020
 * @description box-shadow, filter: drop-shadow and text-shadow editor
 * @example
 * <div data-js="[box/drop/text]-shadow" data-app-type="[box/drop/text]-shadow">
 */

import CssApp from './css-app.mjs';
import ColorPicker from './colorpicker.mjs';

export default class CssShadows extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: 'box-shadow',
			lblAddEntry: 'Add shadow',
			lblAppHeader: 'CSS Shadows Editor',
			lblBlur: 'blur',
			lblColor: 'color',
			lblDelete: '✕',
			lblOffsetX: 'x',
			lblOffsetY: 'y',
			lblShapes: 'Shapes',
			lblSpread: 'spread',
			presetEntry: {
				blur: 2,
				color: 'rgba(230, 230, 230, 1)',
				inset: false,
				spread: 0,
				x: 0,
				y: 1
			},
			presetEntryTextFilter: {
				blur: 2,
				color: 'rgba(230, 230, 230, 1)',
				x: 0,
				y: 1
			}
		}, settings), presets);

		this.init();
	}

	/**
	* @function addEntry
	* @description Adds a new entry to the default preset
	*/
	addEntry() {
		const entry = this.settings.appType === 'box-shadow' ? {...this.settings.presetEntry} : {...this.settings.presetEntryTextFilter};
		this.preset.values.push(entry);
		this.setValue();
		this.setState();
	}

	/**
	* @function delEntry
	* @param {Node} element
	* @description Delete an entry from the default preset
	*/
	delEntry(element) {
		const index = parseInt(element.dataset.index, 10);
		this.preset.values.splice(index, 1);
		this.setValue();
		this.setState();
	}

	/**
	* @function handleClick
	* @param {Event} event
	* @description Handle main form clicks.
	*/
	handleClick(event) {
		const element = event.target;
		if (element.tagName === 'BUTTON' && element.dataset.elm) {
			switch(element.dataset.elm) {
				case 'addPreset':
					super.addPreset();
					break;
				case 'addEntry':
					this.addEntry();
					break;
				case 'delEntry':
					this.delEntry(element);
					break;
				case 'resetPreset':
					this.resetPreset();
					break;
				default: break;
			}
		}
	}

	/**
	* @function handleInput
	* @param {Event} event
	* @description Handle main form input.
	*/
	handleInput(event) {
		const element = event.target;
		const index = element.dataset.index - 0 || 0;
		const key = element.dataset.elm;
		let value = element.value;

		if (key === 'presetDesc' || key === 'presetName') { return; }

		if (element.type === 'checkbox') {
			value = element.checked ? true : false;
		}
		else if (element.type === 'number') {
			value = value - 0;
		}
		else if (element.type === 'radio') {
			return;
		}
		if (event.type === 'eventSetColor') {
			value = event.detail;
		}

		this.preset.values[index][key] = value;
		this.setValue();
		this.setPreview();
	}

	/**
	* @function init
	* @description Initialize app
	*/
	async init() {
		await super.init();
	}

	/**
	* @function loadPreset
	* @description Only run if it differs from super.loadPreset
	*/
	loadPreset(element) {
		super.loadPreset(element);
		this.setValue();
		this.setState();
	}

	/**
	* @function resetPreset
	* @description Only run if it differs from super.resetPreset
	*/
	resetPreset() {
		super.resetPreset();
		this.addEntry();
	}

	/**
	* @function setPreview
	* @paramn {Object} obj
	* @description Updates preview of box-shadow, text-shadow and drop-shadow
	*/
	setPreview(obj = this.preset) {
		switch (this.settings.appType) {
			case 'filter':
				this.elements.previewDrop.style.filter = obj.value;
				break;
			case 'text-shadow':
				this.elements.previewText.style.textShadow = obj.value;
				break;
			default:
				this.elements.previewBox.style.boxShadow = obj.value;
				break;
		}
		super.setCode();
	}

	/**
	* @function setState
	* @paramn {Object} obj
	* @description Updates preview of box-shadow, text-shadow or filter: drop-shadow()
	*/
	setState(obj = this.preset) {
		let colors = this.elements.shadows.querySelectorAll(`[data-js="colorpicker"]`);
		colors.forEach(color => { 
			const dialog = document.getElementById(color.__colorpickerId);
			if (dialog) { dialog.parentNode.removeChild(dialog); }
		});

		this.elements.shadows.innerHTML = obj.values.map((preset, index) => { return this.templateShadowEntry(preset, index)}).join('');

		colors = this.elements.shadows.querySelectorAll(`[data-colorpicker]`);
		colors.forEach(color => {
			new ColorPicker(color, color.dataset);
			color.addEventListener('eventSetColor', (event) => { this.handleInput(event) })
		});
		this.setPreview(obj);
	}

	/**
	* @function setValue
	* @description Calculate value from entries, update style and code-preview
	*/
	setValue(obj = this.preset) {
		switch(this.settings.appType) {
			case 'filter': 
				obj.value = obj.values.map(entry => { return `drop-shadow(${entry.x}px ${entry.y}px ${entry.blur}px ${entry.color})` }).join(' ');
				break;
			case 'text-shadow':
				obj.value = obj.values.map(entry => { return `${entry.x}px ${entry.y}px ${entry.blur}px ${entry.color}` }).join(', ');
				break;
			default: 
				obj.value = obj.values.map(entry => { return `${entry.inset ? 'inset ' : ''}${entry.x}px ${entry.y}px ${entry.blur}px ${entry.spread ? `${entry.spread}px ` : '' }${entry.color}` }).join(', ');
				break;
		}
	}

	/**
	* @function template
	* @description Renders main template
	*/
	template() {
		return `
		<form class="app" data-elm="app">
			<strong class="app__header">
				${this.settings.appIcon ? `	<svg class="app__icon"><use href="${this.settings.appIcon}" /></svg>` : ''}
				${this.settings.lblAppHeader}
			</strong>
			<div class="app__edit">
				<div class="app__preview">
					${this.settings.appType === 'box-shadow' ? `<div data-elm="previewBox"></div>`: ''}
					${this.settings.appType === 'text-shadow' ? `<div data-elm="previewText" contenteditable>HELLO SHADOW</div>`: ''}
					${this.settings.appType === 'filter' ? `<div data-elm="previewDrop"><div data-elm="previewDropInner"></div></div>`: ''}
				</div>

				<div class="app__controls">
					<div data-elm="shadows"></div>
					<button type="button" class="app__button" data-elm="addEntry">${this.settings.lblAddEntry}</button>
					<div class="app__fieldset app__fieldset--topspace">
						<label class="app__label"><input type="text" data-elm="presetName" data-lpignore="true" size="15">${this.settings.lblPresetName}</label>
					</div>
					<div class="app__fieldset">
						<label class="app__label"><textarea data-elm="presetDesc" data-lpignore="true"></textarea>${this.settings.lblPresetDesc}</label>
					</div>
					<div class="app__fieldset app__button-group">
						<button type="button" class="app__button app__button--reset" data-elm="resetPreset">${this.settings.lblReset}</button>
						<button type="button" class="app__button" data-elm="addPreset">${this.settings.lblAddPreset}</button>
					</div>
				</div>
			</div>

			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblPresets}</span></summary>
				<div class="app__panel" data-elm="presets"></div>
			</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblCSSCode}</span></summary>
				<div class="app__code" data-elm="cssCode"></div>
			</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblPresetCode}</span></summary>
				<div class="app__code"><pre data-elm="presetCode"></pre></div>
			</details>
		</form>`
	}


	/**
	* @function templateShadowEntry
	* @param {String} color
	* @param {Number} index
	* @description Renders a single shadow-entry in a list of shadows
	*/	
	templateShadowEntry(shadow, index = 0) {
		return `
		<div class="app__fieldset">
			${this.settings.appType === 'box-shadow' ? `<label class="app__label app__label--checkbox"><input type="checkbox" class="u-hidden" data-elm="inset" data-index="${index}"${shadow.inset ? ' checked' : ''} /><span></span>inset</label>` : ''}
			<label class="app__label"><input type="number" size="3" value="${shadow.x}" data-elm="x" data-index="${index}" />${this.settings.lblOffsetX}</label>
			<label class="app__label"><input type="number" size="3" value="${shadow.y}" data-elm="y" data-index="${index}" />${this.settings.lblOffsetY}</label>
			<label class="app__label"><input type="number" size="3" value="${shadow.blur}" data-elm="blur" data-index="${index}" />${this.settings.lblBlur}</label>
			${this.settings.appType === 'box-shadow' ? `<label class="app__label"><input type="number" size="3" value="${shadow.spread}" data-elm="spread" data-index="${index}" />${this.settings.lblSpread}</label>` : ''}
			<label class="app__label app__label--auto"><input type="text" data-elm="color" data-index="${index}" data-colorpicker="mini rgb update" value="${shadow.color}" />${this.settings.lblColor}</label>
			<label class="app__label app__label--del"><button type="button" data-elm="delEntry" data-index="${index}" aria-label="">${this.settings.lblDelete}</button>del</label>
		</div>`
	}
}