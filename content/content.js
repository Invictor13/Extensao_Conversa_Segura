/**
 * Unimed Privacy Pro - Content Script Entry Point
 * Initializes and coordinates SettingsManager, WhatsAppIntegration,
 * PrivacyEngine, and VisualEngine on web.whatsapp.com.
 */

(function () {
  'use strict';

  const SettingsManager = window.UnimedSettingsManager;
  const WhatsAppIntegration = window.UnimedWhatsAppIntegration;
  const PrivacyEngine = window.UnimedPrivacyEngine;
  const VisualEngine = window.UnimedVisualEngine;

  if (!SettingsManager || !WhatsAppIntegration) {
    console.warn('[Unimed Privacy] Required extension modules not loaded.');
    return;
  }

  function init() {
    if (PrivacyEngine) {
      PrivacyEngine.init(SettingsManager);
    } else {
      SettingsManager.get(function (settings) {
        WhatsAppIntegration.applyClasses(settings);
      });
      SettingsManager.onChanged(function (updatedSettings) {
        SettingsManager.get(function (settings) {
          WhatsAppIntegration.applyClasses(settings);
        });
      });
    }

    if (VisualEngine) {
      VisualEngine.init(SettingsManager);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
