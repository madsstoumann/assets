/**
 * VideoLoader module.
 * @module /assets/js/video
 * @version 1.1.11
 * @summary 05-11-2020
 * @description Video-handling
 */
import { insertScript } from './common/insertscript.mjs';
export default class VideoLoader {
	constructor(settings, json) {
		this.settings = Object.assign({
			intersectionRatio: 0.75,
			youtubeAPI: 'https://www.youtube.com/player_api'
		}, settings);
		this.init(json);
	}

	/**
	 * @function init
	 * @param {Object} json
	 * @description Init videos
	*/
	init(json) {
		/*TODO: Create method to load more videos dynamically, incl. IO and YoiTube onReady */
		if (json) {
			json.forEach(video => {
				document.body.insertAdjacentHTML('beforeEnd', video.src.includes('mp4') ? this.tmplVideo(video, 'video/mp4') : this.tmplVideoIframe(video));
			});
		}
		insertScript(this.settings.youtubeAPI);

		/* Add eventListeners */
		window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);

		document.querySelectorAll('[data-video-play]').forEach(button => {
			button.addEventListener('click', (event) => { this.toggleVideo(event) });
		});
	
		document.addEventListener("visibilitychange", () => { if (document.hidden) this.pauseVideo(); });

		/* Add IntersectionObserver */
		this.IO = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const video = entry.target.querySelector('iframe, video');
					if (entry.intersectionRatio < 0.75) {
						this.pauseVideo(video);
					}
					else {
						this.playVideo(video);
					}
				}
			});
		}, {
			threshold: [0, 0.75]
		});

		document.querySelectorAll(`[data-video="autoplay"]`).forEach((element) => {
			this.IO.observe(element);
		});
	}

	/**
	 * @function onYouTubeIframeAPIReady
	 * @description Init YouTube API
	*/
	onYouTubeIframeAPIReady() {
		const videos = document.querySelectorAll(`iframe[src*="youtube"]`);
		videos.forEach(video => {
			const player = new YT.Player(video, {
				events: {
					'onReady': this.onYouTubePlayerReady.bind(this),
					'onStateChange': this.onYouTubePlayerStateChange.bind(this)
				}
			});
		});
	}

	/**
	 * @function oYouTubePlayerReady
	 * @param {Event} event
	 * @description Set a property on YouTube-iframe with the (inner) player as reference
	*/
	onYouTubePlayerReady(event) {
		event.target.f.__VIDEO_PLAYER = event.target;
	}

	/**
	 * @function onYouTubePlayerStateChange
	 * @param {Event} event
	 * @description Triggers when a YouTube-video change state (play/pause)
	*/
	onYouTubePlayerStateChange(event) {
		/* Native YouTube play-button pressed */
		if (event.data === 1) {
			if (window.__VIDEO_PLAYING !== event.target.f) {
				this.pauseVideo();
			}
			window.__VIDEO_PLAYING = event.target.f;
		};
	}

	/**
	 * @function pauseVideo
	 * @description Pauses a video
	*/
	pauseVideo() {
		const video = window.__VIDEO_PLAYING;
		if (video) {
			video.tagName === 'VIDEO' ? video.pause() : video?.__VIDEO_PLAYER?.pauseVideo();
		}
	}

	/**
	 * @function playVideo
	 * @param {Node} video
	 * @description Plays a video
	*/
	playVideo(video) {
		if (video) {
			video.tagName === 'VIDEO' ? video.play() : video?.__VIDEO_PLAYER?.playVideo();
			window.__VIDEO_PLAYING = video;
		}
	}

	/**
	 * @function tmplVideo
	 * @param {Node} video
	 * @param {String} type
	 * @description Renders a <video>-tag
	 * Control autoplay from JavScript InterSection Observer, instead of ${video.autoplay ? ` autoplay`:''}
	*/
	tmplVideo(video, type) {
		return `
		<div data-video="${video.autoplay ? 'autoplay':''}">
			<video
				${video.controls ? ` controls`:''}
				${video.fullscreen ? ` data-hide-fullscreen`:''}
				${video.loop ? ` loop`:''}
				${video.mute ? ` muted`:''}
				${video.playsinline ? ` playsinline`:''}
				preload="${video.preload ? 'auto':'none'}">
				<source src="${video.src}" type="${type}">
			</video>
			${video.poster ? `
				<img data-video-poster src="${video.poster}" alt="${video.title}" />
				<button data-video-play type="button">PLAY</button>`:''}
		</div>`
	}

	/**
	 * @function tmplVideoIframe
	 * @param {Node} video
	 * @description Renders an iframe with video (YouTube or Vimeo). If video has either autoplay or poster, the `enablejsapi=1` will be set
	*/
	tmplVideoIframe(video) {
		return `
		<div data-video="${video.autoplay ? 'autoplay':''}">
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				frameborder="0"
				loading="${video.preload ? 'eager' : 'lazy'}"
				src="${video.src}?${video.controls ? `controls=1`:''}${video.fullscreen ? `&amp;fs=1`:''}${video.lang ? `&amp;hl=${video.lang}`:''}${video.loop ? `&amp;loop=1`:''}${video.mute ? `&amp;mute=1`:''}${video.playsinline ? `&amp;playsinline=1`:''}&amp;enablejsapi=1"
				title="${video.title}">
			</iframe>
			${video.poster ? `
				<img data-video-poster src="${video.poster}" alt="${video.title}" />
				<button data-video-play type="button">PLAY</button>`:''}
		</div>`
	}

	/**
	 * @function toggleVideo
	 * @param {Event} event
	 * @description Handles clcicks on custom play-buttons
	*/
	toggleVideo(event) {
		const button = event.target;
		const poster = button.parentNode.querySelector('[data-video-poster]');
		const video = button.parentNode.querySelector('[data-video] iframe, [data-video] video');

		if (poster && video) {
			button.hidden = true;
			poster.hidden = true;
			this.pauseVideo();
			this.playVideo(video);
		}

		// video.addEventListener('ended', function videoEnded() {
		// 	button.hidden = false;
		// 	poster.hidden = false;
		// 	video.removeEventListener('ended', videoEnded);
		// });
	}
}