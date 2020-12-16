/**
 * FilterMaker module.
 * @module /assets/js/filtermaker
 * @version 0.1.5
 * @summary 23-11-2020
 * @description 
 * @example
 * <div data-js="filtermaker">
 * Thanks to yoksel for the great SVG filters, which I shamelessly copied:
 * https://yoksel.github.io/svg-filters/#/presets
 * https://yoksel.github.io/svg-gradient-map
 */

import CssApp from './css-app.mjs';
import RangeSlider from './range.mjs';

export default class CssFilter extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: 'filter',
			clsDrag: 'app__img--drag',
			filterFile: '/docs/assets/svg/filters.svg',
			lblAppHeader: 'CSS Filter Editor',
			lblBlur: 'blur',
			lblBrightness: 'brightness',
			lblContrast: 'contrast',
			lblFilters: 'url(#filter)',
			lblGrayscale: 'grayscale',
			lblHueRotate: 'hue-rotate',
			lblInvert: 'invert',
			lblOpacity: 'opacity',
			lblSaturate: 'saturate',
			lblSepia: 'sepia',
			lblUploadImage: 'Upload or drag image',
			presetEntry: {
				blur: 0,
				brightness: 1,
				contrast: 1,
				grayscale: 0,
				'hue-rotate': 0,
				invert: 0,
				opacity: 1,
				saturate: 1,
				sepia: 0,
				url: ''
			},
			previewImage: '../assets/img/filter-demo.jpg'
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
		this.settings.previewImages = this.settings.previewImage.split(',');
		await super.init();

		/* Add RangeSliders */
		Object.values(this.elements).forEach(element => {
			if (element.type && element.type === 'range') {
				element.__range = new RangeSlider(element, element.dataset)
			}
			this.elements[element.dataset.elm] = element;
		});

		/* Add drag/drop functionality to preview-image-area */
		this.elements.filedrop.addEventListener("change", this.setImage.bind(this));
		this.elements.preview.addEventListener("dragover", (event) => { event.preventDefault(); return false; });
		this.elements.preview.addEventListener("dragenter", () => { this.elements.preview.classList.add(this.settings.clsDrag); });
		document.addEventListener("drop", () => { this.elements.preview.classList.remove(this.settings.clsDrag) ;});

		this.elements.thumbnail.addEventListener('click', (event) => { this.elements.preview.src = this.settings.previewImages[event.target.dataset.index-0] })

		/* Load optional svg-filters from file */
		const localFilter = this.settings.filterFile.startsWith('#');
		const filterFile = localFilter ? document.querySelector(this.settings.filterFile)?.outerHTML : await (await fetch(this.settings.filterFile)).text();
		if (filterFile) {
			if (!localFilter) {
				document.body.insertAdjacentHTML('beforeend', filterFile);
			}
			const parser = new DOMParser;
			const doc = parser.parseFromString(filterFile, 'text/xml');
			const filters = doc.querySelectorAll('filter');
			this.settings.filters = [...filters].map(filter => { return { id: filter.id, title: filter.title }})
			this.elements.filters.innerHTML = this.templateFilters(this.settings.filters);
		}
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

		let input;
		let hasSVG = false;
		let svgID = 'none';

		/* Merge preset with default settings */
		const obj = {...this.settings.presetEntry, ...this.preset.values[0]};

		Object.entries(obj).forEach(arr => {
			const [key, value] = [...arr];
			
			if (key === 'url') {
				/* Extract SVG filter-id */
				const url = value.match(/#(.*)'/);
				if (url && url.length && url[1]) {
					svgID = url[1];
				}
				input = this.elements.app.elements[`filter-${svgID}`];

				if (input) {
					hasSVG = true;
					input.checked = true;
				}
			}
			else {
				input = this.elements.app.elements[key];
			}

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

		if (!hasSVG) {
			input = this.elements.app.elements[`filter-${svgID}`];
			if (input) { input.checked = true; }
		}

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
	* @function setImage
	* @description Sets preview-image to dragged (or file-upload) image-src.
	*/
	setImage(event) {
		const reader = new FileReader();
		reader.onload = (e) => {
			this.elements.preview.setAttribute("src", e.target.result);
		};
		reader.readAsDataURL(event.target.files[0]);
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
			if (key === 'blur') { 
				suffix = 'px'; }
			else if (key === 'hue-rotate') { 
				suffix = 'deg';
			}
			else {
				suffix = '';
			}
			str += (key === 'url')  ? `${obj[key]} ` : `${key}(${obj[key]}${suffix}) `;
		}
		this.preset.value = str.trim();
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
					<figure class="app__img-wrapper">
						<img src="${this.settings.previewImages[0]}" class="app__img" data-elm="preview" />
						<input type="file" id="${this.uuid}file" class="app__file-drop" data-elm="filedrop" />
					</figure>
					<label for="${this.uuid}file" class="app__label">${this.settings.lblUploadImage}</label>
					<details data-elm="filters-wrapper" open>
						<summary class="app__summary"><span>${this.settings.lblFilters}</span></summary>
						<div class="app__panel" data-elm="filters"></div>
					</details>
				</div>

				<div class="app__controls">
					${this.templatePreviewImg(this.settings.previewImages)}

					<label class="app__label--range"><span>${this.settings.lblBlur}</span>
						<input type="range" class="c-rng" min="0" max="10" value="0" step="0.1" name="blur" data-elm="blur" data-suffix="px" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblBrightness}</span>
						<input type="range" class="c-rng" min="0" max="3" value="1" step="0.1" name="brightness" data-elm="brightness" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblContrast}</span>
						<input type="range" class="c-rng" min="0" max="3" value="1" step="0.1" name="contrast" data-elm="contrast" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblGrayscale}</span>
						<input type="range" class="c-rng" min="0" max="1" value="0" step="0.01" name="grayscale" data-elm="grayscale" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblHueRotate}</span>
						<input type="range" class="c-rng" min="0" max="360" value="0" name="hue-rotate" data-elm="hue-rotate" data-suffix="deg" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblInvert}</span>
						<input type="range" class="c-rng" min="0" max="1" value="0" step="0.01" name="invert" data-elm="invert" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblOpacity}</span>
						<input type="range" class="c-rng" min="0" max="1" value="1" step="0.01" name="opacity" data-elm="opacity" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblSaturate}</span>
						<input type="range" class="c-rng" min="0" max="3" value="1" step="0.1" name="saturate" data-elm="saturate" data-range="output" />
					</label>
					<label class="app__label--range"><span>${this.settings.lblSepia}</span>
						<input type="range" class="c-rng" min="0" max="1" step="0.01" value="0" name="sepia" data-elm="sepia" data-range="output" />
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
			<p><strong>CREDITS:</strong> The SVG-gradient filters under <code>url(#filter)</code> are from <a href="https://yoksel.github.io/svg-gradient-map">SVG Gradient Map Filter</a><br /> 
			Sample photos from <a href="https://www.pexels.com">pexels.com</a>
		</form>`
	}

	/**
	* @function templateFilters
	* @param {Array} filters
	* @description Renders filters
	*/	
	templateFilters(filters) {
		return `
			<label class="app__label--radio">
				<input type="radio" class="u-hidden" id="filter-none" name="url" data-elm="url" value="" checked />
				<span>none</span>
			</label>
		${filters.map(filter => { return `
			<label class="app__label--radio">
				<input type="radio" class="u-hidden" id="filter-${filter.id}" name="url" data-elm="url" value="url('#${filter.id}')" />
				<span>${filter.title || filter.id}</span>
			</label>`}).join('')}`;
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