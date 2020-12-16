/**
 * SVGtoUrl module.
 * @module /assets/js/svgtourl
 * @requires /assets/js/common
 * @version 0.1.0
 * @summary 24-04-2020
 * @description Manage SVG icons, store as CSS Custom Props
 * @example
 * <div data-js="iconxplorer">
 */

import ColorPicker from './colorpicker.mjs';
import { stringToType, uuid } from './common.mjs';

export default class IconXplorer {
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
			lblAppHeader: 'Icon Xplorer',
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
			lblUploadImage: 'Upload or drag icon',
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
	* @function arrToProps
	* @param {Array} arr
	* @param {Node} style
	* @param {String} prefix
	* @description Creates a stylesheet with a specifc id, sets root CSS Custom props from array.
	*/
	arrToProps(arr, style, prefix = '') {
		style.sheet.insertRule(`:root { ${this.presets.map(preset => {
			return `--${prefix}${preset.name}:${preset.value};\n`
		}).join(';')} }`);
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
	* @function dropFile
	* @description Handles dropFile, cleans file, sets preview
	*/
	dropFile(event) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const xml = e.target.result;
			const svg = this.svgClean(xml);
			this.preset.value = `url('data:image/svg+xml,${svg}');`
			this.setPreset(true, xml, svg);
		};
		reader.readAsText(event.target.files[0]);
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

		if (event.type === 'eventSetColor') {
			value = event.detail.rgba;
			if (element === this.elements.color) {
				this.elements.app.style.setProperty('--icon-bgc',value);
			}
			else {
				this.elements.app.style.setProperty('--icon-bgc--hover',value);
			}
		}
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
		this.style = document.createElement('style');
		document.head.appendChild(this.style);
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

		this.elements.filedrop.addEventListener("change", this.dropFile.bind(this));
		this.elements.preview.addEventListener("dragover", (event) => { event.preventDefault(); return false; });
		this.elements.preview.addEventListener("dragenter", () => { this.elements.preview.classList.add(this.settings.clsDrag); });
		document.addEventListener("drop", () => { this.elements.preview.classList.remove(this.settings.clsDrag) ;});

		const colors = this.elements.app.querySelectorAll(`[data-js="colorpicker"]`);
		colors.forEach(color => {
			new ColorPicker(color, color.dataset);
			color.addEventListener('eventSetColor', (event) => { this.handleInput(event) })
		});

		this.preset = { value: '' };
		this.setPreset(true);
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
			this.preset = {...preset};
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
		this.arrToProps(this.presets, this.style, 'ico-');
		this.elements.presets.innerHTML = this.presets.map((preset, index) => {
			return this.templatePresetEntry(preset, index)
		}).join('');
	}

	/**
	* @function resetPreset
	* @description Resets current preset
	*/
	resetPreset() {
		this.preset.value = '';
		this.setPreset(true);
	}

	/**
	* @function setPreset
	* @param {Boolean} init
	* @param {String} xml
	* @param {String} svg
	* @description Sets active preset, optional initialize
	*/
	setPreset(init = false, xml = this.settings.txtNoCode, svg = this.settings.txtNoCode) {
		if (init) {
			this.preset.name = this.settings.txtEmptyPreset;
			this.preset.deletable = true;
			this.preset.readonly = false;
		}
		if (this.style.sheet.rules.length > 1) {
			this.style.sheet.deleteRule(1);
		}
		this.style.sheet.insertRule(`.app { --icon: ${this.preset.value} }`, 1);
		this.elements.presetName.value = this.preset.name;
		this.elements.cssCode.innerText = this.preset.value;
		this.elements.fullCode.innerText = xml;
		this.elements.svgCode.innerText = svg;
		this.elements.presetCode.innerText = JSON.stringify(this.preset);
	}

	/**
	* @function svgClean
	* @param {String} xml
	* @param {Object} settings 
	* @description Removes unnecessary attributes and tags from an SVG
	*/
	svgClean(xml, settings) {
		const options = {...{
			removeAttr: ['enable-background', 'height', 'id', 'style', 'version', 'width', 'x', 'xml:space', 'xmlns:xlink', 'y'],
			removeAttrInTags: ['class', 'fill', 'id', 'style'],
			removeTags: ['defs', 'desc', 'discard', 'metadata', 'script', 'style', 'title'],
			tags: 'circle, g, line, path, pattern, polygon, polyline, rect, text, tspan',
			useViewBox: true
		},...settings};

		const parser = new DOMParser;
		const doc = parser.parseFromString(xml, 'text/xml');
		let svg = doc.querySelector('svg');

		if (!svg.hasAttribute('viewBox') && options.useViewBox) {
			svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('width')||100} ${svg.getAttribute('height')||100}`)
		}

		options.removeAttr.forEach(attr => {
			if (svg.hasAttribute(attr)) {
				svg.removeAttribute(attr);
			}
		});

		options.removeTags.forEach(tag => {
			const tags = svg.getElementsByTagName(tag);
			if (tags) {
				[...tags].forEach(elm => { elm.parentNode.removeChild(elm)})
			}
		});

		const children = svg.querySelectorAll(options.tags);
		children.forEach(child => {
			options.removeAttrInTags.forEach(attr => {
				if (child.hasAttribute(attr)) {
					child.removeAttribute(attr);
				}
			})
		});

		svg = svg.outerHTML.toString().trim()
			.replace(/(\r\n|\n|\r|\t)/gm,'')
			.replace(/\s\s+/g, ' ')
			.replace(/%/g,'%25')
			.replace(/#/g,'%23');

		return svg;
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
					<figure class="app__img-wrapper">
						<div class="app__img" data-elm="preview"></div>
						<input type="file" id="${this.uuid}file" class="app__file-drop" data-elm="filedrop" />
					</figure>
					<label for="${this.uuid}file" class="app__label">${this.settings.lblUploadImage}</label>

					<!-- TODO: map from array -->
					<div class="app__icon-wrapper">
						<div><div class="app__icon app__icon--xs"></div><code>c-ico--xs</code></div>
						<div><div class="app__icon app__icon--s"></div><code>c-ico--s</code></div>
						<div><div class="app__icon app__icon--m"></div><code>c-ico--m</code></div>
						<div><div class="app__icon app__icon--l"></div><code>c-ico--l</code></div>
						<div><div class="app__icon app__icon--xl"></div><code>c-ico--xl</code></div>
					</div>
				</div>

				<div class="app__controls">

					<div class="app__fieldset">
						<label class="app__label app__label--auto"><input type="text" data-elm="color"  data-js="colorpicker" data-value-format="rgb" value="${this.settings.iconColor}" readonly />${this.settings.lblColor}</label>
						<label class="app__label app__label--auto"><input type="text" data-elm="colorHover"  data-js="colorpicker" data-value-format="rgb" value="${this.settings.iconColorHover}" readonly />${this.settings.lblColorHover}</label>
					</div>

					<div class="app__fieldset app__fieldset--topspace">
						<label class="app__label"><input type="text" data-elm="presetName" data-lpignore="true" size="15">${this.settings.lblPresetName}</label>
						<label class="app__label">	
							<select data-elm="importType">
								<option value="deep">deep: remove as much</option>
								<option value="lite">lite: keep fill, class, style</option>
								<option value="keep">keep: import as is</option>
							</select>
							${this.settings.lblSVGImportType}
						</label>
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
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblSVGCode}</span></summary>
				<div class="app__code" data-elm="svgCode"></div>
			</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblFullCode}</span></summary>
				<div class="app__code" data-elm="fullCode"></div>
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
		return `<button type="button" class="app__preset--icon" data-index="${index}"><div style="background-image:var(--ico-${preset.name})"></div>${preset.name}</button>`
	}
}