/**
 * Victor Ladislau Viana Privacy Pro - WhatsApp Integration
 * Centralizes DOM selectors for WhatsApp Web components and manages visual CSS obfuscation.
 *
 * SECURITY & PRIVACY NOTICE:
 * This module queries DOM element references strictly for visual CSS class application.
 * It DOES NOT extract, collect, store, or transmit message contents, contact names,
 * phone numbers, or any user interaction data.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WhatsAppIntegration = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Centralized, resilient CSS Selectors for WhatsApp Web
  const SELECTORS = {
    // Chat messages
    messages: [
      '#main .message-in div.copyable-text',
      '#main .message-out div.copyable-text',
      '#main [data-testid="msg-container"]',
      '#main [data-id] .aria-label',
      '#main div[data-pre-plain-text]'
    ],
    // Sidebar chat previews (Exclusively last message snippet in conversation row)
    previews: [
      '#pane-side [data-testid="cell-frame-subtitle"]',
      '#pane-side [data-testid="last-msg-status"]',
      '#pane-side [data-testid="cell-frame-container"] div._ak8l',
      '#pane-side [data-testid="cell-frame-container"] div._ak8i:not([data-testid="cell-frame-time"])'
    ],
    // Contact, Group & Sender Names (Sidebar, Header, Search Results, Group Messages, Recent Searches, Status Panel/Viewer)
    names: [
      '#pane-side [data-testid="cell-frame-title"]',
      '#pane-side [data-testid="cell-frame-title"] span[title][dir="auto"]',
      '#pane-side [data-testid="cell-frame-container"] [data-testid="cell-frame-title"]',
      '#main header [data-testid="chat-title"]',
      '#main header [data-testid="chat-title"] span[title][dir="auto"]',
      '#main header [data-testid="conversation-info-header"] span[title][dir="auto"]',
      '#main header [data-testid="conversation-info-header"] [role="button"] span[title][dir="auto"]',
      '#main .message-in span[dir="auto"]._ak8j',
      '#main .message-in [data-testid="author"]',
      '[data-testid="status-v3-panel"] [data-testid="cell-frame-title"]',
      '[data-testid="status-v3-panel"] [data-testid="cell-frame-title"] span[title][dir="auto"]',
      '[data-testid="status-viewer-header"] span[title][dir="auto"]',
      '[data-testid="search-results"] [data-testid="cell-frame-title"]',
      '[data-testid="search-results"] [data-testid="cell-frame-title"] span[title][dir="auto"]',
      '[data-testid="recent-search-list"] [data-testid="cell-frame-title"]',
      '[data-testid="recent-search-item"] [data-testid="cell-frame-title"]',
      '[data-testid="drawer-right"] [data-testid="cell-frame-title"]',
      '[data-testid="drawer-right"] [data-testid="cell-frame-title"] span[title][dir="auto"]',
      '[data-testid="drawer-right"] [data-testid="contact-info-name"]'
    ],
    // Profile photos and avatars (Sidebar, Header, Search Results, Recent Searches, Status Avatars & SVG images)
    photos: [
      '#side img',
      '#side image',
      '#pane-side img',
      '#pane-side image',
      '#main header img',
      '#main header image',
      '#main .message-in img[src*="dyn"]',
      '#main .message-out img[src*="dyn"]',
      '[data-testid="avatar-tile"]',
      '[data-testid="chat-avatar"]',
      '[data-testid="community-avatar"]',
      '[data-testid="status-v3-avatar"]',
      '[data-testid="search-results"] img',
      '[data-testid="chat-list-search"] img',
      '[data-testid="recent-search-list"] img',
      '[data-testid="recent-search-item"] img',
      '[data-icon="default-user"]',
      '[data-icon="default-group"]',
      '[data-icon="default-community"]'
    ],
    // Media (Images, Videos, Stickers, Audio, Galleries, Profile Media, Status & Fullscreen Viewers)
    media: [
      '#main [data-testid="image-thumb"]',
      '#main [data-testid="video-thumb"]',
      '#main [data-testid="audio-player"]',
      '#main [data-testid="sticker"]',
      '#main [data-testid*="sticker"]',
      '#main [data-testid*="sticker"] img:not([src*="emoji"])',
      '#main [data-testid*="sticker"] canvas',
      '#main [data-testid*="sticker"] video',
      '#main [data-testid*="sticker"] div[style*="background-image"]',
      '#main [data-testid*="video"]',
      '#main [data-testid*="video"] video',
      '#main [data-testid*="video"] div[style*="background-image"]',
      '#main [data-testid*="media-video"]',
      '#main [data-testid*="media-video"] div[style*="background-image"]',
      '#main [data-testid*="video-content"]',
      '#main [data-testid*="video-content"] video',
      '#main [data-testid*="video-content"] div[style*="background-image"]',
      '#main [data-testid*="gif"]',
      '#main [data-testid*="media"] video',
      '#main [data-testid*="media"] div[style*="background-image"]',
      '#main [data-testid="quoted-message"] div[style*="background-image"]',
      '#main [data-testid="quoted-message"] img:not([src*="emoji"])',
      '#main [data-testid="msg-container"] img:not([src*="emoji"])',
      '#main [data-testid="msg-container"] video',
      '#main [data-testid="msg-container"] canvas',
      '#main .message-in img:not([src*="emoji"]):not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      '#main .message-out img:not([src*="emoji"]):not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      '#main .message-in div[style*="background-image"]',
      '#main .message-out div[style*="background-image"]',
      '#main [data-id] img:not([src*="emoji"]):not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      '#main [data-id] div[style*="background-image"]',
      '#main [data-id] canvas',
      '#main video',
      '#main canvas',
      // Expression Picker (Sticker and GIF drawer / panels)
      '[data-testid="panel-drawer"] img:not([src*="emoji"])',
      '[data-testid="panel-drawer"] video',
      '[data-testid="panel-drawer"] canvas',
      '[data-testid="panel-drawer"] div[style*="background-image"]',
      '[data-testid="expression-picker"] img:not([src*="emoji"])',
      '[data-testid="expression-picker"] video',
      '[data-testid="expression-picker"] canvas',
      '[data-testid="expression-picker"] div[style*="background-image"]',
      '[data-testid="sticker-pack-item"]',
      '[data-testid="sticker-picker"] img',
      '[data-testid="sticker-picker"] canvas',
      '[data-testid="gif-picker"] video',
      '[data-testid="gif-picker"] img',
      '[data-testid="gif-picker"] div[style*="background-image"]',
      // Profile drawer (Contact & Group Info) - Right Drawer primary container
      '[data-testid="drawer-right"] img:not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      '[data-testid="drawer-right"] video',
      '[data-testid="drawer-right"] canvas',
      '[data-testid="drawer-right"] div[style*="background-image"]',
      '[data-testid="drawer-right"] div[role="listitem"] button > div[style*="background-image"]',
      '[data-testid="drawer-right"] [data-testid="media-gallery"] img',
      '[data-testid="drawer-right"] [data-testid="media-gallery"] video',
      '[data-testid="drawer-right"] [data-testid="link-preview"] img',
      '[data-testid="drawer-right"] [data-testid="link-preview-container"] img',
      '[data-testid="drawer-right"] [data-testid="link-preview-thumbnail"]',
      '[data-testid="drawer-right"] [data-testid="link-preview-thumbnail-jpeg"]',
      '[data-testid="drawer-right"] [data-testid="document-thumb"]',
      '[data-testid="drawer-right"] [data-testid="doc-preview"]',
      // Profile drawer: Region & Generic Structural Containers (Fallback & Multi-version)
      'div[role="region"] [data-testid="drawer-right"] img',
      'div[role="region"] [data-testid="drawer-right"] video',
      'div[role="region"] [data-testid="drawer-right"] div[style*="background-image"]',
      'div[role="region"] [data-testid="media-gallery"] img',
      'div[role="region"] [data-testid="media-gallery"] video',
      'div[role="region"] div[role="grid"] img',
      'div[role="region"] div[role="gridcell"] img',
      'div[role="region"] div[role="gridcell"] video',
      'div[role="region"] div[role="gridcell"] canvas',
      'div[role="region"] div[role="gridcell"] div[style*="background-image"]',
      'div[role="region"] div[role="listitem"] div[style*="background-image"]',
      'div[role="region"] div[role="listitem"] img:not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      'div[role="region"] div[role="listitem"] video',
      'div[role="region"] div[role="listitem"] canvas',
      'div[role="region"] [data-testid="list-item-media-preview"]',
      'div[role="region"] [data-testid="media-preview-container"]',
      'div[role="region"] [data-testid="media-canvas"]',
      'div[role="region"] [data-testid="link-preview"] img',
      'div[role="region"] [data-testid="link-preview"] div[style*="background-image"]',
      'div[role="region"] [data-testid="link-preview-container"] img',
      'div[role="region"] [data-testid="link-preview-thumbnail"]',
      'div[role="region"] [data-testid="link-preview-thumbnail-jpeg"]',
      'div[role="region"] [data-testid="list-item-link"] img',
      'div[role="region"] [data-testid="list-item-link"] [data-testid="thumbnail"]',
      'div[role="region"] [data-testid="list-item-link"] div[style*="background-image"]',
      'div[role="region"] [data-testid="list-item-document"] [data-testid="thumbnail"]',
      'div[role="region"] [data-testid="list-item-document"] img',
      'div[role="region"] [data-testid="list-item-document"] div[style*="background-image"]',
      'div[role="region"] [data-testid="document-thumb"]',
      'div[role="region"] [data-testid="doc-preview"]',
      // Backward compatibility for previous versions and selectors
      '[data-testid="contact-info"] [data-testid="media-gallery"] img',
      '[data-testid="contact-info"] [data-testid="media-gallery"] video',
      '[data-testid="group-info"] [data-testid="media-gallery"] img',
      '[data-testid="group-info"] [data-testid="media-gallery"] video',
      '[data-testid="contact-info"] [data-testid="link-preview"] img',
      '[data-testid="group-info"] [data-testid="link-preview"] img',
      '[data-testid="contact-info"] [data-testid="document-thumb"]',
      '[data-testid="group-info"] [data-testid="document-thumb"]',
      // Fullscreen view / Modals / Dialogs / Status viewer
      'div[role="dialog"] img:not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      'div[role="dialog"] video',
      'div[role="dialog"] canvas',
      'div[role="dialog"] div[style*="background-image"]',
      'div[data-animate-modal-popup="true"] img:not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      'div[data-animate-modal-popup="true"] video',
      'div[data-animate-modal-popup="true"] canvas',
      '[data-testid="status-viewer"] img',
      '[data-testid="status-viewer"] video',
      '[data-testid="status-viewer"] canvas',
      '[data-testid="media-viewer"] img',
      '[data-testid="media-viewer"] video',
      '[data-testid="media-viewer"] canvas'
    ]
  };

  /**
   * Applies privacy body classes based on current settings.
   * @param {Object} settings
   */
  function applyClasses(settings) {
    const body = document.body;
    if (!body) return;

    toggleBodyClass('vlv-hide-messages', !!settings.hideMessages);
    toggleBodyClass('vlv-hide-previews', !!settings.hidePreviews);
    toggleBodyClass('vlv-hide-names', !!settings.hideNames);
    toggleBodyClass('vlv-hide-photos', !!settings.hidePhotos);
    toggleBodyClass('vlv-hide-media', !!settings.hideMedia);
  }

  function toggleBodyClass(className, condition) {
    if (condition) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
  }

  let overlayElement = null;

  /**
   * Creates or updates the fullscreen auto-censor overlay.
   * Uses pointer-events: none and subtle unlock instructions.
   * @param {boolean} active
   * @param {string} effect ('blur' | 'darken' | 'opaque')
   * @param {string} [language]
   */
  function applyAutoCensor(active, effect, language) {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc || !doc.body) return;

    if (!overlayElement) {
      overlayElement = doc.getElementById('vlv-auto-censor-overlay');
      if (!overlayElement) {
        overlayElement = doc.createElement('div');
        overlayElement.id = 'vlv-auto-censor-overlay';

        const card = doc.createElement('div');
        card.className = 'vlv-censor-notice-card';

        const iconSvg = `
          <svg class="vlv-censor-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        `;
        card.innerHTML = iconSvg +
          '<h3 class="vlv-censor-notice-title" id="vlvOverlayTitle"></h3>' +
          '<p class="vlv-censor-notice-sub" id="vlvOverlaySub"></p>';

        overlayElement.appendChild(card);
        doc.body.appendChild(overlayElement);
      }
    }

    // Update localized text if PrivacyI18n is available
    const lang = language || 'pt_BR';
    const titleEl = doc.getElementById('vlvOverlayTitle');
    const subEl = doc.getElementById('vlvOverlaySub');
    if (typeof PrivacyI18n !== 'undefined' && PrivacyI18n.t) {
      if (titleEl) titleEl.textContent = PrivacyI18n.t('overlayNoticeTitle', lang);
      if (subEl) subEl.textContent = PrivacyI18n.t('overlayNoticeSubtitle', lang);
    } else {
      if (titleEl) titleEl.textContent = 'Tela Protegida por Inatividade';
      if (subEl) subEl.textContent = 'Mova o mouse ou pressione qualquer tecla para desbloquear';
    }

    // Reset effect classes
    overlayElement.classList.remove('vlv-effect-blur', 'vlv-effect-darken', 'vlv-effect-opaque');
    const selectedEffect = effect === 'darken' || effect === 'opaque' ? effect : 'blur';
    overlayElement.classList.add('vlv-effect-' + selectedEffect);

    if (active) {
      overlayElement.classList.add('vlv-active');
    } else {
      overlayElement.classList.remove('vlv-active');
    }
  }

  /**
   * Verifies if WhatsApp Web interface DOM is present.
   * @returns {boolean}
   */
  function isWhatsAppWebDetected() {
    return !!(document.getElementById('app') || document.getElementById('pane-side') || document.getElementById('main'));
  }

  return {
    SELECTORS,
    applyClasses,
    applyAutoCensor,
    isWhatsAppWebDetected
  };
});
