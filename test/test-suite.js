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
assert.strictEqual(defaultSanitized.hidePreviews, true);
assert.strictEqual(defaultSanitized.hideMedia, true);
assert.strictEqual(defaultSanitized.hideNames, false);
assert.strictEqual(defaultSanitized.hidePhotos, false);
assert.strictEqual(defaultSanitized.protectionLevel, 'advanced');

// Basic Preset detection
assert.strictEqual(SettingsManager.detectPreset({
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: false,
  hideMedia: false
}), 'basic');

// Advanced Preset detection (messages + previews + media)
assert.strictEqual(SettingsManager.detectPreset({
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: false,
  hideMedia: true
}), 'advanced');

// Maximum Preset detection (all 5 filters)
assert.strictEqual(SettingsManager.detectPreset({
  protectionLevel: 'arbitrary_legacy_value',
  hideMessages: true,
  hidePreviews: true,
  hideNames: true,
  hidePhotos: true,
  hideMedia: true
}), 'maximum');

// Custom Preset detection when unaligned with any standard preset
assert.strictEqual(SettingsManager.detectPreset({
  hideMessages: true,
  hidePreviews: false,
  hideNames: false,
  hidePhotos: false,
  hideMedia: false
}), 'custom');

assert.strictEqual(SettingsManager.detectPreset({
  hideMessages: true,
  hidePreviews: true,
  hideNames: true,
  hidePhotos: false,
  hideMedia: true
}), 'custom');

assert.strictEqual(SettingsManager.detectPreset(null), 'custom');
console.log('SettingsManager preset detection tests PASSED!');

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
      get: function (query, callback) {
        callback({ ...mockStorage });
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

console.log('7. Testing SettingsManager.applyPreset for basic, advanced, and maximum sequentially...');
SettingsManager.applyPreset('basic', (basicSettings, basicErr) => {
  assert.strictEqual(basicErr, null);
  assert.strictEqual(basicSettings.protectionLevel, 'basic');
  assert.strictEqual(basicSettings.hideMessages, true);
  assert.strictEqual(basicSettings.hidePreviews, true);
  assert.strictEqual(basicSettings.hideMedia, false);
  assert.strictEqual(basicSettings.hideNames, false);
  assert.strictEqual(basicSettings.hidePhotos, false);

  SettingsManager.applyPreset('advanced', (advSettings, advErr) => {
    assert.strictEqual(advErr, null);
    assert.strictEqual(advSettings.protectionLevel, 'advanced');
    assert.strictEqual(advSettings.hideMessages, true);
    assert.strictEqual(advSettings.hidePreviews, true);
    assert.strictEqual(advSettings.hideMedia, true);
    assert.strictEqual(advSettings.hideNames, false);
    assert.strictEqual(advSettings.hidePhotos, false);

    SettingsManager.applyPreset('maximum', (maxSettings, maxErr) => {
      assert.strictEqual(maxErr, null);
      assert.strictEqual(maxSettings.protectionLevel, 'maximum');
      assert.strictEqual(maxSettings.hideMessages, true);
      assert.strictEqual(maxSettings.hidePreviews, true);
      assert.strictEqual(maxSettings.hideMedia, true);
      assert.strictEqual(maxSettings.hideNames, true);
      assert.strictEqual(maxSettings.hidePhotos, true);
      console.log('SettingsManager.applyPreset tests PASSED!');

      console.log('8. Testing SettingsManager.set error handling and writeQueue concurrency...');
      const originalSet = global.chrome.storage.local.set;

      // Mock an isolated error during write
      global.chrome.storage.local.set = function (items, callback) {
        global.chrome.runtime.lastError = { message: 'Disk quota exceeded' };
        if (callback) callback();
        delete global.chrome.runtime.lastError;
      };

      SettingsManager.set({ hideMessages: false }, (settings, error) => {
        assert.notStrictEqual(error, null);
        assert.strictEqual(error.message, 'Disk quota exceeded');
        console.log('Storage error handling test PASSED!');

        // Restore normal storage set
        global.chrome.storage.local.set = originalSet;

        // Test concurrent serialization through writeQueue
        SettingsManager.set({ hidePhotos: true });
        SettingsManager.set({ hideNames: true });
        SettingsManager.set({ hidePhotos: false }, (finalSettings, queueError) => {
          assert.strictEqual(queueError, null);
          assert.strictEqual(finalSettings.hidePhotos, false);
          assert.strictEqual(finalSettings.hideNames, true);
          console.log('writeQueue serialization test PASSED!');
          console.log('All automated tests executed successfully!');
        });
      });
    });
  });
});
