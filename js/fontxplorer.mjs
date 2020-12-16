/**
 * FontXplorer module.
 * @module /assets/js/fontxplorer
 * @requires /assets/js/common
 * @version 0.0.1
 * @summary 22-03-2020
 * @description Font Xplorer
 * @example
 * <section data-js="fontxplorer">
 * https://www.googleapis.com/webfonts/v1/webfonts?key=
 * 
 * TODO: letter-spacing ! presets etc.
 */

import { stringToType, uuid } from './common.mjs';

export default class FontXplorer {
	constructor(element, settings) {
		this.settings = Object.assign({
			eventAddFont: 'eventAddFont',
			eventDelFont: 'eventDelFont',
			fontCategories: ['serif', 'sans-serif', 'display', 'handwriting', 'monospace'],
			fontFamilies: ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'emoji', 'math', 'fangsong'],
			fonts: {
				name: 'Fonts',
				open: true,
				values: [
					{
						var: 'body-text',
						deletable: false
					},
					{
						var: 'display',
						deletable: false
					},
					{
						var: 'headline',
						deletable: false
					},
					
					{
					name: 'Inter',
					category: 'sans-serif',
					axes: [
						{
							slnt: [-10,0],
							wght: [100,900]
						}
					],
					url: ''
				}]
			},
			gFontApi: '../assets/data/gfonts.json',
			gFontList: [],
			gFontVar: [
				{
					name: 'Changa',
					category: 'sans-serif',
					wghtFrom: 200,
					wghtTo: 800
				},
				{
					name: 'Comfortaa',
					category: 'sans-serif',
					wghtFrom: 300,
					wghtTo: 700
				},
				{
					name: 'Crimson Pro',
					category: 'serif',
					wghtFrom: 200,
					wghtTo: 900
				},
				{
					name: 'Dancing Script',
					category: 'cursive',
					wghtFrom: 400,
					wghtTo: 700
				},
				{
					name: 'Dosis',
					category: 'sans-serif',
					wghtFrom: 200,
					wghtTo: 800
				},
				{
					name: 'EB Garamond',
					category: 'serif',
					wghtFrom: 400,
					wghtTo: 800
				},
				{
					name: 'Faustina',
					category: 'serif',
					wghtFrom: 400,
					wghtTo: 700
				},
				{
					name: 'Fira Code',
					category: 'monospace',
					wghtFrom: 300,
					wghtTo: 700
				},
				{
					name: 'Hepta Slab',
					category: 'serif',
					wghtFrom: 100,
					wghtTo: 900
				},
				{
					name: 'Inter',
					category: 'sans-serif',
					wghtFrom: 100,
					wghtTo: 900
				}
				
			],
			lblAddFont: 'Add font',
			storageKey: 'font-xplorer',
			useLocalStorage: true
			
		}, stringToType(settings));

		this.app = element;
		this.initFontXplorer();
	}

	/**
	* @function findFont
	* @param {String} key
	* @description Look up a font in one of the collections
	*/
	findFont(collection, key) {
		return collection.find(font => { return font.name === key });
	}

	/**
	* @function handleInput
	* @param {Event} event
	* @description Handle main form input. Triggers when a user moves a range-slider or changes an input value.
	*/
	handleInput(event) {
		const element = event.target;
		switch(element.dataset.elm) {
			case 'fontList': {
				const font = this.findFont(this.settings.gFontVar, element.value);
				if (font) {
					this.setStyleLink(`https://fonts.googleapis.com/css2?family=${font.name.replace(' ', '+')}:wght@${font.wghtFrom}..${font.wghtTo}`);
					this.elements.fxp.style.setProperty(`--fxp-ff`,`${font.name}, ${font.category}`);

					let str = '';
					for (let i = font.wghtFrom; i <= font.wghtTo; i = i + 100) {
						str += `<p style="font-variation-settings: 'wght' ${i};">Font Weight ${i}</p>`
					}

					this.elements.fontWeights.innerHTML = str;
				}
				break;
			}
			default: break;
		}
	}

	/**
	* @function initFontXplorer
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async initFontXplorer() {
		this.app.innerHTML = this.template();
		this.elements = {};
		this.clickTimer = null;
		this.clickTimerDuration = 800;
		this.app.querySelectorAll(`[data-elm]`).forEach(element => {
			this.elements[element.dataset.elm] = element;
		});

		if (this.settings.gFontApi) {
			this.settings.gFontList = await (await fetch(this.settings.gFontApi)).json();
			const filter = this.settings.gFontList.items.filter(font => {return font.category === 'handwriting'});
			console.log(filter)
		}

		this.linkID = uuid();
	
		/* Add eventListeners */
		// this.elements.add.addEventListener('click', () => { this.addSwatch() });
		this.elements.fxp.addEventListener('input', this.handleInput.bind(this));
		// this.elements.colors.addEventListener('keydown', this.keyDown.bind(this));
		// this.elements.colors.addEventListener('pointerdown', this.pointerDown.bind(this));
		// this.elements.colors.addEventListener('pointerup', this.pointerUp.bind(this));
		// this.elements.selected.addEventListener('click', this.copySwatch.bind(this));

		if (this.settings.useLocalStorage) {
			// this.settings.swatches.values = JSON.parse(window.localStorage.getItem(this.settings.storageKey) || []);
			// this.renderSwatches();
		}

		/* Set initial color */
		// this.setColor(this.elements.selected);

		console.log(this);
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
				case ' ': this.setColor(element); break;
				case 'Delete': this.deleteSwatch(element); break;
				default: break;
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
			this.setColor(element);
			if (!this.clickTimer) {
				this.clickTimer = setTimeout(() => { this.deleteSwatch(element) }, this.clickTimerDuration);
			}
		}
	}

	/**
	* @function setFont
	* @param {Node} element
	* @param {Boolean} updateProps If `true`: update CSS Custom Props and range-sliders.value
	* @param {Boolean} updateHSL If `true`: update HSLA inputs
	* @param {Boolean} updateRGB If `true`: update RGBA inputs
	* @param {Boolean} updateHEX If `true`: update HEX input
	* @description Sets current color from swatch/range or default CSS Custom Props.
	*/
	setFont(element) {
		
	}

	setStyleLink(url) {
		if (this.link) {
			this.link.parentNode.removeChild(this.link);
		}
		const link = document.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		link.href = url;
		this.link = link;
		document.head.appendChild(this.link);
	}

	/**
	* @function template
	* @description Renders main template for ColorPicker
	*/
	template() {
		return `
		<form class="c-fxp" data-elm="fxp">
			<h1 contenteditable class="c-fxp__headline">
				The quick brown fox jumps over the lazy dog
			</h1>
			<p class="c-fxp__specimen">
				ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ‘?’“!”(%)[#]{@}/&\\<-+÷×=>®©$€£¥¢:;,.*
			</p>
			<p class="c-fxp__specimen" data-elm="fontWeights"></p>

			<select class="c-fxp__list" data-elm="fontList">
				${this.settings.gFontVar.map(font => { return `<option>${font.name}</option>`}).join('')}
			</select>

			<div class="cp__inner">
				<div class="cp__ranges">
				
				</div>

				<div class="cp__inputs">
					<div class="cp__fieldset">

					<select data-elm="fontType">
						<option selected>Google Font</option>
						<option>Google Variable Font</option>
						<option>Local Font</option>
						<option>Websafe Font</option>
					</select>

					
					</div>
				
					<div class="cp__fieldset">
						<label class="cp__label"><input type="text" data-elm="fontName" data-lpignore="true" size="15" />${this.settings.lblFontName}</label>
					</div>

					<button type="button" data-elm="add" disabled>${this.settings.lblAddFont}</button>

				</div>
			</div>

		</form>`
	}
}