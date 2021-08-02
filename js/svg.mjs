/**
 * SVG
 * @module svg.mjs
 * @version 0.0.10
 * @summary 06-06-2020
 * @author Mads Stoumann
 * @description Small SVG helper-functions
 */
import { uuid } from './common.mjs';
/**
 * @function svgCreateWrapper
 * @param {String} id Array, NodeList or QuerySelector
 * @description Creates an invisible SCG-wrapper for <use>, <clipPath> etc.
 * @reurns Array
 */
export function svgCreateWrapper(id = uuid()) {
	return `<svg id="${id}" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"></svg>`;
}

export function svgCreateClipPath(id, data, width = 100, height = 100) {
	return `<clipPath id="${id}" clipPathUnits="objectBoundingBox" transform="scale(${((100 / width) / 100)}, ${((100 / height) / 100)})">${data}</clipPath>`;
}