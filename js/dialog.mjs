/**
 * Dialog module.
 * @module /assets/js/dialog
 * @requires /assets/js/common
 * @version 1.1.0
 * @summary 16-04-2020
 * @author Mads Stoumann
 * @description Custom versions of alert, confirm and prompt, using <dialog>
 */

import { h, uuid } from './common.mjs';

export default class Dialog {
	constructor(settings = {}) {
		this.settings = Object.assign(
			{
				accept: 'OK',
				cancel: 'Cancel',
				close: `✕<span class="c-ttp">Close</span>`,
				element: '',
				headline: '',
				headlineTag: 'h2',
				hideCancel: false,
				id: '',
				message: '',
				template: '',
				value: '',
				clsAccept: 'c-btn',
				clsCancel: 'c-btn c-btn--ui',
				clsClose: 'c-dialog__close c-btn c-btn--circle c-btn--ui c-ttp__wrapper',
				clsDialog: 'c-dialog',
				clsHeadline: 'c-hdl c-hdl--small',
				clsInput: 'c-inp',
				clsMessage: 'c-dialog__message',
				clsNav: 'c-dialog__nav',
				clsNoSupport: 'c-dialog--nosupport',
				soundAccept: '',
				soundCancel: '',
				soundPopup: '',
				useSounds: false
			},
			settings
		);
		this.init();
	}

	/**
	 * @function accept
	 * @description Accept and close dialog
	 * @returns String | Boolean
	 */
	accept() {
		const fields = this.message.querySelectorAll('input, select, textarea');
		const value = this.input.value || true;
		return fields.length ? { value, fields} : value;
	}

	/**
	 * @function cancel
	 * @description Cancel and close dialog
	 * @returns Boolean
	 */
	cancel() {
		return false;
	}

	/**
	 * @function init
	 * @description Init dialog, create elements and structure
	 */
	init() {
		this.dialogSupported = typeof HTMLDialogElement === 'function';
		if (!this.dialogSupported) {
			this.settings.clsDialog += ` ${this.settings.clsNoSupport}`;
		}

		/* Create elements */
		this.acceptBtn = h('button', {
			class: this.settings.clsAccept,
			type: 'button'
		});
		this.cancelBtn = h('button', {
			class: this.settings.clsCancel,
			type: 'button'
		});
		this.closeBtn = h('button', {
			class: this.settings.clsClose,
			type: 'button'
		});
		this.dialog = h('dialog', {
			class: this.settings.clsDialog,
			id: this.settings.id || uuid()
		});
		this.headline = h(this.settings.headlineTag, {
			class: this.settings.clsHeadline
		});
		this.input = h('input', {
			class: this.settings.clsInput,
			type: 'text'
		});
		this.message = h('p', {
			class: this.settings.clsMessage
		});
		this.nav = h('nav', {
			class: this.settings.clsNav
		});

		if (this.settings.element instanceof HTMLElement) {
			this.message.appendChild(this.settings.element);
		}

		/* Add Sounds, if available */
		if (this.settings.useSounds && this.settings.soundAccept) {
			this.soundAccept = h('audio', {}, [h('source', { src: this.settings.soundAccept })]);
		}
		if (this.settings.useSounds && this.settings.soundPopup) {
			this.soundPopup = h('audio', {}, [h('source', { src: this.settings.soundPopup })]);
		}

		/* Create structure */
		this.closeBtn.innerHTML = this.settings.close;
		this.dialog.appendChild(this.closeBtn);
		this.dialog.appendChild(this.headline);
		this.dialog.appendChild(this.message);
		this.dialog.appendChild(this.input);
		this.dialog.appendChild(this.nav);
		this.nav.appendChild(this.cancelBtn);
		this.nav.appendChild(this.acceptBtn);
		document.body.appendChild(this.dialog);

		if (!this.dialogSupported) {
			this.dialog.hidden = true;
			document.body.addEventListener('keyup', event => {
				if (event.key === 'Escape') {
					this.cancelBtn.click();
				}
			});
		}
	}

	/**
	 * @function show
	 * @param {Object} settings
	 * @description Show dialog
	 */
	show(settings = {}) {
		const dialog = Object.assign({}, this.settings, settings);
		this.acceptBtn.className = dialog.clsAccept;
		this.acceptBtn.innerText = dialog.accept;
		this.cancelBtn.className = dialog.clsCancel;
		this.cancelBtn.innerText = dialog.cancel;
		this.cancelBtn.hidden = dialog.hideCancel;
		this.headline.innerText = dialog.headline;
		this.input.value = dialog.value;
		this.input.hidden = this.input.value === '';
		if (!dialog.element) {
			this.message.innerHTML = dialog.message + dialog.template;
		}

		if (this.settings.useSounds && this.soundPopup) {
			this.soundPopup.play();
		}

		if (this.dialogSupported) {
			this.dialog.showModal();
		} else {
			this.dialog.hidden = false;
		}

		/* Set focus */
		if (dialog.value) {
			this.input.focus();
			this.input.select();
		}
		else {
			this.acceptBtn.focus();
		}

		return new Promise((resolve, reject) => {
			const parent = this;
			try {
				this.dialog.addEventListener('cancel', function bindEscape() {
					parent.dialog.removeEventListener('click', bindEscape);
					reject(parent.cancel());
				});
				this.input.addEventListener('keydown', function bindKey(event) {
					parent.input.removeEventListener('click', bindKey);
					if (event.key === 'Enter' && parent.input.value) {
						resolve(parent.accept());
					}
				});
				this.acceptBtn.addEventListener('click', function bindAccept() {
					parent.acceptBtn.removeEventListener('click', bindAccept);
					if (parent.settings.useSounds && parent.soundAccept) {
						parent.soundAccept.play();
					}
					resolve(parent.accept());
				});
				this.cancelBtn.addEventListener('click', function bindCancel() {
					parent.cancelBtn.removeEventListener('click', bindCancel);
					reject(parent.cancel());
				});
				this.closeBtn.addEventListener('click', function bindCancel() {
					parent.closeBtn.removeEventListener('click', bindCancel);
					reject(parent.cancel());
				});
			} catch (error) {
				reject(parent.cancel());
			}
		})
			.catch(() => {
				return false;
			})
			.finally(() => {
				if (this.dialogSupported) {
					this.dialog.close();
				} else {
					this.dialog.hidden = true;
				}
			});
	}
}
