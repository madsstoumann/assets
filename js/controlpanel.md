# Control Panel

For translations, fill out the `labels`-section, all the `name`-keys, as well as all `$label`- and `$desc`-keys.

## Labels
- collapse
- enableSpeech
- disableSpeech
- pauseAudio
- playAudio
- reset
- trigger

---
## Alignment
The `alignment`-section contains icons for text-alignment: `center`, `left`, `right` or `justify`.

---
## Audio
The `audio`-secton contains a dropdown of available system `voices`, as well as range-sliders for `pitch` and `rate`.

The avaialable voices are filtered, using the `lang`-attribute of the enclosing section or the document itself.  

Fallback-language is `en-US`.

---
## Brightness
The `brightness`-section controls, via a range-slider, the brightness of all images (and background-images) in the enclosing section.

---
## Contrast
The `contrast`-section controls, via a range-slider, the contrast of all images (and background-images) in the enclosing section.

---
## Focusable
focusable

---
## Fontsize
fontsize

---
## Fullscreen
fullscreen

---
## Grayscale
grayscale

---
## Invert
invert

---
## Keyboard-shortcuts
keyboard

---
## Margin
margin

---
## Reduce animations and transparency
reduce

---
## Spacing
spacing

---
## Speech Recognition
speech

---
## Theming
theme

---
## Typography
typography

---
## Zoom
zoom

---
## Trigger

### Insertion-point:
- `afterbegin`
- `afterend`
- `beforebegin`
- `beforeend`

---
## JSON-file Structure

- $grid
- $key
- $keyType
- $preset

- desc
- name
- values
	- $before
	- $icon
	- $label
	- $key*
	- $keyType*
	- attributes


## Events
```js
element.addEventListener("controlPanelUpdate", function(event) { console.log(event) });
```