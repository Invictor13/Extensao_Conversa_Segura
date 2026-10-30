/**
 * Test Suite for Victor Ladislau Viana Privacy Pro
 * Verifies SettingsManager, WhatsAppIntegration, and Context Invalidation error handling.
 */

const assert = require('assert');

// Mock browser environment globals
let mockStorage = {};
let storageChangeListeners = [];

global.window = global;
global.window.matchMedia = function () {
  return { matches: false };
};

global.document = {
  hidden: false,
  body: {
    classList: {
      classes: new Set(),
      add: function (cls) { this.classes.add(cls); },
      remove: function (cls) { this.classes.delete(cls); },
      contains: function (cls) { return this.classes.has(cls); }
    },
    appendChild: function () {},
    removeChild: function () {}
  },
  getElementById: function (id) { return null; },
  createElement: function (tag) {
    return {
      style: {},
      getContext: function () { return null; },
      remove: function () {}
    };
  },
  addEventListener: function () {}
};

global.chrome = {
  runtime: { id: 'test-extension-id' },
  storage: {
    local: {
      get: function (query, callback) {
        if (!query) {
          callback({ ...mockStorage });
        } else {
          callback({ ...mockStorage });
        }
      },
      set: function (items, callback) {
        const changes = {};
        Object.keys(items).forEach((key) => {
          changes[key] = { oldValue: mockStorage[key], newValue: items[key] };
          mockStorage[key] = items[key];
        });
        if (callback) callback();
        storageChangeListeners.forEach((l) => l(changes, 'local'));
      }
    },
    onChanged: {
      addListener: function (listener) {
        storageChangeListeners.push(listener);
      }
    }
  }
};

// 1. Load Modules
const SettingsManager = require('../src/core/settings-manager.js');
const WhatsAppIntegration = require('../src/engine/whatsapp-integration.js');
const PrivacyEngine = require('../src/engine/privacy-engine.js');
const VisualEngine = require('../src/engine/visual-engine.js');

global.WhatsAppIntegration = WhatsAppIntegration;
global.VisualEngine = VisualEngine;

console.log('1. Testing SettingsManager schema sanitization & preset detection...');
const defaultSanitized = SettingsManager.sanitizeSettings({});
assert.strictEqual(defaultSanitized.hideMessages, true);
assert.strictEqual(defaultSanitized.protectionLevel, 'advanced');

assert.strictEqual(SettingsManager.detectPreset({
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: false,
  hideMedia: false
}), 'basic');

assert.strictEqual(SettingsManager.detectPreset({
  protectionLevel: 'maximum',
  hideMessages: true,
  hidePreviews: true,
  hideNames: true,
  hidePhotos: true,
  hideMedia: true
}), 'maximum');

console.log('2. Testing PrivacyEngine evaluation & effective settings...');
PrivacyEngine.updateSettings({
  hideMessages: false,
  hideNames: false,
  panicTriggered: false
});

let effective = PrivacyEngine.getEffectiveSettings();
assert.strictEqual(effective.hideMessages, false);
assert.strictEqual(effective.hideNames, false);
console.log('PrivacyEngine effective settings evaluation test PASSED!');

console.log('3. Testing Emergency Panic Mode & Deactivation...');
// Activate panic mode
PrivacyEngine.updateSettings({ panicTriggered: true });
effective = PrivacyEngine.getEffectiveSettings();
assert.strictEqual(effective.hideMessages, true);
assert.strictEqual(effective.hideNames, true);

// Deactivate panic mode
PrivacyEngine.updateSettings({ panicTriggered: false });
effective = PrivacyEngine.getEffectiveSettings();
assert.strictEqual(effective.panicTriggered, false);
assert.strictEqual(effective.hideMessages, false);
console.log('Emergency Panic Mode lifecycle test PASSED!');

console.log('4. Testing Context Invalidation fallback in SettingsManager...');
const oldRuntime = global.chrome.runtime;
global.chrome = {
  get runtime() {
    throw new Error('Extension context invalidated.');
  }
};

assert.strictEqual(SettingsManager.isContextValid(), false);

let receivedSettings = null;
SettingsManager.get(function (settings) {
  receivedSettings = settings;
});

assert.notStrictEqual(receivedSettings, null);
assert.strictEqual(receivedSettings.hideMessages, true);
console.log('Context Invalidation test PASSED!');

// Restore global chrome for remaining test assertion
global.chrome = {
  runtime: oldRuntime,
  storage: {
    local: {
      get: function (q, cb) { cb(mockStorage); },
      set: function (i, cb) { if (cb) cb(); }
    },
    onChanged: { addListener: function () {} }
  }
};

console.log('5. Testing WhatsAppIntegration CSS class toggling...');
WhatsAppIntegration.applyClasses({
  masterSwitch: true,
  hideMessages: true,
  hidePreviews: true,
  hideNames: true,
  hidePhotos: true,
  hideMedia: true
});

assert.strictEqual(document.body.classList.contains('vlv-hide-messages'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-previews'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-names'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-photos'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-media'), true);

console.log('6. Testing independent filter toggling (turning off hideNames only)...');
WhatsAppIntegration.applyClasses({
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: true,
  hideMedia: true
});

assert.strictEqual(document.body.classList.contains('vlv-hide-messages'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-previews'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-names'), false);
assert.strictEqual(document.body.classList.contains('vlv-hide-photos'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-media'), true);
console.log('Independent filter toggling test PASSED!');

console.log('All automated tests executed successfully!');
