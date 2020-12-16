/**
 * ColorLib
 * @module colorlib.mjs
 * @version 0.9.20
 * @summary 11-12-2020
 * @author Mads Stoumann
 * @description Color-functions
 */

/**
* brightness
* @param {Number} r
* @param {Number} g
	@param {Number} b
	@description Returns percieved brightness of a color
* @return {Number}
*/
export function brightness(r, g, b) {
	return parseInt(((r*299)+(g*587)+(b*114))/1000, 10);
}

export function cmyk2rgb(C, M, Y, K, normalized){
	let c = (C / 100);
	let m = (M / 100);
	let y = (Y / 100);
	let k = (K / 100);
	
	c = c * (1 - k) + k;
	m = m * (1 - k) + k;
	y = y * (1 - k) + k;
	
	let r = 1 - c;
	let g = 1 - m;
	let b = 1 - y;
	
	if (!normalized) {
			r = Math.round(255 * r);
			g = Math.round(255 * g);
			b = Math.round(255 * b);
	}

	return {
			r: r,
			g: g,
			b: b
	}
}

export function contrast(rgb1, rgb2) {
	var lum1 = luminanace(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminanace(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}

/**
* hex2rgb
* @param {String} hex
* @return {Array}
*/
export function hex2rgb(hex) {
	return hex.match(/[0-9a-f]{2}/gi).map(c => { return parseInt(c, 16) });
}

export function luminanace(r, g, b) {
	var a = [r, g, b].map(function (V) {
			let v = V / 255;
			return v <= 0.03928
					? v / 12.92
					: Math.pow( (v + 0.055) / 1.055, 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
* rgb2arr
* @param {String} rgb Supports both rgb() and rgba()-syntax
* @return {String}
*/
export function rgb2arr(rgb) {
	const seperator = rgb.includes(',') ? ',' : ' ';
	return rgb.replace(/rgba?\((.*?)\)/, '$1').split(seperator);
}

export function rgb2cmyk(r, g, b, normalized){
	let c = 1 - (r / 255);
	let m = 1 - (g / 255);
	let y = 1 - (b / 255);
	let k = Math.min(c, Math.min(m, y));

	c = (c - k) / (1 - k);
	m = (m - k) / (1 - k);
	y = (y - k) / (1 - k);

	if(!normalized){
			c = Math.round(c * 10000) / 100;
			m = Math.round(m * 10000) / 100;
			y = Math.round(y * 10000) / 100;
			k = Math.round(k * 10000) / 100;
	}

	c = isNaN(c) ? 0 : c;
	m = isNaN(m) ? 0 : m;
	y = isNaN(y) ? 0 : y;
	k = isNaN(k) ? 0 : k;
	
	return [ c, m, y, k ]
}

/**
* rgb2hex
* @param {String} rgb Supports both rgb() and rgba()-syntax
* @return {String}
*/
export function rgb2hex(rgb) {
	return `#${rgb2arr(rgb).map((c, i) => {
		return i < 3 ? parseInt(c, 10).toString(16).padStart(2,'0') : Math.round(parseFloat(c * 255)).toString(16)
	}).join('')}`;
}

/**
* rgb2hsl
* @param {Number} R
* @param {Number} G
	@param {Number} B
* @return {Array}
*/
export function rgb2hsl(R, G, B){
	const r = R/255;
	const g = G/255;
	const	b = B/255;
	const cmin = Math.min(r, g, b);
	const	cmax = Math.max(r, g, b);
	const delta = cmax - cmin;
	let	h = 0;
	let	s = 0;
	let	l = 0;

	if (delta === 0) {
		h = 0;
	}
	else if (cmax === r) {
		h = ((g - b) / delta) % 6;
	}
	else if (cmax === g) {
		h = (b - r) / delta + 2;
	}
	else {
		h = (r - g) / delta + 4;
	}
	h = Math.round(h * 60);
	if (h < 0) {
		h += 360;
	}

	l = (cmax + cmin) / 2;
	s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	s = + (s * 100).toFixed(1);
	l = + (l * 100).toFixed(1);
	return [h, s, l];
}
