/**
 * SVGtoUrl module.
 * @module /assets/js/svgtourl
 * @version 0.1.3
 * @summary 27-11-2020
 * @description Manage SVG icons, store as CSS Custom Props
 * @example
 * <div data-js="svgtourl">
 */

import CssApp from './css-app.mjs';
export default class SvgToUrl extends CssApp {
	constructor(element, settings, presets) {
		super(element, Object.assign({
			appType: '',
			clsDrag: 'app__img--drag',
			lblAppHeader: 'SVG to <code>url()</code>',
			lblAppIntro: 'This tool will generate code for a CSS <code>url()</code> from a SVG-file. You can remove unnecessary clutter from the SVG by choosing an import option: <code>deep</code>, <code>light</code> or <code>keep</code>, before clicking on  “Upload” — or dragging an SVG into the preview-area. Try the <code>keep</code>-preset, if the SVG is not imported. The tool does NOT re-write points, use <a href="https://jakearchibald.github.io/svgomg/">SVGOMG</a> for that.',
			lblCode: 'Generated code',
			lblFullCode: 'Original code',
			lblSVGCode: 'SVG code',
			lblSVGImportType: 'SVG import profile',
			lblUploadImage: 'Upload or drag icon',
			presetInit: {
				"name": "Initial preset",
				"value": "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 21.328l-1.453-1.313q-2.484-2.25-3.609-3.328t-2.508-2.672-1.898-2.883-0.516-2.648q0-2.297 1.57-3.891t3.914-1.594q2.719 0 4.5 2.109 1.781-2.109 4.5-2.109 2.344 0 3.914 1.594t1.57 3.891q0 1.828-1.219 3.797t-2.648 3.422-4.664 4.359z\"/></svg>');"
			},
			txtNoCode: 'No code rendered (only on import)'
		}, settings), presets);
		this.init();
	}

	/**
	* @function dropFile
	* @description Handles dropFile, cleans file, sets preview
	*/
	dropFile(event) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const xml = e.target.result;
			const svg = this.svgClean(xml);
			this.preset.value = `url('data:image/svg+xml,${svg}');`
			this.setPreset(xml, svg);
			this.elements.filedrop.value = '';
		};
		reader.readAsText(event.target.files[0]);
	}

	/**
	* @function init
	* @description Initialize: Create elements, add eventListeners etc.
	*/
	async init() {
		this.styleElm = document.createElement('style');
		document.head.appendChild(this.styleElm);
		await super.init();
		this.elements.filedrop.addEventListener("change", this.dropFile.bind(this));
		this.elements.preview.addEventListener("dragover", (event) => { event.preventDefault(); return false; });
		this.elements.preview.addEventListener("dragenter", () => { this.elements.preview.classList.add(this.settings.clsDrag); });
		document.addEventListener("drop", () => { this.elements.preview.classList.remove(this.settings.clsDrag) ;});

		if (this.settings.presetInit) {
			super.loadPreset(null, this.settings.presetInit);
			this.setPreset();
		}
	}

	/**
	* @function loadPreset
	* @paramn {Node} element
	* @description Loads preset / overwrites preset.
	*/
	loadPreset(element) {
		super.loadPreset(element);
		this.setPreset();
	}

	/**
	* @function renderPresets
	* @description Renders list of presets, adds icons as custom props to generated stylesheet
	*/
	renderPresets() {
		if (this.styleElm.sheet.rules.length > 1) {
			/* Delete existing rule, if exists */
			this.styleElm.sheet.deleteRule(0);
		}
		this.styleElm.sheet.insertRule(`:root { ${this.presets.map(preset => {
			return `--ico-${preset.name}:${preset.value};\n`
		}).join(';')} }`);

		this.elements.presets.innerHTML = this.presets.map((preset, index) => {
			return this.templatePresetEntry(preset, index)
		}).join('');
	}

	/**
	* @function setPreset
	* @param {String} xml
	* @param {String} svg
	* @description Sets active preset, optional initialize
	*/
	setPreset(xml = this.settings.txtNoCode, svg = this.settings.txtNoCode) {
		if (this.styleElm.sheet.rules.length > 1) {
			this.styleElm.sheet.deleteRule(1);
		}
		this.styleElm.sheet.insertRule(`.app { --icon: ${this.preset.value} }`, 1);
		super.setCode(true);
		this.elements.fullCode.innerText = xml;
		this.elements.svgCode.innerText = svg;
	}

	/**
	* @function svgClean
	* @param {String} xml
	* @param {Object} settings 
	* @description Removes unnecessary attributes and tags from an SVG
	*/
	svgClean(xml, settings) {
		const options = {...{
			removeAttr: ['enable-background', 'height', 'id', 'style', 'version', 'width', 'x', 'xml:space', 'xmlns:xlink', 'y'],
			removeAttrInTags: ['class', 'fill', 'id', 'style'],
			removeTags: ['defs', 'desc', 'discard', 'metadata', 'script', 'style', 'title'],
			tags: 'circle, g, line, path, pattern, polygon, polyline, rect, text, tspan',
			useViewBox: true
		},...settings};

		const parser = new DOMParser;
		const doc = parser.parseFromString(xml, 'text/xml');
		let svg = doc.querySelector('svg');


		switch(this.elements.importType.value) {
			case 'deep': break;
			case 'lite':
				options.removeAttrInTags = [];
				break;
			case 'keep': 
				options.removeAttr = [];
				options.removeAttrInTags = [];
				options.removeTags = [];
				options.tags = '';
				options.useViewBox = false;
				break;
			default: break;
		}

		if (!svg.hasAttribute('viewBox') && options.useViewBox) {
			svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('width')||100} ${svg.getAttribute('height')||100}`)
		}

		options.removeAttr.forEach(attr => {
			if (svg.hasAttribute(attr)) {
				svg.removeAttribute(attr);
			}
		});

		options.removeTags.forEach(tag => {
			const tags = svg.getElementsByTagName(tag);
			if (tags) {
				[...tags].forEach(elm => { elm.parentNode.removeChild(elm)})
			}
		});

		if (options.tags) {
			const children = svg.querySelectorAll(options.tags);
			children.forEach(child => {
				options.removeAttrInTags.forEach(attr => {
					if (child.hasAttribute(attr)) {
						child.removeAttribute(attr);
					}
				})
			});
		}

		svg = svg.outerHTML.toString().trim()
			.replace(/(\r\n|\n|\r|\t)/gm,'')
			.replace(/\s\s+/g, ' ')
			.replace(/%/g,'%25')
			.replace(/#/g,'%23');

		return svg;
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
					<figure class="app__img-wrapper">
						<div class="app__img" data-elm="preview"></div>
						<input type="file" id="${this.uuid}file" class="app__file-drop" data-elm="filedrop" />
					</figure>
					<label class="app__label" aria-label="${this.settings.lblSVGImportType}">	
						<select data-elm="importType">
							<option value="deep">deep: remove as much</option>
							<option value="lite">lite: keep fill, class, style</option>
							<option value="keep">keep: import as is</option>
						</select>
					</label>
					<label for="${this.uuid}file" class="app__label">${this.settings.lblUploadImage}</label>
					<div class="app__urlicon-wrapper">
						<div><div class="app__urlicon app__urlicon--xs"></div><code>xs</code></div>
						<div><div class="app__urlicon app__urlicon--s"></div><code>s</code></div>
						<div><div class="app__urlicon app__urlicon--m"></div><code>m</code></div>
						<div><div class="app__urlicon app__urlicon--l"></div><code>l</code></div>
						<div><div class="app__urlicon app__urlicon--xl"></div><code>xl</code></div>
					</div>
				</div>

				<div class="app__controls">
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
			<details class="app__details" open>
				<summary class="app__summary"><span>${this.settings.lblCSSCode}</span></summary>
				<div class="app__code" data-elm="cssCode"></div>
			</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblPresetCode}</span></summary>
				<div class="app__code" data-elm="presetCode"></div>
			</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblSVGCode}</span></summary>
				<div class="app__code" data-elm="svgCode"></div>
			</details>
			<details class="app__details">
				<summary class="app__summary"><span>${this.settings.lblFullCode}</span></summary>
				<div class="app__code" data-elm="fullCode"></div>
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
		return `<button type="button" class="app__preset--icon" data-index="${index}"><div style="background-image:var(--ico-${preset.name})"></div>${preset.name}</button>`
	}
}