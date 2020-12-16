/**
 * FileUpload module.
 * @module /file-upload.mjs
 * @version 0.2.0
 * @summary 22-05-2020
 * @description FileUpload module
 * @example
 * <input type="file" data-js="file-upload" multiple />
 */
import { h, stringToType, uuid } from './common.mjs';
export default class FileUpload {
	constructor(element, settings) {
		this.settings = Object.assign(
			{
				autoUpload: false,
				clsApp: 'c-fle',
				clsInput: 'c-fle__input',
				lblDropText: 'Or drop a file',
				lblUpload: 'Upload file',
				maxFileItems: -1,
				maxFileSize: -1,
				minFileSize: -1,
				simpleMode: false
			},
			stringToType(settings)
		);
		this.input = element;
		this.init();
	}

	formatBytes(bytes, decimals) {
		if (bytes === 0) {
			return '0 Bytes';
		}
		const k = 1024;
		const dm = decimals || 2;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	handleDragEnter() {
		this.counter++;
		this.elements.drop.classList.add('c-fle__drop--drag');
	}

	handleDragLeave() {
		this.counter--;
		if (this.counter === 0) {
			this.elements.drop.classList.remove('c-fle__drop--drag');
		}
	}

	handleDrop() {
		this.counter = 0;
		this.elements.drop.classList.remove('c-fle__drop--drag');
	}

	async handleFiles() {
		await Promise.all(
			[...this.input.files].map(async file => {
				this.files.set(file.name, {
					file,
					data: await this.readFileAsync(file)
				});
			})
		);

		this.elements.list.innerHTML = this.render(this.files);
		/* TODO: Check if length */
		this.elements.list.hidden = false;
/* TODO send Events ADD or REMOVE */
		// this.input.dispatchEvent(
		//   new CustomEvent('formData', { detail: this.setFormData(this.files) })
		// );
	}

	init() {
		this.uuid = uuid();
		this.app = h('div', { class: this.settings.clsApp });
		this.app.innerHTML = this.template();
		
		this.elements = {};
		this.app.querySelectorAll(`[data-elm]`).forEach(element => {
			this.elements[element.dataset.elm] = element;
		});

		this.input.classList.add(this.settings.clsInput);

		/* TODO: 
		https://stackoverflow.com/questions/50157450/send-blob-object-with-post-form
		Rename this.input - create new hidden input and store files as value ? */
		/* TODO:Max-files, max-size, mime-type */
		this.input.parentNode.insertBefore(this.app, this.input.nextSibling);
		this.elements.input.parentNode.replaceChild(this.input, this.elements.input);

		/* Add eventListeners */
		this.input.addEventListener('change', this.handleFiles.bind(this));
		this.input.addEventListener('dragenter', this.handleDragEnter.bind(this));
		this.input.addEventListener('dragleave', this.handleDragLeave.bind(this));
		this.input.addEventListener('drop', this.handleDrop.bind(this));

		this.elements.list.addEventListener('click', (event) => {
			const element = event.target;
			if (element.tagName === 'BUTTON') {
				this.removeFile(element.dataset.key);
				this.elements.list.innerHTML = this.render(this.files);
			}
			
		})

		// eslint-disable-next-line
		// console.log(this);
		this.files = new Map();
	}

	removeFile(key) {
		this.files.delete(key);
	}

	readFileAsync(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				resolve(reader.result);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	render(files) {
		return [...files.values()]
			.map(
				(item, index) => {
					return `<li class="c-fle__item">${
						item.data && item.data.includes('image')
							? `<img class="c-fle__item-image" src="${
									item.data
								}" alt="${item.file.name}" />`
							: ''
					}
					<span class="c-fle__item-name">${item.file.name}</span>
					<span class="c-fle__item-size">${this.formatBytes(item.file.size, 2)}</span>
					<button type="button" class="c-fle__item-remove" data-key="${item.file.name}">✕</button>
					</li>\n`}
			)
			.join('');
	}

	setFormData(files) {
		let formData = new FormData();
		let total = 0;
		/* TODO: ContentType */
		files.forEach(item => {
			formData.append('files', item.file, item.file.name);
			total += item.file.size;
		});
		return { formData, total };
	}

	template() {
		return `
		<div data-elm="drop" class="c-fle__drop">
			<span data-elm="input"></span>
			<span class="c-btn c-fle__drop-button">
				<svg class="c-ico"><use xlink:href="../assets/svg/icons.svg#icon-upload"></use></svg>
				<span class="c-btn__text">${this.settings.lblUpload}</span>
			</span>
			<span class="c-fle__drop-text">
			${this.settings.lblDropText}
			</span>
		</div>
		<ul data-elm="list" class="c-fle__list"></ul>`;
	}

	validFileSize(size) {
		return (
			size > this.settings.minFileSize && size <= this.settings.maxFileSize
		);
	}
}
