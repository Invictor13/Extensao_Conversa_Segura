/**
 * Victor Ladislau Viana Privacy Pro - Background Service Worker
 * Secure, offline background handler for emergency shortcuts and extension lifecycle.
 * Strictly uses chrome.storage.local (no remote calls, zero telemetry).
 */

try {
  if (typeof importScripts === 'function') {
    importScripts('src/core/settings-manager.js');
  }
} catch (e) {
  console.warn('[Privacy Pro] Could not import SettingsManager in Service Worker:', e);
}

const DEFAULT_SETTINGS = {
  protectionLevel: 'advanced', // 'basic' | 'advanced' | 'maximum'
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: false,
  hideMedia: true,
  particleEffect: true,
  panicTriggered: false,
  panicBackupSettings: null,
  language: 'pt_BR',
  autoCensorEnabled: false,
  autoCensorTimeout: 60,
  autoCensorEffect: 'blur',
  lastUpdated: Date.now()
};

// Initialize default settings on install or update if missing
chrome.runtime.onInstalled.addListener((details) => {
  try {
    chrome.storage.local.get(null, (existing) => {
      // Storage read failure must never be treated as empty storage
      if (chrome.runtime.lastError) {
        console.error('[Privacy Pro] Erro na leitura do storage durante onInstalled:', chrome.runtime.lastError);
        return;
      }

      if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
        console.error('[Privacy Pro] Retorno inválido na leitura do storage durante onInstalled:', existing);
        return;
      }

      const existingKeys = Object.keys(existing);

      if (existingKeys.length === 0) {
        // Completely empty storage: initialize with Advanced Protection defaults
        chrome.storage.local.set({ ...DEFAULT_SETTINGS, lastUpdated: Date.now() }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Privacy Pro] Erro ao gravar defaults iniciais:', chrome.runtime.lastError);
          }
        });
      } else {
        // Populated storage: identify and write ONLY missing keys
        const missingSettings = {};
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
          if (!Object.prototype.hasOwnProperty.call(existing, key)) {
            missingSettings[key] = key === 'lastUpdated' ? Date.now() : value;
          }
        }

        if (Object.keys(missingSettings).length > 0) {
          chrome.storage.local.set(missingSettings, () => {
            if (chrome.runtime.lastError) {
              console.error('[Privacy Pro] Erro ao preencher chaves ausentes:', chrome.runtime.lastError);
            }
          });
        }
      }
    });
  } catch (e) {
    console.warn('[Privacy Pro] Install listener error:', e);
  }
});

// Emergency Panic Shortcut (Alt+Q)
// For security and safety, Alt+Q ALWAYS forces Maximum Emergency Protection.
// Disabling protection requires an explicit user action inside the popup interface.
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-panic') {
    try {
      const manager = typeof SettingsManager !== 'undefined' ? SettingsManager : (typeof self !== 'undefined' ? self.SettingsManager : null);
      if (manager && typeof manager.activateEmergency === 'function') {
        manager.activateEmergency((settings, err) => {
          if (err) {
            console.error('[Privacy Pro] Error activating emergency in background:', err);
          }
        });
      } else {
        // Fallback if SettingsManager failed to load in isolated context
        chrome.storage.local.get(null, (existing) => {
          if (chrome.runtime.lastError) return;
          const current = (existing && typeof existing === 'object') ? existing : {};
          const snapshot = (!current.panicTriggered || !current.panicBackupSettings) ? {
            hideMessages: typeof current.hideMessages === 'boolean' ? current.hideMessages : true,
            hidePreviews: typeof current.hidePreviews === 'boolean' ? current.hidePreviews : true,
            hideNames: typeof current.hideNames === 'boolean' ? current.hideNames : false,
            hidePhotos: typeof current.hidePhotos === 'boolean' ? current.hidePhotos : false,
            hideMedia: typeof current.hideMedia === 'boolean' ? current.hideMedia : true,
            particleEffect: typeof current.particleEffect === 'boolean' ? current.particleEffect : true,
            protectionLevel: current.protectionLevel || 'advanced'
          } : current.panicBackupSettings;

          chrome.storage.local.set({
            protectionLevel: 'maximum',
            hideMessages: true,
            hidePreviews: true,
            hideNames: true,
            hidePhotos: true,
            hideMedia: true,
            panicTriggered: true,
            panicBackupSettings: snapshot,
            lastUpdated: Date.now()
          });
        });
      }
    } catch (e) {
      console.warn('[Privacy Pro] Panic command error:', e);
    }
  }
});
