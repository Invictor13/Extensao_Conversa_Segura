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
    panicMode: false,
    autoCensorActive: false
  };

  // Activity Watcher internal state
  let inactivityTimer = null;
  let isWatcherRunning = false;
  let lastActivityTimestamp = 0;
  const THROTTLE_INTERVAL_MS = 250;

  // Track event handlers for deterministic cleanup
  let boundActivityHandler = null;
  let boundVisibilityHandler = null;

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
   * Handles user interaction events (mousemove, keydown, scroll, click, touchstart).
   * MANDATORY UNLOCK RULE: If auto-censor is currently active, the VERY FIRST valid event
   * must deactivate the censorship IMMEDIATELY with ZERO throttling delay.
   * When not active, throttling prevents CPU waste during continuous movement.
   * @param {Event} [event]
   */
  function handleUserActivity(event) {
    const now = Date.now();

    // 1. Mandatory Unlock Rule: Immediate deactivation without throttle delay
    if (triggerState.autoCensorActive) {
      deactivateAutoCensor();
      lastActivityTimestamp = now;
      resetInactivityTimer();
      return;
    }

    // 2. Throttle activity while normal to avoid timer thrashing
    if (now - lastActivityTimestamp < THROTTLE_INTERVAL_MS) {
      return;
    }

    lastActivityTimestamp = now;
    resetInactivityTimer();
  }

  /**
   * Handles tab visibility changes (visibilitychange).
   * - When tab becomes hidden, clears timer to prevent background activation.
   * - When tab becomes visible again, restarts a clean countdown.
   */
  function handleVisibilityChange() {
    if (typeof document === 'undefined') return;

    if (document.hidden) {
      clearTimerOnly();
    } else {
      if (currentSettings.autoCensorEnabled && isWatcherRunning) {
        resetInactivityTimer();
      }
    }
  }

  function clearTimerOnly() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }

  /**
   * Starts monitoring user activity if enabled.
   * Ensures no duplicate event listeners or duplicate timers.
   */
  function startWatcher() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Remove any lingering listeners first to guarantee idempotent registration
    stopWatcher();

    isWatcherRunning = true;
    lastActivityTimestamp = Date.now();

    boundActivityHandler = function (e) {
      handleUserActivity(e);
    };

    boundVisibilityHandler = function () {
      handleVisibilityChange();
    };

    const options = { passive: true, capture: true };
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

    events.forEach((evt) => {
      window.addEventListener(evt, boundActivityHandler, options);
    });

    document.addEventListener('visibilitychange', boundVisibilityHandler);

    resetInactivityTimer();
  }

  /**
   * Stops activity monitoring and removes all registered listeners and timers.
   */
  function stopWatcher() {
    clearTimerOnly();

    if (isWatcherRunning && typeof window !== 'undefined') {
      if (boundActivityHandler) {
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach((evt) => {
          window.removeEventListener(evt, boundActivityHandler, { passive: true, capture: true });
        });
        boundActivityHandler = null;
      }

      if (boundVisibilityHandler && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', boundVisibilityHandler);
        boundVisibilityHandler = null;
      }
    }

    isWatcherRunning = false;
  }

  /**
   * Resets the single active countdown timer according to configured timeout.
   */
  function resetInactivityTimer() {
    clearTimerOnly();

    if (!currentSettings.autoCensorEnabled || !isWatcherRunning) {
      return;
    }

    // Do not schedule timer if document is currently hidden
    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }

    const timeoutSec = typeof currentSettings.autoCensorTimeout === 'number'
      ? currentSettings.autoCensorTimeout
      : 60;
    const timeoutMs = Math.max(timeoutSec, 10) * 1000;

    inactivityTimer = setTimeout(() => {
      activateAutoCensor();
    }, timeoutMs);
  }

  /**
   * Activates fullscreen auto-censor.
   * Does NOT alter the user's 5 individual filter settings or storage.
   */
  function activateAutoCensor() {
    clearTimerOnly();
    triggerState.autoCensorActive = true;
    evaluateAndApply();
  }

  /**
   * Deactivates fullscreen auto-censor immediately.
   * Restores exact previous visual state.
   */
  function deactivateAutoCensor() {
    triggerState.autoCensorActive = false;
    evaluateAndApply();
  }

  /**
   * Updates base user settings and evaluates effective privacy state.
   * Sanitizes input to avoid partial corrupted state.
   * Synchronizes activity watcher lifecycle with autoCensorEnabled.
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

    // Synchronize activity watcher lifecycle
    if (currentSettings.autoCensorEnabled) {
      startWatcher();
    } else {
      stopWatcher();
      if (triggerState.autoCensorActive) {
        deactivateAutoCensor();
      }
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
    if (typeof WhatsAppIntegration !== 'undefined') {
      if (WhatsAppIntegration.applyClasses) {
        WhatsAppIntegration.applyClasses(effective);
      }
      if (WhatsAppIntegration.applyAutoCensor) {
        WhatsAppIntegration.applyAutoCensor(
          triggerState.autoCensorActive,
          currentSettings.autoCensorEffect || 'blur',
          currentSettings.language || 'pt_BR'
        );
      }
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
    startWatcher,
    stopWatcher,
    resetInactivityTimer,
    activateAutoCensor,
    deactivateAutoCensor,
    handleUserActivity,
    handleVisibilityChange,
    _triggerState: triggerState, // Exposed for testing
    _isWatcherRunning: () => isWatcherRunning,
    _hasActiveTimer: () => inactivityTimer !== null
  };
});
