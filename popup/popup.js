/**
 * Victor Ladislau Viana Privacy Pro - Popup Controller
 * Connects UI controls to SettingsManager and HealthMonitor.
 */

document.addEventListener('DOMContentLoaded', () => {
  const SettingsManager = window.SettingsManager;

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
    'particleEffect'
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

  function updateUI(settings, error) {
    if (error) {
      console.error('[Privacy Pro] Erro ao sincronizar configurações:', error);
      return;
    }
    if (!settings || typeof settings !== 'object') return;

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
        if (panicBannerText) {
          panicBannerText.innerHTML = '<strong>Modo de Emergência Ativo (Alt+Q)</strong>';
        }
        if (exitPanicBtn) {
          exitPanicBtn.style.display = 'inline-block';
        }
        if (recoverFallbackBtn) {
          recoverFallbackBtn.style.display = 'none';
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
  }

  // Load initial settings
  SettingsManager.get(updateUI);

  // Listen for real-time storage changes (e.g. from Alt+Q shortcut)
  SettingsManager.onChanged((updatedSettings) => {
    SettingsManager.get(updateUI);
  });

  // Bind toggle listeners
  toggleIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        const update = { [id]: e.target.checked, panicTriggered: false };
        SettingsManager.set(update);
      });
    }
  });

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
            if (panicBannerText) {
              panicBannerText.innerHTML = '<span>Restauração indisponível (snapshot ausente/inválido).</span>';
            }
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
