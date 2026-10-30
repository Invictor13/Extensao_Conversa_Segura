/**
 * Unimed Privacy Pro - Background Service Worker
 * Secure, offline background handler for emergency shortcuts and extension lifecycle.
 * Strictly uses chrome.storage.local (no remote calls, zero telemetry).
 */

const DEFAULT_SETTINGS = {
  protectionLevel: 'advanced', // 'basic' | 'advanced' | 'maximum'
  hideMessages: true,
  hidePreviews: true,
  hideNames: true,
  hidePhotos: true,
  hideMedia: true,
  particleEffect: true,
  lastUpdated: Date.now()
};

// Initialize default settings on install or update if missing
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.storage.local.get(null, (existing) => {
      if (chrome.runtime.lastError) return;
      const initialized = { ...DEFAULT_SETTINGS, ...(existing || {}) };
      chrome.storage.local.set(initialized);
    });
  } catch (e) {
    console.warn('[Unimed Privacy] Install listener error:', e);
  }
});

// Emergency Panic Shortcut (Alt+Q)
// For security and corporate safety, Alt+Q ALWAYS forces Maximum Emergency Protection.
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
      console.warn('[Unimed Privacy] Panic command error:', e);
    }
  }
});
