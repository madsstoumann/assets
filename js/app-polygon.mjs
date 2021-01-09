/**
 * Polygon Module.
 * @module /assets/js/halftone
 * @version 0.1.1
 * @summary 09-01-2021
 * @description 
 * @example
 * <div data-js="polygon">
 */

import ColorPicker from './colorpicker.mjs';
import CssApp from './css-app.mjs';
import RangeSlider from './range.mjs';

export default class AppPolygon extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: 'clip-path',
			lblAppHeader: 'Polygon to <code>clip-path</code> & <code>SVG</code>',
			lblAppIntro: 'Create equal-sided polygons as both clip-path and svg. From a triangle to a hectogon.',
			lblSVGCode: 'SVG code',
			presetEntry: {
				animationinset: 50,
				color: 'rgba(40,145,200,1)',
				inset: 10,
				sides: 10
			},
			previewImage: '',
			previewImages: []
		}, settings), presets);
		this.init();
	}

	/**
	* @function createPolygon
	* @param {Number} sides
	* @param {Number} inset
	* @param {Number} [width]
	* @description Returns a polygon in percentages
	*/
	createPolygon(sides, inset, precision = 2, width = 100) {
		const coords = [];
		const r = width / 2;
		let c = -.5 * Math.PI;
		const p = Math.PI / sides;
		const v = (1 - inset / 100) * r * Math.cos(p);
		let x, y;

		for (let i = 0; i < sides; i++) {
			x = (r * Math.cos(c)) + r;
			y = (r * Math.sin(c) + r);
			coords.push([x.toFixed(precision), y.toFixed(precision)]);
			c += p;
			x = (v * Math.cos(c)) + r;
			y = (v * Math.sin(c)) + r;
			coords.push([x.toFixed(precision), y.toFixed(precision)]);
			c += p;
		}
		return coords;
	}

	/**
	* @function handleInput
	* @param {Event} event
	* @description Handle main form input. Triggers when a user moves a range-slider or changes an input value.
	*/
	handleInput(event) {
		const element = event.target;
		const key = element.dataset.elm;
		if ('alpha,hue,lightness,presetDesc,presetName,saturation'.includes(key)) { return; }
		this.preset.values[0][key] = element.type === 'range' ? JSON.parse(element.value) : element.value;

		if (event.type === 'eventSetColor') {
			this.elements.app.style.setProperty('--color', event.detail);
		}
		this.setValue();
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		if (this.settings.previewImages.length) {
			this.settings.previewImages = this.settings.previewImages.split(',');
		}
		await super.init();
		Object.values(this.elements).forEach(element => {
			if (element.type && element.type === 'range') {
				element.__range = new RangeSlider(element, element.dataset)
			}
			this.elements[element.dataset.elm] = element;
		});

		const color = this.elements.color;
		new ColorPicker(color, color.dataset);
		color.addEventListener('eventSetColor', (event) => { this.handleInput(event) });

		this.elements.thumbnail.addEventListener('click', (event) => {
			const index = event.target.dataset.index-0;
			this.elements.preview.src = this.settings.previewImages[index];
			this.elements.animation.src = this.settings.previewImages[index];
		});
		this.setValue();
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
		this.elements.color.style.setProperty('--cp-bgc', this.preset.values[0].color);
		this.setValue();
	}

	/**
	* @function polygonToClippath
	* @paramn {Array} ccords
	* @description Transform an array of coords to clip-path
	*/
	polygonToClippath(coords) {
		return `polygon(${coords.map(p => { const [x,y] = p; return `${x}% ${y}%`}).join(', ')})`.replaceAll('.00','');
	}

	/**
	* @function polygonToSVG
	* @paramn {Array} ccords
	* @description Transform an array of coords to SVG points
	*/
	polygonToSVG(coords) {
		return `&lt;svg viewBox="0 0 100 100" &gt;&lt;polygon points="${coords.map(p => p.join(',')).join(' ')}" /&gt;&lt;svg&gt;`.replaceAll('.00','');
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
	* @description Updates preview
	*/
	setValue() {
		let coords = this.createPolygon(this.elements.sides.valueAsNumber, this.elements.animationinset.valueAsNumber);
		let polygon = this.polygonToClippath(coords);
		this.elements.app.style.setProperty('--hover', polygon);
		
		coords = this.createPolygon(this.elements.sides.valueAsNumber, this.elements.inset.valueAsNumber);
		polygon = this.polygonToClippath(coords);
		this.elements.app.style.setProperty('--clippath', polygon);

		this.preset.value = polygon;
		super.setCode();
		this.elements.svgCode.innerHTML = this.polygonToSVG(coords);
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
					<figure class="app__img-wrapper">
						<img src="${this.settings.previewImage}" class="app__img" data-elm="preview" />
					</figure>
				</div>

				<div class="app__controls">
					<div class="app__animation">
						<figure class="app__img-wrapper-animation">
							<img src="${this.settings.previewImage}" class="app__img-animation" data-elm="animation" />
						</figure>
						<header>
							<strong class="app__subheader">Animation preview</strong>
							<p class="app__text">Hover to see animation between <strong>Animation Inset</strong> and original <strong>Inset</strong>.</p>
						</header>
					</div>

					<label class="app__label--range"><span>Sides</span>
						<input type="range" class="c-rng" min="3" max="100" value="10" step="1" data-elm="sides" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Inset</span>
						<input type="range" class="c-rng" min="0" max="99" value="10" data-elm="inset" data-range="output"/>
					</label>
					<label class="app__label--range"><span>Animation Inset</span>
						<input type="range" class="c-rng" min="1" max="99" value="50" data-elm="animationinset" data-range="output"/>
					</label>
					<label class="app__label app__label--auto"><input type="text" data-elm="color" data-colorpicker="mini rgb update" value="rgba(74,112,201,1)" />Color</label>

					${this.templatePreviewImg(this.settings.previewImages)}

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
			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblCSSCode}</span></summary>
				<div class="app__code" data-elm="cssCode"></div>
			</details>
			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblSVGCode}</span></summary>
				<div class="app__code" data-elm="svgCode"></div>
			</details>

			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblPresetCode}</span></summary>
				<div class="app__code"><pre data-elm="presetCode"></pre></div>
			</details>
			<p>Sample photos from <a href="https://www.pexels.com">pexels.com</a></p>
		</form>`
	}
	/**
	* @function templatePreviewImg
	* @param {Array} images
	* @description Renders preview images
	*/	
	templatePreviewImg(images) {
		return `
			<div class="app__thumbnails" data-elm="thumbnail">
				${images.map((image, index) => { return `<button type="button" data-index="${index}" style="background-image:url(${image});" class="app__img-thumb"></button>`}).join('')}
			</div>`;
	}
}
