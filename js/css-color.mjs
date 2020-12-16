/**
 * ColorPicker module.
 * @module /assets/js/colorpicker
 * @requires /assets/js/common
 * @version 0.4.5
 * @summary 12-12-2020
 * @description CSS Color Editor
 * @example
 * <div data-js="color">
 */

import { brightness, cmyk2rgb, rgb2arr, rgb2cmyk, rgb2hex, rgb2hsl } from './colorlib.mjs'
import CssApp from './css-app.mjs';

export default class CSSColor extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			lblAddStop: 'Add current color',
			lblAlpha: 'Alpha',
			lblAngle: 'Angle',
			lblAppHeader: 'CSS Color Editor',
			lblAppIntro: 'Click on either “Solid Color” or “Gradient” to toggle between the two editors. <br />When you save a preset, it will be either a “Solid Color” or “Gradient”, depending on which editor you\'ve chosen.<br />Hover and click on preview-areas to copy the current value to the clipboard. A gradient needs at least two colors, before the preview will display anything.',
			lblBrightness: 'Brightness',
			lblColorDelete: '✕',
			lblColorDeleteQuery: 'Delete color-stop?',
			lblColorHint: 'Color/Hint',
			lblColorOrder: 'Order',
			lblColorStop: 'Stop',
			lblGradient: 'Gradient',
			lblGradientType: 'Gradient type',
			lblHue: 'Hue',
			lblLightness: 'Lightness',
			lblSaturation: 'Saturation',
			lblSolid: 'Solid Color',
			libraries: [
				{
					name: 'Generated Colors',
					open: true,
					subgroups: [
						{
							name: 'Primary/Complimentary',
							values: [
								{ name: 'Primary', value: 'var(--cp-prm)' },
								{ name: 'Complimentary', value: 'var(--cp-com)' }
							]
						},
						{
							name: 'Analogous',
							values: [
								{ name: 'Analogous 1', value: 'var(--cp-an1)' },
								{ name: 'Primary', value: 'var(--cp-prm)' },
								{ name: 'Analogous 2', value: 'var(--cp-an2)' }
							]
						},
						{
							name: 'Triad',
							values: [
								{ name: 'Primary', value: 'var(--cp-prm)' },
								{ name: 'Triad 1', value: 'var(--cp-tr1)' }, 
								{ name: 'Triad 2', value: 'var(--cp-tr2)' }
							]
						},
						{
							name: 'Split Complimentary',
							values: [
								{ name: 'Primary', value: 'var(--cp-prm)' },
								{ name: 'Split Complimentary 1', value: 'var(--cp-sc1)' },
								{ name: 'Split Complimentary 2', value: 'var(--cp-sc2)' }
							]
						},
						{
							name: 'Rectangle',
							values: [
								{ name: 'Primary', value: 'var(--cp-prm)' },
								{ name: 'Rectangle', value: 'var(--cp-rc1)' },
								{ name: 'Complimentary', value: 'var(--cp-com)' },
								{ name: 'Split Complimentary 2', value: 'var(--cp-sc2)' }
							]
						},
						{
							name: 'Square',
							values: [
								{ name: 'Primary', value: 'var(--cp-prm)' },
								{ name: 'Square 1', value: 'var(--cp-sq1)' },
								{ name: 'Complimentary', value: 'var(--cp-com)' },
								{ name: 'Square 2', value: 'var(--cp-sq2)' }
							]
						},
						{
							name: 'Shades',
							values: [
								{ name: 'Shade 10%', value: 'var(--cp-sh1)' },
								{ name: 'Shade 20%', value: 'var(--cp-sh2)' },
								{ name: 'Shade 30%', value: 'var(--cp-sh3)' },
								{ name: 'Shade 40%', value: 'var(--cp-sh4)' },
								{ name: 'Shade 50%', value: 'var(--cp-sh5)' },
								{ name: 'Shade 60%', value: 'var(--cp-sh6)' },
								{ name: 'Shade 70%', value: 'var(--cp-sh7)' },
								{ name: 'Shade 80%', value: 'var(--cp-sh8)' },
								{ name: 'Shade 90%', value: 'var(--cp-sh9)' }
							]
						},
						{
							name: 'Tints',
							values: [
								{ name: 'Tint 10%', value: 'var(--cp-tn1)' },
								{ name: 'Tint 20%', value: 'var(--cp-tn2)' },
								{ name: 'Tint 30%', value: 'var(--cp-tn3)' },
								{ name: 'Tint 40%', value: 'var(--cp-tn4)' },
								{ name: 'Tint 50%', value: 'var(--cp-tn5)' },
								{ name: 'Tint 60%', value: 'var(--cp-tn6)' },
								{ name: 'Tint 70%', value: 'var(--cp-tn7)' },
								{ name: 'Tint 80%', value: 'var(--cp-tn8)' },
								{ name: 'Tint 90%', value: 'var(--cp-tn9)' }
							]
						}	
					]
				},
				{
					name: 'Color Libraries',
					subgroups: [
						{
							name: 'CSS Named Colors',
							values: ['black','dimgray','dimgrey','gray','grey','darkgray','darkgrey','silver','lightgray','lightgrey','gainsboro','whitesmoke','white','rosybrown','indianred','brown','firebrick','lightcoral','maroon','darkred','red','snow','salmon','mistyrose','tomato','darksalmon','orangered','coral','lightsalmon','sienna','chocolate','saddlebrown','seashell','sandybrown','peachpuff','peru','linen','darkorange','bisque','tan','burlywood','antiquewhite','navajowhite','blanchedalmond','papayawhip','moccasin','wheat','oldlace','orange','floralwhite','goldenrod','darkgoldenrod','cornsilk','gold','khaki','lemonchiffon','palegoldenrod','darkkhaki','beige','lightgoldenrodyellow','olive','yellow','lightyellow','ivory','olivedrab','yellowgreen','darkolivegreen','greenyellow','lawngreen','chartreuse','darkseagreen','forestgreen','limegreen','lightgreen','palegreen','darkgreen','green','lime','honeydew','seagreen','mediumseagreen','springgreen','mintcream','mediumspringgreen','mediumaquamarine','aquamarine','turquoise','lightseagreen','mediumturquoise','darkslategray','darkslategrey','paleturquoise','teal','darkcyan','aqua','cyan','lightcyan','azure','darkturquoise','cadetblue','powderblue','lightblue','deepskyblue','skyblue','lightskyblue','steelblue','aliceblue','slategray','slategrey','lightslategray','lightslategrey','dodgerblue','lightsteelblue','cornflowerblue','royalblue','midnightblue','lavender','navy','darkblue','mediumblue','blue','ghostwhite','darkslateblue','slateblue','mediumslateblue','mediumpurple','rebeccapurple','blueviolet','indigo','darkorchid','darkviolet','mediumorchid','thistle','plum','violet','purple','darkmagenta','fuchsia','magenta','orchid','mediumvioletred','deeppink','hotpink','palevioletred','lavenderblush','crimson','pink','lightpink']
						},
						{
							name: 'Websafe',
							values: ['#001F3F','#0074D9','#7FDBFF','#39CCCC','#3D9970','#2ECC40','#01FF70','#FFDC00','#FF851B','#FF4136','#F012BE','#B10DC9','#85144B','#FFFFFF','#DDDDDD','#AAAAAA','#111111']
						},
						{
							name: 'CSS System Colors',
							values: ['Canvas','CanvasText','LinkText','VisitedText','ActiveText','ButtonFace','ButtonText','Field','FieldText','Highlight','HighlightText']
						}
					]
				}
			],

			svgTransparent: `url('data:image/svg+xml;utf8,<svg preserveAspectRatio="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="5" height="5" fill="grey" /><rect x="5" y="5" width="5" height="5" fill="grey" /><rect x="5" y="0" width="5" height="5" fill="white" /><rect x="0" y="5" width="5" height="5" fill="white" /></svg>')`
		}, settings), presets);

		this.init();
	}

	/**
	* @function addStop
	* @description Adds a color-stop to a gradient
	*/
	addStop() {
		const rgb = this.getBGC(this.elements.selected);
		this.preset.values.push({
			color: rgb,
			stop: ''
		});
		this.elements.colorStops.innerHTML = this.templateColorStops();
		this.renderGradient();
	}

	/**
	* @function copySwatch
	* @description Copies a swatch-color-string to the clipboard
	*/
	copySwatch(element) {
		if (element === this.elements.selected) { 
			const rgb = this.getBGC(this.elements.selected);
			this.elements.clipboard.value = rgb2hex(rgb);
		}
		else {
			this.elements.clipboard.value = this.setGradient();
		}
		this.elements.clipboard.select();
		document.execCommand('copy');
	}

	/**
	* @function deleteStop
	* @param {Node} element
	* @description Delete a color-stop from gradient
	*/
	deleteStop(element) {
		const index = parseInt(element.dataset.index, 10);
		this.preset.values.splice(index, 1);
		this.elements.colorStops.innerHTML = this.templateColorStops();
		this.renderGradient();
	}

	/**
	* @function getBGC
	* @param {Node} element
	* @description Get computed background-color for selected element
	*/
	getBGC(element) {
		return window.getComputedStyle(element).getPropertyValue('background-color');
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
					super.addPreset();
					break;
				case 'addStop':
					this.addStop();
					break;
				case 'gradientColor':
					this.setColor(element);
					break;
				case 'gradientStopDelete':
					this.deleteStop(element);
					break;
				case 'preset':
					this.setColor(element);
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
		let index = 0;
		/* If range-slider, set related CSS Custom prop */
		if (element.type === 'range') {
			this.elements.app.style.setProperty(`--${element.dataset.elm}`,`${element.value}${element.dataset.suffix || ''}`);
			this.setColor(this.elements.selected, false);
		}
		else {
			let color;
			let updateCMYK = true;
			let updateHEX = true;
			let updateHSL = true;
			let updateRGB = true;

			switch(element.dataset.elm) {
				case 'colorGradient':
					this.preset.type = this.elements.gradientType.value;
					this.toggleTool(false);
					return;
				case 'colorSolid':
					this.preset.type = 'color';
					this.toggleTool(true);
					return;
				case 'gradientAngle':
					this.preset.angle = element.value;
					this.renderGradient();
					return;
				case 'gradientOrder':
					this.reorderGradient(element);
					this.renderGradient();
					return;
				case 'gradientStop':
					index = parseInt(element.dataset.index, 10);
					this.preset.values[index].stop = element.value || '';
					this.renderGradient();
					return;
				case 'gradientStopColor':
					index = parseInt(element.dataset.index, 10);
					this.preset.values[index].color = element.value || '';
					this.renderGradient();
					return;
				case 'gradientType':
					this.preset.type = element.value;
					this.renderGradient();
					return;
				case 'hex':
					this.elements.sample.style.background = element.value;
					updateHEX = false;
				break;
				case 'hslH': case 'hslS': case 'hslL': case 'hslA':
					this.elements.sample.style.background = `hsla(${this.elements.hslH.value},${this.elements.hslS.value}%,${this.elements.hslL.value}%,${this.elements.hslA.value})`;
					updateHSL = false;
					break;
				case 'rgbR': case 'rgbG': case 'rgbB': case 'rgbA':
					this.elements.sample.style.background = `rgba(${this.elements.rgbR.value},${this.elements.rgbG.value},${this.elements.rgbB.value},${this.elements.rgbA.value})`;
					updateRGB = false;
					break;
				case 'cmyC': case 'cmyM' : case 'cmyY' : case 'cmyK':
					color = cmyk2rgb(this.elements.cmyC.value, this.elements.cmyM.value, this.elements.cmyY.value, this.elements.cmyK.value);
					this.elements.sample.style.background = `rgba(${color.r},${color.g},${color.b},1)`;
					updateCMYK = false;
					break;
				default: return;
			}
			this.setColor(this.elements.sample, true, updateHSL, updateRGB, updateHEX, updateCMYK);
		}
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		await super.init();

		/* Add eventListeners */
		this.elements.selected.addEventListener('click', (event) => {return this.copySwatch(event.target)});
		this.elements.gradient.addEventListener('click', (event) => {return this.copySwatch(event.target)});

		/* Set initial color */
		this.setColor();
	}

		/**
	* @function loadPreset
	* @paramn {Node} element
	* @description Loads preset / overwrites preset
	*/
	loadPreset(element) {
		super.loadPreset(element);
		if (this.preset.type === 'color') {
			this.setColor(element);
			this.elements.colorSolid.checked = true;
			this.toggleTool();
		}
		else {
			this.elements.gradientAngle.value = this.preset.angle || 90;
			this.elements.gradientType.value = this.preset.type;
			this.elements.colorStops.innerHTML = this.templateColorStops();
			this.renderGradient();
			this.elements.colorGradient.checked = true;
			this.toggleTool(false);
		}
	}

	/**
	* @function renderGradient
	* @description Renders/updates gradient preview
	*/
	renderGradient() {
		this.elements.gradient.style.backgroundImage = this.setGradient();
	}

	/**
	* @function reorderGradient
	* @param (Node) element
	* @description Change order of color-stops in gradient
	*/
	reorderGradient(element) {
		const oldpos = element.dataset.index;
		const newpos = element.valueAsNumber-1;
		const item = this.preset.values[oldpos];
		this.preset.values.splice(oldpos, 1);
    this.preset.values.splice(newpos, 0, item);
		this.elements.colorStops.innerHTML = this.templateColorStops();
	}

	/**
	* @function resetPreset
	* @description Resets preset to default
	*/
	resetPreset() {
		super.resetPreset();
		this.elements.colorStops.innerHTML = '';
		this.elements.gradient.removeAttribute('style');
		this.elements.gradientType.value = 'linear-gradient';
		this.elements.gradientAngle.value = 90;
		this.preset.type = this.elements.colorSolid.checked ? 'color' : 'linear-gradient';
	}

	/**
	* @function setCode
	* @description Shows genereated CSS Code
	*/
	setCode() {
		const prefix = this.elements.colorSolid.checked ? 'color: ' : 'background-image: ';
		this.elements.cssCode.innerText = `${prefix}${this.preset.value}`;
	}

	/**
	* @function setColor
	* @param {Node} element
	* @param {Boolean} updateProps If `true`: update CSS Custom Props and range-sliders.value
	* @param {Boolean} updateHSL If `true`: update HSLA inputs
	* @param {Boolean} updateRGB If `true`: update RGBA inputs
	* @param {Boolean} updateHEX If `true`: update HEX input
	* @param {Boolean} updateCMYK If `true`: update CMYK input
	* @description Sets current color from swatch/range or default CSS Custom Props.
	*/
	setColor(element = this.elements.selected, updateProps = true, updateHSL = true, updateRGB = true, updateHEX = true, updateCMYK = true) { 
		const rgb = this.getBGC(element);
		const [r, g, b, alpha] = rgb2arr(rgb);
		const [c, m, y, k] = rgb2cmyk(r, g, b);
		const [h, s, l] = updateProps ? rgb2hsl(r, g, b) : [this.elements.hue.value, this.elements.saturation.value, this.elements.lightness.value];
		const a = parseFloat(alpha, 10) || 1;

		if (updateProps) {
		/* Set CSS Custom Props */
			this.elements.app.style.setProperty(`--hue`,`${h}`);
			this.elements.app.style.setProperty(`--saturation`,`${s}%`);
			this.elements.app.style.setProperty(`--lightness`,`${l}%`);
			this.elements.app.style.setProperty(`--alpha`,`${a}`);

			/* Set range-sliders */
			this.elements.hue.value = h;
			this.elements.saturation.value = s;
			this.elements.lightness.value = l;
			this.elements.alpha.value = a;
		}

		/* Set CMYK inputs */
		if (updateCMYK) {
			this.elements.cmyC.value = parseInt(c, 10);
			this.elements.cmyM.value = parseInt(m, 10);
			this.elements.cmyY.value = parseInt(y, 10);
			this.elements.cmyK.value = parseInt(k, 10);
		}

		/* Set HSL inputs */
		if (updateHSL) {
			this.elements.hslH.value = parseInt(h, 10);
			this.elements.hslS.value = parseInt(s, 10);
			this.elements.hslL.value = parseInt(l, 10);
			this.elements.hslA.value = a;
		}

		/* Set RGB inputs */
		if (updateRGB) {
			this.elements.rgbR.value = parseInt(r, 10);
			this.elements.rgbG.value = parseInt(g, 10);
			this.elements.rgbB.value = parseInt(b, 10);
			this.elements.rgbA.value = a;
		}

		if (updateHEX) {
			this.elements.hex.value = rgb2hex(rgb);
		}

		this.elements.luminance.value = brightness(r, g, b) || 0;

		this.preset.value = `hsl(${h},${s}%,${l}%,${a})`;
		this.setCode();
	}

	/**
	* @function setGradient
	* @description Renders gradient from preset
	*/
	setGradient() {
		const angle = this.preset.type.includes('linear') ? `${this.preset.angle || this.elements.gradientAngle.value}deg, ` : '';
		const value = `${this.preset.type}(${angle}${this.preset.values.map(entry => { return `${entry.color}${entry.stop ? ` ${entry.stop}`: ''}` }).join(',')})`;
		this.preset.value = value;
		this.setCode();
		return value;
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

			<label>${this.settings.lblHue}
				<input type="range" class="c-rng" min="0" max="360" value="0" data-elm="hue" />
			</label>

			<div class="app__edit">
				<div class="app__preview">
					<div data-elm="selected"></div>
						<label class=""app__label--range">${this.settings.lblSaturation}
							<input type="range"class="c-rng" min="0" max="100" value="100" data-elm="saturation" data-suffix="%" />
						</label>
						<label class=""app__label--range">${this.settings.lblLightness}
							<input type="range" class="c-rng" min="0" max="100" value="50" data-elm="lightness" data-suffix="%" />
						</label>
						<label class=""app__label--range">${this.settings.lblAlpha}
							<input type="range" class="c-rng" min="0" max="1" step="0.01" value="1" data-elm="alpha" />
						</label>
					</div>

					<div class="app__controls">
						<input type="radio" id="cp-solid${this.uuid}" name="cp-solid-gradient" class="u-hidden" value="solid" data-elm="colorSolid" checked />
						<input type="radio" id="cp-gradient${this.uuid}" name="cp-solid-gradient" class="u-hidden" value="gradient" data-elm="colorGradient" />

						<div class="app__fieldset">
							<label class="app__label-group" for="cp-solid${this.uuid}" data-for="colorSolid">${this.settings.lblSolid}</label>
							<label class="app__label-group" for="cp-gradient${this.uuid}" data-for="colorGradient">${this.settings.lblGradient}</label>
						</div>

						<div class="app__fieldset" data-state="gradient">
							<div data-elm="gradient"></div>
							<label class="app__label app__label--auto">	
								<select data-elm="gradientType">
									<option value="linear-gradient">linear-gradient</option>
									<option value="repeating-linear-gradient">repeating-linear-gradient</option>
									<option value="radial-gradient">radial-gradient</option>
									<option value="repeating-radial-gradient">repeating-radial-gradient</option>
									<option value="conic-gradient">conic-gradient</option>
								</select>
								${this.settings.lblGradientType}
							</label>
							<label class="app__label"><input type="number" min="0" max="360" size="3" value="90" data-elm="gradientAngle" />${this.settings.lblAngle}</label>
						</div>

						<div data-state="gradient" data-elm="colorStops"></div>

						<div class="app__fieldset" data-state="gradient">
							<button type="button" data-elm="addStop">${this.settings.lblAddStop}</button>
						</div>

						<div class="app__fieldset" data-state="solid">
							<label class="app__label"><input type="number" min="0" max="255" size="3" data-elm="rgbR" />R</label>
							<label class="app__label"><input type="number" min="0" max="255" size="3" data-elm="rgbG" />G</label>
							<label class="app__label"><input type="number" min="0" max="255" size="3" data-elm="rgbB" />B</label>
							<label class="app__label"><input type="number" min="0" max="1" step="0.01" size="3" data-elm="rgbA" />A</label>
						</div>
						<div class="app__fieldset" data-state="solid">
							<label class="app__label"><input type="number" min="0" max="360" size="3" data-elm="hslH" />H</label>
							<label class="app__label"><input type="number" min="0" max="100" size="3" data-elm="hslS" />S</label>
							<label class="app__label"><input type="number" min="0" max="100" size="3" data-elm="hslL" />L</label>
							<label class="app__label"><input type="number" min="0" max="1" step="0.01" size="3" data-elm="hslA" />A</label>
						</div>
						<div class="app__fieldset" data-state="solid">
							<label class="app__label"><input type="number" min="0" max="100" size="3" data-elm="cmyC" />C</label>
							<label class="app__label"><input type="number" min="0" max="100" size="3" data-elm="cmyM" />M</label>
							<label class="app__label"><input type="number" min="0" max="100" size="3" data-elm="cmyY" />Y</label>
							<label class="app__label"><input type="number" min="0" max="100" size="3" data-elm="cmyK" />K</label>
						</div>
						<div class="app__fieldset" data-state="solid">
							<label class="app__label"><input type="text" data-elm="hex" size="9" data-lpignore="true" />HEX/A</label>
							<label class="app__label"><input type="text" data-elm="luminance" size="3" readonly />${this.settings.lblBrightness}</label>
						</div>

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

					<label><textarea class="u-hidden" data-elm="clipboard" tabindex="-1" aria-hidden="true"></textarea></label>
					<div class="u-hidden" data-elm="sample"></div>
				</div>
			</div>

			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblPresets}</span></summary>
				<div class="app__panel" data-elm="presets"></div>
			</details>
			${this.settings.libraries.map(group => { return this.templateColorGroup(group); }).join('')}
			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblCSSCode}</span></summary>
				<div class="app__code" data-elm="cssCode"></div>
			</details>
		</form>`
	}

	/**
	* @function templatePresetEntry
	* @param {Object} preset
	* @param {Number} index
	* @description Renders a single preset
	*/	
	templatePresetEntry(preset, index = 0, isPreset = true) {
		const value = preset.value || preset;
		const title = preset.name || value;
		return `<button type="button" class="app__preset--color" style="background:${value}" title="${title}" data-index="${index}" ${isPreset ? "" : ` data-elm="preset"` }></button>`
	}

	/**
	* @function templateColorStop
	* @param {String} color
	* @param {String} stop
	* @param {Number} index
	* @param {Number} stops
	* @description Renders a single color-stop in a gradient
	*/	
	templateColorStop(color, stop = '', index = 0, stops = 1) {
		return `
		<div class="app__fieldset">
			<div class="app__label app__label--color">
				<button type="button" data-elm="gradientColor" style="background:${color}"></button>
			</div>
			<label class="app__label app__label--auto">
				<input type="text" size="8" value="${color}" data-elm="gradientStopColor" data-index="${index}" />${this.settings.lblColorHint}
			</label>
			<label class="app__label">
				<input type="text" size="3" value="${stop}" data-elm="gradientStop" data-index="${index}" />${this.settings.lblColorStop}
			</label>
			<label class="app__label">
				<input type="number" size="3" value="${index+1}" min="1" max="${stops}" data-elm="gradientOrder" data-index="${index}" />${this.settings.lblColorOrder}
			</label>
			<label class="app__label app__label--del">
				<button type="button" data-elm="gradientStopDelete" data-index="${index}" aria-label="${this.settings.lblColorDeleteQuery}">${this.settings.lblColorDelete}</button>
			</label>
		</div>`
	}

	/**
	* @function templateColorStops
	* @description Renders a group of ColorStops
	*/
	templateColorStops() {
		return this.preset.values.map((entry, index) => { return this.templateColorStop(entry.color, entry.stop || '', index, this.preset.values.length)}).join('');
	}

	/**
	* @function templateColorGroup
	* @description Renders a ColorGroup
	*/
	templateColorGroup(group, panel) {
		return `
		<details class="app__details" ${group.open ? 'open': ''}>
			<summary class="app__summary"><span>${group.name}</span></summary>
			<div class="app__panel" ${panel ? `data-elm="${panel}"`: ''}>
			${group.subgroups ?
				group.subgroups.map(subgroup => {
			return `
				<fieldset class="app__color-group">
					<legend class="app__color-group-headline">${subgroup.name}</legend>
					${this.templateColorSubGroup(subgroup.values)}
				</fieldset>
			`}).join('') : this.templateColorSubGroup(group.values)
			}
			</div>
		</details>`
	}

	/**
	* @function templateColorSubGroup
	* @description Renders a color sub-group
	*/
	templateColorSubGroup(group) {
		return `${group.map(color => {
			return this.templatePresetEntry(color, 0, false);
		}).join('')}`
	}

	/**
	* @function toggleTool
	* @param {Boolean} isSolid
	* @description Toggle between solid color and gradient
	*/
	toggleTool(isSolid = true) {
		if(isSolid) {
			this.setColor();
		} else {
			this.setGradient();
		}
	}
}