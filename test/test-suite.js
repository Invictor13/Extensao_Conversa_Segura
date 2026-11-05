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

          // 9. Parity & onInstalled Lifecycle Suite
          console.log('9. Testing parity between background.js and SettingsManager.DEFAULT_SETTINGS...');
          const fs = require('fs');
          const vm = require('vm');
          const path = require('path');

          const bgSource = fs.readFileSync(path.join(__dirname, '../background.js'), 'utf8');

          let capturedOnInstalledListener = null;
          let capturedOnCommandListener = null;
          let bgStorage = {};

          const bgContext = {
            console: {
              log: () => {},
              warn: () => {},
              error: () => {}
            },
            Date: Date,
            chrome: {
              runtime: {
                lastError: null,
                onInstalled: {
                  addListener: (fn) => { capturedOnInstalledListener = fn; }
                }
              },
              commands: {
                onCommand: {
                  addListener: (fn) => { capturedOnCommandListener = fn; }
                }
              },
              storage: {
                local: {
                  get: (keys, cb) => {
                    if (bgContext.chrome.runtime.lastError) {
                      cb(null);
                    } else {
                      cb({ ...bgStorage });
                    }
                  },
                  set: (items, cb) => {
                    if (!bgContext.chrome.runtime.lastError) {
                      Object.assign(bgStorage, items);
                    }
                    if (cb) cb();
                  }
                }
              }
            }
          };

          // Execute background.js in isolated sandbox and extract DEFAULT_SETTINGS
          vm.createContext(bgContext);
          vm.runInContext(bgSource + '\n;globalThis.extractedBGDefaults = DEFAULT_SETTINGS;', bgContext);
          const bgDefaults = bgContext.extractedBGDefaults;

          assert.strictEqual(typeof bgDefaults, 'object');
          assert.strictEqual(bgDefaults.protectionLevel, 'advanced');
          assert.strictEqual(bgDefaults.hideMessages, SettingsManager.DEFAULT_SETTINGS.hideMessages);
          assert.strictEqual(bgDefaults.hidePreviews, SettingsManager.DEFAULT_SETTINGS.hidePreviews);
          assert.strictEqual(bgDefaults.hideNames, SettingsManager.DEFAULT_SETTINGS.hideNames);
          assert.strictEqual(bgDefaults.hidePhotos, SettingsManager.DEFAULT_SETTINGS.hidePhotos);
          assert.strictEqual(bgDefaults.hideMedia, SettingsManager.DEFAULT_SETTINGS.hideMedia);
          assert.strictEqual(bgDefaults.particleEffect, SettingsManager.DEFAULT_SETTINGS.particleEffect);
          assert.strictEqual(bgDefaults.panicTriggered, SettingsManager.DEFAULT_SETTINGS.panicTriggered);
          assert.strictEqual(bgDefaults.panicBackupSettings, SettingsManager.DEFAULT_SETTINGS.panicBackupSettings);
          assert.strictEqual(typeof bgDefaults.lastUpdated, 'number');
          assert.strictEqual(typeof SettingsManager.DEFAULT_SETTINGS.lastUpdated, 'number');
          console.log('Background & SettingsManager defaults parity test PASSED!');

          // Test helper for spy tracking on bgContext.chrome.storage.local.set
          let setCalls = [];
          function resetStorageSpy(initialData = {}) {
            bgStorage = { ...initialData };
            setCalls = [];
            bgContext.chrome.runtime.lastError = null;
            bgContext.chrome.storage.local.set = function (items, cb) {
              setCalls.push(JSON.parse(JSON.stringify(items)));
              if (!bgContext.chrome.runtime.lastError) {
                Object.assign(bgStorage, items);
              }
              if (cb) cb();
            };
          }

          console.log('10. Testing onInstalled lifecycle: storage read error handling (0 set calls)...');
          resetStorageSpy({ preserveMe: 123 });
          bgContext.chrome.runtime.lastError = { message: 'Read failure' };
          capturedOnInstalledListener({ reason: 'install' });
          assert.strictEqual(setCalls.length, 0, 'Storage write should never occur on read error');
          assert.strictEqual(bgStorage.preserveMe, 123, 'Existing storage must remain intact on read error');
          bgContext.chrome.runtime.lastError = null;
          console.log('Storage read error handling during onInstalled test PASSED!');

          console.log('10b. Testing onInstalled lifecycle: invalid non-object read response (0 set calls)...');
          resetStorageSpy({ preserveMe: 456 });
          const origGet = bgContext.chrome.storage.local.get;
          // Test null response
          bgContext.chrome.storage.local.get = (keys, cb) => cb(null);
          capturedOnInstalledListener({ reason: 'install' });
          assert.strictEqual(setCalls.length, 0, 'Storage write should never occur when get returns null');
          assert.strictEqual(bgStorage.preserveMe, 456);

          // Test array response
          bgContext.chrome.storage.local.get = (keys, cb) => cb([1, 2, 3]);
          capturedOnInstalledListener({ reason: 'install' });
          assert.strictEqual(setCalls.length, 0, 'Storage write should never occur when get returns array');
          assert.strictEqual(bgStorage.preserveMe, 456);
          bgContext.chrome.storage.local.get = origGet;
          console.log('Invalid non-object storage read response test PASSED!');

          console.log('11. Testing onInstalled lifecycle: fresh install with empty storage starts in Advanced...');
          resetStorageSpy({});
          capturedOnInstalledListener({ reason: 'install' });
          assert.strictEqual(setCalls.length, 1, 'Exactly one set call must occur on empty storage');
          const freshPayload = setCalls[0];
          assert.strictEqual(freshPayload.protectionLevel, 'advanced');
          assert.strictEqual(freshPayload.hideMessages, true);
          assert.strictEqual(freshPayload.hidePreviews, true);
          assert.strictEqual(freshPayload.hideNames, false);
          assert.strictEqual(freshPayload.hidePhotos, false);
          assert.strictEqual(freshPayload.hideMedia, true);
          assert.strictEqual(freshPayload.particleEffect, true);
          assert.strictEqual(freshPayload.panicTriggered, false);
          assert.strictEqual(freshPayload.panicBackupSettings, null);
          assert.strictEqual(typeof freshPayload.lastUpdated, 'number');
          assert.strictEqual(SettingsManager.detectPreset(bgStorage), 'advanced');
          console.log('Fresh install starts in Advanced test PASSED!');

          console.log('12. Testing onInstalled lifecycle: update preserves Basic preset (0 writes when complete)...');
          resetStorageSpy({
            protectionLevel: 'basic',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: false,
            particleEffect: false,
            panicTriggered: false,
            panicBackupSettings: null,
            lastUpdated: 1600000000000
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 0, 'No set call should occur when all settings already exist');
          assert.strictEqual(bgStorage.protectionLevel, 'basic');
          assert.strictEqual(bgStorage.hideMedia, false);
          assert.strictEqual(bgStorage.particleEffect, false);
          assert.strictEqual(bgStorage.lastUpdated, 1600000000000);
          assert.strictEqual(SettingsManager.detectPreset(bgStorage), 'basic');
          console.log('Update preserves Basic preset test PASSED!');

          console.log('13. Testing onInstalled lifecycle: update preserves Maximum preset (0 writes when complete)...');
          resetStorageSpy({
            protectionLevel: 'maximum',
            hideMessages: true,
            hidePreviews: true,
            hideNames: true,
            hidePhotos: true,
            hideMedia: true,
            particleEffect: true,
            panicTriggered: false,
            panicBackupSettings: null,
            lastUpdated: 1650000000000
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 0, 'No set call should occur when all settings already exist');
          assert.strictEqual(bgStorage.protectionLevel, 'maximum');
          assert.strictEqual(bgStorage.hideNames, true);
          assert.strictEqual(bgStorage.hidePhotos, true);
          assert.strictEqual(bgStorage.lastUpdated, 1650000000000);
          assert.strictEqual(SettingsManager.detectPreset(bgStorage), 'maximum');
          console.log('Update preserves Maximum preset test PASSED!');

          console.log('14. Testing onInstalled lifecycle: update preserves Custom settings & unrecognized data...');
          resetStorageSpy({
            protectionLevel: 'custom',
            hideMessages: true,
            hidePreviews: false,
            hideNames: true,
            hidePhotos: false,
            hideMedia: false,
            particleEffect: true,
            panicTriggered: false,
            panicBackupSettings: null,
            lastUpdated: 1670000000000,
            userNotes: 'preserve-extra-keys',
            futureVersionFlag: 42
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 0, 'No set call should occur when all known settings already exist');
          assert.strictEqual(bgStorage.hidePreviews, false);
          assert.strictEqual(bgStorage.hideNames, true);
          assert.strictEqual(bgStorage.userNotes, 'preserve-extra-keys');
          assert.strictEqual(bgStorage.futureVersionFlag, 42);
          assert.strictEqual(bgStorage.lastUpdated, 1670000000000);
          assert.strictEqual(SettingsManager.detectPreset(bgStorage), 'custom');
          console.log('Update preserves Custom and extra keys test PASSED!');

          console.log('15. Testing onInstalled lifecycle: update writes ONLY missing keys...');
          resetStorageSpy({
            protectionLevel: 'advanced',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: true,
            lastUpdated: 1700000000000
            // Missing particleEffect, panicTriggered, panicBackupSettings
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 1, 'Exactly one set call should occur for missing keys');
          const missingPayload = setCalls[0];
          assert.deepStrictEqual(Object.keys(missingPayload).sort(), ['panicBackupSettings', 'panicTriggered', 'particleEffect'].sort());
          assert.strictEqual(missingPayload.particleEffect, true);
          assert.strictEqual(missingPayload.panicTriggered, false);
          assert.strictEqual(missingPayload.panicBackupSettings, null);
          assert.strictEqual(missingPayload.lastUpdated, undefined, 'Existing lastUpdated must NOT be in payload');
          assert.strictEqual(bgStorage.lastUpdated, 1700000000000, 'Existing lastUpdated must be preserved exactly');
          console.log('Missing-keys-only update test PASSED!');

          console.log('16. Testing onInstalled lifecycle: lastUpdated existing is strictly preserved...');
          const fixedTimestamp = 1712345678901;
          resetStorageSpy({
            protectionLevel: 'basic',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: false,
            lastUpdated: fixedTimestamp
            // Missing particleEffect, panicTriggered, panicBackupSettings
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 1);
          assert.strictEqual(setCalls[0].lastUpdated, undefined, 'lastUpdated must not be in set payload when already existing');
          assert.strictEqual(bgStorage.lastUpdated, fixedTimestamp, 'Stored lastUpdated timestamp must remain unchanged');
          console.log('Existing lastUpdated strict preservation test PASSED!');

          console.log('17. Testing onInstalled lifecycle: lastUpdated missing is populated with valid timestamp...');
          const beforeTime = Date.now();
          resetStorageSpy({
            protectionLevel: 'advanced',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: true,
            particleEffect: true,
            panicTriggered: false,
            panicBackupSettings: null
            // lastUpdated is missing!
          });
          capturedOnInstalledListener({ reason: 'update' });
          const afterTime = Date.now();
          assert.strictEqual(setCalls.length, 1);
          assert.deepStrictEqual(Object.keys(setCalls[0]), ['lastUpdated'], 'Payload must contain ONLY lastUpdated');
          assert.strictEqual(typeof setCalls[0].lastUpdated, 'number');
          assert.strictEqual(setCalls[0].lastUpdated >= beforeTime && setCalls[0].lastUpdated <= afterTime, true);
          assert.strictEqual(bgStorage.lastUpdated, setCalls[0].lastUpdated);
          console.log('Missing lastUpdated populated test PASSED!');

          console.log('18. Testing onInstalled lifecycle: storage write error does not retry or corrupt storage...');
          resetStorageSpy({
            protectionLevel: 'advanced',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: true,
            lastUpdated: 1700000000000
            // missing particleEffect, panicTriggered, panicBackupSettings
          });
          let writeErrorLogged = false;
          const origConsoleError = bgContext.console.error;
          bgContext.console.error = function (...args) {
            if (args[0] && args[0].includes('Erro ao preencher chaves ausentes')) {
              writeErrorLogged = true;
            }
          };
          // Intercept set to simulate runtime.lastError inside callback
          bgContext.chrome.storage.local.set = function (items, cb) {
            setCalls.push(JSON.parse(JSON.stringify(items)));
            bgContext.chrome.runtime.lastError = { message: 'Write failure' };
            if (cb) cb();
            bgContext.chrome.runtime.lastError = null;
          };
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 1, 'Exactly one write attempt must occur with no retries');
          assert.strictEqual(writeErrorLogged, true, 'Write error must be logged via console.error');
          assert.strictEqual(bgStorage.lastUpdated, 1700000000000, 'Original storage data must remain intact');
          bgContext.console.error = origConsoleError;
          console.log('Storage write error resilience test PASSED!');

          console.log('19. Testing onInstalled lifecycle: Alt+Q panic command behavior remains intact & saves snapshot...');
          resetStorageSpy({
            protectionLevel: 'basic',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: false,
            particleEffect: false,
            panicTriggered: false,
            panicBackupSettings: null,
            lastUpdated: 1000
          });
          capturedOnCommandListener('toggle-panic');
          assert.strictEqual(bgStorage.protectionLevel, 'maximum');
          assert.strictEqual(bgStorage.hideMessages, true);
          assert.strictEqual(bgStorage.hidePreviews, true);
          assert.strictEqual(bgStorage.hideNames, true);
          assert.strictEqual(bgStorage.hidePhotos, true);
          assert.strictEqual(bgStorage.hideMedia, true);
          assert.strictEqual(bgStorage.panicTriggered, true);
          assert.notStrictEqual(bgStorage.panicBackupSettings, null, 'Snapshot must be captured');
          assert.strictEqual(bgStorage.panicBackupSettings.protectionLevel, 'basic');
          assert.strictEqual(bgStorage.panicBackupSettings.hideMedia, false);
          assert.strictEqual(bgStorage.panicBackupSettings.particleEffect, false);
          assert.strictEqual(bgStorage.lastUpdated > 1000, true);
          console.log('Alt+Q panic command behavior test PASSED!');

          // 20. Resilient Emergency Lifecycle Suite (PR02.2)
          console.log('20. Testing SettingsManager.validateSnapshot schema enforcement...');
          assert.strictEqual(SettingsManager.validateSnapshot(null), false);
          assert.strictEqual(SettingsManager.validateSnapshot([]), false);
          assert.strictEqual(SettingsManager.validateSnapshot({}), false);
          assert.strictEqual(SettingsManager.validateSnapshot({
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            // missing hideMedia
            particleEffect: true,
            protectionLevel: 'advanced'
          }), false);
          assert.strictEqual(SettingsManager.validateSnapshot({
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: 'true', // string instead of boolean
            particleEffect: true,
            protectionLevel: 'advanced'
          }), false);
          assert.strictEqual(SettingsManager.validateSnapshot({
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: true,
            particleEffect: true,
            protectionLevel: 'invalid_level'
          }), false);
          assert.strictEqual(SettingsManager.validateSnapshot({
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: false,
            particleEffect: true,
            protectionLevel: 'basic'
          }), true);
          console.log('SettingsManager.validateSnapshot tests PASSED!');

          console.log('21. Testing activateEmergency from Basic and exact restoreEmergency...');
          mockStorage = {
            protectionLevel: 'basic',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: false,
            particleEffect: false,
            panicTriggered: false,
            panicBackupSettings: null,
            lastUpdated: 500
          };

          SettingsManager.activateEmergency((activeSettings, activeErr) => {
            assert.strictEqual(activeErr, null);
            assert.strictEqual(activeSettings.panicTriggered, true);
            assert.strictEqual(activeSettings.protectionLevel, 'maximum');
            assert.strictEqual(activeSettings.hideNames, true);
            assert.strictEqual(activeSettings.hidePhotos, true);
            assert.strictEqual(activeSettings.hideMedia, true);
            assert.notStrictEqual(activeSettings.panicBackupSettings, null);
            assert.strictEqual(activeSettings.panicBackupSettings.hideMedia, false);
            assert.strictEqual(activeSettings.panicBackupSettings.particleEffect, false);
            assert.strictEqual(activeSettings.panicBackupSettings.protectionLevel, 'basic');

            // Test exact restoration
            SettingsManager.restoreEmergency((restoredSettings, restoreErr) => {
              assert.strictEqual(restoreErr, null);
              assert.strictEqual(restoredSettings.panicTriggered, false);
              assert.strictEqual(restoredSettings.panicBackupSettings, null);
              assert.strictEqual(restoredSettings.protectionLevel, 'basic');
              assert.strictEqual(restoredSettings.hideMessages, true);
              assert.strictEqual(restoredSettings.hidePreviews, true);
              assert.strictEqual(restoredSettings.hideMedia, false);
              assert.strictEqual(restoredSettings.hideNames, false);
              assert.strictEqual(restoredSettings.hidePhotos, false);
              assert.strictEqual(restoredSettings.particleEffect, false);
              assert.strictEqual(restoredSettings.lastUpdated > 500, true);
              console.log('Basic preset activation and restore PASSED!');

              console.log('22. Testing repeated Alt+Q (idempotency: snapshot preserved)...');
              SettingsManager.activateEmergency((firstActive) => {
                const initialSnapshot = { ...firstActive.panicBackupSettings };
                // Call activateEmergency again while already in panic
                SettingsManager.activateEmergency((secondActive) => {
                  assert.strictEqual(secondActive.panicTriggered, true);
                  assert.deepStrictEqual(secondActive.panicBackupSettings, initialSnapshot, 'Existing snapshot must be strictly preserved on repeated Alt+Q');
                  console.log('Repeated Alt+Q idempotency test PASSED!');

                  console.log('23. Testing manual filter modification during emergency discards snapshot...');
                  // Modify hideNames manually
                  SettingsManager.set({ hideNames: false }, (manualSettings) => {
                    assert.strictEqual(manualSettings.panicTriggered, false, 'Manual filter change must cancel panic');
                    assert.strictEqual(manualSettings.panicBackupSettings, null, 'Manual filter change must discard snapshot');
                    assert.strictEqual(manualSettings.hideNames, false);
                    console.log('Manual modification during emergency test PASSED!');

                    console.log('24. Testing invalid/corrupted snapshot handling in restoreEmergency...');
                    mockStorage = {
                      protectionLevel: 'maximum',
                      hideMessages: true,
                      hidePreviews: true,
                      hideNames: true,
                      hidePhotos: true,
                      hideMedia: true,
                      particleEffect: true,
                      panicTriggered: true,
                      panicBackupSettings: { corrupt: true } // Corrupt snapshot!
                    };

                    SettingsManager.restoreEmergency((unchangedSettings, corruptErr) => {
                      assert.notStrictEqual(corruptErr, null);
                      assert.strictEqual(corruptErr.code, 'INVALID_SNAPSHOT');
                      assert.strictEqual(mockStorage.panicTriggered, true, 'Must NOT clear panic on invalid snapshot');
                      assert.strictEqual(mockStorage.hideNames, true, 'Filters must remain in Maximum');
                      console.log('Corrupted snapshot refusal test PASSED!');

                      console.log('25. Testing explicit recoverEmergencyFallback...');
                      SettingsManager.recoverEmergencyFallback((recoveredSettings, recErr) => {
                        assert.strictEqual(recErr, null);
                        assert.strictEqual(recoveredSettings.protectionLevel, 'advanced');
                        assert.strictEqual(recoveredSettings.panicTriggered, false);
                        assert.strictEqual(recoveredSettings.panicBackupSettings, null);
                        assert.strictEqual(recoveredSettings.hideNames, false);
                        assert.strictEqual(recoveredSettings.hidePhotos, false);
                        assert.strictEqual(recoveredSettings.hideMedia, true);
                        console.log('Explicit recovery fallback test PASSED!');

                        console.log('26. Testing Custom configuration activation and exact restoration...');
                        mockStorage = {
                          protectionLevel: 'custom',
                          hideMessages: true,
                          hidePreviews: false,
                          hideNames: true,
                          hidePhotos: false,
                          hideMedia: false,
                          particleEffect: true,
                          panicTriggered: false,
                          panicBackupSettings: null,
                          lastUpdated: 1000
                        };

                        SettingsManager.activateEmergency((customActive) => {
                          assert.strictEqual(customActive.panicTriggered, true);
                          assert.strictEqual(customActive.protectionLevel, 'maximum');
                          assert.strictEqual(customActive.panicBackupSettings.protectionLevel, 'custom');
                          assert.strictEqual(customActive.panicBackupSettings.hidePreviews, false);
                          assert.strictEqual(customActive.panicBackupSettings.hideNames, true);

                          SettingsManager.restoreEmergency((customRestored, cRestErr) => {
                            assert.strictEqual(cRestErr, null);
                            assert.strictEqual(customRestored.protectionLevel, 'custom');
                            assert.strictEqual(customRestored.hideMessages, true);
                            assert.strictEqual(customRestored.hidePreviews, false);
                            assert.strictEqual(customRestored.hideNames, true);
                            assert.strictEqual(customRestored.hidePhotos, false);
                            assert.strictEqual(customRestored.hideMedia, false);
                            assert.strictEqual(customRestored.panicTriggered, false);
                            assert.strictEqual(customRestored.panicBackupSettings, null);
                            console.log('Custom configuration activation and restore PASSED!');

                            console.log('All automated tests executed successfully!');
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
