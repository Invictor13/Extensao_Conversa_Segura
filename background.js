/**
 * Victor Ladislau Viana Privacy Pro - Background Service Worker
 * Secure, offline background handler for emergency shortcuts and extension lifecycle.
 * Strictly uses chrome.storage.local (no remote calls, zero telemetry).
 */

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
      chrome.storage.local.set({
        protectionLevel: 'maximum',
        hideMessages: true,
        hidePreviews: true,
        hideNames: true,
        hidePhotos: true,
        hideMedia: true,
        panicTriggered: true,
        lastUpdated: Date.now()
      });
    } catch (e) {
      console.warn('[Privacy Pro] Panic command error:', e);
    }
  }
});
