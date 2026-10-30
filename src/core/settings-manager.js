/**
 * Unimed Privacy Pro - Settings Manager
 * Manages configuration reading, writing, schema validation, and fallback state.
 * Strictly uses chrome.storage.local for corporate security & LGPD compliance.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UnimedSettingsManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_SETTINGS = {
    protectionLevel: 'advanced', // 'basic' | 'advanced' | 'maximum' | 'custom'
    hideMessages: true,
    hidePreviews: true,
    hideNames: true,
    hidePhotos: true,
    hideMedia: true,
    particleEffect: true,
    panicTriggered: false,
    lastUpdated: Date.now()
  };

  const VALID_LEVELS = ['basic', 'advanced', 'maximum', 'custom'];

  /**
   * Evaluates if current filter values match a defined preset level.
   * Returns 'basic', 'advanced', 'maximum', or 'custom'.
   * @param {Object} settings
   * @returns {string}
   */
  function detectPreset(settings) {
    if (!settings) return 'custom';

    const isBasic =
      settings.hideMessages === true &&
      settings.hidePreviews === true &&
      settings.hideNames === false &&
      settings.hidePhotos === false &&
      settings.hideMedia === false;

    const isAllFiltersOn =
      settings.hideMessages === true &&
      settings.hidePreviews === true &&
      settings.hideNames === true &&
      settings.hidePhotos === true &&
      settings.hideMedia === true;

    if (isBasic) return 'basic';
    if (isAllFiltersOn) {
      return settings.protectionLevel === 'maximum' ? 'maximum' : 'advanced';
    }

    return 'custom';
  }

  /**
   * Sanitizes and validates a full settings object against schema rules.
   * @param {Object} input
   * @returns {Object} Validated settings object
   */
  function sanitizeSettings(input) {
    if (!input || typeof input !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    const sanitized = { ...DEFAULT_SETTINGS };

    if (VALID_LEVELS.includes(input.protectionLevel)) sanitized.protectionLevel = input.protectionLevel;
    if (typeof input.hideMessages === 'boolean') sanitized.hideMessages = input.hideMessages;
    if (typeof input.hidePreviews === 'boolean') sanitized.hidePreviews = input.hidePreviews;
    if (typeof input.hideNames === 'boolean') sanitized.hideNames = input.hideNames;
    if (typeof input.hidePhotos === 'boolean') sanitized.hidePhotos = input.hidePhotos;
    if (typeof input.hideMedia === 'boolean') sanitized.hideMedia = input.hideMedia;
    if (typeof input.particleEffect === 'boolean') sanitized.particleEffect = input.particleEffect;
    if (typeof input.panicTriggered === 'boolean') sanitized.panicTriggered = input.panicTriggered;
    if (typeof input.lastUpdated === 'number') sanitized.lastUpdated = input.lastUpdated;

    // Recalculate protection level dynamically
    sanitized.protectionLevel = detectPreset(sanitized);

    return sanitized;
  }

  /**
   * Sanitizes only the partial fields provided for an update.
   * @param {Object} partialInput
   * @returns {Object} Sanitized partial object
   */
  function sanitizePartialSettings(partialInput) {
    if (!partialInput || typeof partialInput !== 'object') {
      return {};
    }

    const sanitizedPartial = {};

    if (VALID_LEVELS.includes(partialInput.protectionLevel)) sanitizedPartial.protectionLevel = partialInput.protectionLevel;
    if (typeof partialInput.hideMessages === 'boolean') sanitizedPartial.hideMessages = partialInput.hideMessages;
    if (typeof partialInput.hidePreviews === 'boolean') sanitizedPartial.hidePreviews = partialInput.hidePreviews;
    if (typeof partialInput.hideNames === 'boolean') sanitizedPartial.hideNames = partialInput.hideNames;
    if (typeof partialInput.hidePhotos === 'boolean') sanitizedPartial.hidePhotos = partialInput.hidePhotos;
    if (typeof partialInput.hideMedia === 'boolean') sanitizedPartial.hideMedia = partialInput.hideMedia;
    if (typeof partialInput.particleEffect === 'boolean') sanitizedPartial.particleEffect = partialInput.particleEffect;
    if (typeof partialInput.panicTriggered === 'boolean') sanitizedPartial.panicTriggered = partialInput.panicTriggered;

    sanitizedPartial.lastUpdated = Date.now();

    return sanitizedPartial;
  }

  /**
   * Returns preset settings for a given protection level.
   * @param {string} level ('basic' | 'advanced' | 'maximum')
   * @returns {Object}
   */
  function getPresetSettings(level) {
    switch (level) {
      case 'basic':
        return {
          protectionLevel: 'basic',
          hideMessages: true,
          hidePreviews: true,
          hideNames: false,
          hidePhotos: false,
          hideMedia: false
        };
      case 'maximum':
        return {
          protectionLevel: 'maximum',
          hideMessages: true,
          hidePreviews: true,
          hideNames: true,
          hidePhotos: true,
          hideMedia: true
        };
      case 'advanced':
      default:
        return {
          protectionLevel: 'advanced',
          hideMessages: true,
          hidePreviews: true,
          hideNames: true,
          hidePhotos: true,
          hideMedia: true
        };
    }
  }

  // Queue to serialize set operations sequentially
  let writeQueue = Promise.resolve();

  /**
   * Safely checks if Chrome extension runtime and storage context is valid and active.
   * Prevents 'Extension context invalidated' uncaught runtime errors.
   * @returns {boolean}
   */
  function isContextValid() {
    try {
      return typeof chrome !== 'undefined' &&
        !!chrome.runtime &&
        !!chrome.runtime.id &&
        !!chrome.storage &&
        !!chrome.storage.local;
    } catch (e) {
      return false;
    }
  }

  return {
    DEFAULT_SETTINGS,
    detectPreset,
    sanitizeSettings,
    sanitizePartialSettings,
    getPresetSettings,
    isContextValid,

    /**
     * Get settings from chrome.storage.local with graceful fallback.
     * @param {Function} callback
     */
    get: function (callback) {
      if (isContextValid()) {
        try {
          chrome.storage.local.get(null, function (items) {
            try {
              if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                console.warn('[Unimed Privacy] Storage access error, using default settings.', chrome.runtime.lastError);
                if (callback) callback(sanitizeSettings(DEFAULT_SETTINGS));
                return;
              }
              if (callback) callback(sanitizeSettings(items));
            } catch (err) {
              if (callback) callback(sanitizeSettings(DEFAULT_SETTINGS));
            }
          });
        } catch (e) {
          if (callback) callback(sanitizeSettings(DEFAULT_SETTINGS));
        }
      } else {
        if (callback) callback(sanitizeSettings(DEFAULT_SETTINGS));
      }
    },

    /**
     * Save partial settings atomically to chrome.storage.local.
     * Uses a sequential queue to eliminate race conditions.
     * Recalculates protectionLevel based on current merged state.
     * @param {Object} partialSettings
     * @param {Function} [callback]
     */
    set: function (partialSettings, callback) {
      writeQueue = writeQueue.then(() => {
        return new Promise((resolve) => {
          this.get((current) => {
            const merged = { ...current, ...partialSettings };
            const detectedLevel = detectPreset(merged);
            const payloadToSave = sanitizePartialSettings({
              ...partialSettings,
              protectionLevel: detectedLevel
            });

            if (isContextValid()) {
              try {
                chrome.storage.local.set(payloadToSave, function () {
                  try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                      console.error('[Unimed Privacy] Storage write error:', chrome.runtime.lastError);
                      if (callback) callback(null, chrome.runtime.lastError);
                      resolve();
                      return;
                    }
                    chrome.storage.local.get(null, function (items) {
                      const updated = sanitizeSettings(items);
                      if (callback) callback(updated);
                      resolve();
                    });
                  } catch (e) {
                    const updated = sanitizeSettings({ ...current, ...payloadToSave });
                    if (callback) callback(updated);
                    resolve();
                  }
                });
              } catch (e) {
                const updated = sanitizeSettings({ ...current, ...payloadToSave });
                if (callback) callback(updated);
                resolve();
              }
            } else {
              const updated = sanitizeSettings({ ...current, ...payloadToSave });
              if (callback) callback(updated);
              resolve();
            }
          });
        });
      }).catch((err) => {
        console.error('[Unimed Privacy] Write queue error:', err);
      });
    },

    /**
     * Apply a protection preset level ('basic', 'advanced', 'maximum').
     * @param {string} level
     * @param {Function} [callback]
     */
    applyPreset: function (level, callback) {
      const preset = getPresetSettings(level);
      this.set(preset, callback);
    },

    /**
     * Subscribe to storage changes safely.
     * @param {Function} listener
     */
    onChanged: function (listener) {
      if (isContextValid() && chrome.storage.onChanged) {
        try {
          chrome.storage.onChanged.addListener(function (changes, areaName) {
            try {
              if (!isContextValid()) return;
              if (areaName === 'local') {
                const updated = {};
                Object.keys(changes).forEach(function (key) {
                  if (changes[key] && changes[key].newValue !== undefined) {
                    updated[key] = changes[key].newValue;
                  }
                });
                listener(updated, changes);
              }
            } catch (e) {
              console.warn('[Unimed Privacy] Error handling storage change:', e);
            }
          });
        } catch (e) {
          console.warn('[Unimed Privacy] Could not add storage change listener:', e);
        }
      }
    }
  };
});
