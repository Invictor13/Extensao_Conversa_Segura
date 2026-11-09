/**
 * Victor Ladislau Viana Privacy Pro - Internationalization (i18n) Module
 * Centralizes UI translations for pt_BR, en, and es.
 * Offline, zero-telemetry, CSP-compliant.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PrivacyI18n = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SUPPORTED_LOCALES = ['pt_BR', 'en', 'es'];
  const DEFAULT_LOCALE = 'pt_BR';

  const DICTIONARIES = {
    pt_BR: {
      extensionName: 'Tela Privada',
      headerSubtitle: 'Proteção visual para WhatsApp Web',
      sectionProtectionLevel: 'Nível de Proteção',
      presetBasic: 'Básico',
      presetAdvanced: 'Avançado',
      presetMaximum: 'Máximo',
      ariaProtectionLevels: 'Níveis de Proteção',
      customBadge: 'Configuração Personalizada',
      sectionIndividualFilters: 'Filtros Individuais',
      filterHideMessages: 'Ocultar Mensagens',
      filterHidePreviews: 'Ocultar prévias das conversas',
      filterHideNames: 'Ocultar Nomes de Contatos',
      filterHidePhotos: 'Ocultar Fotos de Perfil',
      filterHideMedia: 'Ocultar Mídias e Imagens',
      sectionCustomization: 'Customização',
      filterParticleEffect: 'Efeito de Partículas',
      sectionLanguage: 'Idioma',
      labelSelectLanguage: 'Selecione o idioma',
      langPtBr: '🇧🇷 Português (Brasil)',
      langEn: '🇺🇸 English',
      langEs: '🇪🇸 Español',
      panicBannerActive: 'Modo de Emergência Ativo (Alt+Q)',
      panicBannerError: 'Restauração indisponível (snapshot ausente/inválido).',
      btnExitPanic: 'Restaurar Configuração',
      btnRecoverFallback: 'Restabelecer Padrão',
      shortcutBannerPrefix: 'Atalho de Emergência:',
      shortcutBannerKey: 'Alt + Q',
      shortcutBannerSuffix: '(Proteção Máxima)',
      aboutOwnershipPrefix: 'Desenvolvido e de propriedade de',
      aboutAuthorName: 'Victor Ladislau Viana',
      aboutGithubAria: 'GitHub de Victor Ladislau Viana',
      aboutLinkedinAria: 'LinkedIn de Victor Ladislau Viana',
      logoAlt: 'Tela Privada Logo'
    },
    en: {
      extensionName: 'Tela Privada',
      headerSubtitle: 'Visual privacy for WhatsApp Web',
      sectionProtectionLevel: 'Protection Level',
      presetBasic: 'Basic',
      presetAdvanced: 'Advanced',
      presetMaximum: 'Maximum',
      ariaProtectionLevels: 'Protection Levels',
      customBadge: 'Custom Configuration',
      sectionIndividualFilters: 'Individual Filters',
      filterHideMessages: 'Hide Messages',
      filterHidePreviews: 'Hide conversation previews',
      filterHideNames: 'Hide Contact Names',
      filterHidePhotos: 'Hide Profile Photos',
      filterHideMedia: 'Hide Media and Images',
      sectionCustomization: 'Customization',
      filterParticleEffect: 'Particle Effect',
      sectionLanguage: 'Language',
      labelSelectLanguage: 'Select language',
      langPtBr: '🇧🇷 Português (Brasil)',
      langEn: '🇺🇸 English',
      langEs: '🇪🇸 Español',
      panicBannerActive: 'Emergency Mode Active (Alt+Q)',
      panicBannerError: 'Restore unavailable (missing/invalid snapshot).',
      btnExitPanic: 'Restore Configuration',
      btnRecoverFallback: 'Reset to Default',
      shortcutBannerPrefix: 'Emergency Shortcut:',
      shortcutBannerKey: 'Alt + Q',
      shortcutBannerSuffix: '(Maximum Protection)',
      aboutOwnershipPrefix: 'Developed and owned by',
      aboutAuthorName: 'Victor Ladislau Viana',
      aboutGithubAria: "Victor Ladislau Viana's GitHub",
      aboutLinkedinAria: "Victor Ladislau Viana's LinkedIn",
      logoAlt: 'Tela Privada Logo'
    },
    es: {
      extensionName: 'Tela Privada',
      headerSubtitle: 'Protección visual para WhatsApp Web',
      sectionProtectionLevel: 'Nivel de Protección',
      presetBasic: 'Básico',
      presetAdvanced: 'Avanzado',
      presetMaximum: 'Máximo',
      ariaProtectionLevels: 'Niveles de Protección',
      customBadge: 'Configuración Personalizada',
      sectionIndividualFilters: 'Filtros Individuales',
      filterHideMessages: 'Ocultar Mensajes',
      filterHidePreviews: 'Ocultar vistas previas del chat',
      filterHideNames: 'Ocultar Nombres de Contactos',
      filterHidePhotos: 'Ocultar Fotos de Perfil',
      filterHideMedia: 'Ocultar Medios e Imágenes',
      sectionCustomization: 'Personalización',
      filterParticleEffect: 'Efecto de Partículas',
      sectionLanguage: 'Idioma',
      labelSelectLanguage: 'Seleccionar idioma',
      langPtBr: '🇧🇷 Português (Brasil)',
      langEn: '🇺🇸 English',
      langEs: '🇪🇸 Español',
      panicBannerActive: 'Modo de Emergencia Activo (Alt+Q)',
      panicBannerError: 'Restauración no disponible (snapshot ausente/inválido).',
      btnExitPanic: 'Restaurar Configuración',
      btnRecoverFallback: 'Restablecer Predeterminado',
      shortcutBannerPrefix: 'Atajo de Emergencia:',
      shortcutBannerKey: 'Alt + Q',
      shortcutBannerSuffix: '(Protección Máxima)',
      aboutOwnershipPrefix: 'Desarrollado y propiedad de',
      aboutAuthorName: 'Victor Ladislau Viana',
      aboutGithubAria: 'GitHub de Victor Ladislau Viana',
      aboutLinkedinAria: 'LinkedIn de Victor Ladislau Viana',
      logoAlt: 'Tela Privada Logo'
    }
  };

  /**
   * Validates and returns a safe locale.
   * @param {string} locale
   * @returns {string}
   */
  function normalizeLocale(locale) {
    if (typeof locale === 'string' && SUPPORTED_LOCALES.includes(locale)) {
      return locale;
    }
    return DEFAULT_LOCALE;
  }

  /**
   * Retrieves translated string for a given key.
   * Falls back to pt_BR and then key if not found.
   * @param {string} key
   * @param {string} [locale]
   * @returns {string}
   */
  function t(key, locale) {
    const lang = normalizeLocale(locale);
    const dict = DICTIONARIES[lang] || DICTIONARIES[DEFAULT_LOCALE];
    if (dict && typeof dict[key] === 'string') {
      return dict[key];
    }
    const fallbackDict = DICTIONARIES[DEFAULT_LOCALE];
    if (fallbackDict && typeof fallbackDict[key] === 'string') {
      return fallbackDict[key];
    }
    return key || '';
  }

  /**
   * Applies translations to DOM elements using data-i18n attributes.
   * Updates textContent, aria-label, title, and alt.
   * @param {string} [locale]
   * @param {Document|HTMLElement} [rootNode]
   */
  function applyToDOM(locale, rootNode) {
    const root = rootNode || (typeof document !== 'undefined' ? document : null);
    if (!root) return;

    const lang = normalizeLocale(locale);

    // 1. Text elements: data-i18n
    const textEls = root.querySelectorAll('[data-i18n]');
    textEls.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, lang);
      }
    });

    // 2. Aria-label: data-i18n-aria-label
    const ariaEls = root.querySelectorAll('[data-i18n-aria-label]');
    ariaEls.forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        el.setAttribute('aria-label', t(key, lang));
      }
    });

    // 3. Title attribute: data-i18n-title
    const titleEls = root.querySelectorAll('[data-i18n-title]');
    titleEls.forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key, lang));
      }
    });

    // 4. Alt attribute: data-i18n-alt
    const altEls = root.querySelectorAll('[data-i18n-alt]');
    altEls.forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      if (key) {
        el.setAttribute('alt', t(key, lang));
      }
    });

    // Update <html lang="..."> if on main document
    if (root.documentElement) {
      const htmlLangMap = {
        pt_BR: 'pt-BR',
        en: 'en',
        es: 'es'
      };
      root.documentElement.lang = htmlLangMap[lang] || 'pt-BR';
    }
  }

  return {
    SUPPORTED_LOCALES,
    DEFAULT_LOCALE,
    DICTIONARIES,
    normalizeLocale,
    t,
    applyToDOM
  };
});
