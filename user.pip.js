// ==UserScript==
// @name         YouTube - PiP (iOS)
// @namespace    http://tampermonkey.net/
// @homepage     https://github.com/insekter/YouTube-PiP-iOS
// @version      1.01
// @description  Enables PiP and blocks auto-mute; for iOS Safari, on m.youtube.com.
// @match        *://m.youtube.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    Object.defineProperty(Document.prototype, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(Document.prototype, 'visibilityState', { get: () => 'visible', configurable: true });

    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (['webkitpresentationmodechanged', 'enterpictureinpicture', 'leavepictureinpicture'].includes(type)) {
            return;
        }

        if (['visibilitychange', 'pagehide', 'blur'].includes(type)) {
            const wrappedListener = function (e) {
                e.stopImmediatePropagation();
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
        }

        return originalAddEventListener.call(this, type, listener, options);
    };

    document.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
    window.addEventListener('pagehide', (e) => e.stopImmediatePropagation(), true);
    window.addEventListener('blur', (e) => e.stopImmediatePropagation(), true);

    const observer = new MutationObserver(() => {
        const video = document.querySelector('video');
        if (video) {
            if (!video.dataset.pipFixed) {
                video.dataset.pipFixed = true;
                video.setAttribute('playsinline', 'true');
                video.setAttribute('webkit-playsinline', 'true');
            }

            if (video.muted || video.hasAttribute('muted')) {
                video.muted = false;
                video.removeAttribute('muted');
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
