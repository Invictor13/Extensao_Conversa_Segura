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
      '#side [data-testid="cell-frame-title"]',
      '#side span[title][dir="auto"]',
      '#pane-side [data-testid="cell-frame-title"]',
      '#pane-side span[title][dir="auto"]',
      '#main header span[title][dir="auto"]',
      '#main header [data-testid="chat-title"]',
      '#main header [data-testid="conversation-info-header"]',
      '#main .message-in span[dir="auto"]._ak8j',
      '#main .message-in [data-testid="author"]',
      '[data-testid="status-v3-panel"] [data-testid="cell-frame-title"]',
      '[data-testid="status-v3-panel"] span[title][dir="auto"]',
      '[data-testid="status-viewer-header"] span[title][dir="auto"]',
      '[data-testid="search-results"] [data-testid="cell-frame-title"]',
      '[data-testid="search-results"] span[title][dir="auto"]',
      '[data-testid="recent-search-list"] span',
      '[data-testid="recent-search-item"] span',
      '[data-testid="chat-list-search"] span',
      '[data-testid="chatlist-header"] span'
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
    isWhatsAppWebDetected
  };
});
