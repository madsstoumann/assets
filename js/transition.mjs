/**
 * CSS Transition module.
 * @module /assets/js/unit
 * @requires /assets/js/common
 * @version 0.1.0
 * @summary 05-05-2020
 * @description Edit CSS Units
 * @example
 * <div data-js="unit">
 */

import { stringToType, uuid } from './common.mjs';

export default class CssTransition {
	constructor(element, settings) {
		this.settings = Object.assign({
			appType: 'icon',
			clsDrag: 'app__img--drag',
			eventAddPreset: 'eventAddPreset',
			eventDelPreset: 'eventDelPreset',
			iconColor: 'rgba(96, 96, 96, 1)',
			iconColorHover: 'rgba(20, 40, 80, 1)',
			lblAddPreset: 'Add or overwrite preset',
			lbladdEntry: 'Add shadow',
			lblAppHeader: 'CSS <code>transition</code> Editor',
			lblCode: 'Generated code',
			lblColor: 'Icon color',
			lblColorHover: 'Icon color :hover',
			lblCSSCode: 'CSS code',
			lblFullCode: 'Original code',
			lblOverwrite: 'Overwrite existing preset?',
			lblPresetCode: 'Preset code',
			lblPresetName: 'Preset name',
			lblPresetDesc: 'Preset description',
			lblPresets: 'Presets',
			lblReset: '↺ Reset',
			lblSVGCode: 'SVG code',
			lblSVGImportType: 'SVG import profile',
			lblUploadImage: 'Upload or drag SVG with path or polygon',
			pointSize: 40,
			presetEntry: {},
			txtEmptyPreset: 'icon-preset',
			txtNoCode: 'No code rendered',
			urlPresets: '',
			useLocalStorage: true
		}, stringToType(settings));

		this.app = element;
		this.init();
	}

	/**
	* @function addPreset
	* @description Adds a new  preset
	*/
	addPreset() {
		/* TODO */
		if (this.elements.presetName.value) {
			const key = this.elements.presetName.value.replace(' ', "-").toLowerCase();
			const presetIndex = this.findPreset(key);
			this.elements.presetName.value = key;
			this.preset.name = key;
			if (presetIndex > -1) {
				// eslint-disable-next-line no-alert
				if (!window.confirm(this.settings.lblOverwrite)) {
					return;
				}
				this.presets.splice(presetIndex, 1, this.preset);
			}
			else {
				this.presets.push(this.preset);
			}
			this.app.dispatchEvent(new CustomEvent(this.settings.eventAddPreset, { detail: JSON.stringify(this.preset) }));
			this.renderPresets();

			if (this.settings.useLocalStorage) {
				window.localStorage.setItem(this.settings.appType, JSON.stringify(this.presets));
			}
		}
	}

	/**
	* @function delPreset
	* @param {Node} element
	* @description Delete a preset
	*/
	delPreset(element) {
		/* TODO */
		const presetIndex = parseInt(element.dataset.index, 10);
		if (presetIndex > -1) {
			const preset = this.presets[presetIndex];
			this.presets.splice(presetIndex, 1);
			this.app.dispatchEvent(new CustomEvent(this.settings.eventDelPreset, { detail: JSON.stringify(preset) }));
			this.renderPresets();

			if (this.settings.useLocalStorage) {
				window.localStorage.setItem(this.settings.appType, JSON.stringify(this.presets));
			}
		}
	}

	/**
	* @function findKey
	* @param {String} key
	* @description Look up a preset in the presets-collection, return index in array
	*/
	findPreset(key) {
		return this.presets.findIndex(obj => { return obj.name === key });
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
					this.addPreset();
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
		/* TODO */
		const element = event.target;
		const index = element.dataset.index - 0 || 0;
		const key = element.dataset.elm;
		let value = element.value;

		// if (element.type === 'checkbox') {
		// 	value = element.checked ? true : false;
		// }
		// else if (element.type === 'number') {
		// 	value = value - 0;
		// }
		// else if (element.type === 'radio') {
		// 	return;
		// }
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		/* TODO: Clean Up */
		this.uuid = uuid();
		this.app.innerHTML = this.template();
		this.elements = {};
		this.app.querySelectorAll(`[data-elm]`).forEach(element => {
			this.elements[element.dataset.elm] = element;
		});
		// this.style = document.createElement('style');
		// document.head.appendChild(this.style);
		this.presets = [];
		const presets = await (await fetch(this.settings.urlPresets)).json();
		if (presets) {
			this.presets = presets.values;
			this.elements.presets.addEventListener('keydown', this.keyDown.bind(this));
			this.elements.presets.addEventListener('pointerdown', this.pointerDown.bind(this));
			this.renderPresets();
		}

		this.elements.app.addEventListener('click', this.handleClick.bind(this));
		this.elements.app.addEventListener('input', this.handleInput.bind(this));
	}

	/**
	* @function keyDown
	* @paramn {Event} event
	* @description Copies the color of the curent swatch, when user press "Spacebar"
	*/
	keyDown(event) {
		const element = event.target;
		if (element.tagName === 'BUTTON') {
			switch (event.key) {
				case ' ': this.loadPreset(element); break;
				case 'Delete': this.delPreset(element); break;
				default: break;
			}
		}
	}

	/**
	* @function loadPreset
	* @paramn {Node} element
	* @description Loads preset / overwrites preset
	*/
	loadPreset(element) {
		const index = parseInt(element.dataset.index, 10);
		const preset = this.presets[index];
		if (preset) {
			this.preset = JSON.parse(JSON.stringify(preset));
			this.setPreset();
		}
	}


	/**
	* @function pointerDown
	* @paramn {Event} event
	* @description Copies the color of the curent swatch, starts a clickTimer-callback for "long-click"
	*/
	pointerDown(event) {
		const element = event.target;
		if (element.tagName === 'BUTTON') {
			this.loadPreset(element);
		}
	}

	/**
	* @function renderPresets
	* @description Renders list of presets
	*/
	renderPresets() {
		this.elements.presets.innerHTML = this.presets.map((preset, index) => {
			return this.templatePresetEntry(preset, index)
		}).join('');
	}

	/**
	* @function resetPreset
	* @description Resets current preset
	*/
	resetPreset() {
		this.preset = { value: '', values: {} };
		this.setPreset(true);
	}


	/**
	* @function setPreset
	* @param {Boolean} init
	* @param {String} xml
	* @param {String} svg
	* @description Sets active preset, optional initialize
	*/
	setPreset(init = false) {
		if (init) {
			this.preset.name = this.settings.txtEmptyPreset;
			this.preset.deletable = true;
			this.preset.readonly = false;
		}
	}

	/**
	* @function template
	* @description Renders main template
	*/
	template() {
		return `
		<form class="app" data-elm="app">
			<strong class="app__header">${this.settings.lblAppHeader}</strong>
			<div class="app__edit">
				<div class="app__preview">
						<div data-elm="preview"></div>
					

				</div>

				<div class="app__controls">


        
					<div class="app__fieldset">
          <label class="app__label"><input type="text" data-elm="transProperty">transition-property</label>
          <label class="app__label"><input type="text" data-elm="transDuration">transition-duration</label>
          <label class="app__label"><input type="text" data-elm="transTiming">transition-timing-function</label>
          <label class="app__label"><input type="text" data-elm="transDelay">transition-delay</label>
          
        </div>

					<div class="app__fieldset">
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
				<div class="app__code" data-elm="presetCode"></div>
			</details>
		</form>`
	}

	/**
	* @function templatePresetEntry
	* @param {Object} preset
	* @param {Number} index
	* @description Renders a single preset
	*/	
	templatePresetEntry(preset, index = 0) {
		return `<button type="button" class="app__preset" data-index="${index}">${preset.name}</button>`
	}
}