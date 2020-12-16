/**
 * Halftone Module.
 * @module /assets/js/halftone
 * @version 0.0.2
 * @summary 01-12-2020
 * @description 
 * @example
 * <div data-js="halftone">
 */

import CssApp from './css-app.mjs';
import RangeSlider from './range.mjs';

export default class CssHalftone extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: '',
			lblAppHeader: 'CMYK Halftone Editor',
			lblAppIntro: 'I used to edit a fanzine about comics, and would buy letraset screentone-sheets in order to create shades/tones and colors. Today, it\'s a cool retro-effect! I\'ve tried to mimick the printing process, with one layer for <strong>C</strong>yan, <strong>M</strong>agenta, <strong>Y</strong>ellow and blac<strong>K</strong>. To hide a color, set the dot-size to zero. <a href="https://en.wikipedia.org/wiki/Halftone">Halftone on Wikipedia</a>.',
			presetEntry: {
				background: '#000000',
				'print-order': 'ymck',
				'cyan-dot-size': 10,
				'cyan-dot-density': 50,
				'cyan-dot-angle': 15,
				'magenta-dot-size': 10,
				'magenta-dot-density': 50,
				'magenta-dot-angle': 75,
				'yellow-dot-size': 10,
				'yellow-dot-density': 50,
				'yellow-dot-angle': 0,
				'black-dot-size': 0,
				'black-dot-density': 50,
				'black-dot-angle': 45
			}
		}, settings), presets);
		this.init();
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
		this.preset.values[0][key] = element.type === 'range' ? JSON.parse(element.value) : element.value;
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		await super.init();
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

		Object.entries(this.preset.values[0]).forEach(arr => {
			const [key, value] = [...arr];
			let	input = this.elements[key];

			if (input) {
				input.value = value;
				this.elements.app.style.setProperty(`--${key}`,`${input.value}${input.dataset.suffix || ''}`);

				/* Update sliders */
				if (input.__range) {
					const min = parseInt(input.min, 10);
					const multiplier = 100 / ((parseInt(input.max, 10) || 100) - min);
					input.__range.updateRange(input, min, multiplier);
				}
			}
		});
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
	* @function template
	* @description Renders main template for ColorPicker
	*/
	template() {
		return `
		<form class="app" data-elm="app">
			<strong class="app__header">
			${this.settings.appIcon ? `	<svg class="app__icon"><use href="${this.settings.appIcon}" /></svg>` : ''}
				${this.settings.lblAppHeader}
			</strong>
			<p class="app__text">${this.settings.lblAppIntro}</p>
			<div class="app__edit">
				<div class="app__preview">
					<div class="halftone__wrapper">
						<div class="halftone" data-elm="yellow"></div>
						<div class="halftone" data-elm="magenta"></div>
						<div class="halftone" data-elm="cyan"></div>
						<div class="halftone" data-elm="black"></div>
					</div>
				</div>

				<div class="app__controls">
					<label class="app__label">
						<select data-elm="background">
							<option value="" selected>background: none</option>
							<option value="#00FFFF">background: cyan</option>
							<option value="#FF00FF">background: magenta</option>
							<option value="#FFFF00">background: yellow</option>
							<option value="#000000">background: black</option>
						</select>
					</label>

					<label class="app__label">
						<select data-elm="print-order">
							<option value="cmyk" disabled>print-order: C M Y K</option>
							<option value="ymck" selected>print-order: Y M C K</option>
						</select>
					</label>

					<label class="app__label--range"><span>Cyan Dot Size</span>
						<input type="range" class="c-rng" min="0" max="45" value="10" step="1" data-elm="cyan-dot-size" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Cyan Dot Density</span>
						<input type="range" class="c-rng" min="10" max="300" value="50" data-elm="cyan-dot-density" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Cyan Dot Angle</span>
						<input type="range" class="c-rng" min="0" max="360" value="15" data-elm="cyan-dot-angle" data-suffix="deg" data-range="output"/>
					</label>

					<label class="app__label--range"><span>Magenta Dot Size</span>
						<input type="range" class="c-rng" min="0" max="45" value="10" step="1" data-elm="magenta-dot-size" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Magenta Dot Density</span>
						<input type="range" class="c-rng" min="10" max="300" value="50" data-elm="magenta-dot-density" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Magenta Dot Angle</span>
						<input type="range" class="c-rng" min="0" max="360" value="75" data-elm="magenta-dot-angle" data-suffix="deg" data-range="output"/>
					</label>

					<label class="app__label--range"><span>Yellow Dot Size</span>
						<input type="range" class="c-rng" min="0" max="45" value="10" step="1" data-elm="yellow-dot-size" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Yellow Dot Density</span>
						<input type="range" class="c-rng" min="10" max="300" value="50" data-elm="yellow-dot-density" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Yellow Dot Angle</span>
						<input type="range" class="c-rng" min="0" max="360" value="0" data-elm="yellow-dot-angle" data-suffix="deg" data-range="output"/>
					</label>

					<label class="app__label--range"><span>Black Dot Size</span>
						<input type="range" class="c-rng" min="0" max="45" value="10" step="1" data-elm="black-dot-size" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Black Dot Density</span>
						<input type="range" class="c-rng" min="10" max="300" value="50" data-elm="black-dot-density" data-suffix="px" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Black Dot Angle</span>
						<input type="range" class="c-rng" min="0" max="360" value="45" data-elm="black-dot-angle" data-suffix="deg" data-range="output"/>
					</label>
					
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
		</form>`
	}
}