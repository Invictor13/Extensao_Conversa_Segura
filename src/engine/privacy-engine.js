/**
 * Victor Ladislau Viana Privacy Pro - Privacy Engine
 * Centralized Manager for effective privacy protection state.
 * Evaluates logical OR of user settings and active temporary conditions:
 * - Emergency Protection (Alt+Q panic)
 *
 * SECURITY & PRIVACY NOTICE:
 * Does NOT keylog, intercept input fields, or capture typed text.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PrivacyEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let currentSettings = {};

  // Independent state triggers for temporary protection
  const triggerState = {
    panicMode: false
  };

  /**
   * Initializes Privacy Engine and registers event listeners.
   * @param {Object} settingsManager
   */
  function init(settingsManager) {
    settingsManager.get(function (settings) {
      updateSettings(settings);
    });

    // On storage change, always reload fully validated and sanitized settings
    settingsManager.onChanged(function () {
      settingsManager.get(function (settings) {
        updateSettings(settings);
      });
    });
  }

  /**
   * Updates base user settings and evaluates effective privacy state.
   * Sanitizes input to avoid partial corrupted state.
   * @param {Object} newSettings
   */
  function updateSettings(newSettings) {
    if (!newSettings || typeof newSettings !== 'object') return;
    currentSettings = { ...currentSettings, ...newSettings };

    if (currentSettings.panicTriggered) {
      triggerState.panicMode = true;
    } else {
      triggerState.panicMode = false;
    }

    evaluateAndApply();
  }

  /**
   * Calculates the effective protection settings combining saved user preferences
   * with active temporary protection triggers using logical OR semantics.
   * @returns {Object} Effective settings object to be rendered by WhatsAppIntegration
   */
  function getEffectiveSettings() {
    // Emergency Panic Mode forces maximum protection
    if (triggerState.panicMode) {
      return {
        ...currentSettings,
        hideMessages: true,
        hidePreviews: true,
        hideNames: true,
        hidePhotos: true,
        hideMedia: true
      };
    }

    return currentSettings;
  }

  /**
   * Applies the calculated effective settings to the WhatsApp Web DOM & Visual Engine.
   */
  function evaluateAndApply() {
    const effective = getEffectiveSettings();
    if (typeof WhatsAppIntegration !== 'undefined' && WhatsAppIntegration.applyClasses) {
      WhatsAppIntegration.applyClasses(effective);
    }
    if (typeof VisualEngine !== 'undefined' && VisualEngine.updateState) {
      VisualEngine.updateState(effective);
    }
  }

  return {
    init,
    updateSettings,
    getEffectiveSettings,
    evaluateAndApply,
    _triggerState: triggerState // Exposed for testing
  };
});
