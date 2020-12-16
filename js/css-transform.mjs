/**
 * CssTransform module.
 * @module /assets/js/filtermaker

 * @version 0.0.3
 * @summary 17-05-2020
 * @description 
 * @example
 * <div data-js="transform">
 */

import CssApp from './css-app.mjs';
import RangeSlider from './range.mjs';

export default class CssTransform extends CssApp {
	constructor(element, settings) {
		super(element, Object.assign({
			lblAppHeader: 'CSS Transform Editor',
			lblPreviewText: 'transform',
			lblRotate: 'rotate',
			lblScale: 'scale',
			lblSkewX: 'skewX',
			lblSkewY: 'skewY',
			lblTranslateX: 'translateX',
			lblTranslateY: 'translateY',
			presetEntry: {
				scale: 1,
				rotate: 0,
				translateX: 0,
				translateY: 0,
				skewX: 0,
				skewY: 0
			},
		}, settings));

		this.init()
	}

		/**
	* @function handleInput
	* @param {Event} event
	* @description Handle main form input.
	*/
	handleInput(event) {
		const element = event.target;
		if (element?.type === 'text' || element?.type === 'textarea') { return; }
		const key = element.dataset.elm;
		this.elements.app.style.setProperty(`--${key}`,`${element.value}${element.dataset.suffix || ''}`);
		this.preset.values[0][key] = key === 'url' ? element.value : element.value - 0;
		this.setValue();
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		await super.init();
		/* Add RangeSliders */
		Object.values(this.elements).forEach(element => {
			if (element.type && element.type === 'range') {
				element.__range = new RangeSlider(element, element.dataset)
			}
			this.elements[element.dataset.elm] = element;
		});
	}

		/**
	* @function loadPreset
	* @paramn {Node} element
	* @description Loads preset / overwrites preset
	*/
	loadPreset(element) {
		/* If element exists, load preset - otherwise `reset` to default values */
		if (element) {
			super.loadPreset(element);
		}

		/* Merge preset with default settings */
		const obj = {...this.settings.presetEntry, ...this.preset.values[0]};

		Object.entries(obj).forEach(arr => {
			const [key, value] = [...arr];
			let input = this.elements[key];
			if (input) {
				input.value = value;
				this.elements.app.style.setProperty(`--${key}`,`${input.value}${input.dataset.suffix || ''}`);

				/* Update rangeSlider */
				if (input.__range) {
					const min = parseInt(input.min, 10);
					const multiplier = 100 / ((parseInt(input.max, 10) || 100) - min);
					input.__range.updateRange(input, min, multiplier);
				}
			}
		});
		this.setValue();
	}

	/**
	* @function objFilter
	* @param {Object} obj1
	* @param {Object} obj2
	* @description Compare 2 simple objects, return object with differences
	*/
	objFilter(obj1, obj2) {
		const obj = {};
		Object.keys(obj1).forEach(key => { if(obj1[key] !== obj2[key]) { obj[key] = obj1[key] }});
		return obj;
	}

	/**
	* @function resetPreset
	* @description Resets to default
	*/
	resetPreset() {
		super.resetPreset();
		this.preset.values[0] = {...this.settings.presetEntry};
		this.loadPreset(null);
	}

	/**
	* @function setValue
	* @description Updates `value`-part of current preset, filters out default values
	*/
	setValue() {
		let str = '';
		/* Remove default settings from preset, only store values that are *not* default */
		const obj = this.objFilter(this.preset.values[0], this.settings.presetEntry);
		let suffix = '';

		for (let key in obj) {
			switch(key) {
				case 'translateX': case 'translateY':
					suffix = 'px';
					break;
				case 'rotate': case 'skewX': case 'skewY':
					suffix = 'deg';
					break;
				case 'scale':
					suffix = '';
					break;
				default: break;
			}
			str += `${key}(${obj[key]}${suffix}) `;
		}
		this.preset.value = str;
		this.preset.values[0] = obj;
		super.setCode();
	}

	/**
	* @function template
	* @description Renders main template for ColorPicker
	*/
	template() {
		return `
		<form class="app" data-elm="app">
			<strong class="app__header">${this.settings.lblAppHeader}</strong>
			<div class="app__edit">
				<div class="app__preview">
					<div class="app__preview-inner">${this.settings.lblPreviewText}</div>
				</div>

				<div class="app__controls">
					<label class="app__label--range"><span>${this.settings.lblScale}</span>
						<input type="range" class="c-rng" min="0.1" max="3" value="1" step="0.1" data-elm="scale" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblRotate}</span>
						<input type="range" class="c-rng" min="0" max="360" value="0" step="1" data-elm="rotate" data-suffix="deg" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblTranslateX}</span>
						<input type="range" class="c-rng" min="-100" max="100" value="0" step="1" data-elm="translateX" data-suffix="px" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblTranslateY}</span>
						<input type="range" class="c-rng" min="-100" max="100" value="0" step="1" data-elm="translateY" data-suffix="px" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblSkewX}</span>
						<input type="range" class="c-rng" min="-90" max="90" value="0" step="1" data-elm="skewX" data-suffix="deg" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblSkewY}</span>
						<input type="range" class="c-rng" min="-90" max="90" value="0" step="1" data-elm="skewY" data-suffix="deg" data-range="output" />
					</label>

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
}