/**
 * Victor Ladislau Viana Privacy Pro - Popup Controller
 * Connects UI controls to SettingsManager, PrivacyI18n, and DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
  const SettingsManager = window.SettingsManager;
  const PrivacyI18n = window.PrivacyI18n;

  if (!SettingsManager) {
    console.error('[Privacy Pro] SettingsManager module missing.');
    return;
  }

  const toggleIds = [
    'hideMessages',
    'hidePreviews',
    'hideNames',
    'hidePhotos',
    'hideMedia',
    'particleEffect',
    'autoCensorEnabled'
  ];

  const presetBtns = {
    basic: document.getElementById('presetBasic'),
    advanced: document.getElementById('presetAdvanced'),
    maximum: document.getElementById('presetMaximum')
  };

  const panicBanner = document.getElementById('panicBanner');
  const panicBannerText = document.getElementById('panicBannerText');
  const exitPanicBtn = document.getElementById('exitPanicBtn');
  const recoverFallbackBtn = document.getElementById('recoverFallbackBtn');
  const customBadge = document.getElementById('customBadge');
  const languageSelect = document.getElementById('languageSelect');

  // Auto-censor UI elements
  const autoCensorEnabledEl = document.getElementById('autoCensorEnabled');
  const autoCensorSubControls = document.getElementById('autoCensorSubControls');
  const autoCensorTimeoutSelect = document.getElementById('autoCensorTimeoutSelect');
  const customTimeoutWrapper = document.getElementById('customTimeoutWrapper');
  const autoCensorCustomInput = document.getElementById('autoCensorCustomInput');
  const autoCensorEffectSelect = document.getElementById('autoCensorEffectSelect');

  let currentLanguage = 'pt_BR';

  function applyLanguage(lang) {
    currentLanguage = (PrivacyI18n && typeof PrivacyI18n.normalizeLocale === 'function')
      ? PrivacyI18n.normalizeLocale(lang)
      : (lang || 'pt_BR');

    if (PrivacyI18n && typeof PrivacyI18n.applyToDOM === 'function') {
      PrivacyI18n.applyToDOM(currentLanguage, document);
    }

    if (languageSelect && languageSelect.value !== currentLanguage) {
      languageSelect.value = currentLanguage;
    }
  }

  function updatePanicBannerText(isError) {
    if (!panicBannerText) return;
    if (isError) {
      const errText = PrivacyI18n ? PrivacyI18n.t('panicBannerError', currentLanguage) : 'Restauração indisponível (snapshot ausente/inválido).';
      panicBannerText.innerHTML = `<span>${errText}</span>`;
    } else {
      const activeText = PrivacyI18n ? PrivacyI18n.t('panicBannerActive', currentLanguage) : 'Modo de Emergência Ativo (Alt+Q)';
      panicBannerText.innerHTML = `<strong>${activeText}</strong>`;
    }
  }

  function updateUI(settings, error) {
    if (error) {
      console.error('[Privacy Pro] Erro ao sincronizar configurações:', error);
      return;
    }
    if (!settings || typeof settings !== 'object') return;

    // Apply language first
    if (settings.language) {
      applyLanguage(settings.language);
    }

    toggleIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && typeof settings[id] === 'boolean') {
        el.checked = settings[id];
      }
    });

    // Update panic mode banner visibility and status
    if (panicBanner) {
      panicBanner.style.display = settings.panicTriggered ? 'flex' : 'none';
      if (!settings.panicTriggered) {
        panicBanner.classList.remove('error-state');
        updatePanicBannerText(false);
        if (exitPanicBtn) {
          exitPanicBtn.style.display = 'inline-block';
        }
        if (recoverFallbackBtn) {
          recoverFallbackBtn.style.display = 'none';
        }
      } else {
        // If panic is triggered and not in error state, ensure text matches current language
        if (!panicBanner.classList.contains('error-state')) {
          updatePanicBannerText(false);
        }
      }
    }

    // Update preset active button
    Object.keys(presetBtns).forEach((level) => {
      if (presetBtns[level]) {
        if (settings.protectionLevel === level) {
          presetBtns[level].classList.add('active');
        } else {
          presetBtns[level].classList.remove('active');
        }
      }
    });

    // Update custom preset badge visibility
    if (customBadge) {
      customBadge.style.display = settings.protectionLevel === 'custom' ? 'inline-block' : 'none';
    }

    // Auto-censor controls visibility and state
    if (autoCensorSubControls) {
      autoCensorSubControls.style.display = settings.autoCensorEnabled ? 'flex' : 'none';
    }

    if (autoCensorTimeoutSelect && customTimeoutWrapper && autoCensorCustomInput) {
      const timeoutVal = typeof settings.autoCensorTimeout === 'number' ? settings.autoCensorTimeout : 60;
      const standardPresets = [30, 60, 120, 300];
      if (standardPresets.includes(timeoutVal)) {
        autoCensorTimeoutSelect.value = String(timeoutVal);
        customTimeoutWrapper.style.display = 'none';
      } else {
        autoCensorTimeoutSelect.value = 'custom';
        customTimeoutWrapper.style.display = 'flex';
        autoCensorCustomInput.value = timeoutVal;
      }
    }

    if (autoCensorEffectSelect) {
      autoCensorEffectSelect.value = settings.autoCensorEffect || 'blur';
    }
  }

  // Load initial settings
  SettingsManager.get(updateUI);

  // Listen for real-time storage changes (e.g. from Alt+Q shortcut or storage sync)
  SettingsManager.onChanged((updatedSettings) => {
    SettingsManager.get(updateUI);
  });

  // Bind toggle listeners
  toggleIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        if (id === 'autoCensorEnabled') {
          const isEnabled = e.target.checked;
          if (autoCensorSubControls) {
            autoCensorSubControls.style.display = isEnabled ? 'flex' : 'none';
          }
          SettingsManager.set({ autoCensorEnabled: isEnabled });
        } else {
          const update = { [id]: e.target.checked, panicTriggered: false };
          SettingsManager.set(update);
        }
      });
    }
  });

  // Bind auto-censor timeout select
  if (autoCensorTimeoutSelect) {
    autoCensorTimeoutSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        if (customTimeoutWrapper) customTimeoutWrapper.style.display = 'flex';
        const customSec = parseInt(autoCensorCustomInput.value, 10) || 60;
        SettingsManager.set({ autoCensorTimeout: customSec });
      } else {
        if (customTimeoutWrapper) customTimeoutWrapper.style.display = 'none';
        const sec = parseInt(val, 10);
        SettingsManager.set({ autoCensorTimeout: sec });
      }
    });
  }

  // Bind auto-censor custom input
  if (autoCensorCustomInput) {
    autoCensorCustomInput.addEventListener('change', (e) => {
      let sec = parseInt(e.target.value, 10);
      if (isNaN(sec)) sec = 60;
      sec = Math.min(Math.max(sec, 10), 3600);
      e.target.value = sec;
      SettingsManager.set({ autoCensorTimeout: sec });
    });
  }

  // Bind auto-censor effect select
  if (autoCensorEffectSelect) {
    autoCensorEffectSelect.addEventListener('change', (e) => {
      const effect = e.target.value;
      SettingsManager.set({ autoCensorEffect: effect });
    });
  }

  // Bind language select change listener
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      applyLanguage(newLang);
      // If panic banner is visible, refresh its text in the newly selected language
      if (panicBanner && panicBanner.style.display !== 'none') {
        const isError = panicBanner.classList.contains('error-state');
        updatePanicBannerText(isError);
      }
      SettingsManager.set({ language: newLang });
    });
  }

  // Bind exit/restore panic button
  if (exitPanicBtn) {
    exitPanicBtn.addEventListener('click', () => {
      if (typeof SettingsManager.restoreEmergency === 'function') {
        SettingsManager.restoreEmergency((restoredSettings, err) => {
          if (err) {
            console.warn('[Privacy Pro] Falha na restauração do snapshot:', err);
            // Show error state in banner without silent fallback
            if (panicBanner) {
              panicBanner.classList.add('error-state');
            }
            updatePanicBannerText(true);
            if (exitPanicBtn) {
              exitPanicBtn.style.display = 'none';
            }
            if (recoverFallbackBtn) {
              recoverFallbackBtn.style.display = 'inline-block';
            }
            return;
          }
          updateUI(restoredSettings);
        });
      } else {
        SettingsManager.set({ panicTriggered: false }, updateUI);
      }
    });
  }

  // Bind explicit fallback recovery button (when snapshot is invalid/missing)
  if (recoverFallbackBtn) {
    recoverFallbackBtn.addEventListener('click', () => {
      if (typeof SettingsManager.recoverEmergencyFallback === 'function') {
        SettingsManager.recoverEmergencyFallback(updateUI);
      } else {
        SettingsManager.applyPreset('advanced', updateUI);
      }
    });
  }

  // Bind preset button clicks
  Object.keys(presetBtns).forEach((level) => {
    if (presetBtns[level]) {
      presetBtns[level].addEventListener('click', () => {
        SettingsManager.applyPreset(level, updateUI);
      });
    }
  });

  // Enable keyboard activation on labels/switches
  document.querySelectorAll('.switch').forEach((sw) => {
    sw.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const checkbox = sw.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      }
    });
  });
});
