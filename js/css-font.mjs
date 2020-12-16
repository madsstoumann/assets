/**
 * CssTransform module.
 * @module /assets/js/filtermaker

 * @version 0.0.1
 * @summary 12-05-2020
 * @description 
 * @example
 * <div data-js="transform">
 * https://developers.google.com/fonts/docs/css2?hl=da
 */

import CssApp from './css-app.mjs';
import AutoSuggest from './autosuggest.mjs';
import RangeSlider from './range.mjs';

export default class CssFont extends CssApp {
	constructor(element, settings) {
		super(element, Object.assign({
			lblAppHeader: 'CSS Transform Editor',
			lblFontSearch: 'Search Google Fonts',
			lblFontSize: 'Preview size',
			lblSpecimen: 'The quick brown fox jumps over the lazy dog',
			urlFontList: '',
			urlVariableList: '',
		}, settings));

		this.init()
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		await super.init();

		if (this.elements.fontSize) {
			this.elements.fontSize.__range = new RangeSlider(this.elements.fontSize, this.elements.fontSize.dataset)
		}

		if (this.elements.fontList) {
			new AutoSuggest(this.elements.fontList, this.elements.fontList.dataset);
			this.elements.fontList.addEventListener('autoSuggestSelect', (event) => {
				/* TODO: setValue method, that can also load from preset */
				this.font = event.detail;
				this.setValue(this.font);
				this.elements.fontSizes.innerHTML = this.templateFontSizes(this.font);
				this.elements.fontInfo.innerHTML = this.templateFontInfo(this.font);
				console.log(this.font);
			});
		}
	}

	setStyleLink(url) {
		console.log(url)
		if (this.link) {
			this.link.parentNode.removeChild(this.link);
		}
		const link = document.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		link.href = url;
		this.link = link;
		document.head.appendChild(this.link);
	}

	setValue(font) {
		/* TODO: HANDLE WEIGHT 
		/TODO: Replace 'regular' with 400
		:wght@${this.font.variants.map(variant => { return variant }).join(';')}
		*/
		this.setStyleLink(`https://fonts.googleapis.com/css2?family=${font.family.replace(' ', '+')}`);
		this.elements.app.style.setProperty(`--font-family`,`${font.family}, ${font.category}`);
	}

	/**
	* @function template
	* @description Renders main template for ColorPicker
	*/
	template() {
		return `
		<form class="app" data-elm="app">
			<strong class="app__header">${this.settings.lblAppHeader}</strong>
			<div data-elm="fontSpecimen">${this.settings.lblSpecimen}</div>
			<div data-elm="fontSizes"></div>
			<div class="app__edit">
				<div class="app__preview">
					
					
					<div data-elm="fontInfo"></div>
				</div>

				<div class="app__controls">

					<div class="app__fieldset app__fieldset--topspace">
						<div class="app__label app__panel-wrapper">
							<input type="search" data-elm="fontList" minlength="1" maxlength="30" placeholder="${this.settings.lblFontSearch}"
							data-js="autosuggest"
							data-api="${this.settings.urlFontList}"
							data-search-keys=':["family"]'
							data-search-object=":true"
							data-search-object-key="items"
							required>
						</div>
					</div>

					<label class="app__label--range"><span>${this.settings.lblFontSize}</span>
						<input type="range" class="c-rng" min="8" max="112" value="32" step="1" data-elm="fontSize" data-suffix="px" data-range-output=":true" />
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
			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblCSSCode}</span></summary>
				<div class="app__code" data-elm="cssCode"></div>
			</details>
			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblPresetCode}</span></summary>
				<div class="app__code"><pre data-elm="presetCode"></pre></div>
			</details>
		</form>`
	}

	templateFontInfo(font) {
		return `
				<strong>category:</strong> ${font.category}<br />
				<strong>last-modified:</strong> ${font.lastModified}<br />
				<strong>version:</strong> ${font.version}<br />
		
		`
	}

	templateFontSizes(font) {
		return `
			${font.variants.map(variant => { return `<div>${font.family} ${variant}</div>` }).join('')}
		`
	}
}