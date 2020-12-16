/**
 * Control Panel
 * @module /assets/js/controlPanel
 * @requires /assets/js/common
 * @version 1.3.4
 * @summary 28-09-2020
 * @description Control Panel
 * @example
 * <div data-control-panel="alignment audio background brightness contrast fontsize spacing typography zoom">
 */
import { h } from './common/h.mjs';
import { stringToType } from './common/stringToType.mjs';
import { uuid } from './common/uuid.mjs';
import { languages } from './languages.js';
export default class ControlPanel {
	constructor(element, settings) {
		this.settings = Object.assign({
			controlPanelClass: '',
			controlPanelConfig: '',
			controlPanelId: '',
			controlPanelLabel: '',
			controlPanelUrl: '../assets/data/control-panel-en.json'
		}, stringToType(settings));
		this.wrapper = element;
		this.init();
	}

	/**
	 * @function collapseAll
	 * @description Closes all open panels
	 */
	collapseAll() {
		const details = this.trigger.querySelectorAll('details');
		details.forEach(detail => { detail.open = false; });
	}

	/**
	 * @function findDataKey
	 * @param {String} key
	 * @param {String} value
	 * @description Finds a key from value in this.data
	 */
	findDataKey(key, value) {
		return Object.values(this.data[key].values).findIndex(obj => { return obj['$key'] === value; });
	}

	/**
	 * @function getVoices
	 * @description Returns speechSynthesis-voices on local system
	 */
	async getVoices() {
		return new Promise(resolve => {
			let voices = window.speechSynthesis.getVoices()
			if (voices.length) {
				resolve(voices);
				return
			}
			window.speechSynthesis.onvoiceschanged = () => {
				voices = window.speechSynthesis.getVoices();
				resolve(voices);
			}
		})
	}

	/**
	 * @function init
	 * @description Creates a new ControlPanel, creates controls/events
	 */
	async init() {
		/* Find trigger insertion-node, if not found = exit */
		if (!typeof this.settings.controlPanelTrigger === 'string') { return false; }
		let [trigger, insertMethod] = this.settings.controlPanelTrigger.split('::');
		const wrapper = this.wrapper.querySelector(trigger);
		if (!wrapper) { return false; }

		/* Fetch data from API */
		this.data = await (await fetch(this.settings.controlPanelUrl)).json();
		this.options = this.settings.controlPanel.split(' ');
		this.config = this.settings.controlPanelConfig.split(' ');
		this.dialogSupported = typeof HTMLDialogElement === 'function';
		let html = '';

		if (this.data && this.options.length) {
			/* Init audio/speech-synthesis */
			this.audio = {
				enabled: false,
				supported: (typeof window.speechSynthesis !== 'undefined')
			}
			if (this.audio.supported && this.options.includes('audio')) {
				const [lang, region] = (this.wrapper.lang || document.documentElement.lang || 'en-US').split('-');
				this.audio.voices = await this.getVoices();

				try {
					this.audio.voices = this.audio.voices.filter(voice => { return voice.lang.startsWith(lang) });
					const index = this.findDataKey('audio', 'voices');
					this.data.audio.values[index].$data = this.audio.voices;
					this.initAudio(lang, region);
				}
				catch(err) {
					delete this.data.audio;	
					console.error(err);
				}
			}
			/* Init speech recognition */
			this.speech = {
				enabled: false,
				supported: ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
			}
			if (this.options.includes('speech')) {
				if (this.speech.supported) {
					this.initSpeech();
				} else {
					const speechIndex = this.options.findIndex(item => item === 'speech');
					this.options.splice(speechIndex, 1);
				}
			}

			/* Init fullscreen toggler */
			if (this.options.includes('fullscreen')) {
				const fullscreenIndex = this.options.findIndex(item => item === 'fullscreen');
				this.options.splice(fullscreenIndex, 1);
				this.fullscreen = h('button', { type: 'button', 'data-cp-full': '' }, [this.data.labels.$fullscreen]);
				this.fullscreen.addEventListener('click', () => {
					if ('requestFullscreen' in this.wrapper) {
						this.wrapper.requestFullscreen();
					}
					else {
						this.wrapper.webkitRequestFullScreen();
					}
				})
			}

			/* Init keyboard-shortcuts */
			if (this.options.includes('keyboard')) {
				this.renderShortcuts();
			}

			/* Create inner markup from this.data & this.options */
			this.options.forEach(option => {
				if (this.data[option]) {
					html+= this.renderGroup(this.data, option);
				}
			});

			/* Create main controls, add eventListeners */
			this.form = h('form', { 'data-cp-form': '' });
			this.form.innerHTML = html;
			this.form.addEventListener('change', (event) => { return this.setValue(event.target) });
			this.form.addEventListener('reset', this.resetForm.bind(this));
			
			/* Add option to collapse all open panels */
			if (this.config.includes('collapse')) {
				this.collapse = h('button', { type: 'button', 'data-cp-collapse': '' }, [this.data.labels.$collapse]);
				this.collapse.addEventListener('click', () => { return this.collapseAll(); });
				this.form.appendChild(this.collapse);
			}
			/* Add option to reset to defauly */
			if (this.config.includes('reset')) {
				this.reset = h('button', { type: 'reset', 'data-cp-reset': '' }, [this.data.labels.$reset]);
				this.form.appendChild(this.reset);
			}
			this.trigger = h('details', { 'data-cp-trigger': '' }, [h('summary', { 'data-cp-trigger-label': '' }, [h('span', { }, [this.settings.controlPanelLabel || this.data.labels.$trigger])])]);
			this.trigger.addEventListener('keydown', (event) => { if(event.key === 'Escape') {
				this.trigger.open = false;
				this.trigger.firstElementChild.focus();
			}});
			this.trigger.appendChild(this.form);
			this.outer = h('div', { class: this.settings.controlPanelClass, 'data-cp': '', id: this.settings.controlPanelId ? this.settings.controlPanelId : uuid() }, [this.speech.enabled ? this.listen : '', this.audio.enabled ? this.play : '', this.fullscreen ? this.fullscreen : '', this.trigger, this.speech.enabled ? this.result : '']);
			wrapper.insertAdjacentElement(insertMethod || 'beforeend', this.outer);

			/* Set keyboard-shortcut keyboard-listener */
			if (this.options.includes('keyboard')) {
				const button = this.form.querySelector('[data-dialog');
				button.addEventListener('click', () => { this.dialogSupported ? this.dialog.showModal() : this.dialog.setAttribute('open', 'open'); });
				document.documentElement.addEventListener('keydown', (event) => {
					if (!this.dialogSupported && event.key === 'Escape' && this.dialog.hasAttribute('open')) { this.dialog.removeAttribute('open'); }
					if (event.shiftKey && event.key === this.data.keyboard.key) {
						this.dialogSupported ? this.dialog.showModal() : this.dialog.setAttribute('open', 'open');
					}
				})
			}

			/* Close panel when clicking outside */
			document.addEventListener('click', () => {
				if (!this.trigger.contains(event.target)) {
					this.trigger.open = false;
				}
			});
		}
		this.loadState();
	}

	/**
	 * @function initAudio
	 * @param {String} lang
	 * @description Init speechSynthesis, set defaults
	 */
	initAudio(lang, region) {
		const pitchIndex = this.findDataKey('audio', 'pitch');
		const rateIndex = this.findDataKey('audio', 'rate');

		this.audio.enabled = true;
		this.audio.paused = false;
		this.audio.playing = null; /* Initial value. After play have started, it will be `true` or `false` */
		this.audio.utterance = new SpeechSynthesisUtterance();
		this.audio.utterance.lang = `${lang}-${region}`;
		this.audio.utterance.pitch = this.data.audio.values[pitchIndex].value;
		this.audio.utterance.rate = this.data.audio.values[rateIndex].value;
		this.audio.utterance.text = this.wrapper.textContent;
		this.audio.utterance.voice = this.audio.voices[0];
		this.audio.utterance.volume = 0.5;
		this.play = h('button', { type: 'button', 'data-cp-play': '' }, [this.data.labels.$playAudio]);

		/* Add eventListeners */
		// this.audio.utterance.addEventListener('boundary', (event) => {
		// 	console.log(event.target.text.substr(event.charIndex).match(/^.+?\b/)[0]);
		// });
		this.audio.utterance.addEventListener('end', () => {
			this.stopAudio();
		});
		this.play.addEventListener('click', this.playPauseAudio.bind(this));
		window.speechSynthesis.cancel();
	}

	/**
	 * @function initSpeech
	 * @description Init Speech Recognition
	 */
	initSpeech() {
		window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const languageIndex = this.findDataKey('speech', 'language');
		const lang = this.data.speech.values[languageIndex].value;
		this.data.speech.values[languageIndex].$data = languages;

		this.speech.enabled = true;
		this.speech.listening = false;
		this.speech.recognition = new window.SpeechRecognition();
		this.speech.recognition.continuous = true;
		this.speech.recognition.interimResults = true;
		// this.speech.recognition.maxAlternatives = 10;

		this.speech.recognition.lang = lang || this.wrapper.lang || document.documentElement.lang || 'en-US';
		this.speech.text = '';
		this.listen = h('button', { type: 'button', 'data-cp-listen': '' }, [this.listenLabel()]);
		this.result = h('div', { 'data-cp-result': '' });

		/* Add eventListeners */
		this.listen.addEventListener('click', this.listenToggle.bind(this));
		this.speech.recognition.addEventListener('result', (event) => {
			const speech = event.results[event.results.length - 1];
			this.speech.text = speech[0].transcript;

			if (!speech.isFinal) {
				this.result.innerText = this.speech.text;
			}
			else {
				const tag = document.activeElement.nodeName;
				if (tag === 'INPUT' || tag === 'TEXTAREA') {
					document.activeElement.value += this.speech.text;
				}
				else {
					this.result.innerText = this.speech.text;
				}
			}
		});
	}

	/**
	 * @function listenLabel
	 * @description Updates listen-toggler with selected language
	 */
	listenLabel() {
		const lang = languages.find(item => item.value === this.speech.recognition.lang);
		return `${this.speech.listening ? this.data.labels.$disableSpeech : this.data.labels.$enableSpeech} (${lang.name})`;
	}

	/**
	 * @function listenToggle
	 * @description Toggles Speech Recognition listener
	 */
	listenToggle() {
		this.speech.listening = !this.speech.listening;
		this.listen.dataset.cpListen = this.speech.listening ? 'listening' : '';
		this.listen.innerText = this.listenLabel();

		if (this.speech.listening) {
			this.speech.recognition.start();
		}
		else {
			this.speech.recognition.stop();
		}
	}

	/**
	 * @function loadState
	 * @description Load current state from localStorage
	 */
	loadState() {
		const state = window.localStorage.getItem(this.outer.id);
		this.state = state ? JSON.parse(state) : {};
		for (const [key, value] of Object.entries(this.state)) {
			const input = this.form.elements[key];
			if (!input) { return false; }
			input.value = value;
			if (input.nodeName === 'INPUT' || input.nodeName === 'SELECT') {
				this.setValue(input, true);
			}
			else if (Object.prototype.isPrototypeOf.call(NodeList.prototype, input)) {
				const checked = [...input].findIndex(elm => { return elm.value === value; });
				this.setValue(input[checked], true);
			}
		}
	}

	/**
	 * @function playPauseAudio
	 * @description Play/Pause speechSynthesis
	 */
	playPauseAudio() {
		if (this.audio.playing) {
			this.setPlayPause(true);
			window.speechSynthesis.pause();
		}
		else {
			if (this.audio.playing === false) {
				window.speechSynthesis.resume();
			}
			else {
				window.speechSynthesis.speak(this.audio.utterance);
			}
			this.setPlayPause(false);
		}
	}

	/**
	 * @function renderGroup
	 * @description Renders a radio-button group
	 * @param {Object} obj
	 * @param {String} key
	 */
	renderGroup(obj, key) {
		return `
		<details data-cp-item${obj[key].open ? ' open' : ''}>
			<summary data-cp-item-summary>
				<span data-cp-item-label>${obj[key].name}</span>
			</summary>
			<div data-cp-item-panel>
			${obj[key].desc ? `<small>${obj[key].desc}</small>` :''}
			${obj[key].values.map(item => {
				const id = Math.random().toString(36).slice(-6);
				const tag = item.type === 'select' ? item.type : 'input';
				return `
				<label
					${item.$label ? `aria-label="${item.$label}"` : ''}
					data-label-grid="${item.$grid || obj[key].$grid || 'auto'}"
					data-preset="${item.$preset || obj[key].$preset || ''}">
					${item.$before && item.$label ? `<span class="${item.$class || ''}">${item.$label}</span>` : ''}
					<${tag}
						${Object.keys(item).map(entry => {return !entry.startsWith('$') ? `${entry}="${item[entry]}"` : ''}).join('')}
						data-key="${item.$key || obj[key].$key}"
						data-key-type="${item.$keytype || obj[key].$keytype || 'property'}"
						name="${key}"
						${tag === 'input' && item.type === 'range' ? `id="${id}" oninput="${id}__output.value=${id}.value"` : ''}>
						${tag === 'select' && item.$data ? item.$data.map(option => { return `<option value="${option.value || option.name}"${item.value === option.value ? `selected="selected"`:''}>${option.name}</option>` }).join('') : '' }
					</${tag}>
					${tag === 'input' && item.type === 'range' ? `<nav><output for="${id}" id="${id}__output">${item.value}</output>${item['data-suffix']||''}</nav>` : ''}
					${item.$icon ? item.$icon : ''}
					${!item.$icon && item.$label && !item.$before ? `<span class="${item.$class || ''}">${item.$label}</span>` : ''}
				</label>
			`}).join('')}
			</div>
		</details>`;
	}

	/**
	 * @function renderDialog
	 * @description Renders dialog with keyboard shortcuts
	 */
	renderShortcuts() {
		const close = h('button', { 'aria-label': 'Close', type: 'button' }, ['✕']);
		const id = uuid();
		const inner = h('div', { 'data-cp-dialog-inner': '' });
		close.addEventListener('click', () => { this.dialogSupported ? this.dialog.close() : this.dialog.removeAttribute('open'); });
		this.dialog = h('dialog', { 'data-cp-dialog': this.dialogSupported ? '' : 'none', id: id }, [close, inner]);
		inner.innerHTML += this.data.keyboard.shortcuts.map(group => `
			<strong>${group.name}</strong>
			${group.values.map(item => 
			`<dl>
				<dt>${item.name}</dt>
				<dd>${item.desc}</dd>
			</dl>`).join(' ')}
		`).join(' ');
		document.documentElement.appendChild(this.dialog);
	}

	/**
	 * @function resetForm
	 * @description Resets to default values
	 */
	resetForm() {
		/* Remove saved state */
		window.localStorage.removeItem(this.outer.id);
		this.state = {};
		/* Run updates after regular `reset`-event */
		setTimeout( () => {
			const elements = this.form.querySelectorAll(`[checked], [type="checkbox"]:not(checked), [type="range"], select`);
			elements.forEach(element => {
				this.setValue(element, true);
			})
		}, 100);
		this.collapseAll();
	}

	/**
	 * @function saveState
	 * @param {String} id
	 * @param {Object} state
	 * @description Save current state to localStorage
	 */
	saveState(id, state) {
		window.localStorage.setItem(id, JSON.stringify(state));
	}

	/**
	 * @function setCSSProperty
	 * @description Helper-function for setting a custom CSS property on a given element
	 * @param {Node} element
	 * @param {String} property
	 * @param {String | Number} value
	 * @param {String} [suffix]
	 */
	setCSSProperty(element = document.documentElement, property, value, suffix = '') {
		element.style.setProperty(`--${property}`, `${value}${suffix}`);
	}

	/**
	 * @function setCSSClass
	 * @description Helper-function for setting a CSS-class, and removing classes matching a prefix-key.
	 * @param {Node} target
	 * @param {Node} element
	 * @param {Boolean} addRemove
	 */
	setCSSClass(target, element, addRemove) {
		const keys = [...target.classList].filter(item => {return !item.includes(element.dataset.key)});
		if (addRemove) {
			keys.push(element.value);
		}
		target.className = keys.join(' ');
	}

	/**
	 * @function setPlayPause
	 * @description Updates labels and icon when play/pause audio
	 * @param {Boolean} playing
	 */
	setPlayPause(playing) {
		if (playing) {
			this.audio.playing = false;
			this.play.removeAttribute('data-cp-playing');
			this.play.innerText = this.data.labels.$playAudio;
		}
		else {
			this.audio.playing = true;
			this.play.dataset.cpPlaying = '';
			this.play.innerText = this.data.labels.$pauseAudio;
		}
	}

	/**
	 * @function setValue
	 * @description Main event-handler
	 * @param {Node} element
	 */
	setValue(element, reset = false) {
		let saveState = true;
		const target = element?.dataset?.target ? document.querySelector(element.dataset.target) || this.wrapper : this.wrapper;
		let value = element?.value || null;
		if (!value) return; 

		/* Handle checkboxes: `value` in state-object is `1` if checked/selected */
		if (element.type === 'checkbox') {
			if (reset && this.state[element.name] == element.value) {
				element.checked = true;
			}
			if (!element.checked) {
				delete this.state[element.name];
				saveState = false;
				value = 0;
			}
		}

		if (element?.type === 'range') {
			try {
				element.nextElementSibling.firstElementChild.value = value;
			}
			catch(err) {}
		}

		if (!reset) {
			if (saveState) { this.state[element.name] = value; }
			this.saveState(this.outer.id, this.state);
		}

		switch (element.dataset.keyType) {
			case 'property':
				this.setCSSProperty(target, element.dataset.key, value, element.dataset.suffix);
				break;
			case 'audio':
				switch (element.dataset.key) {
					case 'pitch':
						this.audio.utterance.pitch = element.value - 0;
						break;
					case 'rate':
						this.audio.utterance.rate = element.value - 0;
						break;
					case 'voices':
						this.audio.utterance.voice = this.audio.voices[element.selectedIndex];
						break;
					default: break;
				}
				this.stopAudio();
				break;
			case 'speech':
				switch (element.dataset.key) {
					case 'language':
						this.speech.recognition.lang = element.value;
						this.listen.innerText = this.listenLabel();
						break;
					default: break;
				}
				break;
			default:
				this.setCSSClass(target, element, saveState);
				break;
		}

		// Dispatch the event
		this.wrapper.dispatchEvent(new CustomEvent('controlPanelUpdate', { detail: { element: element }}));
	}

	/**
	 * @function stopAudio
	 * @description Runs, when speechSynthesis voice, pitch or rate changes.
	 */
	stopAudio() {
		window.speechSynthesis.cancel();
		this.setPlayPause(true);
		this.audio.playing = null;
	}
}