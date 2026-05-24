/**
 * anime.js - A lightweight JavaScript animation library
 * Fork of juliangarnier/anime
 */

'use strict';

// Default animation settings
const defaultSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutCubic', // changed default from easeOutElastic - less bouncy, feels cleaner to me
  round: 0,
  keyframes: null,
  autoplay: true,
  loop: 0,
  direction: 'normal',
  begin: null,
  change: null,
  update: null,
  complete: null,
  loopBegin: null,
  loopComplete: null,
};

// Easing functions
const penner = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
};

/**
 * Parse easing string or function
 * @param {string|Function} easing
 * @returns {Function}
 */
function parseEasing(easing) {
  if (typeof easing === 'function') return easing;
  if (typeof easing === 'string' && penner[easing]) return penner[easing];
  return penner.linear;
}

/**
 * Get elements from a target selector, element, or array
 * @param {string|Element|Array|NodeList} targets
 * @returns {Array}
 */
function getTargets(targets) {
  if (!targets) return [];
  if (typeof targets === 'string') return Array.from(document.querySelectorAll(targets));
  if (targets instanceof Element) return [targets];
  if (targets instanceof NodeList) return Array.from(targets);
  if (Array.isArray(targets)) return targets.flat();
  return [targets];
}

/**
 * Merge objects together (shallow)
 * @param {...Object} objects
 * @returns {Object}
 */
function mergeObjects(...objects) {
  return Object.assign({}, ...objects);
}

/**
 * Core anime function — creates and returns an animation instance
 * @param {Object} params - Animation parameters
 * @returns {Object} Animation instance
 */
function anime(params = {}) {
  const settings = mergeObjects(defaultSettings, params);
  const targets = getTargets(params.targets);
  const easingFn = parseEasing(settings.easing);

  let startTime = null;
  let lastTime = 0;
  let paused = !settings.autoplay;
  let completed = false;
  let rafId = null;

  const instance = {
    targets,
    settings,
    paused,
    completed,
    play,
    pause,
    restart,
    seek,
  };

  function tick(timestamp) {
    if (paused || completed) return;
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / settings.duration, 1);
    const easedProgress = easingFn(progress);

    if (typeof settings.update === 'function') {
      settings.update({ progress: easedProgress, elapsed, instance });
    }

    if (progress < 1
