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
  const exitPanicBtn = document.getElementById('exitPanicBtn');

  function updateUI(settings) {
    toggleIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && typeof settings[id] === 'boolean') {
        el.checked = settings[id];
      }
    });

    // Update panic mode banner visibility
    if (panicBanner) {
      panicBanner.style.display = settings.panicTriggered ? 'flex' : 'none';
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

  // Bind exit panic button
  if (exitPanicBtn) {
    exitPanicBtn.addEventListener('click', () => {
      SettingsManager.set({ panicTriggered: false }, updateUI);
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
