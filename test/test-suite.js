/**
 * Test Suite for Victor Ladislau Viana Privacy Pro
 * Verifies SettingsManager, WhatsAppIntegration, and Context Invalidation error handling.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log('6b. Testing independent media & photos filter toggling (PR03 media censorship coverage)...');
// hideMedia = true, hidePhotos = false
WhatsAppIntegration.applyClasses({
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: false,
  hideMedia: true
});
assert.strictEqual(document.body.classList.contains('vlv-hide-media'), true);
assert.strictEqual(document.body.classList.contains('vlv-hide-photos'), false);

// hideMedia = false, hidePhotos = true
WhatsAppIntegration.applyClasses({
  hideMessages: true,
  hidePreviews: true,
  hideNames: false,
  hidePhotos: true,
  hideMedia: false
});
assert.strictEqual(document.body.classList.contains('vlv-hide-media'), false);
assert.strictEqual(document.body.classList.contains('vlv-hide-photos'), true);

// Verify that WhatsAppIntegration.SELECTORS.media contains expanded profile and modal selectors
const mediaSelectors = WhatsAppIntegration.SELECTORS.media;
assert.strictEqual(mediaSelectors.includes('#main [data-testid="msg-container"] img:not([src*="emoji"])'), true);
assert.strictEqual(mediaSelectors.includes('div[role="region"] [data-testid="media-gallery"] img'), true);
assert.strictEqual(mediaSelectors.includes('div[role="region"] div[role="grid"] img'), true);
assert.strictEqual(mediaSelectors.includes('[data-testid="contact-info"] [data-testid="media-gallery"] img'), true);
assert.strictEqual(mediaSelectors.includes('[data-testid="group-info"] [data-testid="media-gallery"] img'), true);
assert.strictEqual(mediaSelectors.includes('div[role="region"] [data-testid="link-preview"] img'), true);
assert.strictEqual(mediaSelectors.includes('[data-testid="contact-info"] [data-testid="link-preview"] img'), true);
assert.strictEqual(mediaSelectors.includes('div[role="region"] [data-testid="document-thumb"]'), true);
assert.strictEqual(mediaSelectors.includes('[data-testid="contact-info"] [data-testid="document-thumb"]'), true);
assert.strictEqual(mediaSelectors.includes('div[role="dialog"] img:not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])'), true);
assert.strictEqual(mediaSelectors.includes('[data-testid="media-viewer"] img'), true);
console.log('Independent media & photos filter toggling and SELECTORS.media test PASSED!');

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
          const vm = require('vm');

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
          assert.strictEqual(freshPayload.language, 'pt_BR');
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
            language: 'pt_BR',
            lastUpdated: 1600000000000
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 0, 'No set call should occur when all settings already exist');
          assert.strictEqual(bgStorage.protectionLevel, 'basic');
          assert.strictEqual(bgStorage.hideMedia, false);
          assert.strictEqual(bgStorage.particleEffect, false);
          assert.strictEqual(bgStorage.language, 'pt_BR');
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
            language: 'en',
            lastUpdated: 1650000000000
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 0, 'No set call should occur when all settings already exist');
          assert.strictEqual(bgStorage.protectionLevel, 'maximum');
          assert.strictEqual(bgStorage.hideNames, true);
          assert.strictEqual(bgStorage.hidePhotos, true);
          assert.strictEqual(bgStorage.language, 'en');
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
            language: 'es',
            lastUpdated: 1670000000000,
            userNotes: 'preserve-extra-keys',
            futureVersionFlag: 42
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 0, 'No set call should occur when all known settings already exist');
          assert.strictEqual(bgStorage.hidePreviews, false);
          assert.strictEqual(bgStorage.hideNames, true);
          assert.strictEqual(bgStorage.language, 'es');
          assert.strictEqual(bgStorage.userNotes, 'preserve-extra-keys');
          assert.strictEqual(bgStorage.futureVersionFlag, 42);
          assert.strictEqual(bgStorage.lastUpdated, 1670000000000);
          assert.strictEqual(SettingsManager.detectPreset(bgStorage), 'custom');
          console.log('Update preserves Custom and extra keys test PASSED!');

          console.log('15. Testing onInstalled lifecycle: update writes ONLY missing keys (including migration of language)...');
          resetStorageSpy({
            protectionLevel: 'advanced',
            hideMessages: true,
            hidePreviews: true,
            hideNames: false,
            hidePhotos: false,
            hideMedia: true,
            lastUpdated: 1700000000000
            // Missing particleEffect, panicTriggered, panicBackupSettings, language
          });
          capturedOnInstalledListener({ reason: 'update' });
          assert.strictEqual(setCalls.length, 1, 'Exactly one set call should occur for missing keys');
          const missingPayload = setCalls[0];
          assert.deepStrictEqual(Object.keys(missingPayload).sort(), ['language', 'panicBackupSettings', 'panicTriggered', 'particleEffect'].sort());
          assert.strictEqual(missingPayload.particleEffect, true);
          assert.strictEqual(missingPayload.panicTriggered, false);
          assert.strictEqual(missingPayload.panicBackupSettings, null);
          assert.strictEqual(missingPayload.language, 'pt_BR');
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
            language: 'pt_BR',
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
            panicBackupSettings: null,
            language: 'pt_BR'
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

                            console.log('27. Testing visual assets integrity and dimensions...');
                            const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
                            assert.strictEqual(manifest.icons['16'], 'icons/icon16.png');
                            assert.strictEqual(manifest.icons['48'], 'icons/icon48.png');
                            assert.strictEqual(manifest.icons['128'], 'icons/icon128.png');
                            assert.strictEqual(manifest.action.default_icon['16'], 'icons/icon16.png');
                            assert.strictEqual(manifest.action.default_icon['48'], 'icons/icon48.png');
                            assert.strictEqual(manifest.action.default_icon['128'], 'icons/icon128.png');

                            const popupHtml = fs.readFileSync(path.join(__dirname, '../popup/popup.html'), 'utf8');
                            assert.strictEqual(popupHtml.includes('src="logo.png"'), true);

                            // Helper to check PNG header dimensions
                            function readPngDimensions(filePath) {
                              const buf = fs.readFileSync(filePath);
                              // PNG signature check
                              assert.strictEqual(buf.toString('hex', 0, 8), '89504e470d0a1a0a');
                              const width = buf.readUInt32BE(16);
                              const height = buf.readUInt32BE(20);
                              return { width, height };
                            }

                            const icon16Dim = readPngDimensions(path.join(__dirname, '../icons/icon16.png'));
                            assert.strictEqual(icon16Dim.width, 16);
                            assert.strictEqual(icon16Dim.height, 16);

                            const icon48Dim = readPngDimensions(path.join(__dirname, '../icons/icon48.png'));
                            assert.strictEqual(icon48Dim.width, 48);
                            assert.strictEqual(icon48Dim.height, 48);

                            const icon128Dim = readPngDimensions(path.join(__dirname, '../icons/icon128.png'));
                            assert.strictEqual(icon128Dim.width, 128);
                            assert.strictEqual(icon128Dim.height, 128);

                            const popupLogoDim = readPngDimensions(path.join(__dirname, '../popup/logo.png'));
                            assert.strictEqual(popupLogoDim.width, 128);
                            assert.strictEqual(popupLogoDim.height, 128);

                            console.log('Visual assets integrity and dimensions test PASSED!');

                            // 27b. PR 2.0.2 — Internationalization (i18n) Test Suite
                            console.log('27b. Testing PR 2.0.2 Internationalization (i18n) catalogs, module and lifecycle...');
                            const PrivacyI18n = require('../src/core/i18n.js');

                            // 1. Syntactic validity of the 3 messages.json files
                            const ptBrMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../_locales/pt_BR/messages.json'), 'utf8'));
                            const enMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../_locales/en/messages.json'), 'utf8'));
                            const esMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../_locales/es/messages.json'), 'utf8'));

                            assert.strictEqual(typeof ptBrMessages, 'object');
                            assert.strictEqual(typeof enMessages, 'object');
                            assert.strictEqual(typeof esMessages, 'object');

                            // 2. Parity of keys across all 3 locale messages.json files
                            const ptBrKeys = Object.keys(ptBrMessages).sort();
                            const enKeys = Object.keys(enMessages).sort();
                            const esKeys = Object.keys(esMessages).sort();

                            assert.deepStrictEqual(ptBrKeys, enKeys, 'pt_BR and en messages.json keys must match 1:1');
                            assert.deepStrictEqual(ptBrKeys, esKeys, 'pt_BR and es messages.json keys must match 1:1');
                            assert.strictEqual(ptBrKeys.includes('extensionName'), true);
                            assert.strictEqual(ptBrKeys.includes('extensionDescription'), true);
                            assert.strictEqual(ptBrKeys.includes('commandTogglePanicDescription'), true);

                            // 3. Manifest placeholders and version validation
                            assert.strictEqual(manifest.version, '2.0.3');
                            assert.strictEqual(manifest.default_locale, 'pt_BR');
                            assert.strictEqual(manifest.name, '__MSG_extensionName__');
                            assert.strictEqual(manifest.description, '__MSG_extensionDescription__');
                            assert.strictEqual(manifest.commands['toggle-panic'].description, '__MSG_commandTogglePanicDescription__');

                            // 4. Parity of dictionary keys in PrivacyI18n
                            const dictPtKeys = Object.keys(PrivacyI18n.DICTIONARIES.pt_BR).sort();
                            const dictEnKeys = Object.keys(PrivacyI18n.DICTIONARIES.en).sort();
                            const dictEsKeys = Object.keys(PrivacyI18n.DICTIONARIES.es).sort();
                            assert.deepStrictEqual(dictPtKeys, dictEnKeys, 'PrivacyI18n pt_BR and en dictionary keys must match 1:1');
                            assert.deepStrictEqual(dictPtKeys, dictEsKeys, 'PrivacyI18n pt_BR and es dictionary keys must match 1:1');

                            // 5. Verification of all popup data-i18n keys
                            const popupHtmlContent = fs.readFileSync(path.join(__dirname, '../popup/popup.html'), 'utf8');
                            const dataI18nRegex = /data-i18n(?:-aria-label|-title|-alt)?="([^"]+)"/g;
                            let match;
                            while ((match = dataI18nRegex.exec(popupHtmlContent)) !== null) {
                              const key = match[1];
                              assert.strictEqual(
                                typeof PrivacyI18n.DICTIONARIES.pt_BR[key],
                                'string',
                                'Key ' + key + ' from popup.html must exist in DICTIONARIES'
                              );
                            }

                            // 6. SettingsManager acceptance of valid languages and rejection of invalid languages
                            assert.strictEqual(SettingsManager.sanitizeSettings({ language: 'en' }).language, 'en');
                            assert.strictEqual(SettingsManager.sanitizeSettings({ language: 'es' }).language, 'es');
                            assert.strictEqual(SettingsManager.sanitizeSettings({ language: 'pt_BR' }).language, 'pt_BR');
                            assert.strictEqual(SettingsManager.sanitizeSettings({ language: 'fr' }).language, 'pt_BR');
                            assert.strictEqual(SettingsManager.sanitizeSettings({ language: 123 }).language, 'pt_BR');
                            assert.strictEqual(SettingsManager.sanitizeSettings({ language: null }).language, 'pt_BR');

                            // 7. SettingsManager.set language persistence and filter independence
                            // Ensure mockStorage has complete functional settings before activating emergency
                            mockStorage = {
                              protectionLevel: 'advanced',
                              hideMessages: true,
                              hidePreviews: true,
                              hideNames: false,
                              hidePhotos: false,
                              hideMedia: true,
                              particleEffect: true,
                              panicTriggered: false,
                              panicBackupSettings: null,
                              language: 'pt_BR',
                              lastUpdated: Date.now()
                            };

                            SettingsManager.set({ language: 'en' }, (enSetSettings, enSetErr) => {
                              assert.strictEqual(enSetErr, null);
                              assert.strictEqual(enSetSettings.language, 'en');
                              // Filters must remain unchanged
                              assert.strictEqual(enSetSettings.hideMessages, true);
                              assert.strictEqual(enSetSettings.hideMedia, true);

                              // 8. Emergency mode isolation: Alt+Q preserves language preference
                              SettingsManager.activateEmergency((panicSettings, panicErr) => {
                                assert.strictEqual(panicErr, null);
                                assert.strictEqual(panicSettings.panicTriggered, true);
                                assert.strictEqual(panicSettings.language, 'en', 'Emergency activation must NOT overwrite language');
                                assert.strictEqual(panicSettings.panicBackupSettings.language, undefined, 'panicBackupSettings snapshot must NOT include language');

                                SettingsManager.restoreEmergency((restoredPanic, restErr) => {
                                  assert.strictEqual(restErr, null);
                                  assert.strictEqual(restoredPanic.panicTriggered, false);
                                  assert.strictEqual(restoredPanic.language, 'en', 'Emergency restore must NOT overwrite language');

                                  // Reset back to pt_BR
                                  SettingsManager.set({ language: 'pt_BR' }, (ptSettings, ptErr) => {
                                    assert.strictEqual(ptErr, null);
                                    assert.strictEqual(ptSettings.language, 'pt_BR');

                                    // 9. Popup DOM Real-time translation integration test via Playwright
                                    const pyPopupI18nScript = `
import os
from playwright.sync_api import sync_playwright

popup_path = os.path.abspath('popup/popup.html')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('file://' + popup_path)

    # 1. Default should be pt_BR
    assert page.eval_on_selector('.brand-text .subtitle', 'el => el.textContent') == 'Proteção visual para WhatsApp Web'
    assert page.eval_on_selector('span[data-i18n="filterHideMessages"]', 'el => el.textContent') == 'Ocultar Mensagens'
    assert page.eval_on_selector('#languageSelect', 'el => el.value') == 'pt_BR'

    # 2. Switch to en
    page.select_option('#languageSelect', 'en')
    assert page.eval_on_selector('.brand-text .subtitle', 'el => el.textContent') == 'Visual privacy for WhatsApp Web'
    assert page.eval_on_selector('span[data-i18n="filterHideMessages"]', 'el => el.textContent') == 'Hide Messages'
    assert page.eval_on_selector('button#presetAdvanced', 'el => el.textContent') == 'Advanced'
    assert page.eval_on_selector('#shortcutPrefix', 'el => el.textContent') == 'Emergency Shortcut:'
    assert page.eval_on_selector('#aboutPrefix', 'el => el.textContent') == 'Developed and owned by'

    # 3. Switch to es
    page.select_option('#languageSelect', 'es')
    assert page.eval_on_selector('.brand-text .subtitle', 'el => el.textContent') == 'Protección visual para WhatsApp Web'
    assert page.eval_on_selector('span[data-i18n="filterHideMessages"]', 'el => el.textContent') == 'Ocultar Mensajes'
    assert page.eval_on_selector('button#presetAdvanced', 'el => el.textContent') == 'Avanzado'
    assert page.eval_on_selector('#shortcutPrefix', 'el => el.textContent') == 'Atajo de Emergencia:'
    assert page.eval_on_selector('#aboutPrefix', 'el => el.textContent') == 'Desarrollado y propiedad de'

    browser.close()
    print("Popup DOM real-time translation Playwright test PASSED!")
`;
                                    const tempPopupTestPath = path.join(__dirname, 'temp_eval_popup_i18n.py');
                                    fs.writeFileSync(tempPopupTestPath, pyPopupI18nScript, 'utf8');
                                    try {
                                      const popupTestOutput = execSync('python3 ' + tempPopupTestPath, { encoding: 'utf8' });
                                      assert.strictEqual(popupTestOutput.includes('Popup DOM real-time translation Playwright test PASSED!'), true);
                                    } finally {
                                      if (fs.existsSync(tempPopupTestPath)) {
                                        fs.unlinkSync(tempPopupTestPath);
                                      }
                                    }

                                    console.log('PR 2.0.2 Internationalization tests PASSED!');
                                  });
                                });
                              });
                            });

                            // 28. PR10 — Rigorous Real-DOM Simulation for Profile Drawer Media, Links, and Docs (10 scenarios)
                            console.log('28. Testing Profile Drawer Media, Links and Docs censorship (10 mandatory scenarios)...');

                            const pyValidationScript = `
import sys, json
from playwright.sync_api import sync_playwright

with open('content/content.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

html_template = '''
<!DOCTYPE html>
<html>
<head>
<style>
''' + css_content + '''
</style>
</head>
<body id="test-body">
  <div id="app">
    <!-- Main conversation (for reference) -->
    <div id="main">
      <div data-testid="msg-container">
        <img id="chat-msg-img" src="blob:https://web.whatsapp.com/chat-img">
      </div>
    </div>

    <!-- Contact Info / Group Info Right Drawer Panel -->
    <div data-testid="drawer-right" role="region">
      <!-- Profile Header / Drawer Header (Individual Contact or Group) -->
      <header id="drawer-header">
        <button id="btn-back" aria-label="Voltar"><svg><path></path></svg></button>
        <span id="drawer-title">Dados do contato</span>
        <button id="btn-close" aria-label="Fechar"><svg><path></path></svg></button>
      </header>

      <!-- Profile Avatar & Details -->
      <div id="profile-details">
        <img id="profile-avatar" data-testid="avatar-tile" src="https://web.whatsapp.com/avatar.jpg">
        <span id="contact-name">Victor Ladislau Viana</span>
        <span id="contact-phone">+55 11 99999-9999</span>
      </div>

      <!-- Navigation tabs between Mídia, Links, Docs -->
      <div role="tablist" id="nav-tabs">
        <button id="tab-btn-media" role="tab" aria-selected="true"><span>Mídia</span></button>
        <button id="tab-btn-links" role="tab" aria-selected="false"><span>Links</span></button>
        <button id="tab-btn-docs" role="tab" aria-selected="false"><span>Docs</span></button>
      </div>

      <!-- Container: Tab 1 - Mídia (Images, Videos, Background-image thumbnails) -->
      <div id="panel-media" role="tabpanel" style="display: block;">
        <div role="grid">
          <div role="gridcell" id="gridcell-media-1">
            <!-- WAWebMediaThumbnail background-image representation -->
            <div id="media-thumb-bg" style="background-image: url('blob:https://web.whatsapp.com/uuid-media-1'); width: 80px; height: 80px;"></div>
          </div>
          <div role="gridcell" id="gridcell-media-2">
            <!-- Image tag representation -->
            <img id="media-thumb-img" src="blob:https://web.whatsapp.com/uuid-img-2">
          </div>
          <div role="gridcell" id="gridcell-media-3">
            <!-- Video representation -->
            <video id="media-thumb-video" src="blob:https://web.whatsapp.com/uuid-vid-3"></video>
          </div>
        </div>
      </div>

      <!-- Container: Tab 2 - Links (Previews, Link cards, Thumbnails) -->
      <div id="panel-links" role="tabpanel" style="display: none;">
        <div role="list" id="links-list">
          <div role="listitem" id="link-item-1">
            <div data-testid="link-preview">
              <img id="link-preview-img-1" src="https://example.com/preview1.jpg">
              <span id="link-title-1">Notícias Tech</span>
            </div>
          </div>
          <div role="listitem" id="link-item-2">
            <div data-testid="link-preview-container">
              <div id="link-thumb-bg-2" data-testid="link-preview-thumbnail" style="background-image: url('https://example.com/thumb2.jpg');"></div>
              <span id="link-url-2">https://github.com/Invictor13</span>
            </div>
          </div>
          <div role="listitem" id="link-item-3">
            <div data-testid="list-item-link">
              <div id="link-thumb-bg-3" data-testid="thumbnail" style="background-image: url('blob:https://web.whatsapp.com/link-thumb-3');"></div>
              <span id="link-desc-3">Tela Privada Repositório</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Container: Tab 3 - Docs (Document thumbnails, preview icons) -->
      <div id="panel-docs" role="tabpanel" style="display: none;">
        <div role="list" id="docs-list">
          <div role="listitem" id="doc-item-1">
            <div data-testid="list-item-document">
              <div id="doc-thumb-bg-1" data-testid="thumbnail" style="background-image: url('blob:https://web.whatsapp.com/doc-thumb-1');"></div>
              <span id="doc-title-1">Contrato_Final.pdf</span>
              <span id="doc-size-1">2.4 MB</span>
            </div>
          </div>
          <div role="listitem" id="doc-item-2">
            <div data-testid="document-thumb">
              <img id="doc-thumb-img-2" src="blob:https://web.whatsapp.com/doc-thumb-2.png">
            </div>
            <span id="doc-title-2">Relatorio_2026.docx</span>
          </div>
          <div role="listitem" id="doc-item-3">
            <div data-testid="doc-preview">
              <div id="doc-preview-canvas-3"><canvas id="doc-canvas-3"></canvas></div>
              <span id="doc-title-3">Apresentacao.pptx</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
'''

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_template)

        def is_blurred(selector):
            filt = page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')
            return 'blur' in filt

        def get_filter(selector):
            return page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')

        def set_hide_media(enable):
            if enable:
                page.eval_on_selector('#test-body', 'el => el.classList.add("vlv-hide-media")')
            else:
                page.eval_on_selector('#test-body', 'el => el.classList.remove("vlv-hide-media")')

        # Scenario 8: hideMedia = true -> Initial state
        set_hide_media(True)

        # 1. Aba Mídia: imagens e vídeos
        assert is_blurred('#media-thumb-bg'), f"Media thumb bg should be blurred: {get_filter('#media-thumb-bg')}"
        assert is_blurred('#media-thumb-img'), f"Media img should be blurred: {get_filter('#media-thumb-img')}"
        assert is_blurred('#media-thumb-video'), f"Media video should be blurred: {get_filter('#media-thumb-video')}"

        # 2. Aba Links: miniaturas e prévias visuais
        assert is_blurred('#link-preview-img-1'), f"Link preview img should be blurred: {get_filter('#link-preview-img-1')}"
        assert is_blurred('#link-thumb-bg-2'), f"Link thumb bg 2 should be blurred: {get_filter('#link-thumb-bg-2')}"
        assert is_blurred('#link-thumb-bg-3'), f"Link thumb bg 3 should be blurred: {get_filter('#link-thumb-bg-3')}"

        # 3. Aba Docs: miniaturas e prévias de documentos
        assert is_blurred('#doc-thumb-bg-1'), f"Doc thumb bg 1 should be blurred: {get_filter('#doc-thumb-bg-1')}"
        assert is_blurred('#doc-thumb-img-2'), f"Doc thumb img 2 should be blurred: {get_filter('#doc-thumb-img-2')}"
        assert is_blurred('#doc-canvas-3'), f"Doc canvas 3 should be blurred: {get_filter('#doc-canvas-3')}"

        # 4. Perfil de contato (Individual contact drawer)
        page.eval_on_selector('#drawer-title', 'el => el.innerText = "Dados do contato"')
        assert is_blurred('#media-thumb-bg') and is_blurred('#link-preview-img-1') and is_blurred('#doc-thumb-bg-1'), "Individual contact profile media must be blurred"

        # 5. Perfil de grupo (Group info drawer)
        page.eval_on_selector('#drawer-title', 'el => el.innerText = "Dados do grupo"')
        assert is_blurred('#media-thumb-bg') and is_blurred('#link-preview-img-1') and is_blurred('#doc-thumb-bg-1'), "Group info profile media must be blurred"

        # 6. Conteúdo inserido dinamicamente (Dynamic infinite scroll or new media received)
        page.evaluate('''() => {
            const grid = document.querySelector("#panel-media div[role='grid']");
            const newCell = document.createElement("div");
            newCell.setAttribute("role", "gridcell");
            const dynMediaDiv = document.createElement("div");
            dynMediaDiv.id = "dynamic-media-thumb";
            dynMediaDiv.style.backgroundImage = 'url("blob:https://web.whatsapp.com/dyn-1")';
            newCell.appendChild(dynMediaDiv);
            grid.appendChild(newCell);

            const linksList = document.querySelector("#links-list");
            const newLink = document.createElement("div");
            newLink.setAttribute("role", "listitem");
            newLink.innerHTML = '<div data-testid="link-preview"><img id="dynamic-link-img" src="https://example.com/dyn-preview.png"></div>';
            linksList.appendChild(newLink);

            const docsList = document.querySelector("#docs-list");
            const newDoc = document.createElement("div");
            newDoc.setAttribute("role", "listitem");
            const dynDocDiv = document.createElement("div");
            dynDocDiv.setAttribute("data-testid", "list-item-document");
            const dynDocThumb = document.createElement("div");
            dynDocThumb.id = "dynamic-doc-thumb";
            dynDocThumb.setAttribute("data-testid", "thumbnail");
            dynDocThumb.style.backgroundImage = 'url("blob:https://web.whatsapp.com/dyn-doc")';
            dynDocDiv.appendChild(dynDocThumb);
            newDoc.appendChild(dynDocDiv);
            docsList.appendChild(newDoc);
        }''')
        assert is_blurred('#dynamic-media-thumb'), "Dynamically added media thumb must be blurred immediately by CSS"
        assert is_blurred('#dynamic-link-img'), "Dynamically added link preview img must be blurred immediately by CSS"
        assert is_blurred('#dynamic-doc-thumb'), "Dynamically added doc thumb must be blurred immediately by CSS"

        # 7. Alternância entre abas (Switching active tabs)
        page.evaluate('''() => {
            document.querySelector("#panel-media").style.display = "none";
            document.querySelector("#panel-links").style.display = "block";
            document.querySelector("#tab-btn-media").setAttribute("aria-selected", "false");
            document.querySelector("#tab-btn-links").setAttribute("aria-selected", "true");
        }''')
        assert is_blurred('#link-preview-img-1') and is_blurred('#dynamic-link-img'), "Links tab media must remain blurred after tab switch"

        page.evaluate('''() => {
            document.querySelector("#panel-links").style.display = "none";
            document.querySelector("#panel-docs").style.display = "block";
            document.querySelector("#tab-btn-links").setAttribute("aria-selected", "false");
            document.querySelector("#tab-btn-docs").setAttribute("aria-selected", "true");
        }''')
        assert is_blurred('#doc-thumb-bg-1') and is_blurred('#dynamic-doc-thumb'), "Docs tab media must remain blurred after tab switch"

        # 9. hideMedia = false: conteúdo visual normal (unblurred)
        set_hide_media(False)
        assert not is_blurred('#media-thumb-bg'), f"Media thumb must be unblurred when hideMedia=false: {get_filter('#media-thumb-bg')}"
        assert not is_blurred('#media-thumb-img'), f"Media img must be unblurred when hideMedia=false: {get_filter('#media-thumb-img')}"
        assert not is_blurred('#media-thumb-video'), f"Media video must be unblurred when hideMedia=false: {get_filter('#media-thumb-video')}"
        assert not is_blurred('#link-preview-img-1'), f"Link preview must be unblurred when hideMedia=false: {get_filter('#link-preview-img-1')}"
        assert not is_blurred('#doc-thumb-bg-1'), f"Doc thumb must be unblurred when hideMedia=false: {get_filter('#doc-thumb-bg-1')}"
        assert not is_blurred('#dynamic-media-thumb'), f"Dynamic media thumb must be unblurred when hideMedia=false: {get_filter('#dynamic-media-thumb')}"

        # 10. Controles, ícones e textos de navegação preservados (NEVER blurred by hideMedia)
        set_hide_media(True)
        assert not is_blurred('#btn-back'), "Back button must NOT be blurred"
        assert not is_blurred('#btn-close'), "Close button must NOT be blurred"
        assert not is_blurred('#drawer-title'), "Drawer title must NOT be blurred"
        assert not is_blurred('#contact-name'), "Contact name must NOT be blurred by hideMedia"
        assert not is_blurred('#contact-phone'), "Contact phone must NOT be blurred by hideMedia"
        assert not is_blurred('#tab-btn-media'), "Tab button Mídia must NOT be blurred"
        assert not is_blurred('#tab-btn-links'), "Tab button Links must NOT be blurred"
        assert not is_blurred('#tab-btn-docs'), "Tab button Docs must NOT be blurred"
        assert not is_blurred('#link-title-1'), "Link title text must NOT be blurred"
        assert not is_blurred('#link-url-2'), "Link URL text must NOT be blurred"
        assert not is_blurred('#doc-title-1'), "Doc title text must NOT be blurred"
        assert not is_blurred('#doc-size-1'), "Doc size text must NOT be blurred"

        browser.close()
        print("Profile Drawer 10-scenarios real DOM simulation PASSED!")

run_tests()
`;

                            const tempTestPath = path.join(__dirname, 'temp_eval_drawer_test.py');
                            fs.writeFileSync(tempTestPath, pyValidationScript, 'utf8');

                            try {
                              const testOutput = execSync('python3 ' + tempTestPath, { encoding: 'utf8' });
                              assert.strictEqual(testOutput.includes('Profile Drawer 10-scenarios real DOM simulation PASSED!'), true);
                              console.log('Profile Drawer Media, Links and Docs 10-scenario tests PASSED!');
                            } finally {
                              if (fs.existsSync(tempTestPath)) {
                                fs.unlinkSync(tempTestPath);
                              }
                            }

                            // 29. PR01 — Mandatory Comprehensive Chat Media Censorship Suite (15 Scenarios)
                            console.log('29. Testing PR01 Chat Media Censorship: Videos, GIFs, Stickers, Dyn CDN, Emojis, Avatares (15 mandatory scenarios)...');

                            const pyMediaSuiteScript = `
import sys, json
from playwright.sync_api import sync_playwright

with open('content/content.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

html_media_template = '''
<!DOCTYPE html>
<html>
<head>
<style>
''' + css_content + '''
</style>
</head>
<body id="test-body">
  <div id="app">
    <!-- Main Chat Container -->
    <div id="main">
      <!-- 1 & 7. Received message: Video before playback (poster thumbnail with background-image) -->
      <div class="message-in" data-id="msg-video-in-1">
        <div data-testid="media-video">
          <div id="video-poster-thumb" style="background-image: url('blob:https://web.whatsapp.com/uuid-vid-poster'); width: 200px; height: 150px;"></div>
          <button id="video-play-btn" aria-label="Play"></button>
        </div>
      </div>

      <!-- 2 & 8. Sent message: Video playing inline -->
      <div class="message-out" data-id="msg-video-out-2">
        <div data-testid="video-content">
          <video id="video-playing" src="blob:https://web.whatsapp.com/uuid-vid-stream" controls></video>
        </div>
      </div>

      <!-- 3. GIF looping in message -->
      <div class="message-in" data-id="msg-gif-in-3">
        <div data-testid="video-content">
          <video id="gif-looping" autoplay loop muted playsinline src="blob:https://web.whatsapp.com/uuid-gif-mp4"></video>
          <span id="gif-badge">GIF</span>
        </div>
      </div>

      <!-- 4. GIF thumbnail (not autoplaying / paused) -->
      <div class="message-out" data-id="msg-gif-out-4">
        <div data-testid="gif-content">
          <div id="gif-thumb-bg" style="background-image: url('blob:https://web.whatsapp.com/uuid-gif-thumb'); width: 120px; height: 120px;"></div>
        </div>
      </div>

      <!-- 5. Static sticker in sticker-container -->
      <div class="message-in" data-id="msg-sticker-in-5">
        <div data-testid="sticker-container">
          <img id="static-sticker-img" src="blob:https://web.whatsapp.com/uuid-sticker-static">
        </div>
      </div>

      <!-- 6. Animated sticker (rendered via canvas) -->
      <div class="message-out" data-id="msg-sticker-out-6">
        <div data-testid="sticker-container">
          <canvas id="animated-sticker-canvas" width="100" height="100"></canvas>
        </div>
      </div>

      <!-- 9. Image hosted on CDN with dyn in URL (MUST BE CENSORED by hideMedia) -->
      <div class="message-in" data-id="msg-dyn-media-7">
        <img id="dyn-media-img" src="https://dyn.whatsapp-cdn1.net/v/t61.24694-24/dyn-image-sample.jpg">
      </div>

      <!-- 10. Legitimate text message with inline emoji (MUST NOT BE BLURRED) -->
      <div class="message-in" data-id="msg-text-8">
        <div class="copyable-text">
          <span id="msg-text-content">Olá mundo!</span>
          <img id="emoji-legitimate" src="https://static.whatsapp.net/emoji/smile.png" alt="😀">
        </div>
      </div>

      <!-- 11 & 12. Contact Avatar / Profile Photo inside group message header (MUST NOT BE BLURRED by hideMedia) -->
      <div class="message-in" data-id="msg-group-9">
        <img id="contact-avatar-in-group" data-testid="avatar-tile" src="https://dyn.whatsapp-cdn.net/avatar-dyn.jpg">
        <span id="contact-name-in-group">Victor Ladislau Viana</span>
      </div>
    </div>

    <!-- 13. Expression Picker (Stickers and GIFs tray) -->
    <div id="expression-panel" data-testid="panel-drawer">
      <div id="sticker-picker-container" data-testid="sticker-picker">
        <img id="picker-sticker-img" src="blob:https://web.whatsapp.com/picker-sticker-1">
        <canvas id="picker-sticker-canvas" width="60" height="60"></canvas>
      </div>
      <div id="gif-picker-container" data-testid="gif-picker">
        <video id="picker-gif-video" autoplay loop muted src="blob:https://web.whatsapp.com/picker-gif-1"></video>
        <div id="picker-gif-thumb" style="background-image: url('https://example.com/picker-thumb.jpg'); width: 60px; height: 60px;"></div>
      </div>
    </div>
  </div>
</body>
</html>
'''

def run_media_suite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_media_template)

        def is_blurred(selector):
            filt = page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')
            return 'blur' in filt

        def get_filter(selector):
            return page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')

        def set_hide_media(enable):
            if enable:
                page.eval_on_selector('#test-body', 'el => el.classList.add("vlv-hide-media")')
            else:
                page.eval_on_selector('#test-body', 'el => el.classList.remove("vlv-hide-media")')

        # Test with hideMedia = True
        set_hide_media(True)

        # 1. Vídeo antes da reprodução (miniatura com background-image)
        assert is_blurred('#video-poster-thumb'), f"Video poster thumbnail must be blurred: {get_filter('#video-poster-thumb')}"

        # 2. Vídeo em reprodução
        assert is_blurred('#video-playing'), f"Playing video content must be blurred: {get_filter('#video-playing')}"

        # 3. GIF em loop
        assert is_blurred('#gif-looping'), f"Looping GIF must be blurred: {get_filter('#gif-looping')}"

        # 4. GIF em miniatura
        assert is_blurred('#gif-thumb-bg'), f"GIF thumbnail must be blurred: {get_filter('#gif-thumb-bg')}"

        # 5. Figurinha estática
        assert is_blurred('#static-sticker-img'), f"Static sticker must be blurred: {get_filter('#static-sticker-img')}"

        # 6. Figurinha animada
        assert is_blurred('#animated-sticker-canvas'), f"Animated sticker canvas must be blurred: {get_filter('#animated-sticker-canvas')}"

        # 7. Mensagem recebida (mídia em .message-in)
        assert is_blurred('#video-poster-thumb') and is_blurred('#static-sticker-img'), "Received message media must be protected"

        # 8. Mensagem enviada (mídia em .message-out)
        assert is_blurred('#video-playing') and is_blurred('#animated-sticker-canvas'), "Sent message media must be protected"

        # 9. Imagem hospedada em CDN dyn
        assert is_blurred('#dyn-media-img'), f"Image on dyn CDN must be blurred: {get_filter('#dyn-media-img')}"

        # 10. Emoji legítimo (NUNCA desfocado por hideMedia)
        assert not is_blurred('#emoji-legitimate'), f"Emoji must NEVER be blurred by hideMedia: {get_filter('#emoji-legitimate')}"

        # 11 & 12. Avatar de contato e foto de perfil (NUNCA desfocados por hideMedia isolado)
        assert not is_blurred('#contact-avatar-in-group'), f"Avatar tile must NOT be blurred by hideMedia: {get_filter('#contact-avatar-in-group')}"
        assert not is_blurred('#contact-name-in-group'), f"Contact name must NOT be blurred by hideMedia: {get_filter('#contact-name-in-group')}"

        # 13. Painel de figurinhas/GIFs (Expression Picker)
        assert is_blurred('#picker-sticker-img'), f"Picker sticker img must be blurred: {get_filter('#picker-sticker-img')}"
        assert is_blurred('#picker-sticker-canvas'), f"Picker sticker canvas must be blurred: {get_filter('#picker-sticker-canvas')}"
        assert is_blurred('#picker-gif-video'), f"Picker gif video must be blurred: {get_filter('#picker-gif-video')}"
        assert is_blurred('#picker-gif-thumb'), f"Picker gif thumb must be blurred: {get_filter('#picker-gif-thumb')}"

        # 14. hideMedia = false (nenhum desfoque residual)
        set_hide_media(False)
        assert not is_blurred('#video-poster-thumb'), "Video poster must be unblurred when hideMedia=false"
        assert not is_blurred('#video-playing'), "Playing video must be unblurred when hideMedia=false"
        assert not is_blurred('#gif-looping'), "Looping GIF must be unblurred when hideMedia=false"
        assert not is_blurred('#gif-thumb-bg'), "GIF thumb must be unblurred when hideMedia=false"
        assert not is_blurred('#static-sticker-img'), "Static sticker must be unblurred when hideMedia=false"
        assert not is_blurred('#animated-sticker-canvas'), "Animated sticker canvas must be unblurred when hideMedia=false"
        assert not is_blurred('#dyn-media-img'), "Dyn media must be unblurred when hideMedia=false"
        assert not is_blurred('#picker-sticker-img'), "Picker sticker must be unblurred when hideMedia=false"
        assert not is_blurred('#picker-gif-video'), "Picker gif must be unblurred when hideMedia=false"

        # 15. Reativação de hideMedia (proteção restabelecida)
        set_hide_media(True)
        assert is_blurred('#video-poster-thumb'), "Video poster must be blurred again on hideMedia reactivation"
        assert is_blurred('#gif-looping'), "Looping GIF must be blurred again on hideMedia reactivation"
        assert is_blurred('#static-sticker-img'), "Static sticker must be blurred again on hideMedia reactivation"
        assert is_blurred('#picker-gif-video'), "Picker gif must be blurred again on hideMedia reactivation"

        browser.close()
        print("PR01 Chat Media Censorship 15-scenarios real DOM simulation PASSED!")

run_media_suite()
`;

                            const tempMediaTestPath = path.join(__dirname, 'temp_eval_media_suite_test.py');
                            fs.writeFileSync(tempMediaTestPath, pyMediaSuiteScript, 'utf8');

                            try {
                              const mediaTestOutput = execSync('python3 ' + tempMediaTestPath, { encoding: 'utf8' });
                              assert.strictEqual(mediaTestOutput.includes('PR01 Chat Media Censorship 15-scenarios real DOM simulation PASSED!'), true);
                              console.log('PR01 Chat Media Censorship 15-scenario tests PASSED!');
                            } finally {
                              if (fs.existsSync(tempMediaTestPath)) {
                                fs.unlinkSync(tempMediaTestPath);
                              }
                            }

                            // 30. PR 2.0.3 — Temporary Hover Reveal Test Suite (10 Mandatory Scenarios)
                            console.log('30. Testing PR 2.0.3 Temporary Hover Reveal for Messages and Media (10 mandatory scenarios)...');

                            // Verify that SettingsManager settings and chrome.storage.local remain untouched by hover reveal
                            const beforeHoverStorage = JSON.stringify(mockStorage);

                            const pyHoverSuiteScript = `
import sys, json
from playwright.sync_api import sync_playwright

with open('content/content.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

html_hover_template = f'''
<!DOCTYPE html>
<html>
<head>
<style>
{css_content}
</style>
</head>
<body id="test-body" class="vlv-hide-messages vlv-hide-media">
  <div id="app">
    <div id="main">
      <!-- Scenario: Pure text received -->
      <div class="message-in" data-id="msg-text-in">
        <div data-testid="msg-container" id="text-in-container">
          <div class="copyable-text" id="text-in-content">Mensagem de texto recebida</div>
        </div>
      </div>

      <!-- Scenario: Pure text sent -->
      <div class="message-out" data-id="msg-text-out">
        <div data-testid="msg-container" id="text-out-container">
          <div class="copyable-text" id="text-out-content">Mensagem de texto enviada</div>
        </div>
      </div>

      <!-- Scenario: Image with caption -->
      <div class="message-in" data-id="msg-img-in">
        <div data-testid="msg-container" id="img-in-container">
          <img id="img-in-content" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width:100px; height:100px; display:block;">
          <div class="copyable-text" id="img-in-caption">Legenda da imagem</div>
        </div>
      </div>

      <!-- Scenario: Video in message -->
      <div class="message-out" data-id="msg-video-out">
        <div data-testid="msg-container" id="video-out-container">
          <div data-testid="video-content">
            <video id="video-out-content" src="blob:https://web.whatsapp.com/sample-vid" style="width:120px; height:80px; display:block;"></video>
          </div>
        </div>
      </div>

      <!-- Scenario: GIF looping in message -->
      <div class="message-in" data-id="msg-gif-in">
        <div data-testid="msg-container" id="gif-in-container">
          <div data-testid="video-content">
            <video id="gif-in-content" autoplay loop muted src="blob:https://web.whatsapp.com/sample-gif" style="width:100px; height:100px; display:block;"></video>
          </div>
        </div>
      </div>

      <!-- Scenario: Static sticker -->
      <div class="message-in" data-id="msg-sticker-static">
        <div data-testid="msg-container" id="sticker-static-container">
          <div data-testid="sticker-container">
            <img id="sticker-static-content" src="blob:https://web.whatsapp.com/sample-sticker" style="width:80px; height:80px; display:block;">
          </div>
        </div>
      </div>

      <!-- Scenario: Animated sticker (canvas) -->
      <div class="message-out" data-id="msg-sticker-anim">
        <div data-testid="msg-container" id="sticker-anim-container">
          <div data-testid="sticker-container">
            <canvas id="sticker-anim-content" width="80" height="80" style="display:block;"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
'''

def run_hover_suite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_hover_template)
        page.wait_for_timeout(350)

        def is_blurred(selector):
            filt = page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')
            return 'blur' in filt and 'none' not in filt

        def get_filter(selector):
            return page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')

        # 1. Validation 1: Conteúdo censurado no estado normal por padrão
        assert is_blurred('#text-in-container'), f'text-in-container should be blurred: {get_filter("#text-in-container")}'
        assert is_blurred('#text-out-container'), f'text-out-container should be blurred: {get_filter("#text-out-container")}'
        assert is_blurred('#img-in-content'), f'img-in-content should be blurred: {get_filter("#img-in-content")}'
        assert is_blurred('#img-in-container'), f'img-in-container should be blurred: {get_filter("#img-in-container")}'
        assert is_blurred('#video-out-content'), f'video-out-content should be blurred: {get_filter("#video-out-content")}'
        assert is_blurred('#gif-in-content'), f'gif-in-content should be blurred: {get_filter("#gif-in-content")}'
        assert is_blurred('#sticker-static-content'), f'sticker-static-content should be blurred: {get_filter("#sticker-static-content")}'
        assert is_blurred('#sticker-anim-content'), f'sticker-anim-content should be blurred: {get_filter("#sticker-anim-content")}'

        # 2. Validation 2: Revelação temporária ao passar o mouse sobre mensagem de texto
        page.hover('#text-in-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#text-in-container'), 'text-in-container should be revealed on hover'
        assert is_blurred('#text-out-container'), 'text-out-container must remain blurred'
        assert is_blurred('#img-in-content'), 'img-in-content must remain blurred'

        # 3. Validation 3: Acompanhamento correto ao transitar entre mensagens vizinhas
        page.hover('#text-out-content')
        page.wait_for_timeout(350)
        assert is_blurred('#text-in-container'), 'text-in-container must re-blur'
        assert not is_blurred('#text-out-container'), 'text-out-container should now be revealed'

        # 4. Validation 4: Revelação independente de mídia sem revelar textos vizinhos indevidamente
        page.hover('#img-in-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#img-in-content'), 'img-in-content should be revealed'
        assert is_blurred('#img-in-caption'), 'img-in-caption must stay blurred to protect caption when media is hovered'
        assert is_blurred('#text-out-container'), 'text-out-container must re-blur'

        # 5. Validation 5: Revelação de legenda quando cursor está sobre o texto da legenda
        page.hover('#img-in-caption')
        page.wait_for_timeout(350)
        assert not is_blurred('#img-in-caption'), 'img-in-caption should reveal caption'
        assert is_blurred('#img-in-content'), 'img-in-content must remain blurred when only caption is hovered'

        # 6. Validation 6: Revelação temporária de vídeos e GIFs
        page.hover('#video-out-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#video-out-content'), 'video-out-content should be revealed on hover'

        page.hover('#gif-in-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#gif-in-content'), 'gif-in-content should be revealed on hover'

        # 7. Validation 7: Revelação temporária de figurinhas estáticas e animadas
        page.hover('#sticker-static-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#sticker-static-content'), 'sticker-static-content should be revealed on hover'

        page.hover('#sticker-anim-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#sticker-anim-content'), 'sticker-anim-content should be revealed on hover'

        # 8. Validation 8: Reaplicação imediata da censura ao retirar o mouse
        page.mouse.move(0, 0)
        page.wait_for_timeout(350)
        assert is_blurred('#text-in-container'), 'text-in-container must re-blur'
        assert is_blurred('#text-out-container'), 'text-out-container must re-blur'
        assert is_blurred('#img-in-content'), 'img-in-content must re-blur'
        assert is_blurred('#video-out-content'), 'video-out-content must re-blur'
        assert is_blurred('#gif-in-content'), 'gif-in-content must re-blur'
        assert is_blurred('#sticker-static-content'), 'sticker-static-content must re-blur'
        assert is_blurred('#sticker-anim-content'), 'sticker-anim-content must re-blur'

        # 9. Validation 9: Suporte a elementos adicionados dinamicamente no DOM
        page.evaluate('''() => {
            const main = document.querySelector('#main');
            const dynMsg = document.createElement('div');
            dynMsg.className = 'message-in';
            dynMsg.innerHTML = '<div data-testid="msg-container" id="dyn-container"><div class="copyable-text" id="dyn-text">Mensagem dinâmica</div></div>';
            main.appendChild(dynMsg);
        }''')
        page.wait_for_timeout(100)
        assert is_blurred('#dyn-container'), 'Dynamic element must be blurred initially'
        page.hover('#dyn-text')
        page.wait_for_timeout(350)
        assert not is_blurred('#dyn-container'), 'Dynamic element must be revealed on hover'
        page.mouse.move(0, 0)
        page.wait_for_timeout(350)
        assert is_blurred('#dyn-container'), 'Dynamic element must re-blur when mouse leaves'

        # 10. Validation 10: Dispositivos sem hover (touchscreen) mantêm o conteúdo censurado
        touch_device = p.devices['Pixel 5']
        touch_context = browser.new_context(**touch_device)
        touch_page = touch_context.new_page()
        touch_page.set_content(html_hover_template)
        touch_page.wait_for_timeout(350)

        touch_filt_text = touch_page.eval_on_selector('#text-in-container', 'el => window.getComputedStyle(el).filter')
        touch_filt_img = touch_page.eval_on_selector('#img-in-content', 'el => window.getComputedStyle(el).filter')
        assert 'blur' in touch_filt_text, 'Touch device must keep text blurred'
        assert 'blur' in touch_filt_img, 'Touch device must keep media blurred'

        touch_page.tap('#text-in-content')
        touch_page.wait_for_timeout(350)
        touch_filt_tap = touch_page.eval_on_selector('#text-in-container', 'el => window.getComputedStyle(el).filter')
        assert 'blur' in touch_filt_tap, 'Touch device tap must not trigger hover reveal'
        touch_context.close()

        browser.close()
        print('PR 2.0.3 Temporary Hover Reveal 10-scenario tests PASSED!')

run_hover_suite()
`;

                            const tempHoverTestPath = path.join(__dirname, 'temp_eval_hover_suite_test.py');
                            fs.writeFileSync(tempHoverTestPath, pyHoverSuiteScript, 'utf8');

                            try {
                              const hoverTestOutput = execSync('python3 ' + tempHoverTestPath, { encoding: 'utf8' });
                              assert.strictEqual(hoverTestOutput.includes('PR 2.0.3 Temporary Hover Reveal 10-scenario tests PASSED!'), true);
                              console.log('PR 2.0.3 Temporary Hover Reveal 10-scenario tests PASSED!');
                            } finally {
                              if (fs.existsSync(tempHoverTestPath)) {
                                fs.unlinkSync(tempHoverTestPath);
                              }
                            }

                            // Verify storage was never modified during hover operations
                            assert.strictEqual(JSON.stringify(mockStorage), beforeHoverStorage, 'Hover reveal must never alter SettingsManager or storage');

                            // 31. PR 2.0.3 — Temporary Hover Reveal for Sidebar Previews (Problema B) & Comprehensive Matrix
                            console.log('31. Testing PR 2.0.3 Temporary Hover Reveal for Sidebar Previews & Media-Text Combinations...');

                            const pySidebarHoverSuiteScript = `
import sys, json
from playwright.sync_api import sync_playwright

with open('content/content.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

html_sidebar_template = f'''
<!DOCTYPE html>
<html>
<head>
<style>
{css_content}
</style>
</head>
<body id="test-body" class="vlv-hide-previews vlv-hide-names vlv-hide-photos vlv-hide-messages vlv-hide-media">
  <div id="app">
    <!-- Sidebar -->
    <div id="side">
      <div id="pane-side">
        <!-- Conversation Row 1 -->
        <div data-testid="cell-frame-container" id="row-conv-1">
          <img id="avatar-conv-1" data-testid="avatar-tile" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
          <span data-testid="cell-frame-title" id="name-conv-1">Carlos Eduardo</span>
          <span data-testid="cell-frame-subtitle" id="preview-conv-1">Vamos revisar a proposta amanhã cedo.</span>
          <span data-testid="cell-frame-time" id="time-conv-1">11:15</span>
        </div>

        <!-- Conversation Row 2 -->
        <div data-testid="cell-frame-container" id="row-conv-2">
          <img id="avatar-conv-2" data-testid="avatar-tile" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
          <span data-testid="cell-frame-title" id="name-conv-2">Mariana Lima</span>
          <span data-testid="cell-frame-subtitle" id="preview-conv-2">
            <span data-testid="last-msg-status" id="last-status-conv-2">Entregue: </span>
            <span class="_ak8l" id="snippet-ak8l-conv-2">Arquivo enviado com sucesso.</span>
          </span>
          <span data-testid="cell-frame-time" id="time-conv-2">10:02</span>
        </div>

        <!-- Conversation Row 3 (Alternative class selector _ak8i) -->
        <div data-testid="cell-frame-container" id="row-conv-3">
          <div class="_ak8i" id="snippet-ak8i-conv-3">Reunião confirmada para as 14h.</div>
          <div data-testid="cell-frame-time" class="_ak8i" id="time-conv-3">09:40</div>
        </div>
      </div>
    </div>

    <!-- Main Chat (Media with and without caption, audio, stickers) -->
    <div id="main">
      <!-- Media without caption -->
      <div class="message-in" data-id="msg-img-nocaption">
        <div data-testid="msg-container" id="nocaption-container">
          <img id="nocaption-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width:100px; height:100px; display:block;">
        </div>
      </div>

      <!-- Media with caption -->
      <div class="message-out" data-id="msg-video-caption">
        <div data-testid="msg-container" id="video-caption-container">
          <video id="video-caption-content" src="blob:https://web.whatsapp.com/demo-vid" style="width:120px; height:80px; display:block;"></video>
          <div class="copyable-text" id="video-caption-text">Vídeo da demonstração técnica</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
'''

def run_sidebar_hover_suite():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_sidebar_template)
        page.wait_for_timeout(350)

        def is_blurred(selector):
            filt = page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')
            return 'blur' in filt and 'none' not in filt

        def get_filter(selector):
            return page.eval_on_selector(selector, 'el => window.getComputedStyle(el).filter')

        # 1. Estado inicial de proteção da barra lateral e chat
        assert is_blurred('#preview-conv-1'), f'preview-conv-1 must be blurred: {get_filter("#preview-conv-1")}'
        assert is_blurred('#preview-conv-2'), f'preview-conv-2 must be blurred: {get_filter("#preview-conv-2")}'
        assert is_blurred('#snippet-ak8i-conv-3'), f'snippet-ak8i-conv-3 must be blurred: {get_filter("#snippet-ak8i-conv-3")}'
        assert is_blurred('#name-conv-1'), 'name-conv-1 must be blurred by hideNames'
        assert is_blurred('#avatar-conv-1'), 'avatar-conv-1 must be blurred by hidePhotos'
        assert not is_blurred('#time-conv-1'), 'time-conv-1 must not be blurred'
        assert not is_blurred('#time-conv-3'), 'cell-frame-time with _ak8i must not be blurred'

        # 2. Hover sobre a prévia da conversa 1
        page.hover('#preview-conv-1')
        page.wait_for_timeout(350)
        assert not is_blurred('#preview-conv-1'), 'preview-conv-1 should be revealed on hover'
        # Informações adjacentes permanecem borradas
        assert is_blurred('#preview-conv-2'), 'preview-conv-2 must remain blurred'
        assert is_blurred('#name-conv-1'), 'name-conv-1 must remain blurred during preview hover'
        assert is_blurred('#avatar-conv-1'), 'avatar-conv-1 must remain blurred during preview hover'

        # 3. Transição de hover para a prévia da conversa 2 (com sub-elementos last-msg-status e _ak8l)
        page.hover('#snippet-ak8l-conv-2')
        page.wait_for_timeout(350)
        assert is_blurred('#preview-conv-1'), 'preview-conv-1 must re-blur'
        assert not is_blurred('#snippet-ak8l-conv-2'), 'snippet-ak8l-conv-2 should be revealed on hover'
        assert is_blurred('#name-conv-2'), 'name-conv-2 must remain blurred'

        # 4. Hover sobre status da conversa 2
        page.hover('#last-status-conv-2')
        page.wait_for_timeout(350)
        assert not is_blurred('#last-status-conv-2'), 'last-status-conv-2 should be revealed on hover'

        # 5. Hover sobre _ak8i na conversa 3
        page.hover('#snippet-ak8i-conv-3')
        page.wait_for_timeout(350)
        assert not is_blurred('#snippet-ak8i-conv-3'), 'snippet-ak8i-conv-3 should be revealed on hover'

        # 6. Restauração do blur ao retirar o cursor da barra lateral
        page.mouse.move(0, 0)
        page.wait_for_timeout(350)
        assert is_blurred('#preview-conv-1'), 'preview-conv-1 must re-blur when mouse leaves'
        assert is_blurred('#preview-conv-2'), 'preview-conv-2 must re-blur when mouse leaves'
        assert is_blurred('#snippet-ak8i-conv-3'), 'snippet-ak8i-conv-3 must re-blur when mouse leaves'

        # 7. Mídia sem legenda no chat (Problema A)
        assert is_blurred('#nocaption-img'), 'nocaption-img must be blurred initially'
        page.hover('#nocaption-img')
        page.wait_for_timeout(350)
        assert not is_blurred('#nocaption-img'), 'nocaption-img must be completely revealed on hover'
        page.mouse.move(0, 0)
        page.wait_for_timeout(350)
        assert is_blurred('#nocaption-img'), 'nocaption-img must re-blur when mouse leaves'

        # 8. Mídia com legenda: hover sobre vídeo vs hover sobre legenda (Isolamento estrito)
        page.hover('#video-caption-content')
        page.wait_for_timeout(350)
        assert not is_blurred('#video-caption-content'), 'video must be completely revealed on hover'
        assert is_blurred('#video-caption-text'), 'caption text must remain strictly blurred while hovering video'

        page.hover('#video-caption-text')
        page.wait_for_timeout(350)
        assert not is_blurred('#video-caption-text'), 'caption text must be revealed on hover'
        assert is_blurred('#video-caption-content'), 'video must remain blurred while hovering caption'

        # 9. Retirada do cursor restaura proteção completa
        page.mouse.move(0, 0)
        page.wait_for_timeout(350)
        assert is_blurred('#video-caption-content'), 'video must re-blur'
        assert is_blurred('#video-caption-text'), 'caption must re-blur'

        # 10. Atualização dinâmica do DOM na barra lateral (Novas conversas recebidas)
        page.evaluate('''() => {
            const pane = document.querySelector('#pane-side');
            const newRow = document.createElement('div');
            newRow.setAttribute('data-testid', 'cell-frame-container');
            newRow.innerHTML = '<span data-testid=\"cell-frame-subtitle\" id=\"dynamic-preview\">Nova prévia recebida em tempo real</span>';
            pane.appendChild(newRow);
        }''')
        page.wait_for_timeout(100)
        assert is_blurred('#dynamic-preview'), 'Dynamic preview must be blurred initially'
        page.hover('#dynamic-preview')
        page.wait_for_timeout(350)
        assert not is_blurred('#dynamic-preview'), 'Dynamic preview must be revealed on hover'
        page.mouse.move(0, 0)
        page.wait_for_timeout(350)
        assert is_blurred('#dynamic-preview'), 'Dynamic preview must re-blur when mouse leaves'

        browser.close()
        print('PR 2.0.3 Sidebar Previews and Media Matrix tests PASSED!')

run_sidebar_hover_suite()
`;

                            const tempSidebarHoverTestPath = path.join(__dirname, 'temp_eval_sidebar_hover_test.py');
                            fs.writeFileSync(tempSidebarHoverTestPath, pySidebarHoverSuiteScript, 'utf8');

                            try {
                              const sidebarTestOutput = execSync('python3 ' + tempSidebarHoverTestPath, { encoding: 'utf8' });
                              assert.strictEqual(sidebarTestOutput.includes('PR 2.0.3 Sidebar Previews and Media Matrix tests PASSED!'), true);
                              console.log('PR 2.0.3 Temporary Hover Reveal for Sidebar Previews & Media-Text Combinations PASSED!');
                            } finally {
                              if (fs.existsSync(tempSidebarHoverTestPath)) {
                                fs.unlinkSync(tempSidebarHoverTestPath);
                              }
                            }

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
