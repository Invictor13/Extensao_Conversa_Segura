/**
 * Victor Ladislau Viana Privacy Pro - Settings Manager
 * Manages configuration reading, writing, schema validation, and fallback state.
 * Strictly uses chrome.storage.local for corporate security & LGPD compliance.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SettingsManager = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_SETTINGS = {
    protectionLevel: 'advanced', // 'basic' | 'advanced' | 'maximum' | 'custom'
    hideMessages: true,
    hidePreviews: true,
    hideNames: false,
    hidePhotos: false,
    hideMedia: true,
    particleEffect: true,
    panicTriggered: false,
    panicBackupSettings: null,
    lastUpdated: Date.now()
  };

  const VALID_LEVELS = ['basic', 'advanced', 'maximum', 'custom'];

  const FILTER_KEYS = [
    'hideMessages',
    'hidePreviews',
    'hideNames',
    'hidePhotos',
    'hideMedia'
  ];

  /**
   * Validates if a snapshot is strictly valid and complete.
   * Must contain all 5 privacy filters, particleEffect, and a valid protectionLevel.
   * Types must be boolean for filters/particleEffect and string in VALID_LEVELS for protectionLevel.
   * @param {any} snapshot
   * @returns {boolean}
   */
  function validateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      return false;
    }

    if (typeof snapshot.hideMessages !== 'boolean') return false;
    if (typeof snapshot.hidePreviews !== 'boolean') return false;
    if (typeof snapshot.hideNames !== 'boolean') return false;
    if (typeof snapshot.hidePhotos !== 'boolean') return false;
    if (typeof snapshot.hideMedia !== 'boolean') return false;
    if (typeof snapshot.particleEffect !== 'boolean') return false;
    if (!VALID_LEVELS.includes(snapshot.protectionLevel)) return false;

    return true;
  }

  /**
   * Evaluates if current filter values match a defined preset level deterministically.
   * Does NOT rely on existing protectionLevel property.
   * Returns 'basic', 'advanced', 'maximum', or 'custom'.
   * @param {Object} settings
   * @returns {string}
   */
  function detectPreset(settings) {
    if (!settings || typeof settings !== 'object') return 'custom';

    const isBasic =
      settings.hideMessages === true &&
      settings.hidePreviews === true &&
      settings.hideNames === false &&
      settings.hidePhotos === false &&
      settings.hideMedia === false;

    const isAdvanced =
      settings.hideMessages === true &&
      settings.hidePreviews === true &&
      settings.hideNames === false &&
      settings.hidePhotos === false &&
      settings.hideMedia === true;

    const isMaximum =
      settings.hideMessages === true &&
      settings.hidePreviews === true &&
      settings.hideNames === true &&
      settings.hidePhotos === true &&
      settings.hideMedia === true;

    if (isBasic) return 'basic';
    if (isAdvanced) return 'advanced';
    if (isMaximum) return 'maximum';

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
    if (input.panicBackupSettings === null || (typeof input.panicBackupSettings === 'object' && input.panicBackupSettings !== null)) {
      sanitized.panicBackupSettings = input.panicBackupSettings;
    }
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
    if (partialInput.panicBackupSettings === null || (typeof partialInput.panicBackupSettings === 'object' && partialInput.panicBackupSettings !== null)) {
      sanitizedPartial.panicBackupSettings = partialInput.panicBackupSettings;
    }

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
      case 'advanced':
        return {
          protectionLevel: 'advanced',
          hideMessages: true,
          hidePreviews: true,
          hideNames: false,
          hidePhotos: false,
          hideMedia: true
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
      default:
        return getPresetSettings('advanced');
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
    validateSnapshot,
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
                console.warn('[Privacy Pro] Storage access error, using default settings.', chrome.runtime.lastError);
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
     * Never falsely reports success if storage write fails.
     * Standardized callback signature: callback(settings, error).
     * @param {Object} partialSettings
     * @param {Function} [callback]
     */
    set: function (partialSettings, callback) {
      writeQueue = writeQueue.then(() => {
        return new Promise((resolve) => {
          this.get((current) => {
            // Check if user manually modified any privacy filter or preset during emergency
            const hasManualFilterChange = FILTER_KEYS.some((key) => {
              return Object.prototype.hasOwnProperty.call(partialSettings, key) &&
                     partialSettings[key] !== current[key];
            });
            const hasPresetChange = Object.prototype.hasOwnProperty.call(partialSettings, 'protectionLevel') &&
                                   partialSettings.protectionLevel !== current.protectionLevel;

            // If in panic mode and user makes manual filter/preset change, end panic and discard snapshot
            const overrides = {};
            if ((hasManualFilterChange || hasPresetChange) && (current.panicTriggered || current.panicBackupSettings)) {
              overrides.panicTriggered = false;
              overrides.panicBackupSettings = null;
            }

            const merged = { ...current, ...partialSettings, ...overrides };
            const detectedLevel = detectPreset(merged);
            const payloadToSave = sanitizePartialSettings({
              ...partialSettings,
              ...overrides,
              protectionLevel: detectedLevel
            });

            if (isContextValid()) {
              try {
                chrome.storage.local.set(payloadToSave, function () {
                  try {
                    const runtimeError = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError;
                    if (runtimeError) {
                      console.error('[Privacy Pro] Storage write error:', runtimeError);
                      // Return current verified state and the error; do not pretend unpersisted changes succeeded
                      if (callback) callback(current, runtimeError);
                      resolve();
                      return;
                    }

                    const finalSettings = sanitizeSettings({ ...current, ...payloadToSave });
                    if (callback) callback(finalSettings, null);
                    resolve();
                  } catch (e) {
                    console.error('[Privacy Pro] Error in storage callback:', e);
                    if (callback) callback(current, e);
                    resolve();
                  }
                });
              } catch (e) {
                console.error('[Privacy Pro] Storage set exception:', e);
                if (callback) callback(current, e);
                resolve();
              }
            } else {
              const contextError = new Error('Extension context invalidated.');
              if (callback) callback(current, contextError);
              resolve();
            }
          });
        });
      }).catch((err) => {
        console.error('[Privacy Pro] Write queue error:', err);
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
     * Activates Maximum Emergency Protection (Alt+Q).
     * Strictly idempotent: if panic is already triggered and a valid snapshot exists,
     * it maintains the original snapshot and forces maximum protection without overwriting.
     * Captures snapshot of previous functional state if not already in panic.
     * @param {Function} [callback] Standard callback (settings, error)
     */
    activateEmergency: function (callback) {
      writeQueue = writeQueue.then(() => {
        return new Promise((resolve) => {
          this.get((current) => {
            const hasExistingSnapshot = validateSnapshot(current.panicBackupSettings);
            let snapshotToKeep = current.panicBackupSettings;

            // If not in panic or snapshot missing/invalid, capture fresh snapshot from current functional settings
            if (!current.panicTriggered || !hasExistingSnapshot) {
              snapshotToKeep = {
                hideMessages: current.hideMessages,
                hidePreviews: current.hidePreviews,
                hideNames: current.hideNames,
                hidePhotos: current.hidePhotos,
                hideMedia: current.hideMedia,
                particleEffect: current.particleEffect,
                protectionLevel: detectPreset(current)
              };
            }

            const payloadToSave = {
              protectionLevel: 'maximum',
              hideMessages: true,
              hidePreviews: true,
              hideNames: true,
              hidePhotos: true,
              hideMedia: true,
              panicTriggered: true,
              panicBackupSettings: snapshotToKeep,
              lastUpdated: Date.now()
            };

            if (isContextValid()) {
              try {
                chrome.storage.local.set(payloadToSave, function () {
                  try {
                    const runtimeError = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError;
                    if (runtimeError) {
                      console.error('[Privacy Pro] Storage emergency write error:', runtimeError);
                      if (callback) callback(current, runtimeError);
                      resolve();
                      return;
                    }

                    const finalSettings = sanitizeSettings({ ...current, ...payloadToSave });
                    if (callback) callback(finalSettings, null);
                    resolve();
                  } catch (e) {
                    console.error('[Privacy Pro] Error in activateEmergency callback:', e);
                    if (callback) callback(current, e);
                    resolve();
                  }
                });
              } catch (e) {
                console.error('[Privacy Pro] Storage activateEmergency exception:', e);
                if (callback) callback(current, e);
                resolve();
              }
            } else {
              const contextError = new Error('Extension context invalidated.');
              if (callback) callback(current, contextError);
              resolve();
            }
          });
        });
      }).catch((err) => {
        console.error('[Privacy Pro] Write queue error in activateEmergency:', err);
      });
    },

    /**
     * Restores previous functional settings from snapshot after emergency.
     * Validates snapshot integrity strictly before restoring.
     * If snapshot is invalid or missing, does NOT fall back automatically.
     * Standardized callback signature: callback(settings, error).
     * @param {Function} [callback]
     */
    restoreEmergency: function (callback) {
      writeQueue = writeQueue.then(() => {
        return new Promise((resolve) => {
          this.get((current) => {
            const snapshot = current.panicBackupSettings;

            if (!validateSnapshot(snapshot)) {
              const validationError = new Error('INVALID_SNAPSHOT');
              validationError.code = 'INVALID_SNAPSHOT';
              if (callback) callback(current, validationError);
              resolve();
              return;
            }

            const detectedLevel = detectPreset(snapshot);
            const payloadToSave = {
              hideMessages: snapshot.hideMessages,
              hidePreviews: snapshot.hidePreviews,
              hideNames: snapshot.hideNames,
              hidePhotos: snapshot.hidePhotos,
              hideMedia: snapshot.hideMedia,
              particleEffect: snapshot.particleEffect,
              protectionLevel: detectedLevel,
              panicTriggered: false,
              panicBackupSettings: null,
              lastUpdated: Date.now()
            };

            if (isContextValid()) {
              try {
                chrome.storage.local.set(payloadToSave, function () {
                  try {
                    const runtimeError = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError;
                    if (runtimeError) {
                      console.error('[Privacy Pro] Storage restore error:', runtimeError);
                      if (callback) callback(current, runtimeError);
                      resolve();
                      return;
                    }

                    const finalSettings = sanitizeSettings({ ...current, ...payloadToSave });
                    if (callback) callback(finalSettings, null);
                    resolve();
                  } catch (e) {
                    console.error('[Privacy Pro] Error in restoreEmergency callback:', e);
                    if (callback) callback(current, e);
                    resolve();
                  }
                });
              } catch (e) {
                console.error('[Privacy Pro] Storage restoreEmergency exception:', e);
                if (callback) callback(current, e);
                resolve();
              }
            } else {
              const contextError = new Error('Extension context invalidated.');
              if (callback) callback(current, contextError);
              resolve();
            }
          });
        });
      }).catch((err) => {
        console.error('[Privacy Pro] Write queue error in restoreEmergency:', err);
      });
    },

    /**
     * Explicit fallback recovery to Advanced Protection when snapshot is invalid/missing.
     * Called only upon explicit user confirmation in the popup UI.
     * @param {Function} [callback]
     */
    recoverEmergencyFallback: function (callback) {
      const advancedPreset = getPresetSettings('advanced');
      const payload = {
        ...advancedPreset,
        panicTriggered: false,
        panicBackupSettings: null,
        lastUpdated: Date.now()
      };
      this.set(payload, callback);
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
              console.warn('[Privacy Pro] Error handling storage change:', e);
            }
          });
        } catch (e) {
          console.warn('[Privacy Pro] Could not add storage change listener:', e);
        }
      }
    }
  };
});
