/**
 * @function lazyLoad
 * @version 1.1.15
 * @summary 11-10-2020
 * @description Use Intersection Observer to lazy-load iframes, images, picture-source and videos. 
 * Autoplay videos when at least 75% is in viewport, pause when not.
*/
export function lazyLoad() {
	const elements = document.querySelectorAll("iframe[data-src], img[data-src], video");
	const lazyObserver = new IntersectionObserver(function(entries) {
		entries.forEach(function(entry) {
			if (entry.isIntersecting) {
				const element = entry.target;
				const tagName = element.tagName;
				const isVideo = tagName === 'VIDEO';
				const isLoaded = false;

				if (isVideo) {
					if (!isLoaded) {
						for (let source in element.children) {
							const videoSource = element.children[source];
							if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
								videoSource.src = videoSource.dataset.src;
							}
						}
						element.load();
					}
					if (entry.intersectionRatio < 0.75) {
						element.pause();
					}
					else {
						element.play();
					}
				}
				else {
					element.src = element.dataset.src;
					delete element.dataset.src;
					if (element.dataset.srcset) {
						element.srcset = element.dataset.srcset;
						delete element.dataset.srcset;
					}
				}
				if (!isVideo) {
					lazyObserver.unobserve(element);
				}
			}
		});
	}, {
		threshold: [0, 0.75]
	});
	elements.forEach(function(element) {
		lazyObserver.observe(element);
	});
}