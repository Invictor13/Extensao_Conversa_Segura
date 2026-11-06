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
      '#main [data-testid="msg-container"] img:not([src*="emoji"])',
      '#main [data-testid="msg-container"] video',
      '#main [data-testid="msg-container"] canvas',
      '#main .message-in img:not([src*="emoji"]):not([src*="dyn"])',
      '#main .message-out img:not([src*="emoji"]):not([src*="dyn"])',
      '#main video',
      '#main canvas',
      // Profile drawer & shared media galleries (Contact/Group Info)
      'div[role="region"] [data-testid="media-gallery"] img',
      'div[role="region"] [data-testid="media-gallery"] video',
      'div[role="region"] div[role="grid"] img',
      'div[role="region"] div[role="gridcell"] img',
      'div[role="region"] div[role="gridcell"] video',
      'div[role="region"] div[role="gridcell"] canvas',
      // Profile drawer: Media, Links & Docs tabs (Contact Info, Group Info, Drawer Right)
      '[data-testid="contact-info"] [data-testid="media-gallery"] img',
      '[data-testid="contact-info"] [data-testid="media-gallery"] video',
      '[data-testid="group-info"] [data-testid="media-gallery"] img',
      '[data-testid="group-info"] [data-testid="media-gallery"] video',
      'div[role="region"] [data-testid="list-item-media-preview"]',
      'div[role="region"] [data-testid="media-preview-container"]',
      'div[role="region"] [data-testid="media-canvas"]',
      // Profile drawer: Links tab visual previews & link cards
      'div[role="region"] [data-testid="link-preview"]',
      'div[role="region"] [data-testid="link-preview"] img',
      'div[role="region"] [data-testid="list-item-link"] img',
      'div[role="region"] [data-testid="list-item-link"] [data-testid="thumbnail"]',
      '[data-testid="contact-info"] [data-testid="link-preview"] img',
      '[data-testid="group-info"] [data-testid="link-preview"] img',
      // Profile drawer: Docs tab visual previews & document items
      'div[role="region"] [data-testid="list-item-document"] [data-testid="thumbnail"]',
      'div[role="region"] [data-testid="list-item-document"] img',
      'div[role="region"] [data-testid="document-thumb"]',
      'div[role="region"] [data-testid="doc-preview"]',
      '[data-testid="contact-info"] [data-testid="document-thumb"]',
      '[data-testid="group-info"] [data-testid="document-thumb"]',
      // Fullscreen view / Modals / Dialogs / Status viewer
      'div[role="dialog"] img:not([data-testid="avatar-tile"]):not([data-testid="chat-avatar"])',
      'div[role="dialog"] video',
      'div[role="dialog"] canvas',
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
