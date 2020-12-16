/**
 * FilterMaker module.
 * @module /assets/js/comicframe
 * @version 0.0.1
 * @summary 30-11-2020
 * @description 
 * @example
 * <div data-js="comicframe">
 */

import CssApp from './css-app.mjs';
import RangeSlider from './range.mjs';

export default class ComicFrame extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: 'filter',
			lblAppHeader: 'Comic',
			lblAppIntro: 'Hello World',
			previewImage: '/docs/assets/img/spidey.jpg'
		}, settings), presets);

		this.init();
	}



	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		await super.init();

		const ctx = this.elements.canvas.getContext('2d');
		let img = new Image;
			img.onload = () => {
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.elements.canvas.width, this.elements.canvas.height);

				// const imgData = ctx.getImageData(0, 0, this.elements.canvas.width, this.elements.canvas.height);
				const imgData = ctx.getImageData(0, 0, 7, 7);
				console.log(imgData)
			};
		img.src = this.settings.previewImage;
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
				<canvas class="app__preview" data-elm="canvas">

				</canvas>

				<div class="app__controls">

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