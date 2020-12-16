/**
 * FilterMaker module.
 * @module /assets/js/moviemaker
 * @version 0.0.1
 * @summary 28-11-2020
 * @description 
 * @example
 * <div data-js="moviemaker">
 */

import CssApp from './css-app.mjs';

export default class MovieMaker extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: '',
			clsDrag: 'app__img--drag',
			lblAppIntro: 'Description',
			lblFrames: 'Frames',
			lblMarkupCode: 'Markup',
			lblUploadImage: 'Upload or drag image',
		}, settings), presets);

		this.init();
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
				case 'loadFrame':
					this.loadFrame(element.dataset.frame - 0);
					break;
				case 'resetPreset':
					this.resetPreset();
					break;
				default: break;
			}
		}
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		await super.init();

		/* Add drag/drop functionality to preview-image-area */
		// this.elements.filedrop.addEventListener("change", this.setImage.bind(this));
		// this.elements.preview.addEventListener("dragover", (event) => { event.preventDefault(); return false; });
		// this.elements.preview.addEventListener("dragenter", () => { this.elements.preview.classList.add(this.settings.clsDrag); });
		// document.addEventListener("drop", () => { this.elements.preview.classList.remove(this.settings.clsDrag) ;});

	}

	loadFrame(index) {
		const frame = this.preset.values[index];
		this.elements.animation.value = frame.animation;
		this.elements.caption.value = frame.caption;
		this.elements.filter.value = frame.filter;
		this.elements.position.value = frame.position;
		this.elements.preview.src = frame.src;
		this.elements.subcaption.value = frame.subcaption;
	}

	loadPreset(element) {
		super.loadPreset(element);
		this.elements.frames.innerHTML = this.templateFrames(this.preset.values);
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
						<img src="" class="app__img" data-elm="preview" />
						<input type="file" id="${this.uuid}file" class="app__file-drop" data-elm="filedrop" />
					</figure>
					<label for="${this.uuid}file" class="app__label">${this.settings.lblUploadImage}</label>
				</div>

				<div class="app__controls">
					<label class="app__label">	
						<select data-elm="animation">
							<option value="">None</option>	
							<option value="kenburns-top">Ken Burns Top</option>
							<option value="kenburns-top-right">Ken Burns Top Right</option>
							<option value="kenburns-right">Ken Burns Right</option>
							<option value="kenburns-bottom-right">Ken Burns Bottom Right</option>
							<option value="kenburns-bottom">Ken Burns Bottom</option>
							<option value="kenburns-bottom-left">Ken Burns Bottom Left</option>
							<option value="kenburns-left">Ken Burns Left</option>
							<option value="kenburns-top-left">Ken Burns Top Left</option>
							<option value="shake">Shake</option>
						</select>
						animation
					</label>

					<label class="app__label">	
						<select data-elm="filter">
							<option value="">None</option>	
							<option value="grainy">Silent Movie</option>
						</select>
						filter
					</label>

					<label class="app__label"><input type="text" data-elm="caption" data-lpignore="true" size="15">caption</label>
					<label class="app__label"><input type="text" data-elm="subcaption" data-lpignore="true" size="15">subcaption</label>
			
					<label class="app__label">	
					<select data-elm="position">
						<option value="">Default</option>	
						<option value="bottom left">bottom left</option>
					</select>
					caption position
				</label>

					<div class="app__fieldset" hidden>
						<label class="app__label"><input type="text" data-elm="presetName" data-lpignore="true" size="15">${this.settings.lblPresetName}</label>
					</div>
					<div class="app__fieldset" hidden>
						<label class="app__label"><textarea data-elm="presetDesc" data-lpignore="true"></textarea>${this.settings.lblPresetDesc}</label>
					</div>
					<div class="app__fieldset app__button-group" hidden>
						<button type="button" class="app__button app__button--reset" data-elm="resetPreset">${this.settings.lblReset}</button>
						<button type="button" class="app__button" data-elm="addPreset">${this.settings.lblAddPreset}</button>
					</div>
				</div>
			</div>

			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblFrames}</span></summary>
				<div class="app__panel app__panel--frames" data-elm="frames">

				</div>
			</details>

			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblPresets}</span></summary>
				<div class="app__panel" data-elm="presets"></div>
			</details>
			<details class="app__details">
			<summary class="app__summary"><span>${this.settings.lblPresetCode}</span></summary>
			<div class="app__code"><pre data-elm="presetCode"></pre></div>
		</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblMarkupCode}</span></summary>
				<div class="app__code"><pre data-elm="markupCode"></pre></div>
			</details>

		</form>`
	}

	/**
	* @function templateFrames
	* @param {Array} frames
	* @description Renders filters
	*/	
	templateFrames(frames) {
		return `
		${frames.map((frame, index) => { return `
			<button type="button" class="app__frame" data-elm="loadFrame" data-frame="${index}">
				${frame.src ? `<img src="${frame.src}" />` : `<div>TEXT</div>`}
			</button>`}).join('')}`;
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