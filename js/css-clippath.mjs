/**
 * ClipPath module.
 * @module /assets/js/clippath
 * @requires /assets/js/common
 * @version 0.2.5
 * @summary 17-11-2020
 * @description Edit clip-path: ellipse, polygon, url
 * @example
 * <div data-js="clippath">
 */
import { scrollPosition, uuid } from './common.mjs';
import { svgCreateWrapper, svgCreateClipPath } from './svg.mjs';
import CssApp from './css-app.mjs';
export default class ClipPath extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: 'clip-path',
			lblAnimation: 'Animation preview',
			lblAnimationIntro: 'Hover to see animation between original state and current state.<br />Animation will only work if the number of points are the same.',
			lblAppHeader: 'CSS <code>clip-path</code> Editor',
			lblAppIntro: 'Start by selecting a <code data-type="polygon">polygon()</code> — <code data-type="ellipse">ellipse()</code> or <code data-type="url">url()</code>-preset.<br /><code data-type="polygon">polygon()</code> : To add a point, select the point you want to insert a new point <em>after</em> and press <kbd>+</kbd><br />To delete the selected point, press <kbd>-</kbd> or <kbd>Delete</kbd><br />To <em>move</em> the selected point, use mouse, touch or <kbd>Arrow</kbd>-keys.<br />When using <kbd>Arrow</kbd>-keys, hold <kbd>Ctrl</kbd> to move point in smaller intervals.<br />When using mouse, hold down <kbd>Shift</kbd> to lock x-axis or <kbd>Alt</kbd> to lock y-axis.<br />Hold down <kbd>shift</kbd> while selecting a preset to <em>only</em> update animation-preview clip-path.',
			lblSvgData: 'SVG clipPath data',
			lblSvgHeight: 'SVG viewBox height',
			lblSvgWidth: 'SVG viewBox width',
			pointSize: 40,
			presetInit: {
				"name": "triangle",
				"value": "polygon(50% 0%, 0% 100%, 100% 100%)",
				"values": [
					{
						"coords":  [[50, 0], [0, 100], [100, 100]],
						"type": "polygon"
					}
				]
			},
			previewImage: '../assets/img/clippath-demo.jpg'
		}, settings), presets);
		this.init();
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		/* Create wrapper for SVG <clipPath>s */
		let svgID = uuid();
		document.body.insertAdjacentHTML('beforeEnd', svgCreateWrapper(svgID));
		this.svgWrapper = document.getElementById(svgID);

		await super.init();

		this.elements.points.addEventListener('pointerdown', (event) => { this.pointDown(event); });
		this.elements.points.addEventListener('pointerup', () => { this.point.element = null; });
		this.elements.points.addEventListener('pointerleave', () => {
			this.point.element = null;
			if (window.getSelection) {window.getSelection().removeAllRanges();}
		 });
		this.elements.points.addEventListener('pointermove', (event) => { this.pointMove(event) });
		
		const resizeObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				this.pointInit();
				if (this.preset.values[0]?.type === 'polygon') {
					this.pointCreate();
				}
				/* Load initial preset */
				if (this.initPreset && this.settings.presetInit) {
					this.loadPreset(null, null, true);
					this.initPreset = false;
				}
			}
		});
		this.initPreset = true;
		resizeObserver.observe(this.elements.points);
	}

	/**
	* @function loadPreset
	* @paramn {Node} element
	* @description Loads preset / overwrites preset
	*/
	loadPreset(element, event, init = false) {
		if (event && event.shiftKey) {
			/* Update animation-preview only */
			const style = element?.firstChild.getAttribute('style').replace('clip-path:', '');
			this.elements.animation.style.setProperty('--clippath-ani', style);
			return false;
		}

		if (init) {
			super.loadPreset(null, this.settings.presetInit);
		}
		else {
			super.loadPreset(element);
		}

		this.elements.animation.style.setProperty('--clippath-ani', this.preset.value);
		this.presetType = this.preset.values[0].type; 
		this.setControls(true);
		if (this.presetType === 'url') {
			this.elements.svgClip.innerHTML = this.templateSvgClipPath(this.preset.values[0]);
		} else {
			this.elements.svgClip.innerHTML = '';
			this.pointCreate();
		}
	}

	/**
	* @function pointAdd
	* @paramn {Number} index
	* @description Add a point to a polygon
	*/
	pointAdd(index) {
		if (this.presetType !== 'polygon') { return false; }
		const len = this.preset.values[0].coords.length;
		const position = index + 1 < len ? index + 1 : 0;
		let [x, y] = [...this.preset.values[0].coords[index]];
		let [X, Y] = [...this.preset.values[0].coords[position]];
		this.preset.values[0].coords.splice(position, 0, [(x + X) / 2, (y + Y) / 2]);
		this.pointCreate();
		this.pointRender();
	}

	/**
	* @function pointCreate
	* @description Creates points from polygon
	*/
	pointCreate() {
		this.elements.points.innerHTML = '';
		this.preset.values[0].coords.forEach((coord, index) => {
			const point = document.createElement('button');
			const [x, y] = [...coord];
			point.addEventListener('keydown', (event) => this.pointKeyMove(event));
			point.classList.add('app__point');
			point.dataset.index = index;
			point.dataset.type = this.presetType;
			point.innerText = index;
			point.style.left = `${(x * this.point.percent)}px`;
			point.style.top = `${(y * this.point.percent)}px`;
			point.type = 'button';
			this.elements.points.appendChild(point);
		})
	}

	/**
	* @function pointDelete
	* @paramn {Number} index
	* @description Deletes a point from a polygon
	*/
	pointDelete(index) {
		if (this.presetType !== 'polygon') { return false; }
		this.preset.values[0].coords.splice(index, 1);
		this.pointCreate();
		this.pointRender();
	}

	/**
	* @function pointDown
	* @paramn {Event} event
	* @description Init-code when a point is first selected
	*/
	pointDown(event) {
		const element = event.target;
		if (element?.dataset?.index) {
			const index = element.dataset.index - 0;
			let [x, y] = [...this.preset.values[0].coords[index]];

			this.point.element = element;
			this.point.rect = element.getBoundingClientRect();
			this.point.offsetX = event.clientX - this.point.rect.x;
			this.point.offsetY = event.clientY - this.point.rect.y;
			this.elements.coords.innerText = `point ${index} — x: ${x}, y: ${y}`;
		}
	}

	/**
	* @function pointInit
	* @description Inits the point-object, run on init and resize
	*/
	pointInit() {
		this.point = {
			element: null,
			offsetX: 0,
			offsetY: 0,
			parentRect: this.elements.points.getBoundingClientRect(),
			percent: this.elements.preview.getBoundingClientRect().width / 100,
			rect: null,
			width: this.settings.pointSize,
		}
	}

	/**
	* @function pointKeyMove
	* @paramn {Event} event
	* @description Keyhandler for polygon-editor
	*/
	pointKeyMove(event) {
		const element = event.target;
		const index = element.dataset.index - 0;
		let [x, y] = [...this.preset.values[0].coords[index]];

		x = parseFloat(x);
		y = parseFloat(y);

		switch(event.key) {
			case 'ArrowDown':
				event.preventDefault();
				event.ctrlKey ? y = (y + 0.1) : y++;
				break;
			case 'ArrowLeft':
				event.preventDefault(); 
				event.ctrlKey ? x = (x - 0.1) : x--;
				break;
			case 'ArrowRight':
				event.preventDefault();
				event.ctrlKey ? x = (x + 0.1) : x++;
				break;
			case 'ArrowUp':
				event.preventDefault();
				event.ctrlKey ? y = (y - 0.1) : y--;
				break;
			case 'Delete': case '-': this.pointDelete(index); return;
			case '+': this.pointAdd(index); return;
			default: break;
		}

		x = Math.min(Math.max(x, 0), 100);
		y = Math.min(Math.max(y, 0), 100);
		element.style.left = `${x * this.point.percent}px`;
		element.style.top = `${y * this.point.percent}px`;
		

		this.pointUpdate(index, x.toFixed(2), y.toFixed(2));
	}

	/**
	* @function pointMove
	* @paramn {Event} event
	* @description  Pointer-handler (touch, mouse) for polygon-editor
	*/
	pointMove(event) {
		if (this.point.element) {
			const index = this.point.element.dataset.index - 0;
			const type = this.point.element.dataset.type;

			let x = event.clientX - this.point.offsetX - this.point.parentRect.left;
			let y = event.clientY + scrollPosition() - this.point.offsetY - this.point.parentRect.top;

			if (x < 0) x = 0;
			if (y < 0) y = 0;
			if ((x  + this.point.width) > this.point.parentRect.width) x = this.point.parentRect.width - this.point.width;
			if ((y + this.point.width) > this.point.parentRect.height) y = this.point.parentRect.height - this.point.width;

			/* Lock axii with shift or alt-key */
			if (event.altKey) {
				x = this.point.element.dataset.x;
			}
			if (event.shiftKey) {
				y = this.point.element.dataset.y;
			}

			this.point.element.dataset.x = x;
			this.point.element.dataset.y = y;
			this.point.element.style.left = ((type === 'ellipse' && index === 1)) ? this.point.element.style.left : `${x}px`;
			this.point.element.style.top = ((type === 'ellipse' && index === 2)) ? this.point.element.style.top : `${y}px`;
			this.pointUpdate(index, Math.ceil(x / this.point.percent), Math.ceil(y / this.point.percent));
		}
	}

	/**
	* @function pointRender
	* @description  Renders a polygon from coords, sets current preset
	*/
	pointRender() {
		if (this.presetType === 'polygon') {
			const polygon = this.preset.values[0].coords.map(entry => { return entry.map(i => `${i}%`).join(' ')}).join(',');
			this.preset.value = `polygon(${polygon})`;
		}
		else if (this.presetType === 'ellipse') {
			const [position, y, x] = [...this.preset.values[0].coords];
			const radiusX = x[0] - 50;
			const radiusY = 50 - y[1];
			this.preset.value = `ellipse(${radiusX}% ${radiusY}% at ${position.join('% ')}%)`;
		}
		this.setControls();
	}

	/**
	* @function pointUpdate
	* @paramn {Number} index
	* @paramn {Number} x
	* @paramn {Number} y
	* @description Triggers whena single point updates
	*/
	pointUpdate(index, x, y) {
		this.preset.values[0].coords.splice(index, 1, [x, y]);
		this.elements.coords.innerText = `point ${index} — x: ${x}, y: ${y}`;
		this.pointRender();
	}

	/**
	* @function setControls
	* @param {Boolean} resetPoints
	* @description Updates code-blocks, sets CSS Custom Prop
	*/
	setControls(resetPoints = false) {
		if (resetPoints) {
			this.elements.coords.innerHTML = '';
			this.elements.points.innerHTML = '';
		}
		super.setCode();
		this.elements.app.style.setProperty('--clippath', this.preset.value);
	}

	/**
	* @function svgInsert
	* @param {Object} preset
	* @description Creates and inserts svg clipPath
	*/
	svgInsert(preset) {
		this.svgWrapper.insertAdjacentHTML('beforeEnd', svgCreateClipPath(preset.name, preset.values[0].data, preset.values[0].width, preset.values[0].height));
	}

	/**
	* @function template
	* @description Renders main template
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
					<figure class="app__img-wrapper" data-elm="containment">
						<img src="${this.settings.previewImage}" class="app__img" data-elm="preview" />
						<div data-elm="points"></div>
					</figure>
					<code data-elm="coords"></code>
				</div>

				<div class="app__controls">
					<div class="app__animation">
						<figure class="app__img-wrapper-animation">
							<img src="${this.settings.previewImage}" class="app__img-animation" data-elm="animation" />
						</figure>
						<header>
							<strong class="app__subheader">${this.settings.lblAnimation}</strong>
							<p class="app__text">${this.settings.lblAnimationIntro}</p>
						</header>
					</div>

					<div data-elm="svgClip"></div>

					<div class="app__fieldset">
						<label class="app__label"><input type="text" data-elm="presetName" data-lpignore="true" size="15">${this.settings.lblPresetName}</label>
					</div>
					<div class="app__fieldset">
						<label class="app__label"><textarea data-elm="presetDesc" data-lpignore="true"></textarea>${this.settings.lblPresetDesc}</label>
					</div>
					<div class="app__fieldset">
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

	/**
	* @function templatePresetEntry
	* @param {Object} preset
	* @param {Number} index
	* @description Renders a single preset
	*/	
	templatePresetEntry(preset, index = 0) {
		if (preset.values[0].type === 'url') { this.svgInsert(preset); }
		return `<button type="button" class="app__preset--clip" data-type="${preset.values[0].type}" data-index="${index}"><div style="clip-path:${preset.value}"></div>${preset.name}</button>`
	}

	/**
	* @function templateSvgClipPath
	* @param {Object} preset
	* @param {Number} index
	* @description Renders a single preset
	*/	
	templateSvgClipPath(preset) {
		return `
		<div class="app__fieldset">
			<label class="app__label"><input type="number" min="0" size="5" data-elm="aspectWidth" value="${preset.width}" />${this.settings.lblSvgWidth}</label>
			<label class="app__label"><input type="number" min="0" size="5" data-elm="aspectHeight" value="${preset.height}" />${this.settings.lblSvgHeight}</label>
		</div>
		<div class="app__fieldset">
			<label class="app__label"><textarea data-elm="svgData" data-lpignore="true">${preset.data}</textarea>${this.settings.lblSvgData}</label>
		</div>`
	}
}