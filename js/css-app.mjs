/**
 * CSS App
 * @module /assets/js/css-app
 * @requires /assets/js/common
 * @version 0.1.5
 * @summary 11-12-2020
 * @description Generic CSS App, extend other CSS apps from this
 */

import { mergeArrayOfObjects, stringToType, syntaxHighlight, uuid } from './common.mjs';

export default class CssApp {
	constructor(element, settings, presets = []) {
		this.settings = Object.assign({
			api: '',
			appIcon: '',
			appType: 'css-app',
			eventAddPreset: 'eventAddPreset',
			eventDelPreset: 'eventDelPreset',
			lblAddPreset: 'Add or overwrite preset',
			lblAppIntro: '',
			lblCSSCode: 'CSS code',
			lblPresetCode: 'Preset code',
			lblOverwrite: 'Overwrite existing preset?',
			lblPresetDesc: 'Preset description',
			lblPresetName: 'Preset name [lowercase a-z + 0-9]',
			lblPresets: 'Presets',
			lblReset: '↺ Reset / New',
			useLocalStorage: false
		}, stringToType(settings));

		this.app = element;
		this.presets = presets;
	}

	/**
	* @function addPreset
	* @description Adds a new preset
	*/
	async addPreset() {
		if (this.elements.presetName.value) {
			const key = this.elements.presetName.value.replace(' ', "-").toLowerCase();
			const presetIndex = this.findPreset(key);
			let overwrite = false;

			this.elements.presetName.value = key;
			this.preset.name = key;
			this.preset.description = this.elements.presetDesc.value;

			if (presetIndex > -1) {
				// eslint-disable-next-line no-alert
				if (!window.confirm(this.settings.lblOverwrite)) {
					return;
				}
				overwrite = true;
				this.presets.splice(presetIndex, 1, this.preset);
			}
			else {
				this.presets.push(this.preset);
			}

			/* POST/PUT to REST API */
			if (this.settings.api) {
				try {
					await fetch(`${this.settings.api}${overwrite ? `/${this.preset.id}`: ''}`, {
						method: overwrite ? 'PUT' : 'POST',
						credentials: 'same-origin',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(this.preset)
					});
				}
				catch(err) {
					// eslint-disable-next-line
					console.error(err);
				}
			}
	
			this.app.dispatchEvent(new CustomEvent(this.settings.eventAddPreset, { detail: JSON.stringify(this.preset) }));
			this.renderPresets();

			if (this.settings.useLocalStorage) {
				const localIndex = this.localPresets.length;
				this.localPresets.push(Object.assign({ localIndex }, this.preset));
				window.localStorage.setItem(this.settings.appType, JSON.stringify(this.localPresets));
			}
			this.setCode();
		}
	}

	/**
	* @function delPreset
	* @param {Node} element
	* @description Delete a preset
	*/
	async delPreset(element) {
		const presetIndex = parseInt(element.dataset.index, 10);
		if (presetIndex > -1) {
			const preset = this.presets[presetIndex];
			let localIndex = Object.prototype.hasOwnProperty.call(preset, 'localIndex') ? preset.localIndex : -1;
			this.presets.splice(presetIndex, 1);

			if (this.settings.api) {
				try {
					await fetch(`${this.settings.api}/${this.preset.id}`, {
						method: 'DELETE',
						credentials: 'same-origin',
						headers: { 'Content-Type': 'application/json' }
					});
				}
				catch(err) {
					// eslint-disable-next-line
					console.error(err);
				}
			}

			this.app.dispatchEvent(new CustomEvent(this.settings.eventDelPreset, { detail: JSON.stringify(preset) }));
			this.renderPresets();

			if (this.settings.useLocalStorage && localIndex > -1) {
				this.localPresets.splice(localIndex, 1);
				window.localStorage.setItem(this.settings.appType, JSON.stringify(this.localPresets));
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
	* @description Handle main form input. Triggers when a user moves a range-slider or changes an input value.
	*/
	handleInput(event) {
		const element = event.target;
		const key = element.dataset.elm;
		if (key === 'presetDesc' || key === 'presetName') { return; }
		this.elements.app.style.setProperty(`--${key}`,`${element.value}${element.dataset.suffix || ''}`);
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		this.uuid = uuid();
		this.app.innerHTML = this.template();
		this.elements = {};
		this.app.querySelectorAll(`[data-elm]`).forEach(element => {
			this.elements[element.dataset.elm] = element;
		});

		if (!Object.keys(this.elements).length) { return; }

		if (this.elements.app) {
			this.elements.app.addEventListener('click', this.handleClick.bind(this));
			this.elements.app.addEventListener('input', this.handleInput.bind(this));
		}
	
		/* Load presets */
		if (this.elements.presets) {
			this.elements.presets.addEventListener('keydown', this.keyDown.bind(this));
			this.elements.presets.addEventListener('pointerdown', this.pointerDown.bind(this));

			/* Fetch presets from API */
			if (this.settings.api) {
				try {
					const presets = await (await fetch(this.settings.api)).json();
					if (presets) {
						this.presets = presets;
					}
				}
				catch(err) {
					// eslint-disable-next
					console.error(err);
				}
			}

			/* Get optional, locally stored presets */
			if (this.settings.useLocalStorage) {
				this.localPresets = [];
				const localPresets = window.localStorage.getItem(this.settings.appType);
				if (localPresets) {
					this.localPresets = JSON.parse(localPresets);
					this.presets = this.presets ? mergeArrayOfObjects(this.presets, this.localPresets, 'name') : this.localPresets;
				}
			}
			this.renderPresets();
		}
		/* Initialize preset, if elements exists */
		if (this.elements.presetDesc && this.elements.presetName) {
			this.resetPreset();
		}
	}

	/**
	* @function keyDown
	* @paramn {Event} event
	* @description Loads or deletes a preset from keyboard
	*/
	keyDown(event) {
		const element = event.target;
		if (element.tagName === 'BUTTON') {
			switch (event.key) {
				case ' ': this.loadPreset(element, event); break;
				case 'Delete': this.delPreset(element); break;
				default: break;
			}
		}
	}

	/**
	* @function loadPreset
	* @paramn {Node} element
	* @paramn {Object} data
	* @description Loads preset / overwrites preset.
	*/
	loadPreset(element, data) {
		const index = element ? parseInt(element.dataset.index, 10) : 0;
		let preset = element ? this.presets[index] : data;
		if (preset) {
			/* Deep-clone preset to avoid reference-updates */
			preset = JSON.parse(JSON.stringify(preset));
			this.resetPreset();
			this.elements.presetName.value = preset.name;
			this.elements.presetDesc.value = preset.description || '';
			this.preset = {...preset};
			if (preset.values) {
				this.preset.values = [...preset.values];
			}
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
			this.loadPreset(element, event);
		}
	}

	/**
	* @function resetPreset
	* @description Resets current preset
	*/
	resetPreset() {
		try {
			this.elements.presetDesc.value = '';
			this.elements.presetName.value = '';
		}
		catch(err) { console.error(err); }
		this.preset = {
			description: '',
			id: uuid(),
			name: this.settings.txtEmptyPreset,
			value: '',
			values: []
		};
	}

	/**
	* @function renderPresets
	* @description Renders list of presets
	*/
	renderPresets() {
		this.elements.presets.innerHTML = this.presets.map((preset, index) => { return this.templatePresetEntry(preset, index)}).join('');
	}

	/**
	* @function setCode
	* @param rawCSS {Boolean} [false]
	* @description Updates CSS- and preset-code
	*/
	setCode(rawCSS = false) {
		if (this.elements.cssCode) {
			if (rawCSS) {
				this.elements.cssCode.innerText = this.preset.value;
			}
			else {
				this.elements.cssCode.innerHTML = `<span>${this.settings.appType}:</span> ${this.preset.value};`;
			}
		}
		if (this.elements.presetCode) {
			const str = JSON.stringify(this.preset, null, '\t');
			this.elements.presetCode.innerHTML = syntaxHighlight(str);
		}
	}

	/**
	* @function template
	* @description Renders main template
	*/
	template() {
		return `<code>extend</code> this class from another <code>class</code>`;
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